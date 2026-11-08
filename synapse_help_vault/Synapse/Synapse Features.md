---
permalink: synapse-features
---
# Synapse Features Guide 🧠⚡

**Synapse** is an offline-first, high-performance Markdown and Code workspace engineered with **Tauri v2**, **Rust**, **React**, and **TypeScript**. Styled with a futuristic **Tokyo Night** cyberpunk palette, Synapse merges connected knowledge management with distraction-free code editing.

---

## 🎨 1. Tokyo Night Aesthetic & Base Colors
Synapse features an Obsidian-grade appearance customizer:
- **Base Color Schemes**:
  - **Tokyo Night (Default)**: Deep midnight dark (`#16161e`) with vibrant cyan, purple, and blue neon accents.
  - **Dark**: Classic deep obsidian dark (`#121214`).
  - **Light**: Crisp, high-contrast light mode.
- **Accent Colors**: Customize highlights with Tokyo Blue (`#7aa2f7`), Purple (`#bb9af7`), Cyan (`#7dcfff`), Teal (`#73daca`), Orange (`#ff9e64`), or Rose (`#f7768e`).
- **Additional Themes**: Tokyo Night Storm, Tokyo Night Light, Nord Frost, Dracula, and Cyberpunk Neon.

---

## 📁 2. Dual Workflows: Vault vs Single-File Mode
- **Vault Mode**: Full workspace environment with hierarchical file tree, full-vault fuzzy search, tag indexing, bookmarks, and vault metrics.
- **Single-File Mode (gedit-style)**: Clean, lightweight editor for standalone files without workspace overhead. Open files directly from your terminal:
  ```bash
  synapse /path/to/notes.md
  synapse /path/to/script.py
  ```
- **Code Editor Mode**: Automatically detects 40+ programming languages (`.py`, `.rs`, `.js`, `.ts`, `.json`, `.css`, `.sh`, `.c`, `.cpp`, `.go`, `.html`, etc.) with line numbering, monospace typography, tab handling, and Prism syntax highlighting.

---

## 🌐 3. External Synapse Knowledge Graph
To preserve ultra-smooth typing performance and 0ms latency, the force-directed **Synapse Graph** visualizer runs in a separate native window (`synapse-graph`):
- Notes serve as **neurons**, and wikilinks `[[...]]` act as **synapses**.
- Real-time 60fps canvas particle flow along synaptic connections.
- Launch anytime with `Ctrl+G` or click **Synapse Graph** in the top header.

---

## 🔌 4. Core Plugins Manager
Customize your workspace by toggling built-in core plugins in **Settings → Core Plugins**:
- **Synapse Knowledge Graph**: Force-directed neural network visualizer.
- **Infinite Canvas**: Visual infinite whiteboard for brainstorming.
- **Presentation Slides**: Present notes as slide decks separated by `---`.
- **Quick Switcher (`Ctrl+O`)**: Keyboard-driven fuzzy note jumper.
- **Command Palette (`Ctrl+Shift+P`)**: Global command list.
- **Dynamic Templates**: Insert templates with `{{title}}`, `{{date}}`, and `{{time}}`.
- **Bookmarks**: Pin favorite notes and attachments.
- **Tags Explorer**: Index `#tags` across your vault.
- **Crash Recovery & Autosave**: Atomic disk writes with debounced recovery caching.
- **Outline**: H1–H6 table of contents in the right inspector.
- **Word Count & Reading Stats**: Live reading time in the status bar.
- **Bi-directional Wikilinks**: Links and backlinks inspector.
- **Integrated Browser View**: Embedded web viewer for documentation.

---

## 🌍 5. Native Bi-directional RTL Support (Arabic & Hebrew)
Synapse provides first-class support for Right-to-Left scripts:
- **Auto Detection**: Automatically detects Arabic (`[\u0600-\u06FF]`) and Hebrew (`[\u0590-\u05FF]`) text.
- **Mirrored Layout**: Textarea and rendered preview dynamically switch `dir="rtl"`, aligning text to the right and mirroring callouts and blockquote borders.
- **One-Click Toolbar Toggle**: Click the **RTL / LTR** button in the editor toolbar or status bar to switch text direction instantly.

---

## 📐 6. Advanced Formatting & Formulas
- **KaTeX Math**: Inline formulas `$E=mc^2$` and block equations:
  $$
  \int_{-\infty}^\infty e^{-x^2} dx = \sqrt{\pi}
  $$
- **Mermaid Diagrams**: Interactive flowcharts, sequence diagrams, and state machines:
  ```mermaid
  graph LR
      A[Idea] --> B(Synapse Note)
      B --> C{Knowledge Graph}
  ```
- **Callouts**: GitHub-style callouts (`> [!NOTE]`, `> [!TIP]`, `> [!WARNING]`, `> [!IMPORTANT]`, `> [!CAUTION]`).
- **Wikilinks**: `[[Note Title]]` or `[[Note Title|Custom Alias]]`.
- **Task Lists**: Interactive checkbox items (`- [x] Complete task`).
