// Re-export modular types
export * from './types/index';

// Compatibility types for user's existing components
export type ViewMode = 'live' | 'source' | 'reading' | 'split' | 'browser' | 'asset' | 'edit' | 'preview';

export type AssetsLocationMode = 'root' | 'designated' | 'same-folder' | 'subfolder';

export type RtlMode = 'auto' | 'rtl' | 'ltr';

export interface AssetData {
  mime_type: string;
  base64_data: string;
  file_size: number;
}

export interface EditorTab {
  id: string;
  path: string;
  title: string;
  content?: string;
  isPinned?: boolean;
  isDirty?: boolean;
  viewMode: ViewMode;
  assetData?: AssetData;
  browserUrl?: string;
  cursorPosition?: number;
  sha256?: string;
  fileKind?: 'markdown' | 'code' | 'asset' | 'canvas' | 'browser';
}

export interface NoteBacklinks {
  linkedMentions: { sourcePath: string; sourceTitle: string; snippet: string; line?: number }[];
  unlinkedMentions: { sourcePath: string; sourceTitle: string; snippet: string; line?: number }[];
  outgoingLinks: { targetTitle: string; targetPath?: string }[];
}
