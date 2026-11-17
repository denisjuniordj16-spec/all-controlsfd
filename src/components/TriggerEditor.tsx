import React from 'react';
import { RotateCcw } from 'lucide-react';
import { DEFAULT_TRIGGER_CONFIG, applyTriggerCalibration } from '../data/controllerMappings';
import { TriggerConfig } from '../types/controller';

interface TriggerEditorProps {
  side: 'left' | 'right';
  config: TriggerConfig;
  rawValue: number;
  onChange: (next: TriggerConfig) => void;
  onSimulateValue: (val: number) => void;
}

const ADAPTIVE_MODES: Array<{
  id: TriggerConfig['playstationAdaptiveMode'];
  label: string;
  desc: string;
}> = [
  { id: 'off', label: 'Desligado', desc: 'Curso livre sem resistência' },
  { id: 'feedback', label: 'Feedback', desc: 'Resistência progressiva contínua' },
  { id: 'weapon', label: 'Gatilho Arma', desc: 'Ponto de quebra tátil no disparo' },
  { id: 'rigid', label: 'Rígido', desc: 'Pressão firme em toda a faixa' },
];

export const TriggerEditor: React.FC<TriggerEditorProps> = ({
  side,
  config,
  rawValue,
  onChange,
  onSimulateValue,
}) => {
  const calibrated = applyTriggerCalibration(rawValue, config);
  const title = side === 'left' ? 'Gatilho Esquerdo' : 'Gatilho Direito';
  const subtitle = side === 'left' ? 'L2 (PlayStation) · LT (Xbox)' : 'R2 (PlayStation) · RT (Xbox)';

  return (
    <div className="bg-[#111827] border border-slate-800 rounded-xl p-5 space-y-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-base font-semibold text-slate-100">{title}</h3>
          <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>
        </div>
        <button
          type="button"
          onClick={() => onChange({ ...DEFAULT_TRIGGER_CONFIG })}
          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-800/70 hover:bg-slate-800 border border-slate-700/80 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Restaurar
        </button>
      </div>

      {/* Live Travel Bar + Simulator */}
      <div className="bg-[#0B0F17] border border-slate-800/90 rounded-lg p-4 space-y-3">
        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-400">Curso Físico vs Saída Calibrada</span>
          <span className="font-mono tabular-nums text-slate-200">
            Bruto {Math.round(rawValue * 100)}% → Saída {Math.round(calibrated * 100)}%
          </span>
        </div>

        {/* Dual Gauge */}
        <div className="space-y-2">
          <div className="relative h-3.5 bg-slate-900 rounded-md overflow-hidden border border-slate-800">
            {/* Deadzone band */}
            <div
              className="absolute inset-y-0 left-0 bg-amber-500/20 border-r border-amber-500/60"
              style={{ width: `${config.deadzone * 100}%` }}
            />
            {/* Max threshold line */}
            <div
              className="absolute inset-y-0 border-r border-slate-400/70"
              style={{ left: `${config.maxThreshold * 100}%` }}
            />
            {/* Raw fill */}
            <div
              className="h-full bg-slate-500/70 transition-[width] duration-75"
              style={{ width: `${rawValue * 100}%` }}
            />
          </div>

          <div className="relative h-3.5 bg-slate-900 rounded-md overflow-hidden border border-slate-800">
            <div
              className="h-full bg-gradient-to-r from-blue-600 to-emerald-500 transition-[width] duration-75"
              style={{ width: `${calibrated * 100}%` }}
            />
          </div>
        </div>

        {/* Interactive Test Slider */}
        <div className="pt-2">
          <div className="flex justify-between text-[11px] text-slate-400 mb-1">
            <span>Simular pressão manual do gatilho</span>
            <button
              type="button"
              onClick={() => onSimulateValue(0)}
              className="text-slate-400 hover:text-white underline cursor-pointer"
            >
              Soltar
            </button>
          </div>
          <input
            type="range"
            min={0}
            max={100}
            step={1}
            value={Math.round(rawValue * 100)}
            onChange={(e) => onSimulateValue(Number(e.target.value) / 100)}
            className="w-full studio-range"
          />
        </div>
      </div>

      {/* Activation Range Controls */}
      <div className="space-y-3.5">
        <div>
          <div className="flex justify-between text-xs mb-1.5">
            <span className="text-slate-300">Zona Morta Inicial</span>
            <span className="font-mono tabular-nums text-amber-400">
              {Math.round(config.deadzone * 100)}%
            </span>
          </div>
          <input
            type="range"
            min={0}
            max={40}
            step={1}
            value={Math.round(config.deadzone * 100)}
            onChange={(e) =>
              onChange({ ...config, deadzone: Number(e.target.value) / 100 })
            }
            className="w-full studio-range"
          />
        </div>

        <div>
          <div className="flex justify-between text-xs mb-1.5">
            <span className="text-slate-300">Ponto de Saturação Máxima</span>
            <span className="font-mono tabular-nums text-blue-400">
              {Math.round(config.maxThreshold * 100)}%
            </span>
          </div>
          <input
            type="range"
            min={50}
            max={100}
            step={1}
            value={Math.round(config.maxThreshold * 100)}
            onChange={(e) =>
              onChange({ ...config, maxThreshold: Number(e.target.value) / 100 })
            }
            className="w-full studio-range"
          />
        </div>

        <label className="flex items-center justify-between p-3 bg-[#0B0F17] border border-slate-800 rounded-lg cursor-pointer">
          <div>
            <div className="text-xs font-medium text-slate-200">
              Gatilho Rápido (Hair-Trigger)
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">
              Envia 100% imediatamente ao ultrapassar a zona morta inicial.
            </div>
          </div>
          <input
            type="checkbox"
            checked={config.hairTrigger}
            onChange={(e) => onChange({ ...config, hairTrigger: e.target.checked })}
            className="rounded border-slate-700 bg-slate-900 text-blue-500 focus:ring-blue-500"
          />
        </label>
      </div>

      {/* Platform-Specific Feedback Settings */}
      <div className="pt-3 border-t border-slate-800/80 space-y-4">
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-blue-400">
              PlayStation DualSense · Gatilho Adaptável
            </span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 bg-[#0B0F17] p-1 rounded-lg border border-slate-800">
            {ADAPTIVE_MODES.map((mode) => {
              const active = config.playstationAdaptiveMode === mode.id;
              return (
                <button
                  key={mode.id}
                  type="button"
                  onClick={() =>
                    onChange({ ...config, playstationAdaptiveMode: mode.id })
                  }
                  className={`px-2 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap truncate cursor-pointer ${
                    active
                      ? 'bg-blue-600/20 text-blue-300 border border-blue-500/40'
                      : 'text-slate-400 hover:text-slate-200 border border-transparent'
                  }`}
                >
                  {mode.label}
                </button>
              );
            })}
          </div>
          <p className="text-[11px] text-slate-400 mt-1.5">
            {ADAPTIVE_MODES.find((m) => m.id === config.playstationAdaptiveMode)?.desc}
          </p>
        </div>

        <div>
          <div className="flex justify-between text-xs mb-1.5">
            <span className="font-medium text-emerald-400">
              Xbox Series X|S · Impulse Trigger
            </span>
            <span className="font-mono tabular-nums text-emerald-300">
              {config.xboxImpulseStrength}%
            </span>
          </div>
          <input
            type="range"
            min={0}
            max={100}
            step={5}
            value={config.xboxImpulseStrength}
            onChange={(e) =>
              onChange({ ...config, xboxImpulseStrength: Number(e.target.value) })
            }
            className="w-full studio-range"
          />
        </div>
      </div>
    </div>
  );
};
