import React, { useRef, useState } from 'react';
import { RotateCcw } from 'lucide-react';
import {
  CURVE_LABELS,
  DEFAULT_STICK_CONFIG,
  applyStickCalibration,
  evaluateCurveScalar,
} from '../data/controllerMappings';
import { ResponseCurveType, StickConfig, StickVector } from '../types/controller';

interface StickCurveEditorProps {
  side: 'left' | 'right';
  config: StickConfig;
  rawVector: StickVector;
  onChange: (next: StickConfig) => void;
  onSimulateVector: (vec: StickVector) => void;
}

export const StickCurveEditor: React.FC<StickCurveEditorProps> = ({
  side,
  config,
  rawVector,
  onChange,
  onSimulateVector,
}) => {
  const padRef = useRef<SVGSVGElement | null>(null);
  const [dragging, setDragging] = useState(false);

  const calibrated = applyStickCalibration(rawVector, config);
  const rawMag = Math.min(1, Math.hypot(rawVector.x, rawVector.y));
  const outMag = Math.min(1, Math.hypot(calibrated.x, calibrated.y));

  const title = side === 'left' ? 'Analógico Esquerdo' : 'Analógico Direito';
  const subtitle = side === 'left' ? 'L3 (PlayStation) · LS (Xbox)' : 'R3 (PlayStation) · RS (Xbox)';

  const handlePadPointer = (e: React.PointerEvent<SVGSVGElement>) => {
    if (!padRef.current) return;
    const rect = padRef.current.getBoundingClientRect();
    const cx = rect.width / 2;
    const cy = rect.height / 2;
    const radius = rect.width * 0.42;
    let dx = (e.clientX - rect.left - cx) / radius;
    let dy = (e.clientY - rect.top - cy) / radius;
    const dist = Math.hypot(dx, dy);
    if (dist > 1) {
      dx /= dist;
      dy /= dist;
    }
    onSimulateVector({
      x: Number(dx.toFixed(3)),
      y: Number(dy.toFixed(3)),
    });
  };

  // Build curve polyline points (0..100 input -> 0..100 output)
  const curvePoints: string[] = [];
  for (let i = 0; i <= 40; i++) {
    const input = i / 40;
    let out = 0;
    if (input > config.innerDeadzone) {
      const span = Math.max(0.05, config.outerDeadzone - config.innerDeadzone);
      const norm = Math.min(1, (input - config.innerDeadzone) / span);
      out = Math.min(
        1,
        evaluateCurveScalar(norm, config.curve, config.customCurveExponent) * config.sensitivity
      );
    }
    const px = 16 + input * 168;
    const py = 144 - out * 128;
    curvePoints.push(`${px.toFixed(1)},${py.toFixed(1)}`);
  }

  return (
    <div className="bg-[#111827] border border-slate-800 rounded-xl p-5 space-y-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-base font-semibold text-slate-100">{title}</h3>
          <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>
        </div>
        <button
          type="button"
          onClick={() => onChange({ ...DEFAULT_STICK_CONFIG })}
          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-800/70 hover:bg-slate-800 border border-slate-700/80 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Restaurar
        </button>
      </div>

      {/* Live Circular Pad + Response Curve Graph */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Interactive Circular Stick Simulator */}
        <div className="bg-[#0B0F17] border border-slate-800/90 rounded-lg p-3 flex flex-col items-center">
          <div className="w-full flex items-center justify-between text-[11px] text-slate-400 mb-2">
            <span>Campo Vetorial (Arraste)</span>
            <span className="font-mono tabular-nums text-slate-300">
              {Math.round(outMag * 100)}% saída
            </span>
          </div>
          <svg
            ref={padRef}
            viewBox="0 0 180 180"
            className="w-40 h-40 touch-none cursor-crosshair select-none"
            onPointerDown={(e) => {
              e.currentTarget.setPointerCapture(e.pointerId);
              setDragging(true);
              handlePadPointer(e);
            }}
            onPointerMove={(e) => {
              if (dragging) handlePadPointer(e);
            }}
            onPointerUp={() => {
              setDragging(false);
              onSimulateVector({ x: 0, y: 0 });
            }}
            onPointerCancel={() => {
              setDragging(false);
              onSimulateVector({ x: 0, y: 0 });
            }}
          >
            {/* Outer deadzone limit */}
            <circle
              cx="90"
              cy="90"
              r={74 * config.outerDeadzone}
              fill="rgba(59, 130, 246, 0.04)"
              stroke="#334155"
              strokeDasharray="3 3"
              strokeWidth="1"
            />
            {/* Full physical travel ring */}
            <circle cx="90" cy="90" r="74" fill="none" stroke="#1E293B" strokeWidth="1.5" />
            {/* Crosshair axes */}
            <line x1="16" y1="90" x2="164" y2="90" stroke="#1E293B" strokeWidth="1" />
            <line x1="90" y1="16" x2="90" y2="164" stroke="#1E293B" strokeWidth="1" />
            {/* Inner deadzone circle */}
            <circle
              cx="90"
              cy="90"
              r={74 * config.innerDeadzone}
              fill="rgba(245, 158, 11, 0.12)"
              stroke="#D97706"
              strokeWidth="1.2"
            />
            {/* Raw vector line & dot */}
            <line
              x1="90"
              y1="90"
              x2={90 + rawVector.x * 74}
              y2={90 + rawVector.y * 74}
              stroke="#64748B"
              strokeWidth="1.5"
              strokeDasharray="2 2"
            />
            <circle
              cx={90 + rawVector.x * 74}
              cy={90 + rawVector.y * 74}
              r="4.5"
              fill="#94A3B8"
            />
            {/* Calibrated vector dot */}
            <circle
              cx={90 + calibrated.x * 74}
              cy={90 + calibrated.y * 74}
              r="6"
              fill="#3B82F6"
              stroke="#F8FAFC"
              strokeWidth="1.5"
            />
          </svg>
          <div className="w-full grid grid-cols-2 gap-2 mt-2 pt-2 border-t border-slate-800/80 text-[11px] font-mono tabular-nums">
            <div className="text-slate-400">
              Bruto:{' '}
              <span className="text-slate-200">
                {rawVector.x.toFixed(2)}, {rawVector.y.toFixed(2)}
              </span>
            </div>
            <div className="text-right text-slate-400">
              Final:{' '}
              <span className="text-blue-400">
                {calibrated.x.toFixed(2)}, {calibrated.y.toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        {/* Response Curve Chart */}
        <div className="bg-[#0B0F17] border border-slate-800/90 rounded-lg p-3 flex flex-col justify-between">
          <div className="flex items-center justify-between text-[11px] text-slate-400 mb-2">
            <span>Curva de Resposta</span>
            <span className="font-mono tabular-nums text-slate-300">
              {CURVE_LABELS[config.curve].name}
            </span>
          </div>
          <svg viewBox="0 0 200 160" className="w-full h-40">
            {/* Grid */}
            <line x1="16" y1="144" x2="184" y2="144" stroke="#334155" strokeWidth="1" />
            <line x1="16" y1="16" x2="16" y2="144" stroke="#334155" strokeWidth="1" />
            <line x1="16" y1="80" x2="184" y2="80" stroke="#1E293B" strokeDasharray="3 3" />
            <line x1="100" y1="16" x2="100" y2="144" stroke="#1E293B" strokeDasharray="3 3" />
            {/* Linear baseline reference */}
            <line
              x1="16"
              y1="144"
              x2="184"
              y2="16"
              stroke="#334155"
              strokeWidth="1"
              strokeDasharray="4 4"
            />
            {/* Inner deadzone highlight */}
            <rect
              x="16"
              y="16"
              width={config.innerDeadzone * 168}
              height="128"
              fill="rgba(245, 158, 11, 0.08)"
            />
            {/* Curve path */}
            <polyline
              fill="none"
              stroke="#3B82F6"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              points={curvePoints.join(' ')}
            />
            {/* Live marker */}
            <circle
              cx={16 + rawMag * 168}
              cy={144 - outMag * 128}
              r="4.5"
              fill="#F8FAFC"
              stroke="#3B82F6"
              strokeWidth="2"
            />
          </svg>
          <p className="text-[11px] text-slate-400 leading-snug mt-2">
            {CURVE_LABELS[config.curve].description}
          </p>
        </div>
      </div>

      {/* Curve Presets */}
      <div>
        <label className="block text-xs font-medium text-slate-300 mb-2">
          Perfil da Curva
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5 bg-[#0B0F17] p-1 rounded-lg border border-slate-800">
          {(Object.keys(CURVE_LABELS) as ResponseCurveType[]).map((curveKey) => {
            const active = config.curve === curveKey;
            return (
              <button
                key={curveKey}
                type="button"
                onClick={() => onChange({ ...config, curve: curveKey })}
                className={`px-2 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap truncate cursor-pointer ${
                  active
                    ? 'bg-slate-800 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {curveKey === 'linear'
                  ? 'Linear'
                  : curveKey === 'precision'
                  ? 'Precisão'
                  : curveKey === 'dynamic'
                  ? 'Dinâmica'
                  : curveKey === 'aggressive'
                  ? 'Agressiva'
                  : 'Manual'}
              </button>
            );
          })}
        </div>
      </div>

      {/* Sliders */}
      <div className="space-y-3.5">
        <div>
          <div className="flex justify-between text-xs mb-1.5">
            <span className="text-slate-300">Zona Morta Interna (Deadzone)</span>
            <span className="font-mono tabular-nums text-amber-400">
              {Math.round(config.innerDeadzone * 100)}%
            </span>
          </div>
          <input
            type="range"
            min={0}
            max={40}
            step={1}
            value={Math.round(config.innerDeadzone * 100)}
            onChange={(e) =>
              onChange({ ...config, innerDeadzone: Number(e.target.value) / 100 })
            }
            className="w-full studio-range"
          />
        </div>

        <div>
          <div className="flex justify-between text-xs mb-1.5">
            <span className="text-slate-300">Limite Externo (Outer Threshold)</span>
            <span className="font-mono tabular-nums text-blue-400">
              {Math.round(config.outerDeadzone * 100)}%
            </span>
          </div>
          <input
            type="range"
            min={60}
            max={100}
            step={1}
            value={Math.round(config.outerDeadzone * 100)}
            onChange={(e) =>
              onChange({ ...config, outerDeadzone: Number(e.target.value) / 100 })
            }
            className="w-full studio-range"
          />
        </div>

        <div>
          <div className="flex justify-between text-xs mb-1.5">
            <span className="text-slate-300">Multiplicador de Sensibilidade</span>
            <span className="font-mono tabular-nums text-slate-200">
              {config.sensitivity.toFixed(2)}x
            </span>
          </div>
          <input
            type="range"
            min={50}
            max={175}
            step={5}
            value={Math.round(config.sensitivity * 100)}
            onChange={(e) =>
              onChange({ ...config, sensitivity: Number(e.target.value) / 100 })
            }
            className="w-full studio-range"
          />
        </div>

        {config.curve === 'custom' && (
          <div>
            <div className="flex justify-between text-xs mb-1.5">
              <span className="text-slate-300">Expoente da Curva Manual</span>
              <span className="font-mono tabular-nums text-slate-200">
                {config.customCurveExponent.toFixed(2)}
              </span>
            </div>
            <input
              type="range"
              min={40}
              max={300}
              step={5}
              value={Math.round(config.customCurveExponent * 100)}
              onChange={(e) =>
                onChange({ ...config, customCurveExponent: Number(e.target.value) / 100 })
              }
              className="w-full studio-range"
            />
          </div>
        )}
      </div>

      {/* Axis Toggles */}
      <div className="flex flex-wrap gap-3 pt-2 border-t border-slate-800/80">
        <label className="inline-flex items-center gap-2 text-xs text-slate-300 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={config.invertX}
            onChange={(e) => onChange({ ...config, invertX: e.target.checked })}
            className="rounded border-slate-700 bg-slate-900 text-blue-500 focus:ring-blue-500"
          />
          Inverter Eixo X
        </label>
        <label className="inline-flex items-center gap-2 text-xs text-slate-300 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={config.invertY}
            onChange={(e) => onChange({ ...config, invertY: e.target.checked })}
            className="rounded border-slate-700 bg-slate-900 text-blue-500 focus:ring-blue-500"
          />
          Inverter Eixo Y
        </label>
      </div>
    </div>
  );
};
