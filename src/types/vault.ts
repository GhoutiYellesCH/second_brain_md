export interface FileItem {
  name: string;
  path: string;
  relativePath: string;
  isDir: boolean;
  size: number;
  modified: number;
  extension: string;
  children?: FileItem[];
}

export interface VaultSettings {
  vaultPath: string;
  assetsMode: 'designated' | 'subfolder' | 'root';
  designatedFolder: string;
  defaultViewMode: 'edit' | 'split' | 'preview';
  theme: 'tokyo-night' | 'tokyo-night-storm' | 'tokyo-night-light';
  fontSize: number;
  fontFamily: string;
  tabSize: number;
  wordWrap: boolean;
  lineNumbers: boolean;
  autoSave: boolean;
  autoSaveDelay: number;
}

export interface VaultStats {
  totalNotes: number;
  totalAssets: number;
  totalSizeBytes: number;
}

export interface SearchResult {
  path: string;
  relativePath: string;
  title: string;
  lineNumber: number;
  snippet: string;
}

export interface HeadingItem {
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
