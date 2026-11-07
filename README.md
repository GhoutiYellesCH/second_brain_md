# Second Brain - Obsidian-Grade Markdown Reader & Synapses Graph (Tauri)

An offline-first, native markdown reader and knowledge base built with **Tauri v2**, **Rust**, **React**, and **TypeScript**. Designed as a high-performance replacement for Obsidian vaults with native asset management and an interactive 60fps force-directed **Synapses Knowledge Graph**.

---

## ✨ Features

### 1. 🗂️ Configurable Assets & Attachment Storage
In Obsidian and Second Brain, you choose where note assets are stored:
- **Designated Attachments Folder** (e.g. `assets/` or `attachments/` in vault root).
- **Vault Root Folder** (`/`).
- **Same Folder as Current Note** (co-located attachments).
- **Subfolder Under Current Note** (e.g. `./assets/`).

**Drag-and-Drop & Paste**:
- Drag any image, PDF, audio, or video into the note editor: it is automatically copied into your chosen assets location and linked as `![[filename.ext]]`.
- Paste screenshots from the clipboard (`Ctrl+V`): automatically saved as timestamped PNGs in your asset directory.
- Built-in **Asset Reader**: View images with zoom/rotate, play audio/video, and inspect PDFs directly.

### 2. 📝 Complete Obsidian Editor with All Modes
- **Live Preview Mode**: Inline hybrid editing with live rendered math, callouts, and images.
- **Reading / Preview Mode**: Distraction-free rendered markdown with interactive checkboxes, clickable wikilinks, and copy-code buttons.
- **Source Mode**: Raw markdown code editor with monospace typography and line numbers.
- **Split Mode**: Side-by-side editing on the left and real-time rendered preview on the right.
- **Browser View Mode**: Built-in web browser tab with URL navigation, address bar, back/forward/refresh, and documentation bookmarks (Wikipedia, MDN, Rust Docs, DuckDuckGo).
- **Synapses Graph Mode**: 1-click full-screen or tabbed view of the neural knowledge graph.

### 3. ⚡ Synapses Knowledge Graph (Default Way)
- Notes act as **neurons** and bi-directional wikilinks `[[...]]` act as **synapses**.
- **Synaptic Pulses**: 60fps canvas particle flow along synapses between connected thoughts.
- **Dynamic Neuron Sizing**: Nodes with more incoming/outgoing connections expand proportionally.
- **Hover Neon Glow**: Hovering on a note illuminates its synaptic network and dims unrelated thoughts.
- **Interactive Controls**: Drag nodes, pan and zoom with mouse wheel, adjust repulsion, link length, and gravity.
- **Filter & Search**: Instant filter by note title, filter by `#tag`, and toggle orphan notes.
- **Local Synapses Subgraph**: Collapsible right sidebar showing the active note's immediate neural connections.

### 4. 🔗 Obsidian Compatibility
- **Bi-directional Wikilinks**: `[[Note Title]]` or `[[Note Title|Custom Label]]`. Clicking navigates to the note (or prompts to create it).
- **Backlinks & Outgoing Links**: Dedicated panel tracking linked mentions, unlinked mentions, and outgoing synapses.
- **Table of Contents (Outline)**: Automatic H1–H6 heading outline with 1-click jump to section.
- **Callouts / Admonitions**: `> [!NOTE]`, `> [!TIP]`, `> [!WARNING]`, `> [!IMPORTANT]`, `> [!DANGER]`, `> [!SUCCESS]`, `> [!QUOTE]`.
- **LaTeX Math Support**: Inline `$E=mc^2$` and block `$$\int_{-\infty}^\infty e^{-x^2} dx = \sqrt{\pi}$$` via KaTeX.
- **Code Highlighting**: Syntax highlighting for Rust, TypeScript, JavaScript, Python, Bash, JSON, CSS via PrismJS.
- **Quick Switcher**: `Ctrl+O` / `Ctrl+P` fuzzy search modal with keyboard navigation (`↑`/`↓`/`Enter`).

### 5. 💎 Official Obsidian Help Vault Extracted
The entire official Obsidian Help documentation (`https://obsidian.md/help/`) has been extracted directly into:
```
obsidian_help_vault/
```
- **179 Markdown Notes** covering everything from Basic Formatting, Callouts, Internal Links, Attachments, to Graph View, Canvas, Plugins, and Sync.
- **141 Vault Attachments & Images** under `obsidian_help_vault/Attachments`.
- In **Settings → Vault Storage**, click **"Switch to Help Vault"** to instantly open and navigate the official documentation within Second Brain!
- You can re-run the extraction at any time with:
  ```bash
  node scripts/extract_obsidian_help.mjs
  ```

---

## 🚀 Running the App

### Development Mode
```bash
npm run tauri dev
```
*(Or run `npm run dev` to test the frontend in your browser with mock vault data)*

### Production Build
```bash
npm run build
cd src-tauri && cargo build --release
```
The compiled native executable will be located at:
```bash
src-tauri/target/release/tauri-app
```
*(Debug binary already built at `src-tauri/target/debug/tauri-app`)*

---

## ⌨️ Keyboard Shortcuts
- `Ctrl+O` or `Ctrl+P`: Quick Switcher / Note Search
- `Ctrl+G`: Open Synapses Knowledge Graph
- `Ctrl+B`: Toggle Left File Explorer Sidebar
- `Ctrl+W`: Close active tab
- `Ctrl+B` (in editor): Bold text
- `Ctrl+I` (in editor): Italic text
