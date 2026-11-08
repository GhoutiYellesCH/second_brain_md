export interface FileItem {
  name: string;
  path: string;
  relativePath?: string;
  relative_path?: string;
  isDir?: boolean;
  is_dir?: boolean;
  size: number;
  modified: number;
  extension: string;
  children?: FileItem[];
}

export interface CorePluginConfig {
  graph: boolean;
  canvas: boolean;
  slides: boolean;
  quickSwitcher: boolean;
  commandPalette: boolean;
  templates: boolean;
  bookmarks: boolean;
  tags: boolean;
  recovery: boolean;
  outline: boolean;
  wordCount: boolean;
  wikilinks: boolean;
  browser: boolean;
  [key: string]: boolean;
}

export interface VaultSettings {
  vaultPath: string;
  assetsMode: 'designated' | 'subfolder' | 'root' | 'same-folder';
  designatedFolder: string;
  defaultViewMode: 'edit' | 'split' | 'preview' | 'live' | 'source' | 'reading';
  rtlMode?: 'auto' | 'rtl' | 'ltr';
  theme: 'tokyo-night' | 'tokyo-night-storm' | 'tokyo-night-light' | 'dark' | 'light' | 'nord' | 'dracula' | 'cyberpunk' | string;
  baseColor?: 'dark' | 'light' | 'tokyo-night';
  accentColor?: string;
  corePlugins?: CorePluginConfig;
  fontSize: number;
  fontFamily?: string;
  tabSize?: number;
  wordWrap?: boolean;
  lineNumbers?: boolean;
  autoSave?: boolean;
  autoSaveDelay?: number;
}

export interface VaultStats {
  totalNotes?: number;
  total_notes?: number;
  totalAssets?: number;
  total_assets?: number;
  totalSizeBytes?: number;
  total_size_bytes?: number;
}

export interface SearchResult {
  path: string;
  relativePath?: string;
  relative_path?: string;
  title: string;
  lineNumber?: number;
  line_number?: number;
  snippet: string;
}

export interface HeadingItem {
  id?: string;
  level: number;
  text: string;
  line: number;
}

export interface NoteBacklink {
  sourceTitle: string;
  sourcePath: string;
  snippet: string;
  line: number;
  isLinked: boolean;
}
