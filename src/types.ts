export type ViewMode = 'live' | 'source' | 'reading' | 'split' | 'browser' | 'asset';

export type AssetsLocationMode = 'root' | 'designated' | 'same-folder' | 'subfolder';

export type RtlMode = 'auto' | 'rtl' | 'ltr';

export interface FileItem {
  name: string;
  path: string;
  relative_path: string;
  is_dir: boolean;
  size: number;
  modified: number;
  extension: string;
  children?: FileItem[];
}

export interface SearchResult {
  path: string;
  relative_path: string;
  title: string;
  line_number: number;
  snippet: string;
}

export interface AssetData {
  mime_type: string;
  base64_data: string;
  file_size: number;
}

export interface VaultStats {
  total_notes: number;
  total_assets: number;
  total_size_bytes: number;
}

export interface VaultSettings {
  vaultPath: string;
  assetsMode: AssetsLocationMode;
  designatedFolder: string;
  defaultViewMode: 'reading' | 'live' | 'source' | 'split';
  rtlMode: RtlMode;
  theme: 'dark' | 'light';
  fontSize: number;
}

export interface EditorTab {
  id: string;
  path: string;
  title: string;
  isPinned?: boolean;
  isDirty?: boolean;
  viewMode: ViewMode;
  assetData?: AssetData;
  browserUrl?: string;
  cursorPosition?: number;
}

export interface GraphNode {
  id: string; // usually note relative path or title
  title: string;
  path: string;
  tags: string[];
  connections: number; // in-degree + out-degree
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
  isOrphan: boolean;
  isAsset?: boolean;
}

export interface GraphLink {
  source: string; // source node id
  target: string; // target node id
  label?: string;
}

export interface NoteBacklinks {
  linkedMentions: { sourcePath: string; sourceTitle: string; snippet: string }[];
  unlinkedMentions: { sourcePath: string; sourceTitle: string; snippet: string }[];
  outgoingLinks: { targetTitle: string; targetPath?: string }[];
}

export interface HeadingItem {
  level: number;
  text: string;
  id: string;
  line: number;
}
