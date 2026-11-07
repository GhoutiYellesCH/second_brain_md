import React, { useState } from 'react';
import { VaultSettings, VaultStats } from '../types';
import { X, Folder, HardDrive, Sparkles, Sliders, Palette, RefreshCw, Check } from 'lucide-react';

interface SettingsModalProps {
  settings: VaultSettings;
  onSaveSettings: (settings: VaultSettings) => void;
  onClose: () => void;
  vaultStats: VaultStats;
  onReinitSampleVault: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  settings,
  onSaveSettings,
  onClose,
  vaultStats,
  onReinitSampleVault,
}) => {
  const [activeTab, setActiveTab] = useState<'assets' | 'vault' | 'appearance' | 'graph'>('assets');
  const [currentSettings, setCurrentSettings] = useState<VaultSettings>({ ...settings });
  const [reinitDone, setReinitDone] = useState(false);

  const handleSave = () => {
    onSaveSettings(currentSettings);
    onClose();
  };

  const handleReinit = () => {
    onReinitSampleVault();
    setReinitDone(true);
    setTimeout(() => setReinitDone(false), 2500);
  };

  const formatSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-[#141417] border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col h-[520px]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 bg-[#18181c] shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-purple-600/20 text-purple-400 flex items-center justify-center border border-purple-500/30">
              <Sliders className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-zinc-100">Second Brain Preferences</h2>
              <p className="text-xs text-zinc-400">Configure attachments, vault directory, and synapses</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 hover:bg-zinc-800 text-zinc-400 hover:text-white rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body with Sidebar */}
        <div className="flex-1 flex overflow-hidden">
          {/* Settings Nav Sidebar */}
          <div className="w-48 bg-[#101013] border-r border-zinc-800/80 p-2 space-y-1 text-xs select-none shrink-0">
            <button
              onClick={() => setActiveTab('assets')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg font-medium transition-colors text-left ${
                activeTab === 'assets'
                  ? 'bg-purple-600 text-white shadow'
                  : 'text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200'
              }`}
            >
              <Folder className="w-4 h-4" />
              <span>Attachments & Assets</span>
            </button>

            <button
              onClick={() => setActiveTab('vault')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg font-medium transition-colors text-left ${
                activeTab === 'vault'
                  ? 'bg-purple-600 text-white shadow'
                  : 'text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200'
              }`}
            >
              <HardDrive className="w-4 h-4" />
              <span>Vault Storage</span>
            </button>

            <button
              onClick={() => setActiveTab('graph')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg font-medium transition-colors text-left ${
                activeTab === 'graph'
                  ? 'bg-purple-600 text-white shadow'
                  : 'text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              <span>Synapses Graph</span>
            </button>

            <button
              onClick={() => setActiveTab('appearance')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg font-medium transition-colors text-left ${
                activeTab === 'appearance'
                  ? 'bg-purple-600 text-white shadow'
                  : 'text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200'
              }`}
            >
              <Palette className="w-4 h-4" />
              <span>Appearance</span>
            </button>
          </div>

          {/* Settings Main Content Area */}
          <div className="flex-1 p-6 overflow-y-auto text-xs text-zinc-300 space-y-6">
            {/* TAB: ATTACHMENTS & ASSETS */}
            {activeTab === 'assets' && (
              <div className="space-y-5">
                <div>
                  <h3 className="text-sm font-semibold text-zinc-100 mb-1">
                    Default Location for New Attachments
                  </h3>
                  <p className="text-zinc-400 text-xs">
                    Choose where images, audio, video, and PDF assets are stored when added to notes.
                  </p>
                </div>

                <div className="space-y-2.5">
                  <label
                    onClick={() =>
                      setCurrentSettings((s) => ({ ...s, assetsMode: 'designated' }))
                    }
                    className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${
                      currentSettings.assetsMode === 'designated'
                        ? 'border-purple-500/80 bg-purple-950/20 text-zinc-100'
                        : 'border-zinc-800 bg-zinc-900/50 hover:bg-zinc-900 text-zinc-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="assetsMode"
                      checked={currentSettings.assetsMode === 'designated'}
                      onChange={() => {}}
                      className="mt-1 accent-purple-500"
                    />
                    <div className="flex-1">
                      <div className="font-semibold text-xs flex items-center gap-2">
                        <span>In the folder specified below</span>
                        <span className="text-[10px] text-purple-400 bg-purple-950/60 border border-purple-800/40 px-1.5 py-0.2 rounded">
                          Obsidian Standard
                        </span>
                      </div>
                      <p className="text-[11px] text-zinc-400 mt-0.5">
                        All attachments are grouped inside a dedicated vault folder.
                      </p>
                      {currentSettings.assetsMode === 'designated' && (
                        <div className="mt-2.5 flex items-center gap-2">
                          <span className="text-zinc-400 font-mono text-[11px]">Vault Folder:</span>
                          <input
                            type="text"
                            value={currentSettings.designatedFolder}
                            onChange={(e) =>
                              setCurrentSettings((s) => ({
                                ...s,
                                designatedFolder: e.target.value,
                              }))
                            }
                            placeholder="assets"
                            className="bg-zinc-950 border border-zinc-700 rounded px-2.5 py-1 text-xs text-purple-300 font-mono outline-none w-44 focus:border-purple-500"
                          />
                        </div>
                      )}
                    </div>
                  </label>

                  <label
                    onClick={() => setCurrentSettings((s) => ({ ...s, assetsMode: 'root' }))}
                    className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${
                      currentSettings.assetsMode === 'root'
                        ? 'border-purple-500/80 bg-purple-950/20 text-zinc-100'
                        : 'border-zinc-800 bg-zinc-900/50 hover:bg-zinc-900 text-zinc-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="assetsMode"
                      checked={currentSettings.assetsMode === 'root'}
                      onChange={() => {}}
                      className="mt-1 accent-purple-500"
                    />
                    <div>
                      <div className="font-semibold text-xs">Vault root folder</div>
                      <p className="text-[11px] text-zinc-400 mt-0.5">
                        Assets are placed in the top-level vault root folder.
                      </p>
                    </div>
                  </label>

                  <label
                    onClick={() =>
                      setCurrentSettings((s) => ({ ...s, assetsMode: 'same-folder' }))
                    }
                    className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${
                      currentSettings.assetsMode === 'same-folder'
                        ? 'border-purple-500/80 bg-purple-950/20 text-zinc-100'
                        : 'border-zinc-800 bg-zinc-900/50 hover:bg-zinc-900 text-zinc-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="assetsMode"
                      checked={currentSettings.assetsMode === 'same-folder'}
                      onChange={() => {}}
                      className="mt-1 accent-purple-500"
                    />
                    <div>
                      <div className="font-semibold text-xs">Same folder as current note</div>
                      <p className="text-[11px] text-zinc-400 mt-0.5">
                        Assets stay side-by-side with the note that embeds them.
                      </p>
                    </div>
                  </label>

                  <label
                    onClick={() =>
                      setCurrentSettings((s) => ({ ...s, assetsMode: 'subfolder' }))
                    }
                    className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${
                      currentSettings.assetsMode === 'subfolder'
                        ? 'border-purple-500/80 bg-purple-950/20 text-zinc-100'
                        : 'border-zinc-800 bg-zinc-900/50 hover:bg-zinc-900 text-zinc-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="assetsMode"
                      checked={currentSettings.assetsMode === 'subfolder'}
                      onChange={() => {}}
                      className="mt-1 accent-purple-500"
                    />
                    <div>
                      <div className="font-semibold text-xs">In subfolder under current folder</div>
                      <p className="text-[11px] text-zinc-400 mt-0.5">
                        Creates an assets subfolder (e.g. ./assets/) next to the note.
                      </p>
                    </div>
                  </label>
                </div>
              </div>
            )}

            {/* TAB: VAULT STORAGE */}
            {activeTab === 'vault' && (
              <div className="space-y-5">
                <div>
                  <h3 className="text-sm font-semibold text-zinc-100 mb-1">Vault Directory</h3>
                  <p className="text-zinc-400 text-xs">
                    Current active directory used for all markdown notes and assets.
                  </p>
                </div>

                <div className="p-3 bg-zinc-900 rounded-xl border border-zinc-800 space-y-2">
                  <div className="text-[11px] text-zinc-500 font-medium">ABSOLUTE VAULT PATH</div>
                  <input
                    type="text"
                    value={currentSettings.vaultPath}
                    onChange={(e) =>
                      setCurrentSettings((s) => ({ ...s, vaultPath: e.target.value }))
                    }
                    className="w-full bg-zinc-950 border border-zinc-700/80 rounded-lg px-3 py-1.5 font-mono text-xs text-zinc-200 outline-none focus:border-purple-500"
                  />
                </div>

                {/* Vault Stats */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="p-3 bg-zinc-900/80 border border-zinc-800 rounded-xl text-center">
                    <div className="text-lg font-bold text-purple-400">{vaultStats.total_notes}</div>
                    <div className="text-[11px] text-zinc-400">Markdown Notes</div>
                  </div>
                  <div className="p-3 bg-zinc-900/80 border border-zinc-800 rounded-xl text-center">
                    <div className="text-lg font-bold text-amber-400">{vaultStats.total_assets}</div>
                    <div className="text-[11px] text-zinc-400">Vault Assets</div>
                  </div>
                  <div className="p-3 bg-zinc-900/80 border border-zinc-800 rounded-xl text-center">
                    <div className="text-lg font-bold text-emerald-400">
                      {formatSize(vaultStats.total_size_bytes)}
                    </div>
                    <div className="text-[11px] text-zinc-400">Storage Used</div>
                  </div>
                </div>

                {/* Load Official Obsidian Help Vault */}
                <div className="pt-2 border-t border-zinc-800/80 flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold text-zinc-200 text-xs flex items-center gap-1.5">
                      <span className="text-purple-400">💎</span> Official Obsidian Help Vault
                    </h4>
                    <p className="text-[11px] text-zinc-400">
                      Extracted directly from obsidian.md/help (179 notes & Attachments).
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setCurrentSettings((s) => ({
                        ...s,
                        vaultPath: '/home/gotoro/workspace/second_brain_md/obsidian_help_vault',
                        assetsMode: 'designated',
                        designatedFolder: 'Attachments',
                      }));
                    }}
                    className="px-3 py-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded-lg font-medium transition-colors shadow"
                  >
                    Switch to Help Vault
                  </button>
                </div>

                {/* Seed Demo Notes */}
                <div className="pt-2 border-t border-zinc-800/80 flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold text-zinc-200 text-xs">Populate Sample Knowledge Vault</h4>
                    <p className="text-[11px] text-zinc-400">
                      Creates demo notes with wikilinks, math, callouts, and SVG diagram.
                    </p>
                  </div>
                  <button
                    onClick={handleReinit}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-lg font-medium transition-colors"
                  >
                    {reinitDone ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Seeded!</span>
                      </>
                    ) : (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 text-purple-400" />
                        <span>Re-seed Demo</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* TAB: SYNAPSES GRAPH */}
            {activeTab === 'graph' && (
              <div className="space-y-5">
                <div>
                  <h3 className="text-sm font-semibold text-zinc-100 mb-1">Synapses Graph Settings</h3>
                  <p className="text-zinc-400 text-xs">
                    Configure default startup view and knowledge graph preferences.
                  </p>
                </div>

                <div className="space-y-3">
                  <div className="p-3.5 bg-zinc-900/70 border border-zinc-800 rounded-xl space-y-2">
                    <div className="font-semibold text-xs text-zinc-200">Default View Mode</div>
                    <p className="text-[11px] text-zinc-400">
                      Choose what opens by default when starting the application.
                    </p>
                    <div className="flex gap-2 pt-1">
                      <button
                        onClick={() =>
                          setCurrentSettings((s) => ({ ...s, defaultViewMode: 'graph' }))
                        }
                        className={`flex-1 py-2 px-3 rounded-lg border text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors ${
                          currentSettings.defaultViewMode === 'graph'
                            ? 'bg-purple-600 border-purple-500 text-white shadow'
                            : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                        }`}
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Synapses Graph</span>
                      </button>
                      <button
                        onClick={() =>
                          setCurrentSettings((s) => ({ ...s, defaultViewMode: 'editor' }))
                        }
                        className={`flex-1 py-2 px-3 rounded-lg border text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors ${
                          currentSettings.defaultViewMode === 'editor'
                            ? 'bg-purple-600 border-purple-500 text-white shadow'
                            : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                        }`}
                      >
                        <span>Markdown Editor</span>
                      </button>
                      <button
                        onClick={() =>
                          setCurrentSettings((s) => ({ ...s, defaultViewMode: 'split' }))
                        }
                        className={`flex-1 py-2 px-3 rounded-lg border text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors ${
                          currentSettings.defaultViewMode === 'split'
                            ? 'bg-purple-600 border-purple-500 text-white shadow'
                            : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                        }`}
                      >
                        <span>Split Editor</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB: APPEARANCE */}
            {activeTab === 'appearance' && (
              <div className="space-y-5">
                <div>
                  <h3 className="text-sm font-semibold text-zinc-100 mb-1">Editor Appearance</h3>
                  <p className="text-zinc-400 text-xs">Customize font size and visual preferences.</p>
                </div>

                <div className="p-3 bg-zinc-900 rounded-xl border border-zinc-800 space-y-3">
                  <div className="flex justify-between text-xs">
                    <span className="font-semibold text-zinc-200">Editor Font Size</span>
                    <span className="font-mono text-purple-400">{currentSettings.fontSize}px</span>
                  </div>
                  <input
                    type="range"
                    min="12"
                    max="22"
                    value={currentSettings.fontSize}
                    onChange={(e) =>
                      setCurrentSettings((s) => ({ ...s, fontSize: Number(e.target.value) }))
                    }
                    className="w-full accent-purple-500 bg-zinc-800 h-1.5 rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-zinc-500 font-mono">
                    <span>12px</span>
                    <span>16px (Default)</span>
                    <span>22px</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-end gap-2 px-6 py-3 border-t border-zinc-800 bg-[#18181c] shrink-0 text-xs">
          <button
            onClick={onClose}
            className="px-4 py-1.5 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 rounded-lg font-medium transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-5 py-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded-lg font-semibold shadow transition-colors"
          >
            Save Preferences
          </button>
        </div>
      </div>
    </div>
  );
};
