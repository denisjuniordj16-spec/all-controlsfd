import { useCallback, useEffect, useRef, useState } from 'react';
import {
  CANONICAL_CONTROLS,
  createEmptyButtonState,
} from '../data/controllerMappings';
import {
  ControlId,
  ControllerProfile,
  GamepadBatteryState,
  GamepadLiveState,
  PlatformType,
  StickVector,
} from '../types/controller';

interface ExperimentalGamepadBattery {
  level?: number;
  charging?: boolean;
}

type ExperimentalGamepad = Gamepad & {
  battery?: ExperimentalGamepadBattery | number;
  batteryLevel?: number;
  powerState?: {
    batteryLevel?: number;
    charging?: boolean;
  };
};

interface HidInputReportEventLike extends Event {
  reportId: number;
  data: DataView;
}

interface HidDeviceLike {
  opened: boolean;
  productName?: string;
  vendorId: number;
  productId: number;
  open: () => Promise<void>;
  close: () => Promise<void>;
  addEventListener: (type: string, listener: (event: HidInputReportEventLike) => void) => void;
  removeEventListener: (type: string, listener: (event: HidInputReportEventLike) => void) => void;
}

interface NavigatorWithHid extends Navigator {
  hid?: {
    requestDevice: (options: {
      filters: Array<{ vendorId: number; productId?: number }>;
    }) => Promise<HidDeviceLike[]>;
  };
}

const DEFAULT_BATTERY_UNAVAILABLE: GamepadBatteryState = {
  supported: false,
  source: 'unavailable',
  level: null,
  charging: null,
  statusLabel: 'Telemetria indisponível pela API padrão do navegador',
};

function normalizeBatteryPercent(raw: number): number {
  const pct = raw <= 1 ? raw * 100 : raw;
  return Math.max(0, Math.min(100, Math.round(pct)));
}

function extractGamepadApiBattery(pad: Gamepad): GamepadBatteryState | null {
  const expPad = pad as ExperimentalGamepad;

  if (typeof expPad.battery === 'number' && Number.isFinite(expPad.battery)) {
    const level = normalizeBatteryPercent(expPad.battery);
    return {
      supported: true,
      source: 'gamepad-api',
      level,
      charging: null,
      statusLabel: `${level}% via Gamepad API`,
    };
  }

  if (
    expPad.battery &&
    typeof expPad.battery === 'object' &&
    typeof expPad.battery.level === 'number' &&
    Number.isFinite(expPad.battery.level)
  ) {
    const level = normalizeBatteryPercent(expPad.battery.level);
    const charging =
      typeof expPad.battery.charging === 'boolean' ? expPad.battery.charging : null;
    return {
      supported: true,
      source: 'gamepad-api',
      level,
      charging,
      statusLabel: charging ? 'Carregando via Gamepad API' : 'Em uso via Gamepad API',
    };
  }

  if (typeof expPad.batteryLevel === 'number' && Number.isFinite(expPad.batteryLevel)) {
    const level = normalizeBatteryPercent(expPad.batteryLevel);
    return {
      supported: true,
      source: 'gamepad-api',
      level,
      charging: null,
      statusLabel: `${level}% via Gamepad API`,
    };
  }

  if (
    expPad.powerState &&
    typeof expPad.powerState.batteryLevel === 'number' &&
    Number.isFinite(expPad.powerState.batteryLevel)
  ) {
    const level = normalizeBatteryPercent(expPad.powerState.batteryLevel);
    const charging =
      typeof expPad.powerState.charging === 'boolean' ? expPad.powerState.charging : null;
    return {
      supported: true,
      source: 'gamepad-api',
      level,
      charging,
      statusLabel: charging ? 'Carregando via Gamepad API' : 'Em uso via Gamepad API',
    };
  }

  return null;
}

function parseSonyHidBattery(reportId: number, data: DataView): GamepadBatteryState | null {
  // DualSense USB (reportId 0x01) or Bluetooth (reportId 0x31)
  let batteryByte: number | null = null;
  if (reportId === 0x01 && data.byteLength > 52) {
    batteryByte = data.getUint8(52);
  } else if (reportId === 0x31 && data.byteLength > 53) {
    batteryByte = data.getUint8(53);
  } else if (reportId === 0x01 && data.byteLength > 30) {
    // DualShock 4 USB fallback (byte 30)
    const ds4Byte = data.getUint8(29);
    const cableConnected = (ds4Byte & 0x10) !== 0;
    const rawLevel = ds4Byte & 0x0f;
    const level = Math.min(100, Math.round((rawLevel / (cableConnected ? 11 : 10)) * 100));
    return {
      supported: true,
      source: 'webhid',
      level,
      charging: cableConnected,
      statusLabel: cableConnected ? 'Carregando via WebHID' : 'Em uso via WebHID',
    };
  }

  if (batteryByte === null) return null;

  const rawLevel = batteryByte & 0x0f;
  const chargeState = (batteryByte >> 4) & 0x0f;
  const level = Math.min(100, Math.max(0, (rawLevel + 1) * 10));
  const charging = chargeState === 0x01 || chargeState === 0x02;

  return {
    supported: true,
    source: 'webhid',
    level: chargeState === 0x02 ? 100 : level,
    charging,
    statusLabel:
      chargeState === 0x02
        ? 'Carga completa via WebHID'
        : charging
        ? 'Carregando via WebHID'
        : 'Em uso via WebHID',
  };
}

function detectPlatformFromId(id: string): PlatformType | 'generic' {
  const lower = id.toLowerCase();
  if (
    lower.includes('dualsense') ||
    lower.includes('dualshock') ||
    lower.includes('054c') ||
    lower.includes('sony') ||
    lower.includes('playstation')
  ) {
    return 'playstation';
  }
  if (
    lower.includes('xbox') ||
    lower.includes('045e') ||
    lower.includes('xinput') ||
    lower.includes('microsoft')
  ) {
    return 'xbox';
  }
  return 'generic';
}

export function useGamepad(profile: ControllerProfile) {
  const [connectedGamepad, setConnectedGamepad] = useState<{
    index: number;
    id: string;
    platform: PlatformType | 'generic';
  } | null>(null);

  const [virtualButtons, setVirtualButtons] = useState<Record<ControlId, boolean>>(
    createEmptyButtonState
  );
  const [virtualLeftStick, setVirtualLeftStick] = useState<StickVector>({ x: 0, y: 0 });
  const [virtualRightStick, setVirtualRightStick] = useState<StickVector>({ x: 0, y: 0 });
  const [virtualLeftTrigger, setVirtualLeftTrigger] = useState(0);
  const [virtualRightTrigger, setVirtualRightTrigger] = useState(0);

  const [hardwareState, setHardwareState] = useState<{
    buttons: Record<ControlId, boolean>;
    leftStick: StickVector;
    rightStick: StickVector;
    leftTrigger: number;
    rightTrigger: number;
    apiBattery: GamepadBatteryState | null;
  }>({
    buttons: createEmptyButtonState(),
    leftStick: { x: 0, y: 0 },
    rightStick: { x: 0, y: 0 },
    leftTrigger: 0,
    rightTrigger: 0,
    apiBattery: null,
  });

  const [hidBattery, setHidBattery] = useState<GamepadBatteryState | null>(null);
  const [hidError, setHidError] = useState<string | null>(null);
  const hidDeviceRef = useRef<HidDeviceLike | null>(null);
  const rafRef = useRef<number | null>(null);

  const webHidSupported =
    typeof navigator !== 'undefined' && Boolean((navigator as NavigatorWithHid).hid);

  const scanGamepads = useCallback(() => {
    if (typeof navigator === 'undefined' || !navigator.getGamepads) return;
    const pads = navigator.getGamepads();
    let activePad: Gamepad | null = null;
    for (let i = 0; i < pads.length; i++) {
      if (pads[i] && pads[i]!.connected) {
        activePad = pads[i];
        break;
      }
    }

    if (activePad) {
      setConnectedGamepad((prev) => {
        if (prev && prev.index === activePad!.index && prev.id === activePad!.id) {
          return prev;
        }
        return {
          index: activePad!.index,
          id: activePad!.id,
          platform: detectPlatformFromId(activePad!.id),
        };
      });
    } else {
      setConnectedGamepad(null);
      setHidBattery(null);
    }
  }, []);

  useEffect(() => {
    scanGamepads();
    const onConnect = () => scanGamepads();
    const onDisconnect = () => scanGamepads();

    window.addEventListener('gamepadconnected', onConnect);
    window.addEventListener('gamepaddisconnected', onDisconnect);
    return () => {
      window.removeEventListener('gamepadconnected', onConnect);
      window.removeEventListener('gamepaddisconnected', onDisconnect);
    };
  }, [scanGamepads]);

  useEffect(() => {
    if (!connectedGamepad) {
      setHardwareState({
        buttons: createEmptyButtonState(),
        leftStick: { x: 0, y: 0 },
        rightStick: { x: 0, y: 0 },
        leftTrigger: 0,
        rightTrigger: 0,
        apiBattery: null,
      });
      return;
    }

    let running = true;
    const poll = () => {
      if (!running) return;
      const pads = navigator.getGamepads();
      const pad = pads[connectedGamepad.index];
      if (pad && pad.connected) {
        const nextButtons = createEmptyButtonState();
        for (const control of CANONICAL_CONTROLS) {
          const btn = pad.buttons[control.standardIndex];
          if (btn) {
            nextButtons[control.id] = btn.pressed || btn.value > 0.25;
          }
        }

        const l2Val = pad.buttons[6]?.value ?? 0;
        const r2Val = pad.buttons[7]?.value ?? 0;
        const apiBattery = extractGamepadApiBattery(pad);

        setHardwareState({
          buttons: nextButtons,
          leftStick: {
            x: Number((pad.axes[0] ?? 0).toFixed(3)),
            y: Number((pad.axes[1] ?? 0).toFixed(3)),
          },
          rightStick: {
            x: Number((pad.axes[2] ?? 0).toFixed(3)),
            y: Number((pad.axes[3] ?? 0).toFixed(3)),
          },
          leftTrigger: Number(l2Val.toFixed(3)),
          rightTrigger: Number(r2Val.toFixed(3)),
          apiBattery,
        });
      }
      rafRef.current = requestAnimationFrame(poll);
    };

    rafRef.current = requestAnimationFrame(poll);
    return () => {
      running = false;
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [connectedGamepad]);

  useEffect(() => {
    return () => {
      if (hidDeviceRef.current?.opened) {
        hidDeviceRef.current.close().catch(() => {});
      }
    };
  }, []);

  const requestWebHidBattery = useCallback(async () => {
    setHidError(null);
    const nav = navigator as NavigatorWithHid;
    if (!nav.hid) {
      setHidError('WebHID não suportado neste navegador.');
      return;
    }

    try {
      const devices = await nav.hid.requestDevice({
        filters: [
          { vendorId: 0x054c, productId: 0x0ce6 }, // DualSense
          { vendorId: 0x054c, productId: 0x0df2 }, // DualSense Edge
          { vendorId: 0x054c, productId: 0x09cc }, // DualShock 4 v2
          { vendorId: 0x054c, productId: 0x05c4 }, // DualShock 4 v1
        ],
      });

      const device = devices[0];
      if (!device) return;

      if (hidDeviceRef.current?.opened) {
        await hidDeviceRef.current.close().catch(() => {});
      }

      if (!device.opened) {
        await device.open();
      }
      hidDeviceRef.current = device;

      const handleReport = (event: HidInputReportEventLike) => {
        const parsed = parseSonyHidBattery(event.reportId, event.data);
        if (parsed) {
          setHidBattery(parsed);
        }
      };

      device.addEventListener('inputreport', handleReport);
    } catch {
      setHidError('Acesso WebHID cancelado ou indisponível para este dispositivo.');
    }
  }, []);

  const setVirtualButton = useCallback((id: ControlId, pressed: boolean) => {
    setVirtualButtons((prev) => {
      if (prev[id] === pressed) return prev;
      return { ...prev, [id]: pressed };
    });
  }, []);

  const triggerRumbleTest = useCallback(async () => {
    if (!connectedGamepad) return false;
    const pad = navigator.getGamepads()?.[connectedGamepad.index] as Gamepad & {
      vibrationActuator?: {
        playEffect: (
          type: string,
          params: {
            startDelay: number;
            duration: number;
            weakMagnitude: number;
            strongMagnitude: number;
          }
        ) => Promise<string>;
      };
    };

    if (pad?.vibrationActuator?.playEffect) {
      const strength = Math.max(0.1, profile.vibrationIntensity / 100);
      try {
        await pad.vibrationActuator.playEffect('dual-rumble', {
          startDelay: 0,
          duration: 320,
          weakMagnitude: strength,
          strongMagnitude: strength * 0.85,
        });
        return true;
      } catch {
        return false;
      }
    }
    return false;
  }, [connectedGamepad, profile.vibrationIntensity]);

  // Merge physical hardware input with interactive virtual input
  const rawButtons = createEmptyButtonState();
  const mappedButtons = createEmptyButtonState();

  for (const control of CANONICAL_CONTROLS) {
    const isPressed =
      hardwareState.buttons[control.id] ||
      virtualButtons[control.id] ||
      (control.id === 'l2' && virtualLeftTrigger > 0.1) ||
      (control.id === 'r2' && virtualRightTrigger > 0.1);

    rawButtons[control.id] = isPressed;
    if (isPressed) {
      const target = profile.mappings[control.id];
      if (target && target !== 'disabled') {
        mappedButtons[target] = true;
      }
    }
  }

  const leftStickRaw: StickVector =
    Math.hypot(hardwareState.leftStick.x, hardwareState.leftStick.y) > 0.02
      ? hardwareState.leftStick
      : virtualLeftStick;

  const rightStickRaw: StickVector =
    Math.hypot(hardwareState.rightStick.x, hardwareState.rightStick.y) > 0.02
      ? hardwareState.rightStick
      : virtualRightStick;

  const leftTriggerRaw = Math.max(
    hardwareState.leftTrigger,
    virtualLeftTrigger,
    virtualButtons.l2 ? 1 : 0
  );
  const rightTriggerRaw = Math.max(
    hardwareState.rightTrigger,
    virtualRightTrigger,
    virtualButtons.r2 ? 1 : 0
  );

  const battery: GamepadBatteryState =
    hardwareState.apiBattery ?? hidBattery ?? DEFAULT_BATTERY_UNAVAILABLE;

  const liveState: GamepadLiveState = {
    connected: Boolean(connectedGamepad),
    deviceName: connectedGamepad?.id ?? null,
    detectedPlatform: connectedGamepad?.platform ?? null,
    battery,
    rawButtons,
    mappedButtons,
    leftStickRaw,
    rightStickRaw,
    leftTriggerRaw,
    rightTriggerRaw,
  };

  return {
    liveState,
    webHidSupported,
    hidError,
    requestWebHidBattery,
    setVirtualButton,
    setVirtualLeftStick,
    setVirtualRightStick,
    setVirtualLeftTrigger,
    setVirtualRightTrigger,
    triggerRumbleTest,
    rescanGamepads: scanGamepads,
  };
}
