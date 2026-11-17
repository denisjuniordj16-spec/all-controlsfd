import {
  CanonicalControl,
  ControlId,
  ControllerProfile,
  ResponseCurveType,
  StickConfig,
  StickVector,
  TriggerConfig,
} from '../types/controller';

export const CANONICAL_CONTROLS: CanonicalControl[] = [
  {
    id: 'faceBottom',
    standardIndex: 0,
    category: 'face',
    remappable: true,
    playstation: { name: 'Cruz (Cross)', shortLabel: '✕', accentColor: '#60A5FA' },
    xbox: { name: 'Botão A', shortLabel: 'A', accentColor: '#22C55E' },
  },
  {
    id: 'faceRight',
    standardIndex: 1,
    category: 'face',
    remappable: true,
    playstation: { name: 'Círculo (Circle)', shortLabel: '○', accentColor: '#F87171' },
    xbox: { name: 'Botão B', shortLabel: 'B', accentColor: '#EF4444' },
  },
  {
    id: 'faceLeft',
    standardIndex: 2,
    category: 'face',
    remappable: true,
    playstation: { name: 'Quadrado (Square)', shortLabel: '□', accentColor: '#F472B6' },
    xbox: { name: 'Botão X', shortLabel: 'X', accentColor: '#3B82F6' },
  },
  {
    id: 'faceTop',
    standardIndex: 3,
    category: 'face',
    remappable: true,
    playstation: { name: 'Triângulo (Triangle)', shortLabel: '△', accentColor: '#34D399' },
    xbox: { name: 'Botão Y', shortLabel: 'Y', accentColor: '#F59E0B' },
  },
  {
    id: 'l1',
    standardIndex: 4,
    category: 'bumper',
    remappable: true,
    playstation: { name: 'L1', shortLabel: 'L1', accentColor: '#94A3B8' },
    xbox: { name: 'LB (Left Bumper)', shortLabel: 'LB', accentColor: '#94A3B8' },
  },
  {
    id: 'r1',
    standardIndex: 5,
    category: 'bumper',
    remappable: true,
    playstation: { name: 'R1', shortLabel: 'R1', accentColor: '#94A3B8' },
    xbox: { name: 'RB (Right Bumper)', shortLabel: 'RB', accentColor: '#94A3B8' },
  },
  {
    id: 'l2',
    standardIndex: 6,
    category: 'trigger',
    remappable: true,
    playstation: { name: 'Gatilho L2', shortLabel: 'L2', accentColor: '#3B82F6' },
    xbox: { name: 'Gatilho LT', shortLabel: 'LT', accentColor: '#22C55E' },
  },
  {
    id: 'r2',
    standardIndex: 7,
    category: 'trigger',
    remappable: true,
    playstation: { name: 'Gatilho R2', shortLabel: 'R2', accentColor: '#3B82F6' },
    xbox: { name: 'Gatilho RT', shortLabel: 'RT', accentColor: '#22C55E' },
  },
  {
    id: 'select',
    standardIndex: 8,
    category: 'system',
    remappable: true,
    playstation: { name: 'Create', shortLabel: 'CRT', accentColor: '#94A3B8' },
    xbox: { name: 'View', shortLabel: 'VIEW', accentColor: '#94A3B8' },
  },
  {
    id: 'start',
    standardIndex: 9,
    category: 'system',
    remappable: true,
    playstation: { name: 'Options', shortLabel: 'OPT', accentColor: '#94A3B8' },
    xbox: { name: 'Menu', shortLabel: 'MENU', accentColor: '#94A3B8' },
  },
  {
    id: 'l3',
    standardIndex: 10,
    category: 'stick',
    remappable: true,
    playstation: { name: 'Clique L3', shortLabel: 'L3', accentColor: '#60A5FA' },
    xbox: { name: 'Clique LS', shortLabel: 'LS', accentColor: '#22C55E' },
  },
  {
    id: 'r3',
    standardIndex: 11,
    category: 'stick',
    remappable: true,
    playstation: { name: 'Clique R3', shortLabel: 'R3', accentColor: '#60A5FA' },
    xbox: { name: 'Clique RS', shortLabel: 'RS', accentColor: '#22C55E' },
  },
  {
    id: 'dpadUp',
    standardIndex: 12,
    category: 'dpad',
    remappable: true,
    playstation: { name: 'Direcional Cima', shortLabel: '↑', accentColor: '#94A3B8' },
    xbox: { name: 'D-Pad Cima', shortLabel: '↑', accentColor: '#94A3B8' },
  },
  {
    id: 'dpadDown',
    standardIndex: 13,
    category: 'dpad',
    remappable: true,
    playstation: { name: 'Direcional Baixo', shortLabel: '↓', accentColor: '#94A3B8' },
    xbox: { name: 'D-Pad Baixo', shortLabel: '↓', accentColor: '#94A3B8' },
  },
  {
    id: 'dpadLeft',
    standardIndex: 14,
    category: 'dpad',
    remappable: true,
    playstation: { name: 'Direcional Esquerda', shortLabel: '←', accentColor: '#94A3B8' },
    xbox: { name: 'D-Pad Esquerda', shortLabel: '←', accentColor: '#94A3B8' },
  },
  {
    id: 'dpadRight',
    standardIndex: 15,
    category: 'dpad',
    remappable: true,
    playstation: { name: 'Direcional Direita', shortLabel: '→', accentColor: '#94A3B8' },
    xbox: { name: 'D-Pad Direita', shortLabel: '→', accentColor: '#94A3B8' },
  },
  {
    id: 'home',
    standardIndex: 16,
    category: 'system',
    remappable: false,
    playstation: { name: 'Botão PS', shortLabel: 'PS', accentColor: '#3B82F6' },
    xbox: { name: 'Botão Xbox', shortLabel: 'XBOX', accentColor: '#22C55E' },
  },
  {
    id: 'touchpadOrShare',
    standardIndex: 17,
    category: 'system',
    remappable: true,
    playstation: { name: 'Touchpad Click', shortLabel: 'TOUCH', accentColor: '#60A5FA' },
    xbox: { name: 'Botão Share', shortLabel: 'SHARE', accentColor: '#94A3B8' },
  },
];

export const CONTROL_BY_ID: Record<ControlId, CanonicalControl> = CANONICAL_CONTROLS.reduce(
  (acc, item) => {
    acc[item.id] = item;
    return acc;
  },
  {} as Record<ControlId, CanonicalControl>
);

export const DEFAULT_MAPPINGS: Record<ControlId, ControlId | 'disabled'> = {
  faceBottom: 'faceBottom',
  faceRight: 'faceRight',
  faceLeft: 'faceLeft',
  faceTop: 'faceTop',
  l1: 'l1',
  r1: 'r1',
  l2: 'l2',
  r2: 'r2',
  select: 'select',
  start: 'start',
  l3: 'l3',
  r3: 'r3',
  dpadUp: 'dpadUp',
  dpadDown: 'dpadDown',
  dpadLeft: 'dpadLeft',
  dpadRight: 'dpadRight',
  home: 'home',
  touchpadOrShare: 'touchpadOrShare',
};

export const DEFAULT_STICK_CONFIG: StickConfig = {
  innerDeadzone: 0.08,
  outerDeadzone: 0.96,
  sensitivity: 1.0,
  curve: 'linear',
  customCurveExponent: 1.4,
  invertX: false,
  invertY: false,
};

export const DEFAULT_TRIGGER_CONFIG: TriggerConfig = {
  deadzone: 0.05,
  maxThreshold: 0.95,
  hairTrigger: false,
  playstationAdaptiveMode: 'feedback',
  xboxImpulseStrength: 70,
};

export const DEFAULT_PROFILES: ControllerProfile[] = [
  {
    id: 'standard',
    name: 'Padrão Simultâneo',
    description: 'Mapeamento 1:1 sincronizado entre DualSense e Xbox Series X|S.',
    genre: 'Uso Geral',
    updatedAt: '2026-11-17',
    preferredView: 'dual',
    mappings: { ...DEFAULT_MAPPINGS },
    leftStick: { ...DEFAULT_STICK_CONFIG },
    rightStick: { ...DEFAULT_STICK_CONFIG },
    leftTrigger: { ...DEFAULT_TRIGGER_CONFIG },
    rightTrigger: { ...DEFAULT_TRIGGER_CONFIG },
    vibrationIntensity: 80,
    pollingRateHz: 500,
  },
  {
    id: 'fps-competitive',
    name: 'FPS Competitivo',
    description: 'Pulo em L1/LB, agachar em R3/RS, gatilhos rápidos e curva de precisão.',
    genre: 'Tiro em 1ª Pessoa',
    updatedAt: '2026-11-17',
    preferredView: 'dual',
    mappings: {
      ...DEFAULT_MAPPINGS,
      l1: 'faceBottom', // L1/LB -> Pular (Cross / A)
      faceBottom: 'l1',
      r3: 'faceRight', // R3/RS -> Agachar (Circle / B)
      faceRight: 'r3',
    },
    leftStick: {
      ...DEFAULT_STICK_CONFIG,
      innerDeadzone: 0.05,
      outerDeadzone: 0.92,
      curve: 'aggressive',
    },
    rightStick: {
      ...DEFAULT_STICK_CONFIG,
      innerDeadzone: 0.04,
      outerDeadzone: 0.98,
      sensitivity: 1.15,
      curve: 'precision',
    },
    leftTrigger: {
      ...DEFAULT_TRIGGER_CONFIG,
      deadzone: 0.02,
      maxThreshold: 0.55,
      hairTrigger: true,
      playstationAdaptiveMode: 'off',
      xboxImpulseStrength: 35,
    },
    rightTrigger: {
      ...DEFAULT_TRIGGER_CONFIG,
      deadzone: 0.02,
      maxThreshold: 0.55,
      hairTrigger: true,
      playstationAdaptiveMode: 'weapon',
      xboxImpulseStrength: 45,
    },
    vibrationIntensity: 40,
    pollingRateHz: 1000,
  },
  {
    id: 'fighting-arcade',
    name: 'Luta & Arcade',
    description: 'Zona morta rígida no direcional analógico e gatilhos com resposta instantânea.',
    genre: 'Jogos de Luta',
    updatedAt: '2026-11-17',
    preferredView: 'dual',
    mappings: {
      ...DEFAULT_MAPPINGS,
      l2: 'l1',
      r2: 'r1',
      l1: 'l2',
      r1: 'r2',
    },
    leftStick: {
      ...DEFAULT_STICK_CONFIG,
      innerDeadzone: 0.16,
      outerDeadzone: 0.85,
      curve: 'aggressive',
    },
    rightStick: {
      ...DEFAULT_STICK_CONFIG,
      innerDeadzone: 0.15,
      outerDeadzone: 0.95,
      curve: 'linear',
    },
    leftTrigger: {
      ...DEFAULT_TRIGGER_CONFIG,
      deadzone: 0.02,
      maxThreshold: 0.50,
      hairTrigger: true,
      playstationAdaptiveMode: 'rigid',
      xboxImpulseStrength: 0,
    },
    rightTrigger: {
      ...DEFAULT_TRIGGER_CONFIG,
      deadzone: 0.02,
      maxThreshold: 0.50,
      hairTrigger: true,
      playstationAdaptiveMode: 'rigid',
      xboxImpulseStrength: 0,
    },
    vibrationIntensity: 60,
    pollingRateHz: 1000,
  },
  {
    id: 'sim-racing',
    name: 'Simulador de Corrida',
    description: 'Curva dinâmica na direção e curso longo progressivo em L2/LT e R2/RT.',
    genre: 'Corrida',
    updatedAt: '2026-11-17',
    preferredView: 'dual',
    mappings: {
      ...DEFAULT_MAPPINGS,
      faceLeft: 'r1',
      faceRight: 'l1',
    },
    leftStick: {
      ...DEFAULT_STICK_CONFIG,
      innerDeadzone: 0.03,
      outerDeadzone: 1.0,
      sensitivity: 0.9,
      curve: 'dynamic',
    },
    rightStick: {
      ...DEFAULT_STICK_CONFIG,
      innerDeadzone: 0.1,
      outerDeadzone: 0.95,
      curve: 'linear',
    },
    leftTrigger: {
      ...DEFAULT_TRIGGER_CONFIG,
      deadzone: 0.02,
      maxThreshold: 1.0,
      hairTrigger: false,
      playstationAdaptiveMode: 'feedback',
      xboxImpulseStrength: 95,
    },
    rightTrigger: {
      ...DEFAULT_TRIGGER_CONFIG,
      deadzone: 0.02,
      maxThreshold: 1.0,
      hairTrigger: false,
      playstationAdaptiveMode: 'feedback',
      xboxImpulseStrength: 90,
    },
    vibrationIntensity: 95,
    pollingRateHz: 500,
  },
];

export const CURVE_LABELS: Record<ResponseCurveType, { name: string; description: string }> = {
  linear: {
    name: 'Linear (1:1)',
    description: 'Resposta proporcional direta entre movimento físico e saída.',
  },
  precision: {
    name: 'Precisão (Suave)',
    description: 'Menor sensibilidade perto do centro para micro-ajustes de mira.',
  },
  dynamic: {
    name: 'Dinâmica (Curva S)',
    description: 'Centro controlado com aceleração gradual nas bordas.',
  },
  aggressive: {
    name: 'Agressiva (Rápida)',
    description: 'Atinge velocidade máxima mais cedo com menor deslocamento.',
  },
  custom: {
    name: 'Personalizada',
    description: 'Expoente ajustável manualmente conforme sua preferência.',
  },
};

export function evaluateCurveScalar(
  normalizedMagnitude: number,
  curve: ResponseCurveType,
  customExponent = 1.4
): number {
  const t = Math.max(0, Math.min(1, normalizedMagnitude));
  switch (curve) {
    case 'linear':
      return t;
    case 'precision':
      return Math.pow(t, 2.1);
    case 'aggressive':
      return Math.pow(t, 0.58);
    case 'dynamic': {
      // Smooth S-curve blended with linear
      const s = t * t * (3 - 2 * t);
      return 0.55 * s + 0.45 * t;
    }
    case 'custom':
      return Math.pow(t, customExponent);
    default:
      return t;
  }
}

export function applyStickCalibration(raw: StickVector, config: StickConfig): StickVector {
  const mag = Math.hypot(raw.x, raw.y);
  if (mag <= config.innerDeadzone || mag === 0) {
    return { x: 0, y: 0 };
  }

  const effectiveRange = Math.max(0.05, config.outerDeadzone - config.innerDeadzone);
  const normalized = Math.min(1, (mag - config.innerDeadzone) / effectiveRange);
  const curved = Math.min(
    1,
    evaluateCurveScalar(normalized, config.curve, config.customCurveExponent) * config.sensitivity
  );

  const dirX = (raw.x / mag) * (config.invertX ? -1 : 1);
  const dirY = (raw.y / mag) * (config.invertY ? -1 : 1);

  return {
    x: Number((dirX * curved).toFixed(4)),
    y: Number((dirY * curved).toFixed(4)),
  };
}

export function applyTriggerCalibration(rawValue: number, config: TriggerConfig): number {
  const clamped = Math.max(0, Math.min(1, rawValue));
  if (clamped <= config.deadzone) {
    return 0;
  }
  if (config.hairTrigger) {
    return 1;
  }
  const span = Math.max(0.05, config.maxThreshold - config.deadzone);
  return Math.min(1, (clamped - config.deadzone) / span);
}

export function createEmptyButtonState(): Record<ControlId, boolean> {
  return {
    faceBottom: false,
    faceRight: false,
    faceLeft: false,
    faceTop: false,
    l1: false,
    r1: false,
    l2: false,
    r2: false,
    select: false,
    start: false,
    l3: false,
    r3: false,
    dpadUp: false,
    dpadDown: false,
    dpadLeft: false,
    dpadRight: false,
    home: false,
    touchpadOrShare: false,
  };
}
