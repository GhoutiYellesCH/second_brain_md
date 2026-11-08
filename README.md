# Synapse — High-Performance Markdown & Code Workspace (Tauri v2)

[![Version](https://img.shields.io/badge/version-1.1.0-blue.svg)](package.json)
[![Theme](https://img.shields.io/badge/theme-Tokyo%20Night-purple.svg)](src/App.css)
[![Engine](https://img.shields.io/badge/engine-mdedit%20production-green.svg)](src-tauri/src/)

**Synapse** is an offline-first, native Markdown and Code workspace engineered with **Tauri v2**, **Rust**, **React**, and **TypeScript**. Powered by the battle-tested **mdedit** engine and styled with a futuristic **Tokyo Night** cyberpunk palette, Synapse seamlessly bridges the gap between deep knowledge management and lightweight, distraction-free code editing.

---

## ✨ Core Pillars & Capabilities

### 1. ⚡ Dual Workflows: Vault & Single-File Modes
- **Vault Mode**: Full workspace navigation, hierarchical file trees, full-vault fuzzy search, tag indexing, bookmarks, and automated vault statistics.
- **Single-File Mode (gedit-style)**: Clean, focused editor for standalone files without workspace overhead. Open any file directly from your terminal (`synapse /path/to/document.md` or `synapse /path/to/script.py`).
- **Code Editor Mode**: Automatically identifies and highlights 40+ programming languages (`.py`, `.rs`, `.js`, `.ts`, `.json`, `.css`, `.sh`, `.c`, `.cpp`, `.go`, `.html`, etc.) with line numbering, monospace typography, tab handling, and syntax highlighting.

### 2. 🛡️ Robust mdedit Production Engine
- **Atomic Disk Writes**: Fail-safe file writing with atomic staging to guarantee zero data loss.
- **Automated Crash Recovery**: Dual-timer debounced session caching (`IDLE_DELAY_MS` and `MAXIMUM_DELAY_MS`) with dirty revision tracking and recovery restore.
- **External Modification Detection**: Real-time file signature validation detects background disk edits and provides conflict resolution dialogs.
- **Multi-Format Export Engine**: Export cleanly to HTML, Markdown, PDF, and CSV tables with isolated rendering pipelines.

### 3. 🌐 External Synapse Graph Visualizer
- Rendering large force-directed graphs in the main editor process can cause micro-stutters. Synapse isolates the heavy physics simulation into the external `synapse-graph` binary via native bridge (`open_in_synapse_graph`).
- Notes serve as neurons, bi-directional wikilinks `[[...]]` act as synapses, and 60fps canvas particles visualize synaptic thought flow outside the editing loop.

### 4. 📝 Rich Markdown & Knowledge Management
- **Rendering Modes**: Live Preview, Split Mode, Distraction-Free Reading Mode, and Raw Source Mode.
- **Bi-directional Wikilinks**: Instant note traversal and backlink indexing.
- **LaTeX Math Support**: Inline `$E=mc^2$` and block `$$\int_{-\infty}^\infty e^{-x^2} dx = \sqrt{\pi}$$` powered by KaTeX.
- **Interactive Diagrams**: Mermaid graph, sequence, and state diagrams rendered in real time.
- **Callouts & Admonitions**: GitHub-style callouts (`> [!NOTE]`, `> [!TIP]`, `> [!WARNING]`, `> [!IMPORTANT]`, `> [!CAUTION]`).
- **Command Palette & Quick Switcher**: `Ctrl+P` / `Ctrl+O` fuzzy switcher for instant document jumping.
- **Templates**: Dynamic template insertion supporting `{{title}}`, `{{date}}`, `{{time}}`, and `{{uuid}}`.
- **Canvas & Slides Views**: Visual infinite-board note mapping and presentation slides mode.

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- Rust & Cargo (1.78+)
- Linux dependencies: `libwebkit2gtk-4.1-dev`, `build-essential`, `curl`, `wget`, `file`, `libxdo-dev`, `libssl-dev`, `libayatana-appindicator3-dev`, `librsvg2-dev`

### Development
```bash
# Install frontend dependencies
npm install

# Run desktop application in development mode
npm run tauri dev

# Run Vite web preview
npm run dev
```

### Production Build & Packaging
```bash
# Type check and build frontend
npm run build

# Compile release binary and Debian bundle (.deb)
npm run tauri build -- --bundles deb
```

The output artifacts will be created at:
- **Binary**: `src-tauri/target/release/synapse`
- **Debian Package**: `src-tauri/target/release/bundle/deb/synapse_1.1.0_amd64.deb`

---

## ⌨️ Essential Keyboard Shortcuts

| Shortcut | Action |
| :--- | :--- |
| `Ctrl + O` / `Ctrl + P` | Quick Switcher / Fuzzy Document Search |
| `Ctrl + Shift + P` | Command Palette |
| `Ctrl + F` | Find & Replace Bar |
| `Ctrl + S` | Save Active Document (Atomic) |
| `Ctrl + N` | New Document |
| `Ctrl + Shift + N` | New Vault Folder |
| `Ctrl + W` | Close Active Tab |
| `Ctrl + B` | Toggle File Tree Sidebar |
| `Ctrl + G` | Open Synapse Knowledge Graph (External) |
| `Ctrl + /` | Open Slash Commands Menu |

---

## 🔒 Security & Sandboxing
- Strict **DOMPurify** configuration with MathML and SVG profiles prevents XSS while allowing KaTeX, Mermaid, and task lists.
- Path traversal protection validates vault boundaries and canonicalizes filesystem references before opening or saving.
- External links open exclusively in the system default browser via OS launch bridges; dangerous URI schemes (`javascript:`, `file:`) are rejected.

---

## 📄 License
MIT License.
