import React, { useEffect, useMemo, useState } from 'react';
import {
  CopyPlus,
  Gamepad2,
  Plus,
  RefreshCw,
  RotateCcw,
  Trash2,
  Vibrate,
} from 'lucide-react';
import { ExportModal } from './components/ExportModal';
import { GamepadBatteryMonitor } from './components/GamepadBatteryMonitor';
import { MappingTable } from './components/MappingTable';
import { PlayStationSvg } from './components/PlayStationSvg';
import { StickCurveEditor } from './components/StickCurveEditor';
import { TriggerEditor } from './components/TriggerEditor';
import { XboxSvg } from './components/XboxSvg';
import {
  CANONICAL_CONTROLS,
  CONTROL_BY_ID,
  DEFAULT_MAPPINGS,
  DEFAULT_PROFILES,
  applyStickCalibration,
  applyTriggerCalibration,
} from './data/controllerMappings';
import { useGamepad } from './hooks/useGamepad';
import {
  ControlId,
  ControllerProfile,
  ViewLayoutMode,
  WorkspaceTab,
} from './types/controller';

const STORAGE_KEY = 'dualmap_studio_profiles_v1';

function loadStoredProfiles(): ControllerProfile[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_PROFILES;
    const parsed = JSON.parse(raw) as ControllerProfile[];
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
  } catch {
    // Fallback to defaults
  }
  return DEFAULT_PROFILES;
}

export default function App() {
  const [profiles, setProfiles] = useState<ControllerProfile[]>(loadStoredProfiles);
  const [activeProfileId, setActiveProfileId] = useState<string>(
    () => loadStoredProfiles()[0]?.id ?? DEFAULT_PROFILES[0].id
  );
  const [activeTab, setActiveTab] = useState<WorkspaceTab>('overview');
  const [viewMode, setViewMode] = useState<ViewLayoutMode>('dual');
  const [selectedControl, setSelectedControl] = useState<ControlId>('faceBottom');
  const [showExportModal, setShowExportModal] = useState(false);
  const [rumbleNotice, setRumbleNotice] = useState<string | null>(null);

  const activeProfile = useMemo(
    () => profiles.find((p) => p.id === activeProfileId) ?? profiles[0],
    [profiles, activeProfileId]
  );

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(profiles));
    } catch {
      // Ignore storage quota errors
    }
  }, [profiles]);

  const {
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
    rescanGamepads,
  } = useGamepad(activeProfile);

  const updateActiveProfile = (updater: (prev: ControllerProfile) => ControllerProfile) => {
    setProfiles((prevList) =>
      prevList.map((p) =>
        p.id === activeProfile.id
          ? { ...updater(p), updatedAt: new Date().toISOString().slice(0, 10) }
          : p
      )
    );
  };

  const handleCreateProfile = () => {
    const idx = profiles.length + 1;
    const newProfile: ControllerProfile = {
      ...JSON.parse(JSON.stringify(activeProfile)),
      id: `custom-${Date.now()}`,
      name: `Perfil Personalizado ${idx}`,
      description: 'Configuração personalizada para PlayStation e Xbox.',
      genre: 'Personalizado',
      updatedAt: new Date().toISOString().slice(0, 10),
    };
    setProfiles((prev) => [...prev, newProfile]);
    setActiveProfileId(newProfile.id);
  };

  const handleDuplicateProfile = (source: ControllerProfile) => {
    const copy: ControllerProfile = {
      ...JSON.parse(JSON.stringify(source)),
      id: `custom-${Date.now()}`,
      name: `${source.name} (Cópia)`,
      updatedAt: new Date().toISOString().slice(0, 10),
    };
    setProfiles((prev) => [...prev, copy]);
    setActiveProfileId(copy.id);
  };

  const handleDeleteProfile = (id: string) => {
    if (profiles.length <= 1) return;
    const next = profiles.filter((p) => p.id !== id);
    setProfiles(next);
    if (activeProfileId === id) {
      setActiveProfileId(next[0].id);
    }
  };

  const handleImportProfile = (imported: ControllerProfile) => {
    setProfiles((prev) => [...prev, imported]);
    setActiveProfileId(imported.id);
  };

  const handleUpdateMapping = (source: ControlId, target: ControlId | 'disabled') => {
    updateActiveProfile((prev) => ({
      ...prev,
      mappings: {
        ...prev.mappings,
        [source]: target,
      },
    }));
  };

  const handleSwapConfirmCancel = () => {
    updateActiveProfile((prev) => ({
      ...prev,
      mappings: {
        ...prev.mappings,
        faceBottom: prev.mappings.faceRight,
        faceRight: prev.mappings.faceBottom,
      },
    }));
  };

  const handleSwapBumpersTriggers = () => {
    updateActiveProfile((prev) => ({
      ...prev,
      mappings: {
        ...prev.mappings,
        l1: prev.mappings.l2,
        l2: prev.mappings.l1,
        r1: prev.mappings.r2,
        r2: prev.mappings.r1,
      },
    }));
  };

  const handleResetMappings = () => {
    updateActiveProfile((prev) => ({
      ...prev,
      mappings: { ...DEFAULT_MAPPINGS },
    }));
  };

  const handleTestRumble = async () => {
    const ok = await triggerRumbleTest();
    setRumbleNotice(
      ok
        ? 'Pulso de vibração enviado ao controle.'
        : 'Conecte um controle compatível com Dual Rumble para testar.'
    );
    setTimeout(() => setRumbleNotice(null), 2600);
  };

  const remappedSources = useMemo(() => {
    const set = new Set<ControlId>();
    for (const ctrl of CANONICAL_CONTROLS) {
      if (activeProfile.mappings[ctrl.id] !== ctrl.id) {
        set.add(ctrl.id);
      }
    }
    return set;
  }, [activeProfile.mappings]);

  const calibratedLeftStick = applyStickCalibration(
    liveState.leftStickRaw,
    activeProfile.leftStick
  );
  const calibratedRightStick = applyStickCalibration(
    liveState.rightStickRaw,
    activeProfile.rightStick
  );
  const calibratedLeftTrigger = applyTriggerCalibration(
    liveState.leftTriggerRaw,
    activeProfile.leftTrigger
  );
  const calibratedRightTrigger = applyTriggerCalibration(
    liveState.rightTriggerRaw,
    activeProfile.rightTrigger
  );

  const selectedMeta = CONTROL_BY_ID[selectedControl];
  const selectedTargetId = activeProfile.mappings[selectedControl];
  const selectedTargetMeta =
    selectedTargetId !== 'disabled' ? CONTROL_BY_ID[selectedTargetId] : null;

  const isPresetDefault = DEFAULT_PROFILES.some((d) => d.id === activeProfile.id);

  return (
    <div className="min-h-screen bg-[#0B0F17] text-slate-100 flex flex-col">
      {/* Top Bar (Strict 3-Zone Contract) */}
      <header className="border-b border-slate-800/90 bg-[#0D121C]">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-8">
          {/* Zone 1: Brand Wordmark */}
          <a
            href="#top"
            className="text-lg font-bold tracking-tight text-white whitespace-nowrap shrink-0"
          >
            DualMap Studio
          </a>

          {/* Zone 2: Primary Navigation */}
          <nav
            aria-label="Navegação principal"
            className="hidden md:flex items-center gap-6 text-sm font-medium"
          >
            {(
              [
                { id: 'overview', label: 'Visão Geral' },
                { id: 'mapping', label: 'Mapeamento' },
                { id: 'sticks', label: 'Analógicos' },
                { id: 'triggers', label: 'Gatilhos' },
              ] as Array<{ id: WorkspaceTab; label: string }>
            ).map((tab, index) => {
              const isActive = activeTab === tab.id;
              const isHiddenTab = index >= 1 && index <= 3;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`${isHiddenTab ? 'hidden ' : ''}py-1 transition-colors whitespace-nowrap shrink-0 cursor-pointer border-b-2 ${
                    isActive
                      ? 'text-white border-blue-500'
                      : 'text-slate-400 border-transparent hover:text-slate-200'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </nav>

          {/* Zone 3: Primary Action */}
          <div className="flex items-center shrink-0">
            <button
              type="button"
              onClick={() => setShowExportModal(true)}
              className="px-4 py-2 text-xs font-semibold text-slate-950 bg-slate-100 hover:bg-white rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              Exportar Perfil
            </button>
          </div>
        </div>

        {/* Mobile Tab Strip */}
        <div className="flex md:hidden border-t border-slate-800/80 px-4 py-2 gap-4 overflow-x-auto">
          {(
            [
              { id: 'overview', label: 'Visão Geral' },
              { id: 'mapping', label: 'Mapeamento' },
              { id: 'sticks', label: 'Analógicos' },
              { id: 'triggers', label: 'Gatilhos' },
            ] as Array<{ id: WorkspaceTab; label: string }>
          ).map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`text-xs font-medium whitespace-nowrap shrink-0 pb-1 border-b-2 ${
                activeTab === tab.id
                  ? 'text-white border-blue-500'
                  : 'text-slate-400 border-transparent'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </header>

      {/* Main Workspace */}
      <div className="flex-1 max-w-[1440px] w-full mx-auto px-4 sm:px-6 py-6 grid grid-cols-1 lg:grid-cols-[270px_minmax(0,1fr)] gap-6 items-start">
        {/* Left Sidebar: Profiles & Hardware Detection */}
        <aside className="space-y-5">
          {/* Profiles List */}
          <section className="bg-[#111827] border border-slate-800 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-semibold text-slate-300 tracking-wide">
                Perfis de Controle
              </h2>
              <button
                type="button"
                onClick={handleCreateProfile}
                className="inline-flex items-center gap-1 text-xs font-medium text-blue-400 hover:text-blue-300 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                Novo
              </button>
            </div>

            <div className="space-y-1.5">
              {profiles.map((prof) => {
                const isSelected = prof.id === activeProfile.id;
                const isBuiltIn = DEFAULT_PROFILES.some((d) => d.id === prof.id);
                return (
                  <div
                    key={prof.id}
                    className={`group flex items-center justify-between gap-2 px-3 py-2.5 rounded-lg border transition-colors ${
                      isSelected
                        ? 'bg-slate-800/80 border-slate-700 text-white'
                        : 'bg-transparent border-transparent hover:bg-slate-800/40 text-slate-300'
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => setActiveProfileId(prof.id)}
                      className="flex-1 text-left min-w-0 cursor-pointer"
                    >
                      <div className="text-xs font-semibold truncate">{prof.name}</div>
                      <div className="text-[11px] text-slate-400 truncate mt-0.5">
                        {prof.genre} · {prof.pollingRateHz} Hz
                      </div>
                    </button>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleDuplicateProfile(prof)}
                        title="Duplicar perfil"
                        aria-label={`Duplicar ${prof.name}`}
                        className="p-1 text-slate-500 hover:text-slate-200 rounded cursor-pointer"
                      >
                        <CopyPlus className="w-3.5 h-3.5" />
                      </button>
                      {!isBuiltIn && (
                        <button
                          type="button"
                          onClick={() => handleDeleteProfile(prof.id)}
                          title="Excluir perfil"
                          aria-label={`Excluir ${prof.name}`}
                          className="p-1 text-slate-500 hover:text-red-400 rounded cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Physical Hardware Connection (Web Gamepad API) */}
          <section className="bg-[#111827] border border-slate-800 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-semibold text-slate-300">
                Dispositivo Físico (USB / BT)
              </h2>
              <button
                type="button"
                onClick={rescanGamepads}
                title="Atualizar detecção"
                aria-label="Atualizar detecção de controle"
                className="p-1 text-slate-400 hover:text-white rounded cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </div>

            {liveState.connected ? (
              <div className="bg-[#0B0F17] border border-slate-800 rounded-lg p-3 space-y-2">
                <div className="flex items-center gap-2 text-xs font-medium text-emerald-400">
                  <Gamepad2 className="w-4 h-4 shrink-0" />
                  <span>
                    {liveState.detectedPlatform === 'playstation'
                      ? 'PlayStation Detectado'
                      : liveState.detectedPlatform === 'xbox'
                      ? 'Xbox Detectado'
                      : 'Controle Padrão Detectado'}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 break-words leading-snug">
                  {liveState.deviceName}
                </p>
              </div>
            ) : (
              <div className="bg-[#0B0F17] border border-slate-800 rounded-lg p-3 space-y-1.5">
                <div className="flex items-center gap-2 text-xs font-medium text-slate-300">
                  <Gamepad2 className="w-4 h-4 text-slate-500 shrink-0" />
                  <span>Modo Simulação Interativa</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Conecte um controle PlayStation ou Xbox e pressione qualquer botão, ou clique diretamente nos diagramas.
                </p>
              </div>
            )}

            <GamepadBatteryMonitor
              connected={liveState.connected}
              battery={liveState.battery}
              webHidSupported={webHidSupported}
              hidError={hidError}
              onRequestWebHid={requestWebHidBattery}
            />

            <button
              type="button"
              onClick={handleTestRumble}
              className="w-full inline-flex items-center justify-center gap-2 px-3 py-2 text-xs font-medium text-slate-200 bg-slate-800/80 hover:bg-slate-800 border border-slate-700 rounded-lg transition-colors cursor-pointer"
            >
              <Vibrate className="w-3.5 h-3.5 text-slate-300" />
              Testar Vibração
            </button>
            {rumbleNotice && (
              <p className="text-[11px] text-slate-400 leading-snug">{rumbleNotice}</p>
            )}
          </section>

          {/* Global Hardware Parameters */}
          <section className="bg-[#111827] border border-slate-800 rounded-xl p-4 space-y-4">
            <h2 className="text-xs font-semibold text-slate-300">
              Parâmetros Gerais
            </h2>

            <div>
              <div className="flex justify-between text-xs mb-1.5">
                <span className="text-slate-400">Intensidade de Vibração</span>
                <span className="font-mono tabular-nums text-slate-200">
                  {activeProfile.vibrationIntensity}%
                </span>
              </div>
              <input
                type="range"
                min={0}
                max={100}
                step={5}
                value={activeProfile.vibrationIntensity}
                onChange={(e) =>
                  updateActiveProfile((prev) => ({
                    ...prev,
                    vibrationIntensity: Number(e.target.value),
                  }))
                }
                className="w-full studio-range"
              />
            </div>

            <div>
              <span className="block text-xs text-slate-400 mb-1.5">
                Taxa de Leitura (Polling)
              </span>
              <div className="grid grid-cols-3 gap-1 p-1 bg-[#0B0F17] border border-slate-800 rounded-lg">
                {([250, 500, 1000] as const).map((hz) => (
                  <button
                    key={hz}
                    type="button"
                    onClick={() =>
                      updateActiveProfile((prev) => ({ ...prev, pollingRateHz: hz }))
                    }
                    className={`py-1 text-xs font-mono tabular-nums rounded-md transition-colors cursor-pointer ${
                      activeProfile.pollingRateHz === hz
                        ? 'bg-slate-800 text-white'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {hz}Hz
                  </button>
                ))}
              </div>
            </div>
          </section>
        </aside>

        {/* Right Main Content */}
        <main className="space-y-6 min-w-0">
          {/* Profile Header & Simultaneous View Selector */}
          <div className="bg-[#111827] border border-slate-800 rounded-xl p-5 flex flex-col xl:flex-row xl:items-center justify-between gap-4">
            <div className="space-y-1 min-w-0">
              <div className="flex flex-wrap items-center gap-3">
                {isPresetDefault ? (
                  <h1 className="text-xl font-bold text-white tracking-tight">
                    {activeProfile.name}
                  </h1>
                ) : (
                  <input
                    type="text"
                    value={activeProfile.name}
                    onChange={(e) =>
                      updateActiveProfile((prev) => ({ ...prev, name: e.target.value }))
                    }
                    aria-label="Nome do perfil"
                    className="text-xl font-bold text-white tracking-tight bg-transparent border-b border-slate-700 focus:border-blue-500 focus:outline-none pb-0.5"
                  />
                )}
              </div>
              <p className="text-xs text-slate-400">
                {activeProfile.description} ·{' '}
                <span className="font-mono tabular-nums text-slate-300">
                  {remappedSources.size}{' '}
                  {remappedSources.size === 1 ? 'remapeamento ativo' : 'remapeamentos ativos'}
                </span>
              </p>
            </div>

            {/* Layout Mode Switcher */}
            <div className="flex items-center gap-1 p-1 bg-[#0B0F17] border border-slate-800 rounded-lg self-start xl:self-auto shrink-0">
              <button
                type="button"
                onClick={() => setViewMode('dual')}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  viewMode === 'dual'
                    ? 'bg-slate-800 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Simultâneo (PS + Xbox)
              </button>
              <button
                type="button"
                onClick={() => setViewMode('playstation')}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  viewMode === 'playstation'
                    ? 'bg-blue-600/20 text-blue-300 border border-blue-500/40'
                    : 'text-slate-400 hover:text-slate-200 border border-transparent'
                }`}
              >
                PlayStation
              </button>
              <button
                type="button"
                onClick={() => setViewMode('xbox')}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  viewMode === 'xbox'
                    ? 'bg-emerald-600/20 text-emerald-300 border border-emerald-500/40'
                    : 'text-slate-400 hover:text-slate-200 border border-transparent'
                }`}
              >
                Xbox
              </button>
            </div>
          </div>

          {/* Interactive Dual / Single Controller Stage */}
          <section className="bg-[#111827] border border-slate-800 rounded-xl p-5 space-y-5">
            <div
              className={`grid gap-6 items-center ${
                viewMode === 'dual'
                  ? 'grid-cols-1 xl:grid-cols-2'
                  : 'grid-cols-1 max-w-2xl mx-auto'
              }`}
            >
              {(viewMode === 'dual' || viewMode === 'playstation') && (
                <div className="bg-[#0B0F17] border border-slate-800/90 rounded-xl p-4 sm:p-5 space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-blue-400">
                      PlayStation · DualSense
                    </span>
                    <span className="text-slate-400">
                      Analógicos simétricos · Touchpad
                    </span>
                  </div>
                  <PlayStationSvg
                    selectedControl={selectedControl}
                    activeButtons={liveState.rawButtons}
                    mappedButtons={liveState.mappedButtons}
                    remappedSources={remappedSources}
                    leftStick={calibratedLeftStick}
                    rightStick={calibratedRightStick}
                    leftTrigger={calibratedLeftTrigger}
                    rightTrigger={calibratedRightTrigger}
                    onSelectControl={setSelectedControl}
                    onPressControl={setVirtualButton}
                  />
                </div>
              )}

              {(viewMode === 'dual' || viewMode === 'xbox') && (
                <div className="bg-[#0B0F17] border border-slate-800/90 rounded-xl p-4 sm:p-5 space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-emerald-400">
                      Xbox · Series X|S
                    </span>
                    <span className="text-slate-400">
                      Analógicos assimétricos · ABXY
                    </span>
                  </div>
                  <XboxSvg
                    selectedControl={selectedControl}
                    activeButtons={liveState.rawButtons}
                    mappedButtons={liveState.mappedButtons}
                    remappedSources={remappedSources}
                    leftStick={calibratedLeftStick}
                    rightStick={calibratedRightStick}
                    leftTrigger={calibratedLeftTrigger}
                    rightTrigger={calibratedRightTrigger}
                    onSelectControl={setSelectedControl}
                    onPressControl={setVirtualButton}
                  />
                </div>
              )}
            </div>

            {/* Selected Control Inspector Strip (Simultaneous PS <-> Xbox Remap Bar) */}
            <div className="bg-[#0B0F17] border border-slate-800 rounded-lg p-4 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-4 text-xs">
                <div>
                  <span className="text-slate-400 block text-[11px]">
                    Entrada Selecionada
                  </span>
                  <div className="flex items-center gap-2 mt-1">
                    <span
                      className="px-2 py-0.5 rounded bg-slate-900 border border-slate-700 font-mono font-semibold"
                      style={{ color: selectedMeta.playstation.accentColor }}
                    >
                      PS: {selectedMeta.playstation.shortLabel}
                    </span>
                    <span className="text-slate-500">↔</span>
                    <span
                      className="px-2 py-0.5 rounded bg-slate-900 border border-slate-700 font-mono font-semibold"
                      style={{ color: selectedMeta.xbox.accentColor }}
                    >
                      Xbox: {selectedMeta.xbox.shortLabel}
                    </span>
                    <span className="text-slate-300 font-medium">
                      ({selectedMeta.playstation.name} / {selectedMeta.xbox.name})
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                {selectedMeta.remappable ? (
                  <div className="flex items-center gap-2">
                    <label
                      htmlFor="inspector-remap-select"
                      className="text-xs text-slate-400 whitespace-nowrap"
                    >
                      Função de saída:
                    </label>
                    <select
                      id="inspector-remap-select"
                      value={selectedTargetId}
                      onChange={(e) =>
                        handleUpdateMapping(
                          selectedControl,
                          e.target.value as ControlId | 'disabled'
                        )
                      }
                      className="px-3 py-1.5 rounded-lg text-xs bg-[#111827] border border-slate-700 text-slate-100 focus:outline-none focus:border-blue-500 cursor-pointer"
                    >
                      <option value="disabled">Desativado</option>
                      {CANONICAL_CONTROLS.filter((c) => c.remappable).map((opt) => (
                        <option key={opt.id} value={opt.id}>
                          {opt.playstation.shortLabel} ({opt.playstation.name}) /{' '}
                          {opt.xbox.shortLabel} ({opt.xbox.name})
                        </option>
                      ))}
                    </select>
                    {selectedTargetId !== selectedControl && (
                      <button
                        type="button"
                        onClick={() => handleUpdateMapping(selectedControl, selectedControl)}
                        title="Restaurar este botão"
                        className="p-1.5 text-slate-400 hover:text-white bg-slate-800 rounded-lg cursor-pointer"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                ) : (
                  <span className="text-xs text-slate-500">
                    Botão reservado do sistema ({selectedTargetMeta?.playstation.shortLabel} /{' '}
                    {selectedTargetMeta?.xbox.shortLabel})
                  </span>
                )}
              </div>
            </div>
          </section>

          {/* Active Workspace Tab Content */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Quick Summary Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-[#111827] border border-slate-800 rounded-xl p-4 space-y-2">
                  <div className="text-xs text-slate-400">Remapeamento Simultâneo</div>
                  <div className="text-lg font-semibold text-white font-mono tabular-nums">
                    {remappedSources.size} de {CANONICAL_CONTROLS.length} botões
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Tradução bidirecional ativa para comandos PlayStation e Xbox.
                  </p>
                  <button
                    type="button"
                    onClick={() => setActiveTab('mapping')}
                    className="text-xs font-medium text-blue-400 hover:text-blue-300 pt-1 cursor-pointer"
                  >
                    Editar matriz completa →
                  </button>
                </div>

                <div className="bg-[#111827] border border-slate-800 rounded-xl p-4 space-y-2">
                  <div className="text-xs text-slate-400">Calibração dos Analógicos</div>
                  <div className="text-lg font-semibold text-white font-mono tabular-nums">
                    DZ {Math.round(activeProfile.leftStick.innerDeadzone * 100)}% ·{' '}
                    {Math.round(activeProfile.rightStick.innerDeadzone * 100)}%
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Esquerdo ({activeProfile.leftStick.curve}) e Direito (
                    {activeProfile.rightStick.curve}).
                  </p>
                  <button
                    type="button"
                    onClick={() => setActiveTab('sticks')}
                    className="text-xs font-medium text-blue-400 hover:text-blue-300 pt-1 cursor-pointer"
                  >
                    Ajustar curvas e zonas mortas →
                  </button>
                </div>

                <div className="bg-[#111827] border border-slate-800 rounded-xl p-4 space-y-2">
                  <div className="text-xs text-slate-400">Gatilhos L2/LT e R2/RT</div>
                  <div className="text-lg font-semibold text-white font-mono tabular-nums">
                    {activeProfile.leftTrigger.hairTrigger ||
                    activeProfile.rightTrigger.hairTrigger
                      ? 'Gatilho Rápido Ativo'
                      : 'Curso Progressivo'}
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    DualSense: {activeProfile.rightTrigger.playstationAdaptiveMode} · Xbox
                    Impulse: {activeProfile.rightTrigger.xboxImpulseStrength}%
                  </p>
                  <button
                    type="button"
                    onClick={() => setActiveTab('triggers')}
                    className="text-xs font-medium text-blue-400 hover:text-blue-300 pt-1 cursor-pointer"
                  >
                    Configurar gatilhos →
                  </button>
                </div>
              </div>

              {/* Compact Mapping Matrix right on Overview */}
              <MappingTable
                mappings={activeProfile.mappings}
                selectedControl={selectedControl}
                rawButtons={liveState.rawButtons}
                onSelectControl={setSelectedControl}
                onUpdateMapping={handleUpdateMapping}
                onSwapConfirmCancel={handleSwapConfirmCancel}
                onSwapBumpersTriggers={handleSwapBumpersTriggers}
                onResetMappings={handleResetMappings}
              />
            </div>
          )}

          {activeTab === 'mapping' && (
            <MappingTable
              mappings={activeProfile.mappings}
              selectedControl={selectedControl}
              rawButtons={liveState.rawButtons}
              onSelectControl={setSelectedControl}
              onUpdateMapping={handleUpdateMapping}
              onSwapConfirmCancel={handleSwapConfirmCancel}
              onSwapBumpersTriggers={handleSwapBumpersTriggers}
              onResetMappings={handleResetMappings}
            />
          )}

          {activeTab === 'sticks' && (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              <StickCurveEditor
                side="left"
                config={activeProfile.leftStick}
                rawVector={liveState.leftStickRaw}
                onChange={(next) =>
                  updateActiveProfile((prev) => ({ ...prev, leftStick: next }))
                }
                onSimulateVector={setVirtualLeftStick}
              />
              <StickCurveEditor
                side="right"
                config={activeProfile.rightStick}
                rawVector={liveState.rightStickRaw}
                onChange={(next) =>
                  updateActiveProfile((prev) => ({ ...prev, rightStick: next }))
                }
                onSimulateVector={setVirtualRightStick}
              />
            </div>
          )}

          {activeTab === 'triggers' && (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              <TriggerEditor
                side="left"
                config={activeProfile.leftTrigger}
                rawValue={liveState.leftTriggerRaw}
                onChange={(next) =>
                  updateActiveProfile((prev) => ({ ...prev, leftTrigger: next }))
                }
                onSimulateValue={setVirtualLeftTrigger}
              />
              <TriggerEditor
                side="right"
                config={activeProfile.rightTrigger}
                rawValue={liveState.rightTriggerRaw}
                onChange={(next) =>
                  updateActiveProfile((prev) => ({ ...prev, rightTrigger: next }))
                }
                onSimulateValue={setVirtualRightTrigger}
              />
            </div>
          )}
        </main>
      </div>

      {showExportModal && (
        <ExportModal
          profile={activeProfile}
          onClose={() => setShowExportModal(false)}
          onImportProfile={handleImportProfile}
        />
      )}
    </div>
  );
}
