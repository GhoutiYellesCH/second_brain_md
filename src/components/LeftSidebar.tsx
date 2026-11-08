import React, { useState, useCallback } from 'react';
import { FileItem, SearchResult, VaultSettings } from '../types';
import {
  Folder,
  FolderOpen,
  FileText,
  Image,
  Film,
  Music,
  File,
  Search,
  Hash,
  Star,
  ChevronRight,
  ChevronDown,
  Plus,
  FolderPlus,
  Trash2,
  Edit2,
  Settings,
  Layers,
  Sparkles,
  FoldVertical,
  UnfoldVertical,
} from 'lucide-react';

interface LeftSidebarProps {
  tree: FileItem | null;
  activeFilePath?: string;
  onFileSelect: (path: string, isDir: boolean) => void;
  onCreateFile: (parentDir: string) => void;
  onCreateFolder: (parentDir: string) => void;
  onDelete: (path: string) => void;
  onRename: (oldPath: string) => void;
  onSearchSelect: (result: SearchResult) => void;
  onTagSelect: (tag: string) => void;
  onOpenSettings: () => void;
  onOpenSynapseGraph: () => void;
  onPickVaultFolder: () => void;
  searchResults: SearchResult[];
  onSearchQueryChange: (query: string) => void;
  searchQuery: string;
  allTags: { tag: string; count: number }[];
  starredPaths: string[];
  onToggleStar: (path: string) => void;
  settings: VaultSettings;
  width?: number;
}

export const LeftSidebar: React.FC<LeftSidebarProps> = ({
  tree,
  activeFilePath,
  onFileSelect,
  onCreateFile,
  onCreateFolder,
  onDelete,
  onRename,
  onSearchSelect,
  onTagSelect,
  onOpenSettings,
  onOpenSynapseGraph,
  onPickVaultFolder,
  searchResults,
  onSearchQueryChange,
  searchQuery,
  allTags,
  starredPaths,
  onToggleStar,
  settings,
  width,
}) => {
  const [activeTab, setActiveTab] = useState<'files' | 'search' | 'tags' | 'bookmarks'>('files');
  const [expandedFolders, setExpandedFolders] = useState<Record<string, boolean>>({
    [tree?.path || '']: true,
  });

  // Collect all directories recursively
  const getAllDirs = useCallback((item: FileItem | null): string[] => {
    if (!item) return [];
    let dirs: string[] = [];
    if (item.is_dir) {
      dirs.push(item.path);
      if (item.children) {
        for (const child of item.children) {
          dirs = dirs.concat(getAllDirs(child));
        }
      }
    }
    return dirs;
  }, []);

  const collapseAllFolders = () => {
    if (!tree) return;
    const allDirs = getAllDirs(tree);
    const next: Record<string, boolean> = { [tree.path]: true };
    for (const d of allDirs) {
      if (d !== tree.path) {
        next[d] = false;
      }
    }
    setExpandedFolders(next);
  };

  const expandAllFolders = () => {
    if (!tree) return;
    const allDirs = getAllDirs(tree);
    const next: Record<string, boolean> = {};
    for (const d of allDirs) {
      next[d] = true;
    }
    setExpandedFolders(next);
  };

  const toggleFolder = (path: string) => {
    setExpandedFolders((prev) => ({
      ...prev,
      [path]: !prev[path],
    }));
  };

  const getFileIcon = (item: FileItem) => {
    if (item.is_dir) {
      return expandedFolders[item.path] ? (
        <FolderOpen className="w-4 h-4 text-purple-400 shrink-0" />
      ) : (
        <Folder className="w-4 h-4 text-purple-400 shrink-0" />
      );
    }
    const ext = item.extension.toLowerCase();
    if (ext === 'md' || ext === 'markdown') {
      return <FileText className="w-4 h-4 text-zinc-400 shrink-0" />;
    }
    if (['png', 'jpg', 'jpeg', 'svg', 'gif', 'webp'].includes(ext)) {
      return <Image className="w-4 h-4 text-amber-400 shrink-0" />;
    }
    if (['mp4', 'webm'].includes(ext)) {
      return <Film className="w-4 h-4 text-rose-400 shrink-0" />;
    }
    if (['mp3', 'wav', 'ogg'].includes(ext)) {
      return <Music className="w-4 h-4 text-emerald-400 shrink-0" />;
    }
    return <File className="w-4 h-4 text-zinc-500 shrink-0" />;
  };

  // Recursive Tree Node Renderer
  const renderTree = (item: FileItem, depth: number = 0) => {
    const isExpanded = expandedFolders[item.path] !== false;
    const isActive = activeFilePath === item.path;
    const isStarred = starredPaths.includes(item.path);

    if (item.is_dir) {
      return (
        <div key={item.path} className="flex flex-col">
          <div
            className={`flex items-center justify-between py-1 px-2 rounded-md hover:bg-zinc-800/60 cursor-pointer group text-xs text-zinc-300 font-medium select-none transition-colors`}
            style={{ paddingLeft: `${Math.max(8, depth * 14 + 8)}px` }}
            onClick={() => toggleFolder(item.path)}
          >
            <div className="flex items-center gap-1.5 truncate">
              {isExpanded ? (
                <ChevronDown className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
              ) : (
                <ChevronRight className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
              )}
              {getFileIcon(item)}
              <span dir="auto" className="truncate">{item.name || 'Vault'}</span>
            </div>

            <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1 transition-opacity">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onCreateFile(item.path);
                }}
                title="New Note in folder"
                className="p-1 hover:bg-zinc-700 rounded text-zinc-400 hover:text-white"
              >
                <Plus className="w-3 h-3" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onCreateFolder(item.path);
                }}
                title="New Subfolder"
                className="p-1 hover:bg-zinc-700 rounded text-zinc-400 hover:text-white"
              >
                <FolderPlus className="w-3 h-3" />
              </button>
            </div>
          </div>

          {isExpanded && item.children && (
            <div className="flex flex-col">
              {item.children.map((child) => renderTree(child, depth + 1))}
            </div>
          )}
        </div>
      );
    }

    return (
      <div
        key={item.path}
        className={`flex items-center justify-between py-1 px-2 rounded-md cursor-pointer group text-xs select-none transition-colors ${
          isActive
            ? 'bg-purple-900/40 text-purple-200 font-medium'
            : 'text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-200'
        }`}
        style={{ paddingLeft: `${Math.max(8, depth * 14 + 18)}px` }}
        onClick={() => onFileSelect(item.path, false)}
      >
        <div className="flex items-center gap-1.5 truncate">
          {getFileIcon(item)}
          <span dir="auto" className="truncate">{item.name.replace(/\.md$/, '')}</span>
        </div>

        <div className="opacity-0 group-hover:opacity-100 flex items-center gap-0.5 transition-opacity">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleStar(item.path);
            }}
            title={isStarred ? 'Unstar' : 'Star Note'}
            className={`p-1 rounded ${isStarred ? 'text-amber-400' : 'text-zinc-400 hover:text-amber-400'}`}
          >
            <Star className="w-3 h-3" fill={isStarred ? 'currentColor' : 'none'} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onRename(item.path);
            }}
            title="Rename"
            className="p-1 hover:bg-zinc-700 rounded text-zinc-400 hover:text-white"
          >
            <Edit2 className="w-3 h-3" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(item.path);
            }}
            title="Delete"
            className="p-1 hover:bg-zinc-700 rounded text-zinc-400 hover:text-rose-400"
          >
            <Trash2 className="w-3 h-3" />
          </button>
        </div>
      </div>
    );
  };

  return (
    <div
      className="flex flex-col h-full bg-[#121214] border-r border-zinc-800/80 select-none shrink-0"
      style={{ width: width ? `${width}px` : '16rem' }}
    >
      {/* Top Sidebar Tab Icons */}
      <div className="flex items-center justify-between px-2 py-1.5 border-b border-zinc-800 bg-[#161619] shrink-0">
        <div className="flex items-center gap-1">
          <button
            onClick={() => setActiveTab('files')}
            className={`p-1.5 rounded transition-colors ${
              activeTab === 'files'
                ? 'bg-purple-600 text-white'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
            }`}
            title="Files Explorer"
          >
            <Layers className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setActiveTab('search')}
            className={`p-1.5 rounded transition-colors ${
              activeTab === 'search'
                ? 'bg-purple-600 text-white'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
            }`}
            title="Vault Search"
          >
            <Search className="w-3.5 h-3.5" />
          </button>
          {settings.corePlugins?.tags !== false && (
            <button
              onClick={() => setActiveTab('tags')}
              className={`p-1.5 rounded transition-colors ${
                activeTab === 'tags'
                  ? 'bg-[#7aa2f7] text-[#16161e]'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
              }`}
              title="Tags Explorer"
            >
              <Hash className="w-3.5 h-3.5" />
            </button>
          )}
          {settings.corePlugins?.bookmarks !== false && (
            <button
              onClick={() => setActiveTab('bookmarks')}
              className={`p-1.5 rounded transition-colors ${
                activeTab === 'bookmarks'
                  ? 'bg-[#7aa2f7] text-[#16161e]'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
              }`}
              title="Starred Notes"
            >
              <Star className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={collapseAllFolders}
            className="p-1.5 rounded text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors"
            title="Collapse all folders"
          >
            <FoldVertical className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={expandAllFolders}
            className="p-1.5 rounded text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors"
            title="Expand all folders"
          >
            <UnfoldVertical className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onPickVaultFolder}
            className="p-1.5 rounded text-blue-400 hover:text-blue-300 hover:bg-zinc-800 transition-colors"
            title="Open Any Folder as Vault"
          >
            <FolderOpen className="w-3.5 h-3.5" />
          </button>
          {settings.corePlugins?.graph !== false && (
            <button
              onClick={onOpenSynapseGraph}
              className="p-1.5 rounded text-[#7aa2f7] hover:text-[#7dcfff] hover:bg-zinc-800 transition-colors"
              title="Open Synapse Graph in External Window"
            >
              <Sparkles className="w-3.5 h-3.5" />
            </button>
          )}
          <button
            onClick={() => onCreateFile(tree?.path || '')}
            className="p-1.5 rounded text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors"
            title="New Note at Vault Root"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onCreateFolder(tree?.path || '')}
            className="p-1.5 rounded text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors"
            title="New Folder at Vault Root"
          >
            <FolderPlus className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Tab View */}
      <div className="flex-1 overflow-y-auto p-2 space-y-0.5">
        {/* TAB 1: File Explorer */}
        {activeTab === 'files' && tree && (
          <div className="flex flex-col">{renderTree(tree, 0)}</div>
        )}

        {/* TAB 2: Vault Search */}
        {activeTab === 'search' && (
          <div className="space-y-3">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-zinc-500" />
              <input
                type="text"
                placeholder="Search across all notes..."
                value={searchQuery}
                onChange={(e) => onSearchQueryChange(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 focus:border-purple-500 rounded-lg pl-8 pr-2.5 py-1.5 text-xs text-zinc-200 outline-none"
              />
            </div>

            <div className="space-y-1">
              <div className="text-[11px] text-zinc-500 font-medium px-1 flex justify-between">
                <span>RESULTS</span>
                <span>{searchResults.length}</span>
              </div>
              {searchResults.length === 0 && searchQuery && (
                <p className="text-xs text-zinc-500 px-2 py-4 text-center">No matching notes found</p>
              )}
              {searchResults.map((res, idx) => (
                <div
                  key={`${res.path}-${idx}`}
                  onClick={() => onSearchSelect(res)}
                  className="p-2 bg-zinc-900/60 hover:bg-zinc-800/80 rounded-lg cursor-pointer transition-colors group"
                >
                  <div className="flex items-center justify-between text-xs font-semibold text-zinc-200 group-hover:text-purple-300">
                    <span dir="auto" className="truncate">{res.title}</span>
                    <span className="text-[10px] text-zinc-500 font-mono">L{res.line_number}</span>
                  </div>
                  <p dir="auto" className="text-[11px] text-zinc-400 truncate mt-0.5 font-mono">{res.snippet}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: Tags Explorer */}
        {activeTab === 'tags' && (
          <div className="space-y-2">
            <div className="text-[11px] text-zinc-500 font-medium px-1">VAULT TAGS</div>
            {allTags.length === 0 ? (
              <p className="text-xs text-zinc-500 px-2 py-4 text-center">
                No #tags found in notes yet
              </p>
            ) : (
              allTags.map((item) => (
                <div
                  key={item.tag}
                  onClick={() => onTagSelect(item.tag)}
                  className="flex items-center justify-between px-2.5 py-1.5 rounded-lg hover:bg-purple-950/30 border border-transparent hover:border-purple-800/40 text-xs text-zinc-300 cursor-pointer transition-colors"
                >
                  <span className="text-purple-400 font-medium">#{item.tag}</span>
                  <span className="text-[11px] text-zinc-500 font-mono bg-zinc-850 px-1.5 py-0.5 rounded">
                    {item.count}
                  </span>
                </div>
              ))
            )}
          </div>
        )}

        {/* TAB 4: Bookmarks / Starred */}
        {activeTab === 'bookmarks' && (
          <div className="space-y-1">
            <div className="text-[11px] text-zinc-500 font-medium px-1">STARRED NOTES</div>
            {starredPaths.length === 0 ? (
              <p className="text-xs text-zinc-500 px-2 py-4 text-center">
                No starred notes. Star notes using the star icon in the file list!
              </p>
            ) : (
              starredPaths.map((p) => {
                const title = p.split('/').pop()?.replace(/\.md$/, '') || p;
                return (
                  <div
                    key={p}
                    onClick={() => onFileSelect(p, false)}
                    className="flex items-center justify-between p-2 rounded-lg hover:bg-zinc-800/60 text-xs text-zinc-300 cursor-pointer transition-colors"
                  >
                    <div className="flex items-center gap-2 truncate">
                      <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400 shrink-0" />
                      <span className="truncate">{title}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>

      {/* Bottom Vault & Settings Bar */}
      <div className="p-2 border-t border-zinc-800 bg-[#161619] shrink-0 text-xs text-zinc-400 flex items-center justify-between">
        <div className="flex items-center gap-1.5 truncate max-w-[170px]" title={settings.vaultPath}>
          <div className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
          <span className="truncate text-zinc-300 font-medium">
            {settings.vaultPath.split('/').pop() || 'Vault'}
          </span>
        </div>

        <button
          onClick={onOpenSettings}
          className="p-1.5 hover:bg-zinc-800 rounded text-zinc-400 hover:text-white transition-colors"
          title="Vault & Asset Settings"
        >
          <Settings className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
