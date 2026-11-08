import React, { useState } from 'react';
import { FileItem } from '../../types';
import { FileTreeItem } from './FileTreeItem';
import { VaultSearch } from './VaultSearch';
import { BookmarksView } from './BookmarksView';
import { TagsView } from './TagsView';
import { RecentFilesView } from './RecentFilesView';
import { RecentItem } from '../../services/documentApi';
import {
  FolderTree,
  Search,
  Star,
  Tag,
  History,
  FilePlus,
  FolderPlus,
  RotateCw,
  FolderOpen,
} from 'lucide-react';

type SidebarTab = 'files' | 'search' | 'bookmarks' | 'tags' | 'recent';

interface LeftSidebarProps {
  tree: FileItem | null;
  activePath?: string;
  vaultPath: string;
  bookmarks: string[];
  tags: Map<string, number>;
  recentFiles: RecentItem[];
  onSelectFile: (path: string) => void;
  onSelectSearchResult: (path: string, line: number) => void;
  onCreateFile: () => void;
  onCreateFolder: () => void;
  onDeleteFile: (path: string) => void;
  onRenameFile: (oldPath: string, newPath: string) => void;
  onRefreshVault: () => void;
  onPickVault: () => void;
  onRemoveBookmark: (path: string, e: React.MouseEvent) => void;
  onClearRecent: () => void;
}

export const LeftSidebar: React.FC<LeftSidebarProps> = ({
  tree,
  activePath,
  vaultPath,
  bookmarks,
  tags,
  recentFiles,
  onSelectFile,
  onSelectSearchResult,
  onCreateFile,
  onCreateFolder,
  onDeleteFile,
  onRenameFile,
  onRefreshVault,
  onPickVault,
  onRemoveBookmark,
  onClearRecent,
}) => {
  const [activeTab, setActiveTab] = useState<SidebarTab>('files');
  const vaultName = vaultPath ? vaultPath.split('/').pop() || 'Vault' : 'Synapse Vault';

  return (
    <aside className="w-64 bg-[#16161e] border-r border-[#24283b] flex flex-col h-full shrink-0 select-none">
      {/* Top Header: Vault Name & Action Buttons */}
      <div className="h-10 border-b border-[#24283b] px-3 flex items-center justify-between">
        <button
          onClick={onPickVault}
          className="flex items-center gap-1.5 font-semibold text-xs text-[#c0caf5] hover:text-[#7aa2f7] transition-colors truncate flex-1 text-left"
          title={`Active Vault: ${vaultPath} (Click to switch)`}
        >
          <FolderOpen className="w-3.5 h-3.5 text-[#7aa2f7] shrink-0" />
          <span className="truncate">{vaultName}</span>
        </button>

        <div className="flex items-center gap-1">
          <button
            onClick={onCreateFile}
            className="p-1 rounded hover:bg-[#24283b] text-[#565f89] hover:text-[#7aa2f7] transition-colors"
            title="New Note"
          >
            <FilePlus className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onCreateFolder}
            className="p-1 rounded hover:bg-[#24283b] text-[#565f89] hover:text-[#7aa2f7] transition-colors"
            title="New Folder"
          >
            <FolderPlus className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onRefreshVault}
            className="p-1 rounded hover:bg-[#24283b] text-[#565f89] hover:text-[#c0caf5] transition-colors"
            title="Refresh Vault"
          >
            <RotateCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Navigation Icon Tabs */}
      <div className="flex items-center justify-around border-b border-[#24283b] bg-[#1a1b26]/60 p-1 text-[#565f89]">
        <button
          onClick={() => setActiveTab('files')}
          className={`p-1.5 rounded transition-colors ${
            activeTab === 'files' ? 'bg-[#24283b] text-[#7aa2f7]' : 'hover:text-[#c0caf5]'
          }`}
          title="File Explorer"
        >
          <FolderTree className="w-4 h-4" />
        </button>
        <button
          onClick={() => setActiveTab('search')}
          className={`p-1.5 rounded transition-colors ${
            activeTab === 'search' ? 'bg-[#24283b] text-[#7aa2f7]' : 'hover:text-[#c0caf5]'
          }`}
          title="Vault Search"
        >
          <Search className="w-4 h-4" />
        </button>
        <button
          onClick={() => setActiveTab('bookmarks')}
          className={`p-1.5 rounded transition-colors ${
            activeTab === 'bookmarks' ? 'bg-[#24283b] text-[#e0af68]' : 'hover:text-[#c0caf5]'
          }`}
          title="Bookmarks"
        >
          <Star className="w-4 h-4" />
        </button>
        <button
          onClick={() => setActiveTab('tags')}
          className={`p-1.5 rounded transition-colors ${
            activeTab === 'tags' ? 'bg-[#24283b] text-[#73daca]' : 'hover:text-[#c0caf5]'
          }`}
          title="Tags"
        >
          <Tag className="w-4 h-4" />
        </button>
        <button
          onClick={() => setActiveTab('recent')}
          className={`p-1.5 rounded transition-colors ${
            activeTab === 'recent' ? 'bg-[#24283b] text-[#bb9af7]' : 'hover:text-[#c0caf5]'
          }`}
          title="Recent Documents"
        >
          <History className="w-4 h-4" />
        </button>
      </div>

      {/* Tab Panels */}
      <div className="flex-1 overflow-y-auto p-1.5">
        {activeTab === 'files' && (
          <div className="space-y-0.5">
            {tree?.children && tree.children.length > 0 ? (
              tree.children.map((item) => (
                <FileTreeItem
                  key={item.path}
                  item={item}
                  activePath={activePath}
                  onSelectFile={onSelectFile}
                  onDelete={onDeleteFile}
                  onRename={onRenameFile}
                  level={0}
                />
              ))
            ) : (
              <div className="text-center py-8 text-[#565f89] text-xs">
                No files in vault. Click <span className="text-[#7aa2f7]">+</span> above to create your first note.
              </div>
            )}
          </div>
        )}

        {activeTab === 'search' && (
          <VaultSearch vaultPath={vaultPath} onSelectResult={onSelectSearchResult} />
        )}

        {activeTab === 'bookmarks' && (
          <BookmarksView
            bookmarks={bookmarks}
            onSelectBookmark={onSelectFile}
            onRemoveBookmark={onRemoveBookmark}
          />
        )}

        {activeTab === 'tags' && (
          <TagsView tags={tags} onSelectTag={() => onSelectSearchResult('', 1)} />
        )}

        {activeTab === 'recent' && (
          <RecentFilesView
            recentFiles={recentFiles}
            onSelectFile={onSelectFile}
            onClearRecent={onClearRecent}
          />
        )}
      </div>
    </aside>
  );
};
