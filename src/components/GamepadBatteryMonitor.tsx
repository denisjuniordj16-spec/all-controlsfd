import React from 'react';
import {
  Battery,
  BatteryCharging,
  BatteryFull,
  BatteryLow,
  BatteryMedium,
  BatteryWarning,
} from 'lucide-react';
import { GamepadBatteryState } from '../types/controller';

interface GamepadBatteryMonitorProps {
  connected: boolean;
  battery: GamepadBatteryState;
  webHidSupported: boolean;
  hidError: string | null;
  onRequestWebHid: () => void;
}

function getBatteryTier(level: number): {
  label: string;
  barClass: string;
  textClass: string;
} {
  if (level >= 75) {
    return {
      label: 'Cheia',
      barClass: 'bg-emerald-500',
      textClass: 'text-emerald-400',
    };
  }
  if (level >= 35) {
    return {
      label: 'Normal',
      barClass: 'bg-blue-500',
      textClass: 'text-blue-400',
    };
  }
  if (level >= 15) {
    return {
      label: 'Baixa',
      barClass: 'bg-amber-500',
      textClass: 'text-amber-400',
    };
  }
  return {
    label: 'Crítica',
    barClass: 'bg-red-500',
    textClass: 'text-red-400',
  };
}

export const GamepadBatteryMonitor: React.FC<GamepadBatteryMonitorProps> = ({
  connected,
  battery,
  webHidSupported,
  hidError,
  onRequestWebHid,
}) => {
  const renderIcon = () => {
    if (!connected) {
      return <Battery className="w-4 h-4 text-slate-500 shrink-0" />;
    }
    if (!battery.supported || battery.level === null) {
      return <BatteryWarning className="w-4 h-4 text-slate-400 shrink-0" />;
    }
    if (battery.charging) {
      return <BatteryCharging className="w-4 h-4 text-emerald-400 shrink-0" />;
    }
    if (battery.level >= 75) {
      return <BatteryFull className="w-4 h-4 text-emerald-400 shrink-0" />;
    }
    if (battery.level >= 35) {
      return <BatteryMedium className="w-4 h-4 text-blue-400 shrink-0" />;
    }
    return <BatteryLow className="w-4 h-4 text-amber-400 shrink-0" />;
  };

  if (!connected) {
    return (
      <div className="bg-[#0B0F17] border border-slate-800 rounded-lg p-3 space-y-1.5">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-xs font-medium text-slate-300">
            {renderIcon()}
            <span>Bateria do Controle</span>
          </div>
          <span className="font-mono tabular-nums text-[11px] text-slate-500">
            --%
          </span>
        </div>
        <p className="text-[11px] text-slate-500 leading-snug">
          Aguardando conexão física via USB ou Bluetooth para leitura.
        </p>
      </div>
    );
  }

  if (battery.supported && battery.level !== null) {
    const tier = getBatteryTier(battery.level);
    return (
      <div className="bg-[#0B0F17] border border-slate-800 rounded-lg p-3 space-y-2.5">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-xs font-medium text-slate-200">
            {renderIcon()}
            <span>Bateria do Controle</span>
          </div>
          <span className={`font-mono tabular-nums text-xs font-semibold ${tier.textClass}`}>
            {battery.level}%
          </span>
        </div>

        <div
          className="h-2 bg-slate-900 rounded-full overflow-hidden border border-slate-800"
          role="progressbar"
          aria-valuenow={battery.level}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Nível de bateria do controle"
        >
          <div
            className={`h-full transition-[width] duration-200 ${tier.barClass}`}
            style={{ width: `${battery.level}%` }}
          />
        </div>

        <div className="flex items-center justify-between text-[11px] text-slate-400">
          <span>
            {battery.charging ? 'Carregando' : tier.label}
          </span>
          <span className="font-mono text-[10px] text-slate-500">
            {battery.source === 'webhid' ? 'WebHID' : 'Gamepad API'}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#0B0F17] border border-slate-800 rounded-lg p-3 space-y-2">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-xs font-medium text-slate-300">
          {renderIcon()}
          <span>Bateria do Controle</span>
        </div>
        <span className="text-[11px] text-slate-400">Indisponível</span>
      </div>
      <p className="text-[11px] text-slate-400 leading-snug">
        {battery.statusLabel}.
      </p>
      {webHidSupported && (
        <button
          type="button"
          onClick={onRequestWebHid}
          className="w-full px-2.5 py-1.5 text-[11px] font-medium text-blue-300 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 rounded-md transition-colors cursor-pointer"
        >
          Ler bateria via WebHID (PlayStation)
        </button>
      )}
      {hidError && (
        <p className="text-[11px] text-amber-400 leading-snug">{hidError}</p>
      )}
    </div>
  );
};
