import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import {
  FileItem,
  VaultSettings,
  VaultStats,
  EditorTab,
  ViewMode,
  HeadingItem,
  NoteBacklinks,
  SearchResult,
} from './types';
import { vaultApi } from './services/vaultApi';
import { extractWikilinks, extractTags } from './services/markdownParser';
import { LeftSidebar } from './components/LeftSidebar';
import { RightSidebar } from './components/RightSidebar';
import { SynapseEditor } from './components/SynapseEditor';
import { AssetViewer } from './components/AssetViewer';
import { BrowserView } from './components/BrowserView';
import { SettingsModal } from './components/SettingsModal';
import { QuickSwitcher } from './components/QuickSwitcher';
import {
  Sparkles,
  Globe,
  Plus,
  Settings,
  Search,
  PanelLeft,
  PanelRight,
  X,
  FileText,
  Image as ImageIcon,
  FolderOpen,
  Languages,
} from 'lucide-react';

export const DEFAULT_CORE_PLUGINS = {
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
};

const DEFAULT_SETTINGS: VaultSettings = {
  vaultPath: '',
  assetsMode: 'designated',
  designatedFolder: 'Attachments',
  defaultViewMode: 'reading',
  rtlMode: 'auto',
  theme: 'tokyo-night',
  baseColor: 'tokyo-night',
  accentColor: '#7aa2f7',
  corePlugins: DEFAULT_CORE_PLUGINS,
  fontSize: 16,
};

export const App: React.FC = () => {
  // Settings
  const [settings, setSettings] = useState<VaultSettings>(() => {
    const saved = localStorage.getItem('synapse_settings') || localStorage.getItem('second_brain_settings');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return {
          ...DEFAULT_SETTINGS,
          ...parsed,
          corePlugins: { ...DEFAULT_CORE_PLUGINS, ...(parsed.corePlugins || {}) },
        };
      } catch {}
    }
    return DEFAULT_SETTINGS;
  });

  // Apply Theme & Base Color to root
  useEffect(() => {
    const theme = settings.theme || 'tokyo-night';
    document.documentElement.setAttribute('data-theme', theme);
    document.documentElement.setAttribute('data-base-color', settings.baseColor || 'tokyo-night');
    if (settings.accentColor) {
      document.documentElement.style.setProperty('--synapse-accent', settings.accentColor);
    }
  }, [settings.theme, settings.baseColor, settings.accentColor]);

  // Vault File System State
  const [tree, setTree] = useState<FileItem | null>(null);
  const [vaultStats, setVaultStats] = useState<VaultStats>({
    total_notes: 0,
    total_assets: 0,
    total_size_bytes: 0,
  });
  // Fast note cache to avoid eager loading or memory bloat
  const noteCacheRef = useRef<Map<string, string>>(new Map());
  const [activeFileContent, setActiveFileContent] = useState<string>('');
  const [starredPaths, setStarredPaths] = useState<string[]>(() => {
    const saved = localStorage.getItem('second_brain_starred');
    return saved ? JSON.parse(saved) : [];
  });

  // Tabs Management
  const [tabs, setTabs] = useState<EditorTab[]>([]);
  const [activeTabId, setActiveTabId] = useState<string>('');

  // UI Panels
  const [showLeftSidebar, setShowLeftSidebar] = useState<boolean>(true);
  const [showRightSidebar, setShowRightSidebar] = useState<boolean>(true);
  const [showSettingsModal, setShowSettingsModal] = useState<boolean>(false);
  const [showQuickSwitcher, setShowQuickSwitcher] = useState<boolean>(false);

  // Search, Outline & Tags
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [currentHeadings, setCurrentHeadings] = useState<HeadingItem[]>([]);
  const [vaultTags, setVaultTags] = useState<{ tag: string; count: number }[]>([]);
  const tagCacheRef = useRef<Map<string, string[]>>(new Map());

  // Update tag cache progressively as notes are opened or edited
  const updateNoteTags = useCallback((path: string, content: string) => {
    const tags = extractTags(content);
    tagCacheRef.current.set(path, tags);

    const countMap = new Map<string, number>();
    tagCacheRef.current.forEach((tList: string[]) => {
      tList.forEach((t: string) => countMap.set(t, (countMap.get(t) || 0) + 1));
    });

    const tagsArray = Array.from(countMap.entries())
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count);

    setVaultTags(tagsArray);
  }, []);

  // Helper to find the first markdown note in tree
  const findFirstMarkdownFile = (item: FileItem): string | null => {
    if (!item.is_dir && item.extension === 'md') {
      return item.path;
    }
    if (item.children) {
      for (const child of item.children) {
        const found = findFirstMarkdownFile(child);
        if (found) return found;
      }
    }
    return null;
  };

  // 1. Initialize Vault on Launch (Fast lazy tree & stats)
  const refreshVault = useCallback(async (customPath?: string) => {
    try {
      const vPath = customPath || settings.vaultPath || (await vaultApi.getDefaultVaultPath());
      if (!settings.vaultPath || customPath) {
        setSettings((prev) => ({ ...prev, vaultPath: vPath }));
      }

      const fileTree = await vaultApi.listVaultTree(vPath);
      setTree(fileTree);

      const stats = await vaultApi.getVaultStats(vPath);
      setVaultStats(stats);

      return { fileTree };
    } catch (err) {
      console.error('Failed to load vault:', err);
    }
  }, [settings.vaultPath]);

  // Pick any folder as vault using native dialog
  const handlePickVaultFolder = async () => {
    try {
      const picked = await vaultApi.pickVaultFolder();
      if (picked) {
        setSettings((prev) => ({ ...prev, vaultPath: picked }));
        await refreshVault(picked);
      }
    } catch (err) {
      console.error('Failed to pick vault folder:', err);
    }
  };

  // Launch Synapse Graph in external window
  const handleOpenSynapseGraph = async () => {
    try {
      await vaultApi.openInSynapseGraph(settings.vaultPath);
    } catch (err) {
      console.error('Failed to open synapse-graph:', err);
    }
  };

  // Initial load effect (instant load, no synchronous whole-vault reading)
  useEffect(() => {
    (async () => {
      // 1. Check CLI arguments (e.g. `second-brain /path/to/folder` or `-v /path/to/folder`)
      const cliArgs = await vaultApi.getCliVaultArgs();
      const targetVault = cliArgs.vault_path || undefined;

      const result = await refreshVault(targetVault);
      if (!result) return;

      // 2. If initial note passed from CLI, open it
      if (cliArgs.initial_file) {
        openNote(cliArgs.initial_file);
      } else {
        // Open first note or welcome note
        const firstNote = findFirstMarkdownFile(result.fileTree);
        if (firstNote) {
          openNote(firstNote);
        }
      }
    })();
  }, []);

  // Background idle tag indexer (runs once after startup without blocking UI)
  useEffect(() => {
    if (!settings.vaultPath) return;
    const idleTimer = setTimeout(async () => {
      try {
        const results = await vaultApi.searchVault(settings.vaultPath, '#');
        results.forEach((r) => {
          const tags = extractTags(r.snippet);
          if (tags.length > 0) {
            const existing = tagCacheRef.current.get(r.path) || [];
            const combined = Array.from(new Set([...existing, ...tags]));
            tagCacheRef.current.set(r.path, combined);
          }
        });
        const countMap = new Map<string, number>();
        tagCacheRef.current.forEach((tList: string[]) => {
          tList.forEach((t: string) => countMap.set(t, (countMap.get(t) || 0) + 1));
        });
        const tagsArray = Array.from(countMap.entries())
          .map(([tag, count]) => ({ tag, count }))
          .sort((a, b) => b.count - a.count);
        setVaultTags(tagsArray);
      } catch (err) {
        console.error('Background tag discovery error:', err);
      }
    }, 1200);

    return () => clearTimeout(idleTimer);
  }, [settings.vaultPath]);

  // Save settings in localStorage
  useEffect(() => {
    localStorage.setItem('second_brain_settings', JSON.stringify(settings));
  }, [settings]);

  // Save starred notes in localStorage
  useEffect(() => {
    localStorage.setItem('second_brain_starred', JSON.stringify(starredPaths));
  }, [starredPaths]);

  // Flattened list of notes for search & navigation
  const flatNoteList = useMemo(() => {
    const list: { path: string; title: string; relativePath: string }[] = [];
    if (!tree) return list;
    const walk = (item: FileItem) => {
      if (item.is_dir && item.children) {
        item.children.forEach(walk);
      } else if (item.extension === 'md') {
        list.push({
          path: item.path,
          title: item.name.replace(/\.md$/, ''),
          relativePath: item.relative_path || item.relativePath || '',
        });
      }
    };
    walk(tree);
    return list;
  }, [tree]);

  // Active tab getter
  const activeTab = useMemo(() => {
    return tabs.find((t) => t.id === activeTabId) || tabs[0];
  }, [tabs, activeTabId]);

  // Open note in tab
  const openNote = useCallback(
    async (filePath: string, mode: ViewMode = 'live') => {
      const existingTab = tabs.find((t) => t.path === filePath);
      if (existingTab) {
        setActiveTabId(existingTab.id);
        let content = noteCacheRef.current.get(filePath);
        if (content === undefined) {
          content = await vaultApi.readFileContent(filePath);
          noteCacheRef.current.set(filePath, content);
        }
        setActiveFileContent(content);
        updateNoteTags(filePath, content);
        return;
      }

      const noteTitle = filePath.split('/').pop()?.replace(/\.md$/, '') || 'Note';
      let content = noteCacheRef.current.get(filePath);
      if (content === undefined) {
        content = await vaultApi.readFileContent(filePath);
        noteCacheRef.current.set(filePath, content);
      }
      setActiveFileContent(content);
      updateNoteTags(filePath, content);

      const newTab: EditorTab = {
        id: `note-${filePath}`,
        path: filePath,
        title: noteTitle,
        viewMode: mode,
      };

      setTabs((prev) => [...prev, newTab]);
      setActiveTabId(newTab.id);
    },
    [tabs, updateNoteTags]
  );

  // Select tab helper
  const selectTab = useCallback(
    async (tab: EditorTab) => {
      setActiveTabId(tab.id);
      if (tab.viewMode !== 'browser' && tab.viewMode !== 'asset') {
        let content = noteCacheRef.current.get(tab.path);
        if (content === undefined) {
          content = await vaultApi.readFileContent(tab.path);
          noteCacheRef.current.set(tab.path, content);
        }
        setActiveFileContent(content);
        updateNoteTags(tab.path, content);
      }
    },
    [updateNoteTags]
  );

  // Open Asset Viewer in tab
  const openAssetViewer = useCallback(
    async (assetName: string, assetPath: string) => {
      const tabId = `asset-${assetPath}`;
      const existing = tabs.find((t) => t.id === tabId);
      if (existing) {
        setActiveTabId(tabId);
        return;
      }

      let assetData;
      try {
        assetData = await vaultApi.readAssetFile(assetPath);
      } catch (e) {
        console.error('Failed to read asset data:', e);
      }

      const newTab: EditorTab = {
        id: tabId,
        path: assetPath,
        title: `📎 ${assetName}`,
        viewMode: 'asset',
        assetData,
      };

      setTabs((prev) => [...prev, newTab]);
      setActiveTabId(newTab.id);
    },
    [tabs]
  );

  // Open Browser View tab
  const openBrowserTab = useCallback(
    (url?: string) => {
      const tabId = `browser-${Date.now()}`;
      const newTab: EditorTab = {
        id: tabId,
        path: 'browser://view',
        title: '🌐 Browser',
        viewMode: 'browser',
        browserUrl: url || 'https://en.wikipedia.org/wiki/Second_brain',
      };
      setTabs((prev) => [...prev, newTab]);
      setActiveTabId(newTab.id);
    },
    [tabs]
  );

  // Close tab
  const closeTab = (tabId: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    const idx = tabs.findIndex((t) => t.id === tabId);
    if (idx === -1) return;

    const remaining = tabs.filter((t) => t.id !== tabId);
    setTabs(remaining);

    if (activeTabId === tabId && remaining.length > 0) {
      const nextActive = remaining[Math.max(0, idx - 1)];
      setActiveTabId(nextActive.id);
      if (nextActive.viewMode !== 'browser' && nextActive.viewMode !== 'asset') {
        const c = noteCacheRef.current.get(nextActive.path);
        if (c !== undefined) {
          setActiveFileContent(c);
        } else {
          vaultApi.readFileContent(nextActive.path).then((content) => {
            noteCacheRef.current.set(nextActive.path, content);
            setActiveFileContent(content);
          });
        }
      }
    }
  };

  // Create new note
  const handleCreateFile = async (parentDir: string, defaultName?: string) => {
    const name = defaultName || prompt('Enter note name:', 'New Note');
    if (!name) return;
    const sanitized = name.endsWith('.md') ? name : `${name}.md`;
    const targetDir = parentDir || settings.vaultPath;
    const fullPath = `${targetDir}/${sanitized}`;

    const template = `# ${name.replace(/\.md$/, '')}\n\nWrite your thoughts with [[wikilinks]] and #tags...\n`;
    try {
      await vaultApi.createNewFile(fullPath, template);
      await refreshVault();
      openNote(fullPath);
    } catch (err) {
      alert(`Could not create note: ${err}`);
    }
  };

  // Create new folder
  const handleCreateFolder = async (parentDir: string) => {
    const folderName = prompt('Enter folder name:', 'New Folder');
    if (!folderName) return;
    const targetDir = parentDir || settings.vaultPath;
    const fullPath = `${targetDir}/${folderName}`;
    try {
      await vaultApi.createNewFolder(fullPath);
      await refreshVault();
    } catch (err) {
      alert(`Could not create folder: ${err}`);
    }
  };

  // Delete item
  const handleDeleteItem = async (path: string) => {
    if (confirm(`Are you sure you want to delete ${path.split('/').pop()}?`)) {
      try {
        await vaultApi.deleteFileOrFolder(path);
        // Close tab if open
        const openT = tabs.find((t) => t.path === path);
        if (openT) closeTab(openT.id);
        await refreshVault();
      } catch (err) {
        alert(`Delete failed: ${err}`);
      }
    }
  };

  // Rename item
  const handleRenameItem = async (oldPath: string) => {
    const oldName = oldPath.split('/').pop() || '';
    const newName = prompt('Enter new name:', oldName);
    if (!newName || newName === oldName) return;

    const parent = oldPath.substring(0, oldPath.lastIndexOf('/'));
    const newPath = `${parent}/${newName}`;
    try {
      await vaultApi.renameFileOrFolder(oldPath, newPath);
      await refreshVault();
    } catch (err) {
      alert(`Rename failed: ${err}`);
    }
  };

  // Handle note content change & auto-save (debounced by SynapseEditor)
  const handleContentChange = useCallback((newContent: string) => {
    setActiveFileContent(newContent);
    if (activeTab && activeTab.path.endsWith('.md')) {
      noteCacheRef.current.set(activeTab.path, newContent);
      vaultApi.writeFileContent(activeTab.path, newContent).catch(console.error);
      updateNoteTags(activeTab.path, newContent);
    }
  }, [activeTab, updateNoteTags]);

  // Navigate to wikilink note
  const handleNavigateWikilink = (targetNoteTitle: string) => {
    const cleanTitle = targetNoteTitle.trim();
    // Search existing notes
    const match = flatNoteList.find(
      (f) => f.title.toLowerCase() === cleanTitle.toLowerCase()
    );
    if (match) {
      openNote(match.path);
    } else {
      // Prompt to create note if missing
      if (confirm(`Note "[[${cleanTitle}]]" does not exist yet. Create it now?`)) {
        handleCreateFile(settings.vaultPath, cleanTitle);
      }
    }
  };

  // Toggle star
  const handleToggleStar = (path: string) => {
    setStarredPaths((prev) =>
      prev.includes(path) ? prev.filter((p) => p !== path) : [...prev, path]
    );
  };

  // Real-time Vault Search
  useEffect(() => {
    if (!searchQuery.trim() || !settings.vaultPath) {
      setSearchResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      try {
        const results = await vaultApi.searchVault(settings.vaultPath, searchQuery);
        setSearchResults(results);
      } catch {}
    }, 200);
    return () => clearTimeout(timer);
  }, [searchQuery, settings.vaultPath]);

  // Backlinks for active note (async Rust search, zero main-thread block, never lags editor)
  const [activeNoteBacklinks, setActiveNoteBacklinks] = useState<NoteBacklinks>({
    linkedMentions: [],
    unlinkedMentions: [],
    outgoingLinks: [],
  });

  useEffect(() => {
    if (!activeTab || !activeTab.path.endsWith('.md')) {
      setActiveNoteBacklinks({ linkedMentions: [], unlinkedMentions: [], outgoingLinks: [] });
      return;
    }

    const currentTitle = activeTab.title;
    const outgoing = extractWikilinks(activeFileContent).map((target) => ({ targetTitle: target }));

    setActiveNoteBacklinks((prev) => ({
      ...prev,
      outgoingLinks: outgoing,
    }));

    if (!settings.vaultPath) return;

    let isCancelled = false;
    const searchTimer = setTimeout(() => {
      const query = `[[${currentTitle}`;
      vaultApi
        .searchVault(settings.vaultPath, query)
        .then((results) => {
          if (isCancelled) return;
          const linked = results
            .filter((r) => r.path !== activeTab.path)
            .map((r) => ({
              sourcePath: r.path,
              sourceTitle: r.title,
              snippet: r.snippet,
            }));
          setActiveNoteBacklinks({
            linkedMentions: linked,
            unlinkedMentions: [],
            outgoingLinks: outgoing,
          });
        })
        .catch(console.error);
    }, 150);

    return () => {
      isCancelled = true;
      clearTimeout(searchTimer);
    };
  }, [activeTab?.path, activeTab?.title, settings.vaultPath]);

  // Global hotkeys
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+O or Ctrl+P: Quick Switcher
      if ((e.ctrlKey || e.metaKey) && (e.key === 'o' || e.key === 'p')) {
        e.preventDefault();
        setShowQuickSwitcher(true);
      }
      // Ctrl+G: Launch Synapse Graph externally
      if ((e.ctrlKey || e.metaKey) && e.key === 'g') {
        e.preventDefault();
        handleOpenSynapseGraph();
      }
      // Ctrl+B: Toggle Sidebar
      if ((e.ctrlKey || e.metaKey) && e.key === 'b') {
        e.preventDefault();
        setShowLeftSidebar((prev) => !prev);
      }
      // Ctrl+W: Close active tab
      if ((e.ctrlKey || e.metaKey) && e.key === 'w' && activeTabId) {
        e.preventDefault();
        closeTab(activeTabId);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeTabId, handleOpenSynapseGraph]);

  // Word count & reading stats
  const stats = useMemo(() => {
    if (!activeFileContent) return { words: 0, chars: 0, time: 0 };
    const text = activeFileContent.trim();
    const words = text ? text.split(/\s+/).length : 0;
    const chars = text.length;
    const time = Math.max(1, Math.ceil(words / 200));
    return { words, chars, time };
  }, [activeFileContent]);

  return (
    <div className="flex flex-col w-screen h-screen overflow-hidden bg-[#0e0e11] text-zinc-100 select-none">
      {/* Top Application Header / Tab Strip */}
      <header className="flex items-center justify-between px-3 h-10 bg-[#121215] border-b border-zinc-800 text-xs shrink-0">
        <div className="flex items-center gap-2">
          {/* Sidebar Toggle Buttons */}
          <button
            onClick={() => setShowLeftSidebar(!showLeftSidebar)}
            className={`p-1.5 rounded transition-colors ${
              showLeftSidebar ? 'text-purple-400 bg-purple-950/40' : 'text-zinc-400 hover:bg-zinc-800'
            }`}
            title="Toggle File Explorer (Ctrl+B)"
          >
            <PanelLeft className="w-3.5 h-3.5" />
          </button>

          <span className="font-bold tracking-wider text-[#7aa2f7] font-mono text-[11px] uppercase ml-1 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#7aa2f7] animate-pulse" />
            Synapse
          </span>

          <div className="w-[1px] h-4 bg-zinc-800 mx-1" />

          {/* Open Folder as Vault */}
          <button
            onClick={handlePickVaultFolder}
            className="flex items-center gap-1.5 px-2.5 py-1 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-md text-zinc-300 font-medium transition-colors"
            title="Open Any Folder as Markdown Vault"
          >
            <FolderOpen className="w-3 h-3 text-blue-400" />
            <span>Open Vault</span>
          </button>

          {/* Quick Switcher Trigger */}
          {settings.corePlugins?.quickSwitcher !== false && (
            <button
              onClick={() => setShowQuickSwitcher(true)}
              className="flex items-center gap-2 px-2.5 py-1 bg-zinc-900/90 hover:bg-zinc-800 border border-zinc-800 rounded-md text-zinc-400 hover:text-zinc-200 transition-colors"
            >
              <Search className="w-3 h-3 text-[#7aa2f7]" />
              <span className="text-[11px]">Quick Switcher</span>
              <kbd className="text-[9px] bg-zinc-800 px-1 py-0.2 rounded font-mono text-zinc-500">
                Ctrl+O
              </kbd>
            </button>
          )}

          {/* 1-Click External Synapse Graph Button */}
          {settings.corePlugins?.graph !== false && (
            <button
              onClick={handleOpenSynapseGraph}
              className="flex items-center gap-1.5 px-2.5 py-1 bg-[#7aa2f7]/15 hover:bg-[#7aa2f7]/25 border border-[#7aa2f7]/30 rounded-md text-[#7aa2f7] font-medium transition-colors"
              title="Launch Synapse Graph Visualizer (Ctrl+G)"
            >
              <Sparkles className="w-3 h-3 text-[#7aa2f7]" />
              <span>Synapse Graph</span>
            </button>
          )}

          {/* 1-Click Browser View Button */}
          {settings.corePlugins?.browser !== false && (
            <button
              onClick={() => openBrowserTab()}
              className="flex items-center gap-1.5 px-2.5 py-1 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-md text-zinc-300 font-medium transition-colors"
              title="Open Web Browser View"
            >
              <Globe className="w-3 h-3 text-zinc-400" />
              <span>Browser View</span>
            </button>
          )}
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => handleCreateFile(settings.vaultPath)}
            className="flex items-center gap-1 px-2.5 py-1 bg-purple-600 hover:bg-purple-500 text-white font-medium rounded-md shadow transition-colors"
            title="Create New Note"
          >
            <Plus className="w-3 h-3" />
            <span>New Note</span>
          </button>

          <button
            onClick={() => setShowSettingsModal(true)}
            className="p-1.5 hover:bg-zinc-800 text-zinc-400 hover:text-white rounded-md transition-colors"
            title="Vault & Asset Preferences"
          >
            <Settings className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => setShowRightSidebar(!showRightSidebar)}
            className={`p-1.5 rounded transition-colors ${
              showRightSidebar ? 'text-purple-400 bg-purple-950/40' : 'text-zinc-400 hover:bg-zinc-800'
            }`}
            title="Toggle Local Synapses & Outline"
          >
            <PanelRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </header>

      {/* Tabs Strip Bar */}
      <div className="flex items-center h-8 bg-[#161619] border-b border-zinc-800/80 px-2 gap-1 overflow-x-auto shrink-0 select-none">
        {tabs.map((tab) => {
          const isActive = tab.id === activeTabId;
          return (
            <div
              key={tab.id}
              onClick={() => selectTab(tab)}
              className={`flex items-center gap-2 px-3 py-1 rounded-t-md text-xs cursor-pointer border-t-2 transition-colors max-w-[200px] group ${
                isActive
                  ? 'bg-[#18181b] border-purple-500 text-white font-medium'
                  : 'bg-transparent border-transparent text-zinc-400 hover:bg-zinc-850 hover:text-zinc-200'
              }`}
            >
              {tab.viewMode === 'browser' ? (
                <Globe className="w-3 h-3 text-blue-400 shrink-0" />
              ) : tab.viewMode === 'asset' ? (
                <ImageIcon className="w-3 h-3 text-amber-400 shrink-0" />
              ) : (
                <FileText className="w-3 h-3 text-purple-400 shrink-0" />
              )}

              <span className="truncate">{tab.title}</span>

              {!tab.isPinned && (
                <button
                  onClick={(e) => closeTab(tab.id, e)}
                  className="opacity-0 group-hover:opacity-100 hover:bg-zinc-700/80 p-0.5 rounded text-zinc-400 hover:text-white transition-opacity"
                >
                  <X className="w-2.5 h-2.5" />
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* Main Workspace Body */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar */}
        {showLeftSidebar && (
          <LeftSidebar
            tree={tree}
            activeFilePath={activeTab?.path}
            onFileSelect={(path, isDir) => {
              if (!isDir) {
                const ext = path.split('.').pop()?.toLowerCase();
                if (ext === 'md') {
                  openNote(path);
                } else {
                  const name = path.split('/').pop() || 'Asset';
                  openAssetViewer(name, path);
                }
              }
            }}
            onCreateFile={(parentDir) => handleCreateFile(parentDir)}
            onCreateFolder={(parentDir) => handleCreateFolder(parentDir)}
            onDelete={(path) => handleDeleteItem(path)}
            onRename={(oldPath) => handleRenameItem(oldPath)}
            onSearchSelect={(result) => {
              openNote(result.path);
            }}
            onTagSelect={(tag) => {
              setSearchQuery(`#${tag}`);
            }}
            onOpenSettings={() => setShowSettingsModal(true)}
            onOpenSynapseGraph={handleOpenSynapseGraph}
            onPickVaultFolder={handlePickVaultFolder}
            searchResults={searchResults}
            onSearchQueryChange={setSearchQuery}
            searchQuery={searchQuery}
            allTags={vaultTags}
            starredPaths={starredPaths}
            onToggleStar={handleToggleStar}
            settings={settings}
          />
        )}

        {/* Center Main Stage */}
        <main className="flex-1 flex flex-col h-full overflow-hidden bg-[#18181b] relative">
          {activeTab ? (
            <>
              {/* Tab Mode: Browser View */}
              {activeTab.viewMode === 'browser' && (
                <BrowserView initialUrl={activeTab.browserUrl} />
              )}

              {/* Tab Mode: Asset Reader */}
              {activeTab.viewMode === 'asset' && (
                <AssetViewer
                  assetName={activeTab.title.replace(/^📎\s*/, '')}
                  assetPath={activeTab.path}
                  assetData={activeTab.assetData}
                  onInsertIntoNote={(wikilink) => {
                    const lastNoteTab = tabs.find((t) => t.path.endsWith('.md'));
                    if (lastNoteTab) {
                      setActiveTabId(lastNoteTab.id);
                      handleContentChange(activeFileContent + `\n${wikilink}\n`);
                    }
                  }}
                />
              )}

              {/* Tab Mode: Markdown Editor Modes (Live, Reading, Source, Split) */}
              {activeTab.viewMode !== 'browser' &&
                activeTab.viewMode !== 'asset' && (
                  <SynapseEditor
                    content={activeFileContent}
                    onChange={handleContentChange}
                    filePath={activeTab.path}
                    settings={settings}
                    viewMode={activeTab.viewMode}
                    onViewModeChange={(mode) => {
                      setTabs((prev) =>
                        prev.map((t) => (t.id === activeTab.id ? { ...t, viewMode: mode } : t))
                      );
                    }}
                    onNavigateWikilink={handleNavigateWikilink}
                    onOpenAssetViewer={openAssetViewer}
                    onOutlineExtracted={setCurrentHeadings}
                  />
                )}
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-zinc-500">
              <Sparkles className="w-12 h-12 text-purple-500/40 mb-3 animate-pulse" />
              <h2 className="text-zinc-300 font-semibold text-base mb-1">
                No note open in Synapse
              </h2>
              <p className="text-xs text-zinc-500 max-w-sm mb-6">
                Open a note from the File Explorer, create a new thought, or explore connections in Synapse Graph!
              </p>
              <div className="flex gap-3">
                <button
                  onClick={handleOpenSynapseGraph}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-xs font-semibold shadow flex items-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Launch Synapse Graph</span>
                </button>
                <button
                  onClick={handlePickVaultFolder}
                  className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-lg text-xs font-semibold flex items-center gap-1.5"
                >
                  <FolderOpen className="w-3.5 h-3.5 text-blue-400" />
                  <span>Open Any Folder...</span>
                </button>
                <button
                  onClick={() => handleCreateFile(settings.vaultPath)}
                  className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-lg text-xs font-semibold"
                >
                  Create New Note
                </button>
              </div>
            </div>
          )}
        </main>

        {/* Right Sidebar (Backlinks, Outline, Synapse launcher) */}
        {showRightSidebar && (
          <RightSidebar
            activeNoteTitle={activeTab?.title || ''}
            activeNotePath={activeTab?.path || ''}
            backlinks={activeNoteBacklinks}
            headings={currentHeadings}
            onNavigateToNote={handleNavigateWikilink}
            onOpenSynapseGraph={handleOpenSynapseGraph}
            onClose={() => setShowRightSidebar(false)}
            settings={settings}
          />
        )}
      </div>

      {/* Bottom Status Bar */}
      <footer className="h-6 bg-[#101012] border-t border-zinc-800/80 px-3 flex items-center justify-between text-[11px] text-zinc-500 shrink-0 font-mono select-none">
        <div className="flex items-center gap-3">
          <button
            onClick={handlePickVaultFolder}
            className="flex items-center gap-1.5 text-zinc-400 hover:text-zinc-200 transition-colors"
            title="Click to open another folder as vault"
          >
            <FolderOpen className="w-3 h-3 text-purple-400" />
            <span className="truncate max-w-[200px]" title={settings.vaultPath}>
              {settings.vaultPath.split('/').pop() || 'Vault'}
            </span>
          </button>

          <span className="text-zinc-700">•</span>

          <span className="text-zinc-400">
            Assets Folder:{' '}
            <strong className="text-purple-400">
              {settings.assetsMode === 'designated'
                ? settings.designatedFolder
                : settings.assetsMode}
            </strong>
          </span>

          {settings.corePlugins?.graph !== false && (
            <>
              <span className="text-zinc-700">•</span>
              <button
                onClick={handleOpenSynapseGraph}
                className="flex items-center gap-1 text-[#7aa2f7] hover:text-[#7dcfff] font-medium transition-colors"
                title="Open Synapse Graph in external window"
              >
                <Sparkles className="w-3 h-3" />
                <span>Launch Synapse Graph</span>
              </button>
            </>
          )}
        </div>

        <div className="flex items-center gap-3">
          {settings.corePlugins?.wordCount !== false && activeTab && activeTab.path.endsWith('.md') && (
            <>
              <span>{stats.words} words</span>
              <span>{stats.chars} characters</span>
              <span>{stats.time} min read</span>
              <span className="text-zinc-700">•</span>
            </>
          )}
          <button
            onClick={() => {
              const modes: ('auto' | 'rtl' | 'ltr')[] = ['auto', 'rtl', 'ltr'];
              const current = settings.rtlMode || 'auto';
              const nextIndex = (modes.indexOf(current) + 1) % modes.length;
              const nextMode = modes[nextIndex];
              const updated = { ...settings, rtlMode: nextMode };
              setSettings(updated);
              localStorage.setItem('synapse_settings', JSON.stringify(updated));
            }}
            className="flex items-center gap-1.5 px-2 py-0.5 rounded hover:bg-zinc-800 transition-colors cursor-pointer text-[10px] font-semibold"
            title={`Text Direction: ${settings.rtlMode || 'auto'} (Click to cycle Auto / RTL / LTR)`}
          >
            <Languages className="w-3 h-3 text-emerald-400" />
            <span
              className={
                settings.rtlMode === 'rtl'
                  ? 'text-emerald-400 font-bold'
                  : settings.rtlMode === 'ltr'
                  ? 'text-blue-400'
                  : 'text-zinc-400'
              }
            >
              {settings.rtlMode === 'rtl'
                ? 'RTL ACTIVE'
                : settings.rtlMode === 'ltr'
                ? 'LTR (EN)'
                : 'RTL (AUTO)'}
            </span>
          </button>
          <span className="text-purple-400 uppercase font-semibold text-[10px]">
            {activeTab?.viewMode || 'READY'}
          </span>
        </div>
      </footer>

      {/* Modals */}
      {showSettingsModal && (
        <SettingsModal
          settings={settings}
          onSaveSettings={(newSettings) => {
            setSettings(newSettings);
            localStorage.setItem('synapse_settings', JSON.stringify(newSettings));
            if (newSettings.vaultPath !== settings.vaultPath) {
              refreshVault(newSettings.vaultPath);
            }
          }}
          onClose={() => setShowSettingsModal(false)}
          vaultStats={vaultStats}
          onReinitSampleVault={async () => {
            await vaultApi.initSampleVault(settings.vaultPath);
            await refreshVault();
          }}
        />
      )}

      {showQuickSwitcher && (
        <QuickSwitcher
          isOpen={showQuickSwitcher}
          onClose={() => setShowQuickSwitcher(false)}
          files={flatNoteList}
          onSelectNote={openNote}
          onCreateNote={(title) => handleCreateFile(settings.vaultPath, title)}
        />
      )}
    </div>
  );
};
