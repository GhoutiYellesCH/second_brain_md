import { invoke } from '@tauri-apps/api/core';
import { FileItem, SearchResult, AssetData, VaultStats } from '../types';

export const isTauri = (): boolean => {
  return typeof window !== 'undefined' && ('__TAURI_INTERNALS__' in window || '__TAURI__' in window);
};

// Fallback in-memory mock vault for standalone browser testing
const mockFiles: Record<string, string> = {
  '/vault/Welcome to Second Brain.md': `# Welcome to your Second Brain Vault 🧠

Welcome to your offline-first, Obsidian-compatible knowledge base built with **Tauri**!

## ✨ Key Capabilities
1. **Obsidian Compatibility**:
   - Bi-directional links: [[Neural Synapses]] and [[Knowledge Representation]]
   - Attachment embeds: \`![[synapse_network.svg]]\`
   - Configurable assets folder in Settings
2. **Editor Modes**:
   - **Live Preview Mode**: Inline editing with WYSIWYG
   - **Reading Mode**: Distraction-free preview
   - **Source Mode**: Raw markdown code
   - **Split Mode**: Side-by-side editing and preview
   - **Browser View**: Built-in web browser
   - **Synapses Graph**: Interactive force-directed knowledge graph

## 🖼️ Vault Asset Resolution Demo
![[synapse_network.svg]]

> [!NOTE] Configurable Assets Folder
> You can choose where attachments are stored in the **Settings** modal.
> Drag-and-drop or paste any image directly into this note!

#vault #welcome #obsidian #synapses
`,
  '/vault/Architecture/Neural Synapses.md': `# Neural Synapses in Knowledge Graphs ⚡

In a Second Brain, notes act like **neurons** and bi-directional links \`[[...]]\` act like **synapses**.

> [!TIP] The Power of Bidirectional Links
> When note A links to note B via \`[[Note B]]\`, note B automatically discovers its backlink to note A.

## 🔗 Related Concepts
- [[Knowledge Representation]]
- [[Artificial Intelligence]]
- [[Welcome to Second Brain]]

\`\`\`mermaid
flowchart LR
    A["[[Neural Synapses]]"] --> B["[[Artificial Intelligence]]"]
    A --> C["[[Knowledge Representation]]"]
    B --> D["[[Quantum Computing]]"]
    C --> A
\`\`\`

#synapse #neuroscience #graph #ai
`,
  '/vault/Architecture/Knowledge Representation.md': `# Knowledge Representation & Math 📐

Second Brain markdown supports rich formatting, KaTeX mathematical notation, callouts, and interactive task lists.

## 🧮 LaTeX Mathematical Equations
Inline equation: $E = mc^2$

Block math equation:
$$
\\int_{-\\infty}^{+\\infty} e^{-x^2} dx = \\sqrt{\\pi}
$$

## 📋 Interactive Task Checklist
- [x] Create Tauri backend with custom file vault APIs
- [x] Implement configurable assets storage location
- [x] Build Live Preview, Source, Reading, Split, and Browser view modes
- [x] Implement 60fps canvas Synapses Graph with force physics
- [ ] Connect custom external Obsidian vault

#math #representation #callouts #latex
`,
  '/vault/Research/Quantum Computing.md': `# Quantum Computing ⚛️

Quantum computing uses qubits that exploit superposition and entanglement.

A qubit state $|\\psi\\rangle$ is:
$$
|\\psi\\rangle = \\alpha |0\\rangle + \\beta |1\\rangle
$$

## Connections
- Connects to [[Artificial Intelligence]] for Quantum Machine Learning
- Influenced by [[Neural Synapses]]

#quantum #physics #computing #algorithms
`,
  '/vault/Research/Artificial Intelligence.md': `# Artificial Intelligence & Second Brains 🤖

AI enhances second brains by discovering unlinked semantic connections between thoughts.

## Related Network Nodes
- [[Neural Synapses]]
- [[Quantum Computing]]
- [[Welcome to Second Brain]]

#ai #deeplearning #knowledge #future
`,
};

export const vaultApi = {
  async getDefaultVaultPath(): Promise<string> {
    if (isTauri()) {
      return await invoke<string>('get_default_vault_path');
    }
    return '/vault';
  },

  async listVaultTree(vaultPath: string): Promise<FileItem> {
    if (isTauri()) {
      return await invoke<FileItem>('list_vault_tree', { vaultPath });
    }
    // Browser Mock Tree
    return {
      name: 'vault',
      path: '/vault',
      relative_path: '',
      is_dir: true,
      size: 0,
      modified: Date.now() / 1000,
      extension: '',
      children: [
        {
          name: 'Welcome to Second Brain.md',
          path: '/vault/Welcome to Second Brain.md',
          relative_path: 'Welcome to Second Brain.md',
          is_dir: false,
          size: mockFiles['/vault/Welcome to Second Brain.md']?.length || 0,
          modified: Date.now() / 1000,
          extension: 'md',
        },
        {
          name: 'Architecture',
          path: '/vault/Architecture',
          relative_path: 'Architecture',
          is_dir: true,
          size: 0,
          modified: Date.now() / 1000,
          extension: '',
          children: [
            {
              name: 'Neural Synapses.md',
              path: '/vault/Architecture/Neural Synapses.md',
              relative_path: 'Architecture/Neural Synapses.md',
              is_dir: false,
              size: 500,
              modified: Date.now() / 1000,
              extension: 'md',
            },
            {
              name: 'Knowledge Representation.md',
              path: '/vault/Architecture/Knowledge Representation.md',
              relative_path: 'Architecture/Knowledge Representation.md',
              is_dir: false,
              size: 600,
              modified: Date.now() / 1000,
              extension: 'md',
            },
          ],
        },
        {
          name: 'Research',
          path: '/vault/Research',
          relative_path: 'Research',
          is_dir: true,
          size: 0,
          modified: Date.now() / 1000,
          extension: '',
          children: [
            {
              name: 'Quantum Computing.md',
              path: '/vault/Research/Quantum Computing.md',
              relative_path: 'Research/Quantum Computing.md',
              is_dir: false,
              size: 400,
              modified: Date.now() / 1000,
              extension: 'md',
            },
            {
              name: 'Artificial Intelligence.md',
              path: '/vault/Research/Artificial Intelligence.md',
              relative_path: 'Research/Artificial Intelligence.md',
              is_dir: false,
              size: 450,
              modified: Date.now() / 1000,
              extension: 'md',
            },
          ],
        },
        {
          name: 'assets',
          path: '/vault/assets',
          relative_path: 'assets',
          is_dir: true,
          size: 0,
          modified: Date.now() / 1000,
          extension: '',
          children: [
            {
              name: 'synapse_network.svg',
              path: '/vault/assets/synapse_network.svg',
              relative_path: 'assets/synapse_network.svg',
              is_dir: false,
              size: 1024,
              modified: Date.now() / 1000,
              extension: 'svg',
            },
          ],
        },
      ],
    };
  },

  async readFileContent(path: string): Promise<string> {
    if (isTauri()) {
      return await invoke<string>('read_file_content', { path });
    }
    return mockFiles[path] || '';
  },

  async writeFileContent(path: string, content: string): Promise<void> {
    if (isTauri()) {
      await invoke('write_file_content', { path, content });
      return;
    }
    mockFiles[path] = content;
  },

  async createNewFile(path: string, initialContent?: string): Promise<void> {
    if (isTauri()) {
      await invoke('create_new_file', { path, initialContent });
      return;
    }
    mockFiles[path] = initialContent || '';
  },

  async createNewFolder(path: string): Promise<void> {
    if (isTauri()) {
      await invoke('create_new_folder', { path });
    }
  },

  async deleteFileOrFolder(path: string): Promise<void> {
    if (isTauri()) {
      await invoke('delete_file_or_folder', { path });
      return;
    }
    delete mockFiles[path];
  },

  async renameFileOrFolder(oldPath: string, newPath: string): Promise<void> {
    if (isTauri()) {
      await invoke('rename_file_or_folder', { oldPath, newPath });
      return;
    }
    if (mockFiles[oldPath]) {
      mockFiles[newPath] = mockFiles[oldPath];
      delete mockFiles[oldPath];
    }
  },

  async saveAssetFile(targetPath: string, base64Data: string): Promise<string> {
    if (isTauri()) {
      return await invoke<string>('save_asset_file', { targetPath, base64Data });
    }
    return targetPath;
  },

  async readAssetFile(path: string): Promise<AssetData> {
    if (isTauri()) {
      return await invoke<AssetData>('read_asset_file', { path });
    }
    // Return mock svg
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 240"><rect width="100%" height="100%" rx="16" fill="#18181b"/><circle cx="100" cy="120" r="30" fill="#8b5cf6"/><circle cx="300" cy="120" r="30" fill="#3b82f6"/><line x1="130" y1="120" x2="270" y2="120" stroke="#a855f7" stroke-width="4"/><text x="200" y="80" fill="#fff" text-anchor="middle">Synapses Asset</text></svg>`;
    return {
      mime_type: 'image/svg+xml',
      base64_data: btoa(svg),
      file_size: svg.length,
    };
  },

  async searchVault(vaultPath: string, query: string): Promise<SearchResult[]> {
    if (isTauri()) {
      return await invoke<SearchResult[]>('search_vault', { vaultPath, query });
    }
    const results: SearchResult[] = [];
    const qLower = query.toLowerCase();
    for (const [p, content] of Object.entries(mockFiles)) {
      const lines = content.split('\n');
      lines.forEach((line, idx) => {
        if (line.toLowerCase().includes(qLower)) {
          const parts = p.split('/');
          const title = parts[parts.length - 1].replace(/\.md$/, '');
          results.push({
            path: p,
            relative_path: p.replace('/vault/', ''),
            title,
            line_number: idx + 1,
            snippet: line.trim(),
          });
        }
      });
    }
    return results;
  },

  async getVaultStats(vaultPath: string): Promise<VaultStats> {
    if (isTauri()) {
      return await invoke<VaultStats>('get_vault_stats', { vaultPath });
    }
    return {
      total_notes: Object.keys(mockFiles).length,
      total_assets: 1,
      total_size_bytes: 4096,
    };
  },

  async initSampleVault(vaultPath: string): Promise<void> {
    if (isTauri()) {
      await invoke('init_sample_vault', { vaultPath });
    }
  },
};
