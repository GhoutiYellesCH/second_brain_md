import { invoke } from '@tauri-apps/api/core';

export interface ReadDocumentResult {
  path: string;
  canonicalPath: string;
  content: string;
  sha256: string;
  size: number;
  modifiedMs: number | null;
}

export interface SaveDocumentResult {
  status: 'saved' | 'compatibility-required' | 'conflict' | 'missing';
  canonicalPath?: string;
  sha256?: string;
  size?: number;
  modifiedMs?: number | null;
  actualSha256?: string;
  compatibilityPath?: string;
}

export interface ProbeDocumentResult {
  exists: boolean;
  size: number;
  modifiedMs: number | null;
  sha256: string | null;
}

export interface RecentItem {
  path: string;
  title: string;
  lastOpened: number;
}

export interface CliVaultArgs {
  vault_path: string | null;
  initial_file: string | null;
}

export const documentApi = {
  async readDocument(path: string): Promise<ReadDocumentResult> {
    return await invoke<ReadDocumentResult>('read_document', { path });
  },

  async saveDocument(path: string, content: string, expectedSha256?: string): Promise<SaveDocumentResult> {
    return await invoke<SaveDocumentResult>('save_document', {
      path,
      content,
      expectedSha256: expectedSha256 || null,
    });
  },

  async probeDocument(path: string): Promise<ProbeDocumentResult> {
    return await invoke<ProbeDocumentResult>('probe_document', { path });
  },

  async revealDocument(path: string): Promise<void> {
    return await invoke<void>('reveal_document', { path });
  },

  async listRecentDocuments(): Promise<RecentItem[]> {
    try {
      const items = await invoke<any[]>('list_recent_documents');
      return items.map(item => ({
        path: item.path || '',
        title: item.title || item.path?.split('/').pop() || 'Untitled',
        lastOpened: item.last_opened || item.lastOpened || Date.now(),
      }));
    } catch {
      return [];
    }
  },

  async rememberRecentDocument(path: string): Promise<void> {
    try {
      await invoke('remember_recent_document', { path });
    } catch {}
  },

  async removeRecentDocument(path: string): Promise<void> {
    try {
      await invoke('remove_recent_document', { path });
    } catch {}
  },

  async clearRecentDocuments(): Promise<void> {
    try {
      await invoke('clear_recent_documents');
    } catch {}
  },

  async takePendingFiles(): Promise<string[]> {
    try {
      return await invoke<string[]>('take_pending_files');
    } catch {
      return [];
    }
  },

  async getCliVaultArgs(): Promise<CliVaultArgs> {
    try {
      return await invoke<CliVaultArgs>('get_cli_vault_args');
    } catch {
      return { vault_path: null, initial_file: null };
    }
  },

  async openBrowserLink(url: string): Promise<void> {
    try {
      await invoke('open_browser_link', { url });
    } catch {
      window.open(url, '_blank');
    }
  },
};
