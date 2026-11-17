import React from 'react';
import { ControlId, StickVector } from '../types/controller';

interface ControllerSvgProps {
  selectedControl: ControlId | null;
  activeButtons: Record<ControlId, boolean>;
  mappedButtons: Record<ControlId, boolean>;
  remappedSources: Set<ControlId>;
  leftStick: StickVector;
  rightStick: StickVector;
  leftTrigger: number;
  rightTrigger: number;
  onSelectControl: (id: ControlId) => void;
  onPressControl: (id: ControlId, pressed: boolean) => void;
}

export const PlayStationSvg: React.FC<ControllerSvgProps> = ({
  selectedControl,
  activeButtons,
  mappedButtons,
  remappedSources,
  leftStick,
  rightStick,
  leftTrigger,
  rightTrigger,
  onSelectControl,
  onPressControl,
}) => {
  const isLit = (id: ControlId) => activeButtons[id] || mappedButtons[id];
  const isSel = (id: ControlId) => selectedControl === id;
  const isRemapped = (id: ControlId) => remappedSources.has(id);

  const buttonHandlers = (id: ControlId) => ({
    onClick: () => onSelectControl(id),
    onPointerDown: () => onPressControl(id, true),
    onPointerUp: () => onPressControl(id, false),
    onPointerLeave: () => onPressControl(id, false),
    className: 'cursor-pointer transition-all duration-100 focus:outline-none',
    role: 'button',
    tabIndex: 0,
    onKeyDown: (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        onSelectControl(id);
      }
    },
  });

  const lsX = 166 + leftStick.x * 11;
  const lsY = 178 + leftStick.y * 11;
  const rsX = 294 + rightStick.x * 11;
  const rsY = 178 + rightStick.y * 11;

  return (
    <svg
      viewBox="0 0 460 290"
      className="w-full h-auto select-none drop-shadow-[0_14px_30px_rgba(0,0,0,0.45)]"
      aria-label="Diagrama interativo do controle PlayStation DualSense"
    >
      <defs>
        <linearGradient id="psBodyGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#1E293B" />
          <stop offset="55%" stopColor="#151D2C" />
          <stop offset="100%" stopColor="#0F172A" />
        </linearGradient>
        <linearGradient id="psGripGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#111827" />
          <stop offset="100%" stopColor="#090D16" />
        </linearGradient>
        <linearGradient id="psTouchpadGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#1E293B" />
          <stop offset="100%" stopColor="#0F172A" />
        </linearGradient>
      </defs>

      {/* L2 / R2 Analog Triggers */}
      <g {...buttonHandlers('l2')} aria-label="Gatilho L2">
        <rect
          x="74"
          y="18"
          width="54"
          height="22"
          rx="8"
          fill="#0F172A"
          stroke={isSel('l2') ? '#60A5FA' : isLit('l2') ? '#3B82F6' : '#334155'}
          strokeWidth={isSel('l2') ? '2' : '1.25'}
        />
        <rect
          x="76"
          y="20"
          width={Math.max(0, Math.min(50, leftTrigger * 50))}
          height="18"
          rx="6"
          fill="#2563EB"
          opacity={leftTrigger > 0.02 ? 0.7 : 0}
        />
        <text x="101" y="33" textAnchor="middle" fill="#CBD5E1" fontSize="10" fontWeight="600" fontFamily="JetBrains Mono">
          L2
        </text>
      </g>

      <g {...buttonHandlers('r2')} aria-label="Gatilho R2">
        <rect
          x="332"
          y="18"
          width="54"
          height="22"
          rx="8"
          fill="#0F172A"
          stroke={isSel('r2') ? '#60A5FA' : isLit('r2') ? '#3B82F6' : '#334155'}
          strokeWidth={isSel('r2') ? '2' : '1.25'}
        />
        <rect
          x="334"
          y="20"
          width={Math.max(0, Math.min(50, rightTrigger * 50))}
          height="18"
          rx="6"
          fill="#2563EB"
          opacity={rightTrigger > 0.02 ? 0.7 : 0}
        />
        <text x="359" y="33" textAnchor="middle" fill="#CBD5E1" fontSize="10" fontWeight="600" fontFamily="JetBrains Mono">
          R2
        </text>
      </g>

      {/* L1 / R1 Bumpers */}
      <g {...buttonHandlers('l1')} aria-label="Botão L1">
        <path
          d="M 64 56 C 68 42, 122 40, 134 50 L 130 62 L 62 66 Z"
          fill={isLit('l1') ? '#2563EB' : '#1E293B'}
          stroke={isSel('l1') ? '#60A5FA' : isRemapped('l1') ? '#F59E0B' : '#334155'}
          strokeWidth={isSel('l1') ? '2' : '1.25'}
        />
        <text x="98" y="56" textAnchor="middle" fill="#E2E8F0" fontSize="9.5" fontWeight="600" fontFamily="JetBrains Mono">
          L1
        </text>
      </g>

      <g {...buttonHandlers('r1')} aria-label="Botão R1">
        <path
          d="M 396 56 C 392 42, 338 40, 326 50 L 330 62 L 398 66 Z"
          fill={isLit('r1') ? '#2563EB' : '#1E293B'}
          stroke={isSel('r1') ? '#60A5FA' : isRemapped('r1') ? '#F59E0B' : '#334155'}
          strokeWidth={isSel('r1') ? '2' : '1.25'}
        />
        <text x="362" y="56" textAnchor="middle" fill="#E2E8F0" fontSize="9.5" fontWeight="600" fontFamily="JetBrains Mono">
          R1
        </text>
      </g>

      {/* Main DualSense Ergonomic Shell */}
      <path
        d="M 122 58
           L 338 58
           C 382 58, 412 80, 424 130
           L 442 222
           C 448 250, 424 274, 398 268
           C 378 263, 366 236, 352 210
           C 344 196, 330 192, 308 194
           L 152 194
           C 130 192, 116 196, 108 210
           C 94 236, 82 263, 62 268
           C 36 274, 12 250, 18 222
           L 36 130
           C 48 80, 78 58, 122 58 Z"
        fill="url(#psBodyGrad)"
        stroke="#334155"
        strokeWidth="1.5"
      />

      {/* Lower dark accent trim (DualSense two-tone silhouette) */}
      <path
        d="M 134 150
           C 148 144, 160 144, 184 148
           L 276 148
           C 300 144, 312 144, 326 150
           L 346 198
           C 332 193, 316 194, 308 194
           L 152 194
           C 144 194, 128 193, 114 198 Z"
        fill="url(#psGripGrad)"
        stroke="#1E293B"
        strokeWidth="1"
      />

      {/* Touchpad + Lightbar */}
      <g {...buttonHandlers('touchpadOrShare')} aria-label="Touchpad">
        <path
          d="M 164 62 L 296 62 L 288 126 C 287 132, 282 136, 276 136 L 184 136 C 178 136, 173 132, 172 126 Z"
          fill={isLit('touchpadOrShare') ? '#1D4ED8' : 'url(#psTouchpadGrad)'}
          stroke={isSel('touchpadOrShare') ? '#60A5FA' : isRemapped('touchpadOrShare') ? '#F59E0B' : '#334155'}
          strokeWidth={isSel('touchpadOrShare') ? '2' : '1.25'}
        />
        {/* DualSense lightbar lines */}
        <line x1="169" y1="64" x2="176" y2="128" stroke="#3B82F6" strokeWidth="2.2" strokeLinecap="round" opacity="0.85" />
        <line x1="291" y1="64" x2="284" y2="128" stroke="#3B82F6" strokeWidth="2.2" strokeLinecap="round" opacity="0.85" />
        <text x="230" y="102" textAnchor="middle" fill="#64748B" fontSize="8.5" fontWeight="500" fontFamily="JetBrains Mono">
          TOUCHPAD
        </text>
      </g>

      {/* Create & Options Buttons */}
      <g {...buttonHandlers('select')} aria-label="Botão Create">
        <rect
          x="141"
          y="74"
          width="11"
          height="20"
          rx="5.5"
          transform="rotate(-10 146 84)"
          fill={isLit('select') ? '#3B82F6' : '#0F172A'}
          stroke={isSel('select') ? '#60A5FA' : isRemapped('select') ? '#F59E0B' : '#475569'}
          strokeWidth={isSel('select') ? '1.8' : '1.2'}
        />
        <text x="144" y="69" textAnchor="middle" fill="#64748B" fontSize="7" fontFamily="JetBrains Mono">
          CRT
        </text>
      </g>

      <g {...buttonHandlers('start')} aria-label="Botão Options">
        <rect
          x="308"
          y="74"
          width="11"
          height="20"
          rx="5.5"
          transform="rotate(10 313 84)"
          fill={isLit('start') ? '#3B82F6' : '#0F172A'}
          stroke={isSel('start') ? '#60A5FA' : isRemapped('start') ? '#F59E0B' : '#475569'}
          strokeWidth={isSel('start') ? '1.8' : '1.2'}
        />
        <text x="316" y="69" textAnchor="middle" fill="#64748B" fontSize="7" fontFamily="JetBrains Mono">
          OPT
        </text>
      </g>

      {/* PS Home Button */}
      <g {...buttonHandlers('home')} aria-label="Botão PS">
        <circle
          cx="230"
          cy="168"
          r="11"
          fill={isLit('home') ? '#2563EB' : '#0F172A'}
          stroke={isSel('home') ? '#60A5FA' : '#475569'}
          strokeWidth={isSel('home') ? '2' : '1.25'}
        />
        <text x="230" y="171.5" textAnchor="middle" fill="#CBD5E1" fontSize="8.5" fontWeight="700" fontFamily="Plus Jakarta Sans">
          PS
        </text>
      </g>

      {/* Split D-Pad (Left) */}
      <g>
        {/* D-Pad Up */}
        <g {...buttonHandlers('dpadUp')} aria-label="Direcional Cima">
          <path
            d="M 88 89 L 106 89 L 106 105 L 97 112 L 88 105 Z"
            fill={isLit('dpadUp') ? '#3B82F6' : '#0F172A'}
            stroke={isSel('dpadUp') ? '#60A5FA' : isRemapped('dpadUp') ? '#F59E0B' : '#475569'}
            strokeWidth={isSel('dpadUp') ? '2' : '1.2'}
          />
        </g>
        {/* D-Pad Down */}
        <g {...buttonHandlers('dpadDown')} aria-label="Direcional Baixo">
          <path
            d="M 88 145 L 106 145 L 106 129 L 97 122 L 88 129 Z"
            fill={isLit('dpadDown') ? '#3B82F6' : '#0F172A'}
            stroke={isSel('dpadDown') ? '#60A5FA' : isRemapped('dpadDown') ? '#F59E0B' : '#475569'}
            strokeWidth={isSel('dpadDown') ? '2' : '1.2'}
          />
        </g>
        {/* D-Pad Left */}
        <g {...buttonHandlers('dpadLeft')} aria-label="Direcional Esquerda">
          <path
            d="M 69 108 L 85 108 L 92 117 L 85 126 L 69 126 Z"
            fill={isLit('dpadLeft') ? '#3B82F6' : '#0F172A'}
            stroke={isSel('dpadLeft') ? '#60A5FA' : isRemapped('dpadLeft') ? '#F59E0B' : '#475569'}
            strokeWidth={isSel('dpadLeft') ? '2' : '1.2'}
          />
        </g>
        {/* D-Pad Right */}
        <g {...buttonHandlers('dpadRight')} aria-label="Direcional Direita">
          <path
            d="M 125 108 L 109 108 L 102 117 L 109 126 L 125 126 Z"
            fill={isLit('dpadRight') ? '#3B82F6' : '#0F172A'}
            stroke={isSel('dpadRight') ? '#60A5FA' : isRemapped('dpadRight') ? '#F59E0B' : '#475569'}
            strokeWidth={isSel('dpadRight') ? '2' : '1.2'}
          />
        </g>
      </g>

      {/* PlayStation Action Face Buttons (Triangle, Circle, Cross, Square) */}
      {/* Triangle (Top) */}
      <g {...buttonHandlers('faceTop')} aria-label="Botão Triângulo">
        <circle
          cx="363"
          cy="90"
          r="14"
          fill={isLit('faceTop') ? '#10B981' : '#0F172A'}
          stroke={isSel('faceTop') ? '#60A5FA' : isRemapped('faceTop') ? '#F59E0B' : '#475569'}
          strokeWidth={isSel('faceTop') ? '2' : '1.25'}
        />
        <polygon
          points="363,82 370,95 356,95"
          fill="none"
          stroke={isLit('faceTop') ? '#FFFFFF' : '#34D399'}
          strokeWidth="2"
          strokeLinejoin="round"
        />
      </g>

      {/* Circle (Right) */}
      <g {...buttonHandlers('faceRight')} aria-label="Botão Círculo">
        <circle
          cx="392"
          cy="118"
          r="14"
          fill={isLit('faceRight') ? '#EF4444' : '#0F172A'}
          stroke={isSel('faceRight') ? '#60A5FA' : isRemapped('faceRight') ? '#F59E0B' : '#475569'}
          strokeWidth={isSel('faceRight') ? '2' : '1.25'}
        />
        <circle
          cx="392"
          cy="118"
          r="6.2"
          fill="none"
          stroke={isLit('faceRight') ? '#FFFFFF' : '#F87171'}
          strokeWidth="2"
        />
      </g>

      {/* Cross (Bottom) */}
      <g {...buttonHandlers('faceBottom')} aria-label="Botão Cruz">
        <circle
          cx="363"
          cy="146"
          r="14"
          fill={isLit('faceBottom') ? '#3B82F6' : '#0F172A'}
          stroke={isSel('faceBottom') ? '#60A5FA' : isRemapped('faceBottom') ? '#F59E0B' : '#475569'}
          strokeWidth={isSel('faceBottom') ? '2' : '1.25'}
        />
        <path
          d="M 357.5 140.5 L 368.5 151.5 M 368.5 140.5 L 357.5 151.5"
          stroke={isLit('faceBottom') ? '#FFFFFF' : '#60A5FA'}
          strokeWidth="2.2"
          strokeLinecap="round"
        />
      </g>

      {/* Square (Left) */}
      <g {...buttonHandlers('faceLeft')} aria-label="Botão Quadrado">
        <circle
          cx="334"
          cy="118"
          r="14"
          fill={isLit('faceLeft') ? '#EC4899' : '#0F172A'}
          stroke={isSel('faceLeft') ? '#60A5FA' : isRemapped('faceLeft') ? '#F59E0B' : '#475569'}
          strokeWidth={isSel('faceLeft') ? '2' : '1.25'}
        />
        <rect
          x="328"
          y="112"
          width="12"
          height="12"
          rx="1.5"
          fill="none"
          stroke={isLit('faceLeft') ? '#FFFFFF' : '#F472B6'}
          strokeWidth="2"
        />
      </g>

      {/* Symmetrical Left Analog Stick (L3) */}
      <g {...buttonHandlers('l3')} aria-label="Analógico Esquerdo L3">
        <circle cx="166" cy="178" r="27" fill="#090D16" stroke="#334155" strokeWidth="1.5" />
        <circle
          cx={lsX}
          cy={lsY}
          r="20"
          fill={isLit('l3') ? '#2563EB' : '#1E293B'}
          stroke={isSel('l3') ? '#60A5FA' : isRemapped('l3') ? '#F59E0B' : '#475569'}
          strokeWidth={isSel('l3') ? '2' : '1.4'}
        />
        <circle cx={lsX} cy={lsY} r="13" fill="#0F172A" opacity="0.7" />
        <text x={lsX} y={lsY + 3.5} textAnchor="middle" fill="#94A3B8" fontSize="8.5" fontWeight="600" fontFamily="JetBrains Mono">
          L3
        </text>
      </g>

      {/* Symmetrical Right Analog Stick (R3) */}
      <g {...buttonHandlers('r3')} aria-label="Analógico Direito R3">
        <circle cx="294" cy="178" r="27" fill="#090D16" stroke="#334155" strokeWidth="1.5" />
        <circle
          cx={rsX}
          cy={rsY}
          r="20"
          fill={isLit('r3') ? '#2563EB' : '#1E293B'}
          stroke={isSel('r3') ? '#60A5FA' : isRemapped('r3') ? '#F59E0B' : '#475569'}
          strokeWidth={isSel('r3') ? '2' : '1.4'}
        />
        <circle cx={rsX} cy={rsY} r="13" fill="#0F172A" opacity="0.7" />
        <text x={rsX} y={rsY + 3.5} textAnchor="middle" fill="#94A3B8" fontSize="8.5" fontWeight="600" fontFamily="JetBrains Mono">
          R3
        </text>
      </g>
    </svg>
  );
};
