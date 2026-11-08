import { invoke } from '@tauri-apps/api/core';
import { FileItem, SearchResult, VaultStats } from '../types';

export const isTauri = () => typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window;

export interface AssetData {
  mime_type: string;
  base64_data: string;
  file_size: number;
}

export const vaultApi = {
  async getDefaultVaultPath(): Promise<string> {
    return await invoke<string>('get_default_vault_path');
  },

  async pickVaultFolder(): Promise<string | null> {
    try {
      const res = await invoke<string | null>('pick_vault_folder');
      if (res) return res;
    } catch {}

    try {
      const { open } = await import('@tauri-apps/plugin-dialog');
      const selected = await open({
        directory: true,
        multiple: false,
        title: 'Select Synapse Vault Folder',
      });
      return typeof selected === 'string' ? selected : null;
    } catch {
      return null;
    }
  },

  async listVaultTree(vaultPath: string): Promise<FileItem> {
    const raw = await invoke<any>('list_vault_tree', { vaultPath });
    function mapEntry(entry: any): FileItem {
      const is_dir = entry.is_dir !== undefined ? entry.is_dir : entry.isDir;
      const rel = entry.relative_path || entry.relativePath || '';
      return {
        name: entry.name,
        path: entry.path,
        relativePath: rel,
        relative_path: rel,
        isDir: is_dir,
        is_dir: is_dir,
        size: entry.size || 0,
        modified: entry.modified || 0,
        extension: entry.extension || '',
        children: entry.children ? entry.children.map(mapEntry) : undefined,
      };
    }
    return mapEntry(raw);
  },

  async readFileContent(path: string): Promise<string> {
    return await invoke<string>('read_file_content', { path });
  },

  async writeFileContent(path: string, content: string): Promise<void> {
    await invoke('write_file_content', { path, content });
  },

  async createNewFile(path: string, initialContent?: string): Promise<void> {
    await invoke('create_new_file', { path, initialContent: initialContent || null });
  },

  async createNewFolder(path: string): Promise<void> {
    await invoke('create_new_folder', { path });
  },

  async deleteFileOrFolder(path: string): Promise<void> {
    await invoke('delete_file_or_folder', { path });
  },

  async renameFileOrFolder(oldPath: string, newPath: string): Promise<void> {
    await invoke('rename_file_or_folder', { oldPath, newPath });
  },

  async saveAssetFile(targetPath: string, base64Data: string): Promise<string> {
    return await invoke<string>('save_asset_file', { targetPath, base64Data });
  },

  async readAssetFile(path: string): Promise<AssetData> {
    return await invoke<AssetData>('read_asset_file', { path });
  },

  async searchVault(vaultPath: string, query: string): Promise<SearchResult[]> {
    const raw = await invoke<any[]>('search_vault', { vaultPath, query });
    return raw.map(r => ({
      path: r.path,
      relativePath: r.relative_path || r.relativePath || '',
      relative_path: r.relative_path || r.relativePath || '',
      title: r.title,
      lineNumber: r.line_number || r.lineNumber || 1,
      line_number: r.line_number || r.lineNumber || 1,
      snippet: r.snippet,
    }));
  },

  async getVaultStats(vaultPath: string): Promise<VaultStats> {
    const raw = await invoke<any>('get_vault_stats', { vaultPath });
    const notes = raw.total_notes !== undefined ? raw.total_notes : (raw.totalNotes || 0);
    const assets = raw.total_assets !== undefined ? raw.total_assets : (raw.totalAssets || 0);
    const size = raw.total_size_bytes !== undefined ? raw.total_size_bytes : (raw.totalSizeBytes || 0);
    return {
      totalNotes: notes,
      total_notes: notes,
      totalAssets: assets,
      total_assets: assets,
      totalSizeBytes: size,
      total_size_bytes: size,
    };
  },

  async initSampleVault(vaultPath: string): Promise<void> {
    await invoke('init_sample_vault', { vaultPath });
  },

  async openInSynapseGraph(vaultPath: string): Promise<void> {
    await invoke('open_in_synapse_graph', { vaultPath });
  },

  async getCliVaultArgs(): Promise<{ vault_path: string | null; initial_file: string | null }> {
    try {
      return await invoke<{ vault_path: string | null; initial_file: string | null }>('get_cli_vault_args');
    } catch {
      return { vault_path: null, initial_file: null };
    }
  },
};
