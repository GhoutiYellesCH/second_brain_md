export type ViewMode = 'edit' | 'split' | 'preview';
export type FileKind = 'markdown' | 'code' | 'asset' | 'canvas';

export interface DocumentTab {
  id: string;
  path: string;
  title: string;
  content: string;
  savedContent: string;
  isDirty: boolean;
  sha256?: string;
  size?: number;
  modifiedMs?: number;
  viewMode: ViewMode;
  fileKind: FileKind;
  cursorLine?: number;
  cursorCol?: number;
  scrollTop?: number;
}

export interface FindState {
  isOpen: boolean;
  query: string;
  replaceText: string;
  caseSensitive: boolean;
  wholeWord: boolean;
  useRegex: boolean;
  currentMatchIndex: number;
  totalMatches: number;
}

export interface RecentDocumentItem {
  path: string;
  title: string;
  lastOpened: number;
}
