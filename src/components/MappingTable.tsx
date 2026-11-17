import React, { useMemo, useState } from 'react';
import { ArrowLeftRight, RotateCcw, Search } from 'lucide-react';
import { CANONICAL_CONTROLS, CONTROL_BY_ID } from '../data/controllerMappings';
import { ControlCategory, ControlId } from '../types/controller';

interface MappingTableProps {
  mappings: Record<ControlId, ControlId | 'disabled'>;
  selectedControl: ControlId | null;
  rawButtons: Record<ControlId, boolean>;
  onSelectControl: (id: ControlId) => void;
  onUpdateMapping: (source: ControlId, target: ControlId | 'disabled') => void;
  onSwapConfirmCancel: () => void;
  onSwapBumpersTriggers: () => void;
  onResetMappings: () => void;
}

const CATEGORY_OPTIONS: Array<{ id: 'all' | ControlCategory; label: string }> = [
  { id: 'all', label: 'Todos' },
  { id: 'face', label: 'Ação' },
  { id: 'bumper', label: 'Ombro' },
  { id: 'trigger', label: 'Gatilhos' },
  { id: 'dpad', label: 'Direcional' },
  { id: 'stick', label: 'Analógicos' },
  { id: 'system', label: 'Sistema' },
];

export const MappingTable: React.FC<MappingTableProps> = ({
  mappings,
  selectedControl,
  rawButtons,
  onSelectControl,
  onUpdateMapping,
  onSwapConfirmCancel,
  onSwapBumpersTriggers,
  onResetMappings,
}) => {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<'all' | ControlCategory>('all');

  const filteredControls = useMemo(() => {
    return CANONICAL_CONTROLS.filter((ctrl) => {
      if (category !== 'all' && ctrl.category !== category) return false;
      if (!search.trim()) return true;
      const q = search.toLowerCase();
      return (
        ctrl.playstation.name.toLowerCase().includes(q) ||
        ctrl.playstation.shortLabel.toLowerCase().includes(q) ||
        ctrl.xbox.name.toLowerCase().includes(q) ||
        ctrl.xbox.shortLabel.toLowerCase().includes(q)
      );
    });
  }, [category, search]);

  const remappedCount = useMemo(() => {
    return CANONICAL_CONTROLS.filter((c) => mappings[c.id] !== c.id).length;
  }, [mappings]);

  return (
    <div className="bg-[#111827] border border-slate-800 rounded-xl overflow-hidden">
      {/* Header Toolbar */}
      <div className="p-4 sm:p-5 border-b border-slate-800 space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-semibold text-slate-100">
              Matriz de Mapeamento Simultâneo
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Qualquer alteração sincroniza a tradução física entre PlayStation e Xbox ·{' '}
              <span className="font-mono tabular-nums text-slate-300">
                {remappedCount} {remappedCount === 1 ? 'botão modificado' : 'botões modificados'}
              </span>
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={onSwapConfirmCancel}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-200 bg-slate-800/80 hover:bg-slate-800 border border-slate-700 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <ArrowLeftRight className="w-3.5 h-3.5 text-blue-400" />
              Inverter ✕/A ↔ ○/B
            </button>
            <button
              type="button"
              onClick={onSwapBumpersTriggers}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-200 bg-slate-800/80 hover:bg-slate-800 border border-slate-700 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <ArrowLeftRight className="w-3.5 h-3.5 text-emerald-400" />
              Inverter L1/LB ↔ L2/LT
            </button>
            <button
              type="button"
              onClick={onResetMappings}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Padrão 1:1
            </button>
          </div>
        </div>

        {/* Filter & Search Row */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-1 p-1 bg-[#0B0F17] border border-slate-800 rounded-lg overflow-x-auto">
            {CATEGORY_OPTIONS.map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => setCategory(opt.id)}
                className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  category === opt.id
                    ? 'bg-slate-800 text-white'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          <div className="relative w-full md:w-64">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Filtrar botão (ex: Cruz, LT, R3)..."
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-[#0B0F17] border border-slate-800 rounded-lg text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Mapping Grid */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-800 bg-[#0D131F] text-[11px] font-medium text-slate-400">
              <th className="py-2.5 px-4">Índice</th>
              <th className="py-2.5 px-4">Layout PlayStation</th>
              <th className="py-2.5 px-4">Layout Xbox</th>
              <th className="py-2.5 px-4">Saída Mapeada (PS / Xbox)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/70 text-xs">
            {filteredControls.map((ctrl) => {
              const target = mappings[ctrl.id];
              const isModified = target !== ctrl.id;
              const isSelected = selectedControl === ctrl.id;
              const isActive = rawButtons[ctrl.id];
              const targetMeta = target !== 'disabled' ? CONTROL_BY_ID[target] : null;

              return (
                <tr
                  key={ctrl.id}
                  onClick={() => onSelectControl(ctrl.id)}
                  className={`transition-colors cursor-pointer ${
                    isActive
                      ? 'bg-blue-500/15'
                      : isSelected
                      ? 'bg-slate-800/60'
                      : 'hover:bg-slate-800/30'
                  }`}
                >
                  <td className="py-2.5 px-4 font-mono tabular-nums text-slate-500">
                    #{String(ctrl.standardIndex).padStart(2, '0')}
                  </td>

                  {/* PlayStation Column */}
                  <td className="py-2.5 px-4">
                    <div className="flex items-center gap-2.5">
                      <span
                        className="w-7 h-6 inline-flex items-center justify-center rounded bg-[#0B0F17] border border-slate-700/80 font-mono text-[11px] font-semibold shrink-0"
                        style={{ color: ctrl.playstation.accentColor }}
                      >
                        {ctrl.playstation.shortLabel}
                      </span>
                      <span className="text-slate-200 font-medium whitespace-nowrap">
                        {ctrl.playstation.name}
                      </span>
                    </div>
                  </td>

                  {/* Xbox Column */}
                  <td className="py-2.5 px-4">
                    <div className="flex items-center gap-2.5">
                      <span
                        className="w-7 h-6 inline-flex items-center justify-center rounded bg-[#0B0F17] border border-slate-700/80 font-mono text-[11px] font-semibold shrink-0"
                        style={{ color: ctrl.xbox.accentColor }}
                      >
                        {ctrl.xbox.shortLabel}
                      </span>
                      <span className="text-slate-200 font-medium whitespace-nowrap">
                        {ctrl.xbox.name}
                      </span>
                    </div>
                  </td>

                  {/* Target Output Dropdown */}
                  <td className="py-2.5 px-4" onClick={(e) => e.stopPropagation()}>
                    {ctrl.remappable ? (
                      <div className="flex items-center gap-2">
                        <select
                          aria-label={`Mapear saída para ${ctrl.playstation.name} / ${ctrl.xbox.name}`}
                          value={target}
                          onChange={(e) =>
                            onUpdateMapping(
                              ctrl.id,
                              e.target.value as ControlId | 'disabled'
                            )
                          }
                          className={`px-2.5 py-1.5 rounded-lg text-xs border bg-[#0B0F17] focus:outline-none focus:border-blue-500 cursor-pointer ${
                            target === 'disabled'
                              ? 'border-red-900/60 text-red-400'
                              : isModified
                              ? 'border-amber-500/50 text-amber-300'
                              : 'border-slate-700 text-slate-200'
                          }`}
                        >
                          <option value="disabled">Desativado</option>
                          {CANONICAL_CONTROLS.filter((c) => c.remappable).map((opt) => (
                            <option key={opt.id} value={opt.id}>
                              {opt.playstation.shortLabel} ({opt.playstation.name}) /{' '}
                              {opt.xbox.shortLabel} ({opt.xbox.name})
                            </option>
                          ))}
                        </select>
                        {isModified && targetMeta && (
                          <span className="text-[11px] text-amber-400 font-mono whitespace-nowrap">
                            Alterado
                          </span>
                        )}
                      </div>
                    ) : (
                      <span className="text-slate-500">Fixo do sistema</span>
                    )}
                  </td>
                </tr>
              );
            })}
            {filteredControls.length === 0 && (
              <tr>
                <td colSpan={4} className="py-8 text-center text-slate-500 text-xs">
                  Nenhum botão encontrado para &ldquo;{search}&rdquo;.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
