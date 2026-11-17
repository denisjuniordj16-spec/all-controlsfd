export type PlatformType = 'playstation' | 'xbox';

export type ViewLayoutMode = 'dual' | 'playstation' | 'xbox';

export type WorkspaceTab = 'overview' | 'mapping' | 'sticks' | 'triggers';

export type ControlId =
  | 'faceBottom'
  | 'faceRight'
  | 'faceLeft'
  | 'faceTop'
  | 'l1'
  | 'r1'
  | 'l2'
  | 'r2'
  | 'l3'
  | 'r3'
  | 'dpadUp'
  | 'dpadDown'
  | 'dpadLeft'
  | 'dpadRight'
  | 'select'
  | 'start'
  | 'home'
  | 'touchpadOrShare';

export type ControlCategory = 'face' | 'bumper' | 'trigger' | 'dpad' | 'stick' | 'system';

export interface PlatformButtonLabel {
  name: string;
  shortLabel: string;
  accentColor: string;
}

export interface CanonicalControl {
  id: ControlId;
  standardIndex: number;
  category: ControlCategory;
  remappable: boolean;
  playstation: PlatformButtonLabel;
  xbox: PlatformButtonLabel;
}

export type ResponseCurveType = 'linear' | 'dynamic' | 'precision' | 'aggressive' | 'custom';

export interface StickConfig {
  innerDeadzone: number; // 0 to 0.40
  outerDeadzone: number; // 0.60 to 1.00
  sensitivity: number; // 0.50 to 2.00
  curve: ResponseCurveType;
  customCurveExponent: number; // 0.4 to 3.0
  invertX: boolean;
  invertY: boolean;
}

export interface TriggerConfig {
  deadzone: number; // 0 to 0.40
  maxThreshold: number; // 0.50 to 1.00
  hairTrigger: boolean;
  playstationAdaptiveMode: 'off' | 'feedback' | 'weapon' | 'rigid';
  xboxImpulseStrength: number; // 0 to 100
}

export interface ControllerProfile {
  id: string;
  name: string;
  description: string;
  genre: string;
  updatedAt: string;
  preferredView: ViewLayoutMode;
  mappings: Record<ControlId, ControlId | 'disabled'>;
  leftStick: StickConfig;
  rightStick: StickConfig;
  leftTrigger: TriggerConfig;
  rightTrigger: TriggerConfig;
  vibrationIntensity: number; // 0 to 100
  pollingRateHz: 250 | 500 | 1000;
}

export interface StickVector {
  x: number; // -1 to 1
  y: number; // -1 to 1
}

export interface GamepadBatteryState {
  supported: boolean;
  source: 'gamepad-api' | 'webhid' | 'unavailable';
  level: number | null; // 0 to 100
  charging: boolean | null;
  statusLabel: string;
}

export interface GamepadLiveState {
  connected: boolean;
  deviceName: string | null;
  detectedPlatform: PlatformType | 'generic' | null;
  battery: GamepadBatteryState;
  rawButtons: Record<ControlId, boolean>;
  mappedButtons: Record<ControlId, boolean>;
  leftStickRaw: StickVector;
  rightStickRaw: StickVector;
  leftTriggerRaw: number; // 0 to 1
  rightTriggerRaw: number; // 0 to 1
}
