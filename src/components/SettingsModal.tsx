import React, { useState } from 'react';
import { VaultSettings, VaultStats } from '../types';
import { X, Folder, HardDrive, Sliders, Palette, RefreshCw, Check, FolderOpen, Languages } from 'lucide-react';
import { vaultApi } from '../services/vaultApi';

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
  const [activeTab, setActiveTab] = useState<'assets' | 'vault' | 'writing' | 'appearance'>('vault');
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

  const handleBrowseFolder = async () => {
    const picked = await vaultApi.pickVaultFolder();
    if (picked) {
      setCurrentSettings((s) => ({ ...s, vaultPath: picked }));
    }
  };

  const formatSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-[#141417] border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col h-[530px]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 bg-[#18181c] shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-purple-600/20 text-purple-400 flex items-center justify-center border border-purple-500/30">
              <Sliders className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-zinc-100">Second Brain Preferences</h2>
              <p className="text-xs text-zinc-400">Configure attachments, any vault directory, and Arabic RTL writing</p>
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
              onClick={() => setActiveTab('writing')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg font-medium transition-colors text-left ${
                activeTab === 'writing'
                  ? 'bg-purple-600 text-white shadow'
                  : 'text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200'
              }`}
            >
              <Languages className="w-4 h-4" />
              <span>RTL & Arabic</span>
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
            {/* TAB: VAULT STORAGE */}
            {activeTab === 'vault' && (
              <div className="space-y-5">
                <div>
                  <h3 className="text-sm font-semibold text-zinc-100 mb-1">Vault Directory</h3>
                  <p className="text-zinc-400 text-xs">
                    Choose any folder on your computer to open as an Obsidian markdown vault.
                  </p>
                </div>

                <div className="p-3 bg-zinc-900 rounded-xl border border-zinc-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="text-[11px] text-zinc-500 font-medium">ABSOLUTE VAULT PATH</div>
                    <button
                      onClick={handleBrowseFolder}
                      className="flex items-center gap-1.5 px-2.5 py-1 bg-purple-600/30 hover:bg-purple-600/50 text-purple-200 border border-purple-500/40 rounded text-xs font-medium transition-colors"
                    >
                      <FolderOpen className="w-3.5 h-3.5 text-purple-400" />
                      <span>Browse / Pick Any Folder...</span>
                    </button>
                  </div>
                  <input
                    type="text"
                    value={currentSettings.vaultPath}
                    onChange={(e) =>
                      setCurrentSettings((s) => ({ ...s, vaultPath: e.target.value }))
                    }
                    placeholder="/path/to/any/folder"
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
                      <div className="font-semibold text-xs">In designated attachments folder</div>
                      <p className="text-[11px] text-zinc-400 mt-0.5">
                        All images and media are saved into a specific vault folder (e.g. <code>Attachments</code> or <code>assets</code>).
                      </p>
                      {currentSettings.assetsMode === 'designated' && (
                        <div className="mt-2.5 flex items-center gap-2">
                          <span className="text-[11px] text-zinc-400">Folder Name:</span>
                          <input
                            type="text"
                            value={currentSettings.designatedFolder}
                            onChange={(e) =>
                              setCurrentSettings((s) => ({
                                ...s,
                                designatedFolder: e.target.value,
                              }))
                            }
                            className="bg-zinc-950 border border-zinc-700 rounded px-2.5 py-1 text-xs text-zinc-200 outline-none focus:border-purple-500 font-mono"
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

            {/* TAB: RTL & ARABIC WRITING */}
            {activeTab === 'writing' && (
              <div className="space-y-5">
                <div>
                  <h3 className="text-sm font-semibold text-zinc-100 mb-1">RTL & Arabic Writing Support</h3>
                  <p className="text-zinc-400 text-xs">
                    Configure right-to-left text direction, Arabic fonts, and bidirectional typography.
                  </p>
                </div>

                <div className="p-3 bg-zinc-900 rounded-xl border border-zinc-800 space-y-3">
                  <div className="text-xs font-semibold text-zinc-200">Writing Direction</div>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      onClick={() =>
                        setCurrentSettings((s) => ({ ...s, rtlMode: 'auto' }))
                      }
                      className={`p-3 rounded-lg border text-xs font-semibold flex flex-col items-center justify-center gap-1 transition-colors ${
                        (currentSettings.rtlMode || 'auto') === 'auto'
                          ? 'bg-purple-600 border-purple-500 text-white shadow'
                          : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                      }`}
                    >
                      <span className="font-bold text-sm">AUTO (تلقائي)</span>
                      <span className="text-[10px] opacity-80">Auto-detect Arabic</span>
                    </button>
                    <button
                      onClick={() =>
                        setCurrentSettings((s) => ({ ...s, rtlMode: 'rtl' }))
                      }
                      className={`p-3 rounded-lg border text-xs font-semibold flex flex-col items-center justify-center gap-1 transition-colors ${
                        currentSettings.rtlMode === 'rtl'
                          ? 'bg-purple-600 border-purple-500 text-white shadow'
                          : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                      }`}
                    >
                      <span className="font-bold text-sm">RTL (من اليمين)</span>
                      <span className="text-[10px] opacity-80">Force Arabic RTL</span>
                    </button>
                    <button
                      onClick={() =>
                        setCurrentSettings((s) => ({ ...s, rtlMode: 'ltr' }))
                      }
                      className={`p-3 rounded-lg border text-xs font-semibold flex flex-col items-center justify-center gap-1 transition-colors ${
                        currentSettings.rtlMode === 'ltr'
                          ? 'bg-purple-600 border-purple-500 text-white shadow'
                          : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                      }`}
                    >
                      <span className="font-bold text-sm">LTR (من اليسار)</span>
                      <span className="text-[10px] opacity-80">Force English LTR</span>
                    </button>
                  </div>
                </div>

                <div className="p-3 bg-zinc-900/60 rounded-xl border border-zinc-800 text-xs text-zinc-400 space-y-1">
                  <p className="font-semibold text-zinc-300">💡 Arabic Typography Features:</p>
                  <p>• Native support for Amiri, Cairo, and Noto Sans Arabic system typefaces.</p>
                  <p>• Automatic mirrored callout borders and aligned list bullets.</p>
                  <p>• Per-note RTL quick-toggle button in the editor top toolbar.</p>
                </div>
              </div>
            )}

            {/* TAB: APPEARANCE */}
            {activeTab === 'appearance' && (
              <div className="space-y-5">
                <div>
                  <h3 className="text-sm font-semibold text-zinc-100 mb-1">Editor Appearance</h3>
                  <p className="text-zinc-400 text-xs">Customize font size and default editor view mode.</p>
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

                <div className="p-3 bg-zinc-900 rounded-xl border border-zinc-800 space-y-2">
                  <span className="font-semibold text-zinc-200 text-xs">Default Note View Mode</span>
                  <div className="grid grid-cols-3 gap-2 mt-2">
                    <button
                      onClick={() =>
                        setCurrentSettings((s) => ({ ...s, defaultViewMode: 'live' }))
                      }
                      className={`py-2 px-3 rounded-lg border text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors ${
                        currentSettings.defaultViewMode === 'live'
                          ? 'bg-purple-600 border-purple-500 text-white shadow'
                          : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                      }`}
                    >
                      <span>Live Preview</span>
                    </button>
                    <button
                      onClick={() =>
                        setCurrentSettings((s) => ({ ...s, defaultViewMode: 'reading' }))
                      }
                      className={`py-2 px-3 rounded-lg border text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors ${
                        currentSettings.defaultViewMode === 'reading'
                          ? 'bg-purple-600 border-purple-500 text-white shadow'
                          : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                      }`}
                    >
                      <span>Reading View</span>
                    </button>
                    <button
                      onClick={() =>
                        setCurrentSettings((s) => ({ ...s, defaultViewMode: 'split' }))
                      }
                      className={`py-2 px-3 rounded-lg border text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors ${
                        currentSettings.defaultViewMode === 'split'
                          ? 'bg-purple-600 border-purple-500 text-white shadow'
                          : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                      }`}
                    >
                      <span>Split Mode</span>
                    </button>
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
            className="px-4 py-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded-lg font-medium transition-colors shadow"
          >
            Save Preferences
          </button>
        </div>
      </div>
    </div>
  );
};
