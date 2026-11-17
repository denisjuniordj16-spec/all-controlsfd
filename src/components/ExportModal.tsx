import React, { useState } from 'react';
import { Check, Copy, Download, Upload, X } from 'lucide-react';
import { CONTROL_BY_ID } from '../data/controllerMappings';
import { ControlId, ControllerProfile } from '../types/controller';

interface ExportModalProps {
  profile: ControllerProfile;
  onClose: () => void;
  onImportProfile: (imported: ControllerProfile) => void;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  profile,
  onClose,
  onImportProfile,
}) => {
  const [copied, setCopied] = useState(false);
  const [importText, setImportText] = useState('');
  const [importError, setImportError] = useState<string | null>(null);
  const [mode, setMode] = useState<'export' | 'import'>('export');

  const exportPayload = {
    schema: 'dualmap-studio/v1',
    profileName: profile.name,
    genre: profile.genre,
    pollingRateHz: profile.pollingRateHz,
    vibrationIntensity: profile.vibrationIntensity,
    simultaneousMappings: (Object.keys(profile.mappings) as ControlId[]).reduce(
      (acc, sourceId) => {
        const targetId = profile.mappings[sourceId];
        const src = CONTROL_BY_ID[sourceId];
        const dst = targetId === 'disabled' ? null : CONTROL_BY_ID[targetId];
        acc[sourceId] = {
          playstationInput: src.playstation.shortLabel,
          xboxInput: src.xbox.shortLabel,
          outputId: targetId,
          playstationOutput: dst ? dst.playstation.shortLabel : 'DISABLED',
          xboxOutput: dst ? dst.xbox.shortLabel : 'DISABLED',
        };
        return acc;
      },
      {} as Record<string, unknown>
    ),
    rawProfile: profile,
  };

  const jsonString = JSON.stringify(exportPayload, null, 2);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(jsonString);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // Clipboard fallback ignored
    }
  };

  const handleDownload = () => {
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${profile.name.toLowerCase().replace(/\s+/g, '-')}-dualmap.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportSubmit = () => {
    setImportError(null);
    try {
      const parsed = JSON.parse(importText);
      const candidate: ControllerProfile = parsed.rawProfile ?? parsed;
      if (!candidate || !candidate.mappings || !candidate.leftStick || !candidate.rightStick) {
        setImportError('JSON inválido: faltam campos obrigatórios de perfil (mappings, leftStick, rightStick).');
        return;
      }
      onImportProfile({
        ...candidate,
        id: `custom-${Date.now()}`,
        name: candidate.name ? `${candidate.name} (Importado)` : 'Perfil Importado',
        updatedAt: new Date().toISOString().slice(0, 10),
      });
      onClose();
    } catch {
      setImportError('Não foi possível interpretar o JSON. Verifique a sintaxe e tente novamente.');
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="export-modal-title"
    >
      <div className="w-full max-w-2xl bg-[#111827] border border-slate-800 rounded-xl shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800">
          <div>
            <h2 id="export-modal-title" className="text-base font-semibold text-slate-100">
              Exportar ou Importar Configuração
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Esquema JSON unificado com tradução simultânea PlayStation e Xbox
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar janela"
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <div className="flex items-center gap-1 p-1 bg-[#0B0F17] border border-slate-800 rounded-lg w-fit">
            <button
              type="button"
              onClick={() => setMode('export')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                mode === 'export' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Exportar JSON
            </button>
            <button
              type="button"
              onClick={() => setMode('import')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                mode === 'import' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Importar JSON
            </button>
          </div>

          {mode === 'export' ? (
            <>
              <pre className="w-full h-72 overflow-auto bg-[#0B0F17] border border-slate-800 rounded-lg p-4 text-[11px] font-mono text-slate-300 leading-relaxed">
                {jsonString}
              </pre>
              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={handleCopy}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors cursor-pointer"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      Copiado
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      Copiar JSON
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={handleDownload}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-slate-950 bg-slate-100 hover:bg-white rounded-lg transition-colors cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  Baixar Arquivo
                </button>
              </div>
            </>
          ) : (
            <>
              <textarea
                value={importText}
                onChange={(e) => setImportText(e.target.value)}
                placeholder="Cole aqui o JSON exportado pelo DualMap Studio..."
                className="w-full h-64 bg-[#0B0F17] border border-slate-800 rounded-lg p-4 text-xs font-mono text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
              />
              {importError && (
                <p className="text-xs text-red-400">{importError}</p>
              )}
              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={handleImportSubmit}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-slate-950 bg-slate-100 hover:bg-white rounded-lg transition-colors cursor-pointer"
                >
                  <Upload className="w-3.5 h-3.5" />
                  Importar como Novo Perfil
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
