import React from 'react';
import { VaultSettings } from '../../types';
import { Settings, X, Palette, Type, Folder, Check } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  settings: VaultSettings;
  onUpdateSettings: (settings: VaultSettings) => void;
  onPickVault: () => void;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  settings,
  onUpdateSettings,
  onPickVault,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 select-none"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-xl bg-[#1f2335] border border-[#24283b] rounded-xl shadow-2xl overflow-hidden flex flex-col text-xs max-h-[85vh]"
      >
        {/* Header */}
        <div className="h-11 px-4 border-b border-[#24283b] flex items-center justify-between">
          <div className="flex items-center gap-2 font-semibold text-sm text-[#c0caf5]">
            <Settings className="w-4 h-4 text-[#7aa2f7]" />
            <span>Preferences & Settings</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-[#24283b] text-[#565f89] hover:text-[#c0caf5]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Settings Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* Theme Section */}
          <div className="space-y-2">
            <label className="text-[10px] text-[#565f89] uppercase tracking-wider font-semibold flex items-center gap-1.5">
              <Palette className="w-3.5 h-3.5 text-[#7aa2f7]" /> Appearance & Theme
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'tokyo-night', name: 'Tokyo Night Night', color: '#16161e' },
                { id: 'tokyo-night-storm', name: 'Tokyo Night Storm', color: '#1f2335' },
                { id: 'tokyo-night-light', name: 'Tokyo Night Light', color: '#d5d6db' },
              ].map((th) => (
                <button
                  key={th.id}
                  onClick={() =>
                    onUpdateSettings({ ...settings, theme: th.id as any })
                  }
                  style={{ backgroundColor: th.color }}
                  className={`p-3 rounded-lg border text-left flex flex-col justify-between h-20 transition-all ${
                    settings.theme === th.id
                      ? 'border-[#7aa2f7] ring-1 ring-[#7aa2f7]'
                      : 'border-[#24283b] hover:border-[#414868]'
                  }`}
                >
                  <span className={`font-medium text-xs ${th.id.includes('light') ? 'text-black' : 'text-[#c0caf5]'}`}>
                    {th.name}
                  </span>
                  {settings.theme === th.id && (
                    <Check className="w-4 h-4 text-[#7aa2f7] self-end" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Typography & Editor */}
          <div className="space-y-3 pt-2 border-t border-[#24283b]">
            <label className="text-[10px] text-[#565f89] uppercase tracking-wider font-semibold flex items-center gap-1.5">
              <Type className="w-3.5 h-3.5 text-[#bb9af7]" /> Editor & Typography
            </label>

            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium text-[#c0caf5]">Font Size</div>
                <div className="text-[11px] text-[#565f89]">Base editor text size</div>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="range"
                  min="12"
                  max="24"
                  value={settings.fontSize}
                  onChange={(e) =>
                    onUpdateSettings({ ...settings, fontSize: parseInt(e.target.value, 10) })
                  }
                  className="w-28 accent-[#7aa2f7]"
                />
                <span className="font-mono text-[#7aa2f7] w-6 text-right">{settings.fontSize}px</span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium text-[#c0caf5]">Tab Indentation Size</div>
                <div className="text-[11px] text-[#565f89]">Number of spaces inserted per Tab</div>
              </div>
              <select
                value={settings.tabSize}
                onChange={(e) =>
                  onUpdateSettings({ ...settings, tabSize: parseInt(e.target.value, 10) })
                }
                className="bg-[#16161e] border border-[#24283b] rounded px-2.5 py-1 text-xs text-[#c0caf5] outline-none"
              >
                <option value={2}>2 spaces</option>
                <option value={4}>4 spaces</option>
              </select>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium text-[#c0caf5]">Line Numbers</div>
                <div className="text-[11px] text-[#565f89]">Show line numbers gutter</div>
              </div>
              <input
                type="checkbox"
                checked={settings.lineNumbers}
                onChange={(e) =>
                  onUpdateSettings({ ...settings, lineNumbers: e.target.checked })
                }
                className="accent-[#7aa2f7] w-4 h-4 rounded cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium text-[#c0caf5]">Word Wrap</div>
                <div className="text-[11px] text-[#565f89]">Soft wrap long lines in editor</div>
              </div>
              <input
                type="checkbox"
                checked={settings.wordWrap}
                onChange={(e) =>
                  onUpdateSettings({ ...settings, wordWrap: e.target.checked })
                }
                className="accent-[#7aa2f7] w-4 h-4 rounded cursor-pointer"
              />
            </div>
          </div>

          {/* Vault & Files */}
          <div className="space-y-3 pt-2 border-t border-[#24283b]">
            <label className="text-[10px] text-[#565f89] uppercase tracking-wider font-semibold flex items-center gap-1.5">
              <Folder className="w-3.5 h-3.5 text-[#73daca]" /> Vault & Storage
            </label>

            <div>
              <div className="font-medium text-[#c0caf5]">Active Vault Folder</div>
              <div className="flex items-center gap-2 mt-1">
                <input
                  type="text"
                  readOnly
                  value={settings.vaultPath}
                  className="flex-1 bg-[#16161e] border border-[#24283b] rounded px-2.5 py-1 text-xs text-[#787c99] font-mono outline-none"
                />
                <button
                  onClick={onPickVault}
                  className="px-3 py-1 bg-[#24283b] hover:bg-[#3d59a1] text-[#c0caf5] rounded font-medium transition-colors"
                >
                  Change...
                </button>
              </div>
            </div>

            <div>
              <div className="font-medium text-[#c0caf5]">Designated Attachments Folder</div>
              <input
                type="text"
                value={settings.designatedFolder}
                onChange={(e) =>
                  onUpdateSettings({ ...settings, designatedFolder: e.target.value })
                }
                className="w-full bg-[#16161e] border border-[#24283b] rounded px-2.5 py-1 text-xs text-[#c0caf5] font-mono outline-none mt-1"
                placeholder="Attachments"
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="h-12 px-4 border-t border-[#24283b] flex items-center justify-end bg-[#1a1b26]/50">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded bg-[#7aa2f7] hover:bg-[#89b4fa] text-[#16161e] font-medium transition-colors shadow-sm"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
