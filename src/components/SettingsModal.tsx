import React, { useState } from 'react';
import { VaultSettings, VaultStats, CorePluginConfig } from '../types';
import {
  X,
  Folder,
  HardDrive,
  Sliders,
  Palette,
  RefreshCw,
  Check,
  FolderOpen,
  Languages,
  Puzzle,
  Sun,
  Moon,
  Sparkles,
  ToggleLeft,
  ToggleRight,
  Bookmark,
  Hash,
  Compass,
  FileText,
  Presentation,
  Terminal,
  FileSpreadsheet,
  Globe,
  Clock,
  RotateCw,
} from 'lucide-react';
import { vaultApi } from '../services/vaultApi';

interface SettingsModalProps {
  settings: VaultSettings;
  onSaveSettings: (settings: VaultSettings) => void;
  onClose: () => void;
  vaultStats: VaultStats;
  onReinitSampleVault: () => void;
}

const THEME_OPTIONS = [
  { id: 'tokyo-night', name: 'Tokyo Night (Default)', bg: '#16161e', border: '#7aa2f7', dark: true },
  { id: 'tokyo-night-storm', name: 'Tokyo Night Storm', bg: '#1f2335', border: '#7aa2f7', dark: true },
  { id: 'tokyo-night-light', name: 'Tokyo Night Light', bg: '#d5d6db', border: '#34548a', dark: false },
  { id: 'dark', name: 'Obsidian Dark', bg: '#121214', border: '#3f3f46', dark: true },
  { id: 'nord', name: 'Nord Frost', bg: '#2e3440', border: '#88c0d0', dark: true },
  { id: 'dracula', name: 'Dracula', bg: '#282a36', border: '#bd93f9', dark: true },
  { id: 'cyberpunk', name: 'Cyberpunk Neon', bg: '#0b0e14', border: '#00f0ff', dark: true },
  { id: 'light', name: 'Clean Light', bg: '#ffffff', border: '#2563eb', dark: false },
];

const ACCENT_COLORS = [
  { color: '#7aa2f7', label: 'Tokyo Blue' },
  { color: '#bb9af7', label: 'Purple' },
  { color: '#7dcfff', label: 'Cyan' },
  { color: '#73daca', label: 'Teal' },
  { color: '#ff9e64', label: 'Orange' },
  { color: '#f7768e', label: 'Rose' },
];

interface PluginItem {
  id: keyof CorePluginConfig;
  name: string;
  description: string;
  icon: React.ReactNode;
}

const CORE_PLUGINS_LIST: PluginItem[] = [
  {
    id: 'graph',
    name: 'Synapse Knowledge Graph',
    description: 'Launch external 60fps force-directed knowledge graph with synaptic particle flow.',
    icon: <Sparkles className="w-4 h-4 text-[#7aa2f7]" />,
  },
  {
    id: 'canvas',
    name: 'Infinite Canvas View',
    description: 'Visual spatial whiteboard to organize notes, cards, and connections on an infinite plane.',
    icon: <Compass className="w-4 h-4 text-[#bb9af7]" />,
  },
  {
    id: 'slides',
    name: 'Presentation Slides',
    description: 'Present markdown documents as interactive slideshows using horizontal slide separators (---).',
    icon: <Presentation className="w-4 h-4 text-[#7dcfff]" />,
  },
  {
    id: 'quickSwitcher',
    name: 'Quick Switcher (Ctrl+O / Ctrl+P)',
    description: 'Instant fuzzy note searching and creation directly from a floating keyboard modal.',
    icon: <Terminal className="w-4 h-4 text-[#e0af68]" />,
  },
  {
    id: 'commandPalette',
    name: 'Command Palette (Ctrl+Shift+P)',
    description: 'Quickly trigger all application commands, view modes, and tools via keyboard.',
    icon: <Sliders className="w-4 h-4 text-[#73daca]" />,
  },
  {
    id: 'templates',
    name: 'Dynamic Templates',
    description: 'Insert markdown templates with dynamic variables like {{title}}, {{date}}, and {{time}}.',
    icon: <FileText className="w-4 h-4 text-[#f7768e]" />,
  },
  {
    id: 'bookmarks',
    name: 'Bookmarks & Starred Notes',
    description: 'Save favorite notes and assets for quick access in the sidebar explorer.',
    icon: <Bookmark className="w-4 h-4 text-[#e0af68]" />,
  },
  {
    id: 'tags',
    name: 'Tags Explorer',
    description: 'Automatically index and filter all hashtag references (#tag) across notes.',
    icon: <Hash className="w-4 h-4 text-[#73daca]" />,
  },
  {
    id: 'recovery',
    name: 'Recovery & Atomic Disk Saves',
    description: 'Fail-safe background crash recovery with dual-timer debouncing and atomic staging.',
    icon: <RotateCw className="w-4 h-4 text-[#7aa2f7]" />,
  },
  {
    id: 'outline',
    name: 'Outline / Table of Contents',
    description: 'Hierarchical H1–H6 table of contents in right sidebar with smooth 1-click jumps.',
    icon: <FileSpreadsheet className="w-4 h-4 text-[#bb9af7]" />,
  },
  {
    id: 'wordCount',
    name: 'Word Count & Reading Stats',
    description: 'Live statistics in bottom status bar showing word count, character count, and reading time.',
    icon: <Clock className="w-4 h-4 text-[#7dcfff]" />,
  },
  {
    id: 'wikilinks',
    name: 'Wikilinks & Backlinks',
    description: 'Bi-directional [[Note]] navigation and live backlink mentions panel.',
    icon: <FileText className="w-4 h-4 text-[#7aa2f7]" />,
  },
  {
    id: 'browser',
    name: 'Integrated Browser View',
    description: 'Built-in web documentation viewer with developer bookmarks and back/forward navigation.',
    icon: <Globe className="w-4 h-4 text-[#73daca]" />,
  },
];

export const SettingsModal: React.FC<SettingsModalProps> = ({
  settings,
  onSaveSettings,
  onClose,
  vaultStats,
  onReinitSampleVault,
}) => {
  const [activeTab, setActiveTab] = useState<'vault' | 'assets' | 'writing' | 'appearance' | 'plugins'>('appearance');
  const [currentSettings, setCurrentSettings] = useState<VaultSettings>({
    ...settings,
    theme: settings.theme || 'tokyo-night',
    baseColor: settings.baseColor || 'tokyo-night',
    accentColor: settings.accentColor || '#7aa2f7',
    corePlugins: {
      graph: true,
      canvas: true,
      slides: true,
      quickSwitcher: true,
      commandPalette: true,
      templates: true,
      bookmarks: true,
      tags: true,
      recovery: true,
      outline: true,
      wordCount: true,
      wikilinks: true,
      browser: true,
      ...(settings.corePlugins || {}),
    },
  });
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

  const togglePlugin = (pluginId: keyof CorePluginConfig) => {
    setCurrentSettings((prev) => {
      const plugins = { ...(prev.corePlugins || {}) } as CorePluginConfig;
      plugins[pluginId] = !plugins[pluginId];
      return { ...prev, corePlugins: plugins };
    });
  };

  const formatSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-[#141417] border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col h-[560px]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 bg-[#18181c] shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#7aa2f7]/20 text-[#7aa2f7] flex items-center justify-center border border-[#7aa2f7]/30">
              <Sliders className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-zinc-100">Synapse Preferences</h2>
              <p className="text-xs text-zinc-400">Configure base color, Tokyo Night themes, core plugins, and RTL writing</p>
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
              onClick={() => setActiveTab('appearance')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg font-medium transition-colors text-left ${
                activeTab === 'appearance'
                  ? 'bg-[#7aa2f7] text-[#16161e] font-semibold shadow'
                  : 'text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200'
              }`}
            >
              <Palette className="w-4 h-4" />
              <span>Base Color & Theme</span>
            </button>

            <button
              onClick={() => setActiveTab('plugins')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg font-medium transition-colors text-left ${
                activeTab === 'plugins'
                  ? 'bg-[#7aa2f7] text-[#16161e] font-semibold shadow'
                  : 'text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200'
              }`}
            >
              <Puzzle className="w-4 h-4" />
              <span>Core Plugins</span>
            </button>

            <button
              onClick={() => setActiveTab('vault')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg font-medium transition-colors text-left ${
                activeTab === 'vault'
                  ? 'bg-[#7aa2f7] text-[#16161e] font-semibold shadow'
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
                  ? 'bg-[#7aa2f7] text-[#16161e] font-semibold shadow'
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
                  ? 'bg-[#7aa2f7] text-[#16161e] font-semibold shadow'
                  : 'text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200'
              }`}
            >
              <Languages className="w-4 h-4" />
              <span>RTL & Arabic</span>
            </button>
          </div>

          {/* Settings Main Content Area */}
          <div className="flex-1 p-6 overflow-y-auto text-xs text-zinc-300 space-y-6">
            {/* TAB: BASE COLOR & APPEARANCE */}
            {activeTab === 'appearance' && (
              <div className="space-y-5">
                <div>
                  <h3 className="text-sm font-semibold text-zinc-100 mb-1">Base Color & Appearance</h3>
                  <p className="text-zinc-400 text-xs">
                    Choose your base color scheme (Tokyo Night default) and accent color palette.
                  </p>
                </div>

                {/* Base Color Selection */}
                <div className="p-3 bg-zinc-900 rounded-xl border border-zinc-800 space-y-2.5">
                  <span className="font-semibold text-zinc-200 text-xs">Base Color Scheme</span>
                  <div className="grid grid-cols-3 gap-2 mt-1">
                    <button
                      onClick={() =>
                        setCurrentSettings((s) => ({ ...s, baseColor: 'tokyo-night', theme: 'tokyo-night' }))
                      }
                      className={`p-3 rounded-lg border text-xs font-semibold flex flex-col items-center gap-1.5 transition-all ${
                        (currentSettings.baseColor || 'tokyo-night') === 'tokyo-night'
                          ? 'border-[#7aa2f7] bg-[#16161e] text-[#7aa2f7] ring-1 ring-[#7aa2f7]'
                          : 'border-zinc-800 bg-[#16161e] text-zinc-400 hover:border-zinc-700'
                      }`}
                    >
                      <Sparkles className="w-4 h-4 text-[#7aa2f7]" />
                      <span className="font-bold">Tokyo Night</span>
                      <span className="text-[10px] text-zinc-400">(Default Neon)</span>
                    </button>

                    <button
                      onClick={() =>
                        setCurrentSettings((s) => ({ ...s, baseColor: 'dark', theme: 'dark' }))
                      }
                      className={`p-3 rounded-lg border text-xs font-semibold flex flex-col items-center gap-1.5 transition-all ${
                        currentSettings.baseColor === 'dark'
                          ? 'border-[#7aa2f7] bg-[#121214] text-zinc-100 ring-1 ring-[#7aa2f7]'
                          : 'border-zinc-800 bg-[#121214] text-zinc-400 hover:border-zinc-700'
                      }`}
                    >
                      <Moon className="w-4 h-4 text-purple-400" />
                      <span className="font-bold">Dark</span>
                      <span className="text-[10px] text-zinc-400">Deep Obsidian</span>
                    </button>

                    <button
                      onClick={() =>
                        setCurrentSettings((s) => ({ ...s, baseColor: 'light', theme: 'light' }))
                      }
                      className={`p-3 rounded-lg border text-xs font-semibold flex flex-col items-center gap-1.5 transition-all ${
                        currentSettings.baseColor === 'light'
                          ? 'border-[#7aa2f7] bg-zinc-200 text-zinc-900 ring-1 ring-[#7aa2f7]'
                          : 'border-zinc-800 bg-zinc-200 text-zinc-800 hover:border-zinc-400'
                      }`}
                    >
                      <Sun className="w-4 h-4 text-amber-500" />
                      <span className="font-bold">Light</span>
                      <span className="text-[10px] text-zinc-600">Crisp White</span>
                    </button>
                  </div>
                </div>

                {/* Accent Color Selection */}
                <div className="p-3 bg-zinc-900 rounded-xl border border-zinc-800 space-y-2.5">
                  <span className="font-semibold text-zinc-200 text-xs">Accent Color</span>
                  <div className="flex items-center gap-3 mt-1">
                    {ACCENT_COLORS.map((acc) => (
                      <button
                        key={acc.color}
                        onClick={() => setCurrentSettings((s) => ({ ...s, accentColor: acc.color }))}
                        style={{ backgroundColor: acc.color }}
                        className={`w-7 h-7 rounded-full flex items-center justify-center transition-transform hover:scale-110 shadow ${
                          (currentSettings.accentColor || '#7aa2f7') === acc.color
                            ? 'ring-2 ring-white scale-110'
                            : ''
                        }`}
                        title={acc.label}
                      >
                        {(currentSettings.accentColor || '#7aa2f7') === acc.color && (
                          <Check className="w-3.5 h-3.5 text-black" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Themes List */}
                <div className="p-3 bg-zinc-900 rounded-xl border border-zinc-800 space-y-2">
                  <span className="font-semibold text-zinc-200 text-xs">Themes</span>
                  <div className="grid grid-cols-2 gap-2 mt-1">
                    {THEME_OPTIONS.map((th) => (
                      <button
                        key={th.id}
                        onClick={() =>
                          setCurrentSettings((s) => ({
                            ...s,
                            theme: th.id as any,
                            baseColor: th.dark ? 'tokyo-night' : 'light',
                          }))
                        }
                        style={{ backgroundColor: th.bg }}
                        className={`p-2.5 rounded-lg border text-left flex items-center justify-between transition-all ${
                          currentSettings.theme === th.id
                            ? 'border-[#7aa2f7] ring-1 ring-[#7aa2f7]'
                            : 'border-zinc-800 hover:border-zinc-700'
                        }`}
                      >
                        <span className={`font-medium text-xs ${th.dark ? 'text-zinc-200' : 'text-zinc-900'}`}>
                          {th.name}
                        </span>
                        {currentSettings.theme === th.id && (
                          <Check className="w-3.5 h-3.5 text-[#7aa2f7]" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Font Size Slider */}
                <div className="p-3 bg-zinc-900 rounded-xl border border-zinc-800 space-y-3">
                  <div className="flex justify-between text-xs">
                    <span className="font-semibold text-zinc-200">Editor Font Size</span>
                    <span className="font-mono text-[#7aa2f7]">{currentSettings.fontSize}px</span>
                  </div>
                  <input
                    type="range"
                    min="12"
                    max="22"
                    value={currentSettings.fontSize}
                    onChange={(e) =>
                      setCurrentSettings((s) => ({ ...s, fontSize: Number(e.target.value) }))
                    }
                    className="w-full accent-[#7aa2f7] bg-zinc-800 h-1.5 rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-zinc-500 font-mono">
                    <span>12px</span>
                    <span>16px (Default)</span>
                    <span>22px</span>
                  </div>
                </div>

                {/* Default Note View Mode */}
                <div className="p-3 bg-zinc-900 rounded-xl border border-zinc-800 space-y-2">
                  <span className="font-semibold text-zinc-200 text-xs">Default Note View Mode</span>
                  <div className="grid grid-cols-3 gap-2 mt-2">
                    <button
                      onClick={() =>
                        setCurrentSettings((s) => ({ ...s, defaultViewMode: 'live' }))
                      }
                      className={`py-2 px-3 rounded-lg border text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors ${
                        currentSettings.defaultViewMode === 'live'
                          ? 'bg-[#7aa2f7] border-[#7aa2f7] text-[#16161e] shadow'
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
                          ? 'bg-[#7aa2f7] border-[#7aa2f7] text-[#16161e] shadow'
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
                          ? 'bg-[#7aa2f7] border-[#7aa2f7] text-[#16161e] shadow'
                          : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                      }`}
                    >
                      <span>Split Mode</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* TAB: CORE PLUGINS */}
            {activeTab === 'plugins' && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-semibold text-zinc-100 mb-1">Core Plugins</h3>
                  <p className="text-zinc-400 text-xs">
                    Enable or disable native Synapse features to keep your workspace fast and focused.
                  </p>
                </div>

                <div className="space-y-2">
                  {CORE_PLUGINS_LIST.map((plugin) => {
                    const isEnabled = currentSettings.corePlugins?.[plugin.id] !== false;
                    return (
                      <div
                        key={plugin.id}
                        onClick={() => togglePlugin(plugin.id)}
                        className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-colors ${
                          isEnabled
                            ? 'bg-zinc-900/80 border-zinc-800 hover:border-zinc-700'
                            : 'bg-zinc-950/40 border-zinc-900 opacity-60 hover:opacity-80'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className="mt-0.5">{plugin.icon}</div>
                          <div>
                            <div className="font-semibold text-xs text-zinc-200">{plugin.name}</div>
                            <div className="text-[11px] text-zinc-400 mt-0.5 leading-relaxed">
                              {plugin.description}
                            </div>
                          </div>
                        </div>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            togglePlugin(plugin.id);
                          }}
                          className={`ml-3 shrink-0 transition-colors ${
                            isEnabled ? 'text-[#7aa2f7]' : 'text-zinc-600'
                          }`}
                        >
                          {isEnabled ? (
                            <ToggleRight className="w-6 h-6" />
                          ) : (
                            <ToggleLeft className="w-6 h-6" />
                          )}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* TAB: VAULT STORAGE */}
            {activeTab === 'vault' && (
              <div className="space-y-5">
                <div>
                  <h3 className="text-sm font-semibold text-zinc-100 mb-1">Vault Directory</h3>
                  <p className="text-zinc-400 text-xs">
                    Choose any folder on your computer to open as a Synapse markdown vault.
                  </p>
                </div>

                <div className="p-3 bg-zinc-900 rounded-xl border border-zinc-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="text-[11px] text-zinc-500 font-medium">ABSOLUTE VAULT PATH</div>
                    <button
                      onClick={handleBrowseFolder}
                      className="flex items-center gap-1.5 px-2.5 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-md font-medium transition-colors"
                    >
                      <FolderOpen className="w-3.5 h-3.5 text-blue-400" />
                      <span>Browse / Open Folder</span>
                    </button>
                  </div>
                  <div className="p-2 bg-zinc-950 rounded-lg border border-zinc-800 font-mono text-zinc-300 break-all select-text">
                    {currentSettings.vaultPath || 'Default app vault'}
                  </div>
                </div>

                {/* Vault Metrics */}
                <div className="grid grid-cols-3 gap-2">
                  <div className="p-3 bg-zinc-900 rounded-xl border border-zinc-800 text-center">
                    <div className="text-lg font-bold text-[#7aa2f7] font-mono">
                      {vaultStats.totalNotes ?? vaultStats.total_notes ?? 0}
                    </div>
                    <div className="text-[10px] text-zinc-400 uppercase tracking-wider font-semibold mt-0.5">
                      Notes
                    </div>
                  </div>
                  <div className="p-3 bg-zinc-900 rounded-xl border border-zinc-800 text-center">
                    <div className="text-lg font-bold text-amber-400 font-mono">
                      {vaultStats.totalAssets ?? vaultStats.total_assets ?? 0}
                    </div>
                    <div className="text-[10px] text-zinc-400 uppercase tracking-wider font-semibold mt-0.5">
                      Assets
                    </div>
                  </div>
                  <div className="p-3 bg-zinc-900 rounded-xl border border-zinc-800 text-center">
                    <div className="text-lg font-bold text-emerald-400 font-mono">
                      {formatSize(vaultStats.totalSizeBytes ?? vaultStats.total_size_bytes ?? 0)}
                    </div>
                    <div className="text-[10px] text-zinc-400 uppercase tracking-wider font-semibold mt-0.5">
                      Size
                    </div>
                  </div>
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
                        <RefreshCw className="w-3.5 h-3.5 text-[#7aa2f7]" />
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

                <div className="space-y-3">
                  <label
                    onClick={() => setCurrentSettings((s) => ({ ...s, assetsMode: 'designated' }))}
                    className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${
                      currentSettings.assetsMode === 'designated'
                        ? 'border-[#7aa2f7]/80 bg-[#7aa2f7]/10 text-zinc-100'
                        : 'border-zinc-800 bg-zinc-900/50 hover:bg-zinc-900 text-zinc-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="assetsMode"
                      checked={currentSettings.assetsMode === 'designated'}
                      onChange={() => {}}
                      className="mt-1 accent-[#7aa2f7]"
                    />
                    <div className="flex-1">
                      <div className="font-semibold text-xs">Designated attachments folder</div>
                      <p className="text-[11px] text-zinc-400 mt-0.5">
                        All pasted and dropped files are placed in a designated root folder.
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
                            className="bg-zinc-950 border border-zinc-700 rounded px-2.5 py-1 text-xs text-zinc-200 outline-none focus:border-[#7aa2f7] font-mono"
                          />
                        </div>
                      )}
                    </div>
                  </label>

                  <label
                    onClick={() => setCurrentSettings((s) => ({ ...s, assetsMode: 'root' }))}
                    className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${
                      currentSettings.assetsMode === 'root'
                        ? 'border-[#7aa2f7]/80 bg-[#7aa2f7]/10 text-zinc-100'
                        : 'border-zinc-800 bg-zinc-900/50 hover:bg-zinc-900 text-zinc-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="assetsMode"
                      checked={currentSettings.assetsMode === 'root'}
                      onChange={() => {}}
                      className="mt-1 accent-[#7aa2f7]"
                    />
                    <div>
                      <div className="font-semibold text-xs">Vault root folder</div>
                      <p className="text-[11px] text-zinc-400 mt-0.5">
                        All pasted attachments are saved directly into the vault root directory (/).
                      </p>
                    </div>
                  </label>

                  <label
                    onClick={() => setCurrentSettings((s) => ({ ...s, assetsMode: 'same-folder' }))}
                    className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${
                      currentSettings.assetsMode === 'same-folder'
                        ? 'border-[#7aa2f7]/80 bg-[#7aa2f7]/10 text-zinc-100'
                        : 'border-zinc-800 bg-zinc-900/50 hover:bg-zinc-900 text-zinc-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="assetsMode"
                      checked={currentSettings.assetsMode === 'same-folder'}
                      onChange={() => {}}
                      className="mt-1 accent-[#7aa2f7]"
                    />
                    <div>
                      <div className="font-semibold text-xs">Same folder as current note</div>
                      <p className="text-[11px] text-zinc-400 mt-0.5">
                        Attachments are saved in the exact same directory alongside the active note.
                      </p>
                    </div>
                  </label>

                  <label
                    onClick={() => setCurrentSettings((s) => ({ ...s, assetsMode: 'subfolder' }))}
                    className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${
                      currentSettings.assetsMode === 'subfolder'
                        ? 'border-[#7aa2f7]/80 bg-[#7aa2f7]/10 text-zinc-100'
                        : 'border-zinc-800 bg-zinc-900/50 hover:bg-zinc-900 text-zinc-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="assetsMode"
                      checked={currentSettings.assetsMode === 'subfolder'}
                      onChange={() => {}}
                      className="mt-1 accent-[#7aa2f7]"
                    />
                    <div>
                      <div className="font-semibold text-xs">Subfolder under current note (./assets)</div>
                      <p className="text-[11px] text-zinc-400 mt-0.5">
                        Attachments are saved in an `assets/` subfolder located under the note's directory.
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
                    Synapse features full bi-directional text layout with automatic Arabic and Hebrew detection.
                  </p>
                </div>

                <div className="p-3 bg-zinc-900 rounded-xl border border-zinc-800 space-y-3">
                  <span className="font-semibold text-zinc-200 text-xs">Direction Mode</span>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      onClick={() =>
                        setCurrentSettings((s) => ({ ...s, rtlMode: 'auto' }))
                      }
                      className={`p-3 rounded-lg border text-xs font-semibold flex flex-col items-center justify-center gap-1 transition-colors ${
                        (currentSettings.rtlMode || 'auto') === 'auto'
                          ? 'bg-[#7aa2f7] border-[#7aa2f7] text-[#16161e] shadow'
                          : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                      }`}
                    >
                      <span className="font-bold text-sm">Auto Detect</span>
                      <span className="text-[10px] opacity-80">Paragraph-based</span>
                    </button>
                    <button
                      onClick={() =>
                        setCurrentSettings((s) => ({ ...s, rtlMode: 'rtl' }))
                      }
                      className={`p-3 rounded-lg border text-xs font-semibold flex flex-col items-center justify-center gap-1 transition-colors ${
                        currentSettings.rtlMode === 'rtl'
                          ? 'bg-[#7aa2f7] border-[#7aa2f7] text-[#16161e] shadow'
                          : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                      }`}
                    >
                      <span className="font-bold text-sm">RTL (من اليمين)</span>
                      <span className="text-[10px] opacity-80">Force Arabic / Hebrew RTL</span>
                    </button>
                    <button
                      onClick={() =>
                        setCurrentSettings((s) => ({ ...s, rtlMode: 'ltr' }))
                      }
                      className={`p-3 rounded-lg border text-xs font-semibold flex flex-col items-center justify-center gap-1 transition-colors ${
                        currentSettings.rtlMode === 'ltr'
                          ? 'bg-[#7aa2f7] border-[#7aa2f7] text-[#16161e] shadow'
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
            className="px-4 py-1.5 bg-[#7aa2f7] hover:bg-[#89b4fa] text-[#16161e] rounded-lg font-semibold transition-colors shadow"
          >
            Save Preferences
          </button>
        </div>
      </div>
    </div>
  );
};
