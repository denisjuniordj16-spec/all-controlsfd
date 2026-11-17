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

export const XboxSvg: React.FC<ControllerSvgProps> = ({
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

  // Asymmetrical layout: Left Stick top-left (106, 118), D-Pad bottom-left (162, 174), Right Stick bottom-right (294, 174)
  const lsX = 106 + leftStick.x * 11;
  const lsY = 118 + leftStick.y * 11;
  const rsX = 294 + rightStick.x * 11;
  const rsY = 174 + rightStick.y * 11;

  return (
    <svg
      viewBox="0 0 460 290"
      className="w-full h-auto select-none drop-shadow-[0_14px_30px_rgba(0,0,0,0.45)]"
      aria-label="Diagrama interativo do controle Xbox Series X|S"
    >
      <defs>
        <linearGradient id="xbBodyGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#1E293B" />
          <stop offset="55%" stopColor="#141C2B" />
          <stop offset="100%" stopColor="#0C121E" />
        </linearGradient>
      </defs>

      {/* LT / RT Triggers */}
      <g {...buttonHandlers('l2')} aria-label="Gatilho LT">
        <rect
          x="74"
          y="18"
          width="54"
          height="22"
          rx="8"
          fill="#0F172A"
          stroke={isSel('l2') ? '#4ADE80' : isLit('l2') ? '#22C55E' : '#334155'}
          strokeWidth={isSel('l2') ? '2' : '1.25'}
        />
        <rect
          x="76"
          y="20"
          width={Math.max(0, Math.min(50, leftTrigger * 50))}
          height="18"
          rx="6"
          fill="#16A34A"
          opacity={leftTrigger > 0.02 ? 0.75 : 0}
        />
        <text x="101" y="33" textAnchor="middle" fill="#CBD5E1" fontSize="10" fontWeight="600" fontFamily="JetBrains Mono">
          LT
        </text>
      </g>

      <g {...buttonHandlers('r2')} aria-label="Gatilho RT">
        <rect
          x="332"
          y="18"
          width="54"
          height="22"
          rx="8"
          fill="#0F172A"
          stroke={isSel('r2') ? '#4ADE80' : isLit('r2') ? '#22C55E' : '#334155'}
          strokeWidth={isSel('r2') ? '2' : '1.25'}
        />
        <rect
          x="334"
          y="20"
          width={Math.max(0, Math.min(50, rightTrigger * 50))}
          height="18"
          rx="6"
          fill="#16A34A"
          opacity={rightTrigger > 0.02 ? 0.75 : 0}
        />
        <text x="359" y="33" textAnchor="middle" fill="#CBD5E1" fontSize="10" fontWeight="600" fontFamily="JetBrains Mono">
          RT
        </text>
      </g>

      {/* LB / RB Bumpers */}
      <g {...buttonHandlers('l1')} aria-label="Botão LB">
        <path
          d="M 62 58 C 70 42, 128 38, 154 50 L 148 64 L 58 68 Z"
          fill={isLit('l1') ? '#16A34A' : '#1E293B'}
          stroke={isSel('l1') ? '#4ADE80' : isRemapped('l1') ? '#F59E0B' : '#334155'}
          strokeWidth={isSel('l1') ? '2' : '1.25'}
        />
        <text x="104" y="56" textAnchor="middle" fill="#E2E8F0" fontSize="9.5" fontWeight="600" fontFamily="JetBrains Mono">
          LB
        </text>
      </g>

      <g {...buttonHandlers('r1')} aria-label="Botão RB">
        <path
          d="M 398 58 C 390 42, 332 38, 306 50 L 312 64 L 402 68 Z"
          fill={isLit('r1') ? '#16A34A' : '#1E293B'}
          stroke={isSel('r1') ? '#4ADE80' : isRemapped('r1') ? '#F59E0B' : '#334155'}
          strokeWidth={isSel('r1') ? '2' : '1.25'}
        />
        <text x="356" y="56" textAnchor="middle" fill="#E2E8F0" fontSize="9.5" fontWeight="600" fontFamily="JetBrains Mono">
          RB
        </text>
      </g>

      {/* Main Xbox Series X|S Shell */}
      <path
        d="M 134 54
           C 172 48, 288 48, 326 54
           C 378 62, 412 86, 424 136
           L 440 220
           C 444 252, 418 272, 392 266
           C 372 261, 356 232, 338 206
           C 326 190, 312 190, 294 190
           L 166 190
           C 148 190, 134 190, 122 206
           C 104 232, 88 261, 68 266
           C 42 272, 16 252, 20 220
           L 36 136
           C 48 86, 82 62, 134 54 Z"
        fill="url(#xbBodyGrad)"
        stroke="#334155"
        strokeWidth="1.5"
      />

      {/* Top central glossy cap accent */}
      <path
        d="M 164 53 C 200 49, 260 49, 296 53 L 288 74 L 172 74 Z"
        fill="#0F172A"
        stroke="#1E293B"
        strokeWidth="1"
      />

      {/* Xbox Guide Button */}
      <g {...buttonHandlers('home')} aria-label="Botão Xbox">
        <circle
          cx="230"
          cy="78"
          r="14"
          fill={isLit('home') ? '#16A34A' : '#0F172A'}
          stroke={isSel('home') ? '#4ADE80' : '#475569'}
          strokeWidth={isSel('home') ? '2' : '1.4'}
        />
        <path
          d="M 224 72 Q 230 78 236 84 M 236 72 Q 230 78 224 84"
          stroke={isLit('home') ? '#FFFFFF' : '#4ADE80'}
          strokeWidth="2.1"
          strokeLinecap="round"
          fill="none"
        />
      </g>

      {/* View, Share, and Menu Buttons */}
      <g {...buttonHandlers('select')} aria-label="Botão View">
        <circle
          cx="188"
          cy="112"
          r="10"
          fill={isLit('select') ? '#16A34A' : '#0F172A'}
          stroke={isSel('select') ? '#4ADE80' : isRemapped('select') ? '#F59E0B' : '#475569'}
          strokeWidth={isSel('select') ? '1.8' : '1.2'}
        />
        <rect x="184" y="109" width="6" height="5" rx="0.8" fill="none" stroke="#94A3B8" strokeWidth="1.2" />
        <rect x="186.5" y="111.5" width="6" height="5" rx="0.8" fill="#0F172A" stroke="#94A3B8" strokeWidth="1.2" />
      </g>

      <g {...buttonHandlers('touchpadOrShare')} aria-label="Botão Share">
        <rect
          x="219"
          y="122"
          width="22"
          height="13"
          rx="6.5"
          fill={isLit('touchpadOrShare') ? '#16A34A' : '#0F172A'}
          stroke={isSel('touchpadOrShare') ? '#4ADE80' : isRemapped('touchpadOrShare') ? '#F59E0B' : '#475569'}
          strokeWidth={isSel('touchpadOrShare') ? '1.8' : '1.2'}
        />
        <text x="230" y="131" textAnchor="middle" fill="#94A3B8" fontSize="6.5" fontWeight="600" fontFamily="JetBrains Mono">
          SHARE
        </text>
      </g>

      <g {...buttonHandlers('start')} aria-label="Botão Menu">
        <circle
          cx="272"
          cy="112"
          r="10"
          fill={isLit('start') ? '#16A34A' : '#0F172A'}
          stroke={isSel('start') ? '#4ADE80' : isRemapped('start') ? '#F59E0B' : '#475569'}
          strokeWidth={isSel('start') ? '1.8' : '1.2'}
        />
        <line x1="267" y1="109" x2="277" y2="109" stroke="#94A3B8" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="267" y1="112" x2="277" y2="112" stroke="#94A3B8" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="267" y1="115" x2="277" y2="115" stroke="#94A3B8" strokeWidth="1.5" strokeLinecap="round" />
      </g>

      {/* Asymmetrical Left Analog Stick (LS - top left) */}
      <g {...buttonHandlers('l3')} aria-label="Analógico Esquerdo LS">
        <circle cx="106" cy="118" r="27" fill="#090D16" stroke="#334155" strokeWidth="1.5" />
        <circle
          cx={lsX}
          cy={lsY}
          r="20"
          fill={isLit('l3') ? '#16A34A' : '#1E293B'}
          stroke={isSel('l3') ? '#4ADE80' : isRemapped('l3') ? '#F59E0B' : '#475569'}
          strokeWidth={isSel('l3') ? '2' : '1.4'}
        />
        <circle cx={lsX} cy={lsY} r="13" fill="#0F172A" opacity="0.7" />
        <text x={lsX} y={lsY + 3.5} textAnchor="middle" fill="#94A3B8" fontSize="8.5" fontWeight="600" fontFamily="JetBrains Mono">
          LS
        </text>
      </g>

      {/* Hybrid Dish D-Pad (Bottom Left) */}
      <g>
        <circle cx="162" cy="174" r="28" fill="#090D16" stroke="#334155" strokeWidth="1.25" />
        {/* Up */}
        <g {...buttonHandlers('dpadUp')} aria-label="D-Pad Cima">
          <rect
            x="154"
            y="148"
            width="16"
            height="19"
            rx="3"
            fill={isLit('dpadUp') ? '#22C55E' : '#1E293B'}
            stroke={isSel('dpadUp') ? '#4ADE80' : isRemapped('dpadUp') ? '#F59E0B' : '#475569'}
            strokeWidth={isSel('dpadUp') ? '1.8' : '1'}
          />
        </g>
        {/* Down */}
        <g {...buttonHandlers('dpadDown')} aria-label="D-Pad Baixo">
          <rect
            x="154"
            y="181"
            width="16"
            height="19"
            rx="3"
            fill={isLit('dpadDown') ? '#22C55E' : '#1E293B'}
            stroke={isSel('dpadDown') ? '#4ADE80' : isRemapped('dpadDown') ? '#F59E0B' : '#475569'}
            strokeWidth={isSel('dpadDown') ? '1.8' : '1'}
          />
        </g>
        {/* Left */}
        <g {...buttonHandlers('dpadLeft')} aria-label="D-Pad Esquerda">
          <rect
            x="136"
            y="166"
            width="19"
            height="16"
            rx="3"
            fill={isLit('dpadLeft') ? '#22C55E' : '#1E293B'}
            stroke={isSel('dpadLeft') ? '#4ADE80' : isRemapped('dpadLeft') ? '#F59E0B' : '#475569'}
            strokeWidth={isSel('dpadLeft') ? '1.8' : '1'}
          />
        </g>
        {/* Right */}
        <g {...buttonHandlers('dpadRight')} aria-label="D-Pad Direita">
          <rect
            x="169"
            y="166"
            width="19"
            height="16"
            rx="3"
            fill={isLit('dpadRight') ? '#22C55E' : '#1E293B'}
            stroke={isSel('dpadRight') ? '#4ADE80' : isRemapped('dpadRight') ? '#F59E0B' : '#475569'}
            strokeWidth={isSel('dpadRight') ? '1.8' : '1'}
          />
        </g>
        <circle cx="162" cy="174" r="6" fill="#0F172A" pointerEvents="none" />
      </g>

      {/* Right Analog Stick (RS - bottom right) */}
      <g {...buttonHandlers('r3')} aria-label="Analógico Direito RS">
        <circle cx="294" cy="174" r="27" fill="#090D16" stroke="#334155" strokeWidth="1.5" />
        <circle
          cx={rsX}
          cy={rsY}
          r="20"
          fill={isLit('r3') ? '#16A34A' : '#1E293B'}
          stroke={isSel('r3') ? '#4ADE80' : isRemapped('r3') ? '#F59E0B' : '#475569'}
          strokeWidth={isSel('r3') ? '2' : '1.4'}
        />
        <circle cx={rsX} cy={rsY} r="13" fill="#0F172A" opacity="0.7" />
        <text x={rsX} y={rsY + 3.5} textAnchor="middle" fill="#94A3B8" fontSize="8.5" fontWeight="600" fontFamily="JetBrains Mono">
          RS
        </text>
      </g>

      {/* Xbox Action Face Buttons (Y, B, A, X) */}
      {/* Y (Top) */}
      <g {...buttonHandlers('faceTop')} aria-label="Botão Y">
        <circle
          cx="355"
          cy="90"
          r="14"
          fill={isLit('faceTop') ? '#F59E0B' : '#0F172A'}
          stroke={isSel('faceTop') ? '#4ADE80' : isRemapped('faceTop') ? '#F59E0B' : '#475569'}
          strokeWidth={isSel('faceTop') ? '2' : '1.25'}
        />
        <text
          x="355"
          y="94.5"
          textAnchor="middle"
          fill={isLit('faceTop') ? '#090D16' : '#FBBF24'}
          fontSize="13"
          fontWeight="700"
          fontFamily="Plus Jakarta Sans"
        >
          Y
        </text>
      </g>

      {/* B (Right) */}
      <g {...buttonHandlers('faceRight')} aria-label="Botão B">
        <circle
          cx="384"
          cy="118"
          r="14"
          fill={isLit('faceRight') ? '#EF4444' : '#0F172A'}
          stroke={isSel('faceRight') ? '#4ADE80' : isRemapped('faceRight') ? '#F59E0B' : '#475569'}
          strokeWidth={isSel('faceRight') ? '2' : '1.25'}
        />
        <text
          x="384"
          y="122.5"
          textAnchor="middle"
          fill={isLit('faceRight') ? '#FFFFFF' : '#F87171'}
          fontSize="13"
          fontWeight="700"
          fontFamily="Plus Jakarta Sans"
        >
          B
        </text>
      </g>

      {/* A (Bottom) */}
      <g {...buttonHandlers('faceBottom')} aria-label="Botão A">
        <circle
          cx="355"
          cy="146"
          r="14"
          fill={isLit('faceBottom') ? '#22C55E' : '#0F172A'}
          stroke={isSel('faceBottom') ? '#4ADE80' : isRemapped('faceBottom') ? '#F59E0B' : '#475569'}
          strokeWidth={isSel('faceBottom') ? '2' : '1.25'}
        />
        <text
          x="355"
          y="150.5"
          textAnchor="middle"
          fill={isLit('faceBottom') ? '#090D16' : '#4ADE80'}
          fontSize="13"
          fontWeight="700"
          fontFamily="Plus Jakarta Sans"
        >
          A
        </text>
      </g>

      {/* X (Left) */}
      <g {...buttonHandlers('faceLeft')} aria-label="Botão X">
        <circle
          cx="326"
          cy="118"
          r="14"
          fill={isLit('faceLeft') ? '#3B82F6' : '#0F172A'}
          stroke={isSel('faceLeft') ? '#4ADE80' : isRemapped('faceLeft') ? '#F59E0B' : '#475569'}
          strokeWidth={isSel('faceLeft') ? '2' : '1.25'}
        />
        <text
          x="326"
          y="122.5"
          textAnchor="middle"
          fill={isLit('faceLeft') ? '#FFFFFF' : '#60A5FA'}
          fontSize="13"
          fontWeight="700"
          fontFamily="Plus Jakarta Sans"
        >
          X
        </text>
      </g>
    </svg>
  );
};
