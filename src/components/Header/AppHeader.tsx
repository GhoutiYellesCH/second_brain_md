import React from 'react';
import { DocumentTab, ViewMode } from '../../types';
import { EditorTabs } from './EditorTabs';
import {
  Columns2,
  FileCode,
  Eye,
  Share2,
  Settings,
  Search,
  Layout,
  Play,
  PanelLeft,
  PanelRight,
  Sparkles,
} from 'lucide-react';

interface AppHeaderProps {
  tabs: DocumentTab[];
  activeTabId: string | null;
  activeViewMode: ViewMode;
  isSingleFileMode: boolean;
  showLeftSidebar: boolean;
  showRightSidebar: boolean;
  activeSpecialView: 'editor' | 'graph' | 'canvas' | 'slides';
  onSelectTab: (id: string) => void;
  onCloseTab: (id: string, e: React.MouseEvent) => void;
  onNewTab: () => void;
  onChangeViewMode: (mode: ViewMode) => void;
  onToggleLeftSidebar: () => void;
  onToggleRightSidebar: () => void;
  onOpenCommandPalette: () => void;
  onOpenQuickSwitcher: () => void;
  onOpenSettings: () => void;
  onToggleSpecialView: (view: 'graph' | 'canvas' | 'slides') => void;
  onToggleSingleFileMode: () => void;
}

export const AppHeader: React.FC<AppHeaderProps> = ({
  tabs,
  activeTabId,
  activeViewMode,
  isSingleFileMode,
  showLeftSidebar,
  showRightSidebar,
  activeSpecialView,
  onSelectTab,
  onCloseTab,
  onNewTab,
  onChangeViewMode,
  onToggleLeftSidebar,
  onToggleRightSidebar,
  onOpenCommandPalette,
  onOpenQuickSwitcher,
  onOpenSettings,
  onToggleSpecialView,
  onToggleSingleFileMode,
}) => {
  return (
    <header className="h-10 bg-[#16161e] border-b border-[#24283b] flex items-center justify-between px-2 select-none shrink-0 z-30">
      {/* Left branding and sidebar toggle */}
      <div className="flex items-center gap-2 pr-2 border-r border-[#24283b]">
        {!isSingleFileMode && (
          <button
            onClick={onToggleLeftSidebar}
            className={`p-1.5 rounded transition-colors ${
              showLeftSidebar ? 'bg-[#24283b] text-[#7aa2f7]' : 'text-[#565f89] hover:bg-[#1f2335] hover:text-[#c0caf5]'
            }`}
            title="Toggle Left Sidebar"
          >
            <PanelLeft className="w-4 h-4" />
          </button>
        )}

        {/* Synapse Logo & Name */}
        <div className="flex items-center gap-2 px-1">
          <img src="/icon.svg" alt="Synapse" className="w-5 h-5 rounded-md drop-shadow-[0_0_8px_rgba(122,162,247,0.5)]" />
          <span className="font-semibold text-xs tracking-wide bg-gradient-to-r from-[#7aa2f7] via-[#bb9af7] to-[#7dcfff] bg-clip-text text-transparent hidden sm:inline">
            Synapse
          </span>
        </div>

        {/* Mode pill: Vault Mode vs Single File Mode */}
        <button
          onClick={onToggleSingleFileMode}
          className={`text-[10px] px-2 py-0.5 rounded-full font-medium transition-colors border ${
            isSingleFileMode
              ? 'bg-[#73daca]/10 text-[#73daca] border-[#73daca]/30 hover:bg-[#73daca]/20'
              : 'bg-[#7aa2f7]/10 text-[#7aa2f7] border-[#7aa2f7]/30 hover:bg-[#7aa2f7]/20'
          }`}
          title={isSingleFileMode ? "Click to switch to Vault Explorer mode" : "Click to switch to Single File Focus mode"}
        >
          {isSingleFileMode ? 'Single File' : 'Vault'}
        </button>
      </div>

      {/* Center Tabs */}
      <EditorTabs
        tabs={tabs}
        activeTabId={activeTabId}
        onSelectTab={onSelectTab}
        onCloseTab={onCloseTab}
        onNewTab={onNewTab}
      />

      {/* Right controls: View modes, Graph, Quick Switcher, Settings */}
      <div className="flex items-center gap-1 pl-2 border-l border-[#24283b]">
        {/* Quick Switcher Button */}
        <button
          onClick={onOpenQuickSwitcher}
          className="p-1.5 rounded text-[#787c99] hover:bg-[#1f2335] hover:text-[#7aa2f7] transition-colors"
          title="Quick Switcher (Ctrl+O)"
        >
          <Search className="w-4 h-4" />
        </button>

        {/* Synapse Neural Graph View Toggle */}
        <button
          onClick={() => onToggleSpecialView('graph')}
          className={`p-1.5 rounded transition-colors ${
            activeSpecialView === 'graph'
              ? 'bg-[#7aa2f7]/20 text-[#7aa2f7] border border-[#7aa2f7]/40 shadow-[0_0_8px_rgba(122,162,247,0.3)]'
              : 'text-[#787c99] hover:bg-[#1f2335] hover:text-[#7aa2f7]'
          }`}
          title="Tokyo Night Synapse Graph View (Ctrl+G)"
        >
          <Share2 className="w-4 h-4" />
        </button>

        {/* Canvas Whiteboard Toggle */}
        <button
          onClick={() => onToggleSpecialView('canvas')}
          className={`p-1.5 rounded transition-colors ${
            activeSpecialView === 'canvas'
              ? 'bg-[#bb9af7]/20 text-[#bb9af7] border border-[#bb9af7]/40 shadow-[0_0_8px_rgba(187,154,247,0.3)]'
              : 'text-[#787c99] hover:bg-[#1f2335] hover:text-[#bb9af7]'
          }`}
          title="Visual Canvas Board"
        >
          <Layout className="w-4 h-4" />
        </button>

        {/* Presentation Slides Toggle */}
        <button
          onClick={() => onToggleSpecialView('slides')}
          className={`p-1.5 rounded transition-colors ${
            activeSpecialView === 'slides'
              ? 'bg-[#73daca]/20 text-[#73daca] border border-[#73daca]/40'
              : 'text-[#787c99] hover:bg-[#1f2335] hover:text-[#73daca]'
          }`}
          title="Presentation Slides View"
        >
          <Play className="w-4 h-4" />
        </button>

        <div className="h-4 w-[1px] bg-[#24283b] mx-1" />

        {/* Editor View Modes (Edit / Split / Preview) */}
        {activeSpecialView === 'editor' && (
          <div className="flex items-center bg-[#1a1b26] p-0.5 rounded border border-[#24283b]">
            <button
              onClick={() => onChangeViewMode('edit')}
              className={`p-1 rounded text-xs transition-colors ${
                activeViewMode === 'edit' ? 'bg-[#24283b] text-[#7aa2f7]' : 'text-[#565f89] hover:text-[#c0caf5]'
              }`}
              title="Edit Source Only"
            >
              <FileCode className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onChangeViewMode('split')}
              className={`p-1 rounded text-xs transition-colors ${
                activeViewMode === 'split' ? 'bg-[#24283b] text-[#7aa2f7]' : 'text-[#565f89] hover:text-[#c0caf5]'
              }`}
              title="Split View (Source + Preview)"
            >
              <Columns2 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onChangeViewMode('preview')}
              className={`p-1 rounded text-xs transition-colors ${
                activeViewMode === 'preview' ? 'bg-[#24283b] text-[#7aa2f7]' : 'text-[#565f89] hover:text-[#c0caf5]'
              }`}
              title="Reading / Preview Only"
            >
              <Eye className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Command Palette Button */}
        <button
          onClick={onOpenCommandPalette}
          className="p-1.5 rounded text-[#787c99] hover:bg-[#1f2335] hover:text-[#bb9af7] transition-colors"
          title="Command Palette (Ctrl+P / Ctrl+K)"
        >
          <Sparkles className="w-4 h-4" />
        </button>

        {/* Settings Button */}
        <button
          onClick={onOpenSettings}
          className="p-1.5 rounded text-[#787c99] hover:bg-[#1f2335] hover:text-[#c0caf5] transition-colors"
          title="Settings (Ctrl+,)"
        >
          <Settings className="w-4 h-4" />
        </button>

        {/* Right Inspector Toggle */}
        <button
          onClick={onToggleRightSidebar}
          className={`p-1.5 rounded transition-colors ${
            showRightSidebar ? 'bg-[#24283b] text-[#7aa2f7]' : 'text-[#565f89] hover:bg-[#1f2335] hover:text-[#c0caf5]'
          }`}
          title="Toggle Backlinks & Outline"
        >
          <PanelRight className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
