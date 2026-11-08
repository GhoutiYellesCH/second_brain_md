import React from 'react';
import { DocumentTab } from '../../types';
import { X, FileText, Code, Layout, Image as ImageIcon } from 'lucide-react';

interface EditorTabsProps {
  tabs: DocumentTab[];
  activeTabId: string | null;
  onSelectTab: (id: string) => void;
  onCloseTab: (id: string, e: React.MouseEvent) => void;
  onNewTab: () => void;
}

export const EditorTabs: React.FC<EditorTabsProps> = ({
  tabs,
  activeTabId,
  onSelectTab,
  onCloseTab,
  onNewTab,
}) => {
  const getTabIcon = (tab: DocumentTab) => {
    switch (tab.fileKind) {
      case 'code':
        return <Code className="w-3.5 h-3.5 text-[#73daca]" />;
      case 'canvas':
        return <Layout className="w-3.5 h-3.5 text-[#bb9af7]" />;
      case 'asset':
        return <ImageIcon className="w-3.5 h-3.5 text-[#ff9e64]" />;
      default:
        return <FileText className="w-3.5 h-3.5 text-[#7aa2f7]" />;
    }
  };

  return (
    <div className="flex items-center flex-1 h-full overflow-x-auto no-scrollbar">
      <div className="flex items-center h-full">
        {tabs.map((tab) => {
          const isActive = tab.id === activeTabId;
          return (
            <div
              key={tab.id}
              onClick={() => onSelectTab(tab.id)}
              title={tab.path || tab.title}
              className={`group flex items-center gap-2 h-full px-3 text-xs border-r border-[#24283b] cursor-pointer transition-colors max-w-[200px] select-none ${
                isActive
                  ? 'bg-[#1e202e] text-[#c0caf5] border-t-2 border-t-[#7aa2f7] font-medium'
                  : 'bg-[#16161e] text-[#787c99] hover:bg-[#1a1b26] hover:text-[#a9b1d6]'
              }`}
            >
              {getTabIcon(tab)}
              <span className="truncate flex-1">{tab.title || 'Untitled'}</span>
              
              {tab.isDirty ? (
                <span className="w-2 h-2 rounded-full bg-[#7aa2f7] group-hover:hidden shrink-0" />
              ) : null}

              <button
                onClick={(e) => onCloseTab(tab.id, e)}
                className={`p-0.5 rounded hover:bg-[#24283b] text-[#565f89] hover:text-[#c0caf5] transition-colors shrink-0 ${
                  tab.isDirty ? 'hidden group-hover:block' : ''
                }`}
                title="Close Tab"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          );
        })}
      </div>

      <button
        onClick={onNewTab}
        className="px-2.5 h-full flex items-center justify-center text-[#565f89] hover:text-[#7aa2f7] hover:bg-[#1a1b26] transition-colors"
        title="New Tab (Ctrl+N)"
      >
        <span className="text-base font-light">+</span>
      </button>
    </div>
  );
};
