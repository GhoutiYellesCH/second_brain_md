use std::fs;
use std::path::{Path, PathBuf};
use std::time::UNIX_EPOCH;
use serde::{Deserialize, Serialize};
use walkdir::WalkDir;
use base64::engine::general_purpose::STANDARD as BASE64_STANDARD;
use base64::Engine;

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct FileEntry {
    pub name: String,
    pub path: String,
    pub relative_path: String,
    pub is_dir: bool,
    pub size: u64,
    pub modified: u64,
    pub extension: String,
    pub children: Option<Vec<FileEntry>>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct SearchResult {
    pub path: String,
    pub relative_path: String,
    pub title: String,
    pub line_number: usize,
    pub snippet: String,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct AssetData {
    pub mime_type: String,
    pub base64_data: String,
    pub file_size: u64,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct VaultStats {
    pub total_notes: usize,
    pub total_assets: usize,
    pub total_size_bytes: u64,
}

fn get_mime_type(ext: &str) -> &'static str {
    match ext.to_lowercase().as_str() {
        "png" => "image/png",
        "jpg" | "jpeg" => "image/jpeg",
        "gif" => "image/gif",
        "svg" => "image/svg+xml",
        "webp" => "image/webp",
        "bmp" => "image/bmp",
        "ico" => "image/x-icon",
        "pdf" => "application/pdf",
        "mp3" => "audio/mpeg",
        "wav" => "audio/wav",
        "ogg" => "audio/ogg",
        "mp4" => "video/mp4",
        "webm" => "video/webm",
        "md" | "markdown" => "text/markdown",
        "txt" => "text/plain",
        "json" => "application/json",
        _ => "application/octet-stream",
    }
}

#[tauri::command]
fn get_default_vault_path() -> Result<String, String> {
    // 1. If obsidian_help_vault exists in the current working directory, use it by default
    let local_help = PathBuf::from("obsidian_help_vault");
    if local_help.exists() && local_help.is_dir() {
        if let Ok(abs) = fs::canonicalize(&local_help) {
            return Ok(abs.to_string_lossy().to_string());
        }
    }

    // 2. Otherwise default to ~/second_brain_vault
    let home = std::env::var("HOME").or_else(|_| std::env::var("USERPROFILE")).map_err(|e| e.to_string())?;
    let default_path = PathBuf::from(home).join("second_brain_vault");
    if !default_path.exists() {
        fs::create_dir_all(&default_path).map_err(|e| e.to_string())?;
        init_sample_vault_internal(&default_path)?;
    }
    Ok(default_path.to_string_lossy().to_string())
}

#[tauri::command]
fn list_vault_tree(vault_path: String) -> Result<FileEntry, String> {
    let root_path = Path::new(&vault_path);
    if !root_path.exists() {
        return Err("Vault path does not exist".to_string());
    }

    fn build_tree(path: &Path, root: &Path) -> Result<FileEntry, String> {
        let metadata = fs::metadata(path).map_err(|e| e.to_string())?;
        let name = path.file_name().and_then(|n| n.to_str()).unwrap_or("").to_string();
        let relative_path = path.strip_prefix(root).unwrap_or(path).to_string_lossy().to_string();
        let modified = if let Ok(m) = metadata.modified() {
            m.duration_since(UNIX_EPOCH).map(|d| d.as_secs()).unwrap_or(0)
        } else {
            0
        };
        let extension = path.extension().and_then(|e| e.to_str()).unwrap_or("").to_lowercase();

        if metadata.is_dir() {
            let mut children = Vec::new();
            if let Ok(entries) = fs::read_dir(path) {
                let mut dir_entries: Vec<PathBuf> = entries
                    .filter_map(|e| e.ok())
                    .map(|e| e.path())
                    .filter(|p| {
                        // ignore hidden files/directories like .git or .obsidian
                        if let Some(file_name) = p.file_name().and_then(|s| s.to_str()) {
                            !file_name.starts_with('.')
                        } else {
                            false
                        }
                    })
                    .collect();

                // Sort: folders first, then files alphabetically
                dir_entries.sort_by(|a, b| {
                    let a_is_dir = a.is_dir();
                    let b_is_dir = b.is_dir();
                    if a_is_dir != b_is_dir {
                        b_is_dir.cmp(&a_is_dir)
                    } else {
                        a.file_name().cmp(&b.file_name())
                    }
                });

                for child_path in dir_entries {
                    if let Ok(child_entry) = build_tree(&child_path, root) {
                        children.push(child_entry);
                    }
                }
            }

            Ok(FileEntry {
                name,
                path: path.to_string_lossy().to_string(),
                relative_path,
                is_dir: true,
                size: 0,
                modified,
                extension: "".to_string(),
                children: Some(children),
            })
        } else {
            Ok(FileEntry {
                name,
                path: path.to_string_lossy().to_string(),
                relative_path,
                is_dir: false,
                size: metadata.len(),
                modified,
                extension,
                children: None,
            })
        }
    }

    build_tree(root_path, root_path)
}

#[tauri::command]
fn read_file_content(path: String) -> Result<String, String> {
    fs::read_to_string(&path).map_err(|e| format!("Failed to read file {}: {}", path, e))
}

#[tauri::command]
fn write_file_content(path: String, content: String) -> Result<(), String> {
    let p = Path::new(&path);
    if let Some(parent) = p.parent() {
        if !parent.exists() {
            fs::create_dir_all(parent).map_err(|e| e.to_string())?;
        }
    }
    fs::write(p, content).map_err(|e| format!("Failed to write file {}: {}", path, e))
}

#[tauri::command]
fn create_new_file(path: String, initial_content: Option<String>) -> Result<(), String> {
    let p = Path::new(&path);
    if p.exists() {
        return Err("File already exists".to_string());
    }
    if let Some(parent) = p.parent() {
        if !parent.exists() {
            fs::create_dir_all(parent).map_err(|e| e.to_string())?;
        }
    }
    let content = initial_content.unwrap_or_else(String::new);
    fs::write(p, content).map_err(|e| e.to_string())
}

#[tauri::command]
fn create_new_folder(path: String) -> Result<(), String> {
    let p = Path::new(&path);
    if p.exists() {
        return Err("Folder already exists".to_string());
    }
    fs::create_dir_all(p).map_err(|e| e.to_string())
}

#[tauri::command]
fn delete_file_or_folder(path: String) -> Result<(), String> {
    let p = Path::new(&path);
    if !p.exists() {
        return Err("Item does not exist".to_string());
    }
    if p.is_dir() {
        fs::remove_dir_all(p).map_err(|e| e.to_string())
    } else {
        fs::remove_file(p).map_err(|e| e.to_string())
    }
}

#[tauri::command]
fn rename_file_or_folder(old_path: String, new_path: String) -> Result<(), String> {
    let op = Path::new(&old_path);
    let np = Path::new(&new_path);
    if !op.exists() {
        return Err("Source item does not exist".to_string());
    }
    if np.exists() {
        return Err("Target path already exists".to_string());
    }
    if let Some(parent) = np.parent() {
        if !parent.exists() {
            fs::create_dir_all(parent).map_err(|e| e.to_string())?;
        }
    }
    fs::rename(op, np).map_err(|e| e.to_string())
}

#[tauri::command]
fn save_asset_file(target_path: String, base64_data: String) -> Result<String, String> {
    let p = Path::new(&target_path);
    if let Some(parent) = p.parent() {
        if !parent.exists() {
            fs::create_dir_all(parent).map_err(|e| e.to_string())?;
        }
    }
    // Clean base64 header if present (e.g. "data:image/png;base64,xxxx")
    let raw_b64 = if let Some(idx) = base64_data.find(";base64,") {
        &base64_data[idx + 8..]
    } else {
        &base64_data
    };

    let bytes = BASE64_STANDARD.decode(raw_b64.trim()).map_err(|e| format!("Base64 decode error: {}", e))?;
    fs::write(p, bytes).map_err(|e| format!("Failed to write asset file: {}", e))?;
    Ok(p.to_string_lossy().to_string())
}

#[tauri::command]
fn read_asset_file(path: String) -> Result<AssetData, String> {
    let p = Path::new(&path);
    if !p.exists() {
        return Err(format!("Asset not found: {}", path));
    }
    let ext = p.extension().and_then(|e| e.to_str()).unwrap_or("");
    let mime_type = get_mime_type(ext).to_string();
    let bytes = fs::read(p).map_err(|e| format!("Failed to read asset {}: {}", path, e))?;
    let base64_data = BASE64_STANDARD.encode(&bytes);
    Ok(AssetData {
        mime_type,
        base64_data,
        file_size: bytes.len() as u64,
    })
}

#[tauri::command]
fn search_vault(vault_path: String, query: String) -> Result<Vec<SearchResult>, String> {
    let root = Path::new(&vault_path);
    if !root.exists() {
        return Err("Vault path not found".to_string());
    }

    let q_lower = query.to_lowercase();
    let mut results = Vec::new();

    for entry in WalkDir::new(root).into_iter().filter_map(|e| e.ok()) {
        let p = entry.path();
        if p.is_file() {
            if let Some(ext) = p.extension().and_then(|s| s.to_str()) {
                if ext.eq_ignore_ascii_case("md") || ext.eq_ignore_ascii_case("markdown") || ext.eq_ignore_ascii_case("txt") {
                    let relative_path = p.strip_prefix(root).unwrap_or(p).to_string_lossy().to_string();
                    let title = p.file_stem().and_then(|s| s.to_str()).unwrap_or("").to_string();

                    if let Ok(content) = fs::read_to_string(p) {
                        for (idx, line) in content.lines().enumerate() {
                            if line.to_lowercase().contains(&q_lower) {
                                results.push(SearchResult {
                                    path: p.to_string_lossy().to_string(),
                                    relative_path: relative_path.clone(),
                                    title: title.clone(),
                                    line_number: idx + 1,
                                    snippet: line.trim().to_string(),
                                });
                                if results.len() >= 100 {
                                    return Ok(results);
                                }
                            }
                        }
                    }
                }
            }
        }
    }

    Ok(results)
}

#[tauri::command]
fn get_vault_stats(vault_path: String) -> Result<VaultStats, String> {
    let root = Path::new(&vault_path);
    let mut total_notes = 0;
    let mut total_assets = 0;
    let mut total_size_bytes = 0;

    for entry in WalkDir::new(root).into_iter().filter_map(|e| e.ok()) {
        let p = entry.path();
        if p.is_file() {
            if let Ok(meta) = entry.metadata() {
                total_size_bytes += meta.len();
            }
            if let Some(ext) = p.extension().and_then(|s| s.to_str()) {
                let ext_lower = ext.to_lowercase();
                if ext_lower == "md" || ext_lower == "markdown" {
                    total_notes += 1;
                } else if matches!(ext_lower.as_str(), "png" | "jpg" | "jpeg" | "gif" | "svg" | "webp" | "pdf" | "mp3" | "wav" | "mp4") {
                    total_assets += 1;
                }
            }
        }
    }

    Ok(VaultStats {
        total_notes,
        total_assets,
        total_size_bytes,
    })
}

#[tauri::command]
fn init_sample_vault(vault_path: String) -> Result<(), String> {
    let path = Path::new(&vault_path);
    init_sample_vault_internal(path)
}

fn init_sample_vault_internal(root: &Path) -> Result<(), String> {
    if !root.exists() {
        fs::create_dir_all(root).map_err(|e| e.to_string())?;
    }

    let assets_dir = root.join("assets");
    let architecture_dir = root.join("Architecture");
    let research_dir = root.join("Research");

    fs::create_dir_all(&assets_dir).map_err(|e| e.to_string())?;
    fs::create_dir_all(&architecture_dir).map_err(|e| e.to_string())?;
    fs::create_dir_all(&research_dir).map_err(|e| e.to_string())?;

    // Create SVG Asset
    let sample_svg = r##"<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 240" width="100%" height="240">
  <defs>
    <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#8b5cf6;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#3b82f6;stop-opacity:1" />
    </linearGradient>
    <filter id="glow">
      <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
      <feMerge>
        <feMergeNode in="coloredBlur"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
  </defs>
  <rect width="100%" height="100%" rx="16" fill="#18181b" stroke="#3f3f46" stroke-width="2"/>
  <circle cx="80" cy="120" r="30" fill="url(#grad1)" filter="url(#glow)"/>
  <circle cx="200" cy="60" r="24" fill="#a855f7" filter="url(#glow)"/>
  <circle cx="200" cy="180" r="24" fill="#06b6d4" filter="url(#glow)"/>
  <circle cx="320" cy="120" r="30" fill="url(#grad1)" filter="url(#glow)"/>
  <line x1="110" y1="120" x2="176" y2="72" stroke="#a855f7" stroke-width="3" stroke-dasharray="4,4"/>
  <line x1="110" y1="120" x2="176" y2="168" stroke="#06b6d4" stroke-width="3" stroke-dasharray="4,4"/>
  <line x1="224" y1="72" x2="290" y2="120" stroke="#a855f7" stroke-width="3"/>
  <line x1="224" y1="168" x2="290" y2="120" stroke="#06b6d4" stroke-width="3"/>
  <text x="80" y="125" fill="#ffffff" font-family="sans-serif" font-size="12" font-weight="bold" text-anchor="middle">Input</text>
  <text x="200" y="65" fill="#ffffff" font-family="sans-serif" font-size="11" font-weight="bold" text-anchor="middle">Synapse A</text>
  <text x="200" y="185" fill="#ffffff" font-family="sans-serif" font-size="11" font-weight="bold" text-anchor="middle">Synapse B</text>
  <text x="320" y="125" fill="#ffffff" font-family="sans-serif" font-size="12" font-weight="bold" text-anchor="middle">Output</text>
  <text x="200" y="222" fill="#a1a1aa" font-family="sans-serif" font-size="11" text-anchor="middle">Neural Synaptic Connection Flow</text>
</svg>"##;
    let _ = fs::write(assets_dir.join("synapse_network.svg"), sample_svg);

    // Welcome Note
    let welcome_note = r#"# Welcome to your Second Brain Vault 🧠

Welcome to your offline-first, Obsidian-compatible knowledge base built with **Tauri**!

## ✨ Key Capabilities

1. **Obsidian Compatibility**:
   - Bi-directional links: [[Neural Synapses]] and [[Knowledge Representation]]
   - Attachment embeds: `![[synapse_network.svg]]`
   - Configurable assets folder in Settings (Designated folder, Vault root, or Same folder as note)
2. **Editor Modes**:
   - **Live Preview Mode**: Inline live editing with WYSIWYG formatting
   - **Reading Mode**: Distraction-free rendered preview
   - **Source Mode**: Raw markdown code editor
   - **Split Mode**: Side-by-side editing and preview with synchronized scrolling
   - **Browser View**: Built-in web browser for documentation and research
   - **Synapses Graph**: Interactive force-directed knowledge graph
3. **Synapses Graph View**:
   - Default view and local sidebar graph
   - Force-directed physics simulation with synaptic glow
   - Degree-based neuron node sizing

## 🖼️ Vault Asset Resolution Demo
Here is an asset automatically resolved from your configured `assets/` directory:

![[synapse_network.svg]]

> [!NOTE] Configurable Assets Folder
> You can choose where attachments are stored from the **Vault & Asset Settings** gear icon in the top toolbar or sidebar.
> Drag-and-drop or paste any image directly into this note!

## 🚀 Jump to Connected Notes
- Learn about [[Neural Synapses]] and how brain graph connections work
- Explore [[Knowledge Representation]] with LaTeX math and callouts
- Check out [[Quantum Computing]] and [[Artificial Intelligence]]

#vault #welcome #obsidian #synapses
"#;
    let _ = fs::write(root.join("Welcome to Second Brain.md"), welcome_note);

    // Neural Synapses Note
    let neural_note = r#"# Neural Synapses in Knowledge Graphs ⚡

In a Second Brain, notes act like **neurons** and bi-directional links `[[...]]` act like **synapses**.

## 🧬 Biological Inspiration

The human brain processes information through interconnected networks of neurons. Rather than organizing files in rigid hierarchical folders, associative thinking connects ideas across domains.

> [!TIP] The Power of Bidirectional Links
> When note A links to note B via `[[Note B]]`, note B automatically discovers its backlink to note A. In the **Synapses Graph**, this creates a physical gravitational pull!

## 🔗 Related Concepts
- [[Knowledge Representation]]
- [[Artificial Intelligence]]
- [[Welcome to Second Brain]]

```mermaid
flowchart LR
    A["[[Neural Synapses]]"] --> B["[[Artificial Intelligence]]"]
    A --> C["[[Knowledge Representation]]"]
    B --> D["[[Quantum Computing]]"]
    C --> A
```

#synapse #neuroscience #graph #ai
"#;
    let _ = fs::write(architecture_dir.join("Neural Synapses.md"), neural_note);

    // Knowledge Representation Note
    let rep_note = r#"# Knowledge Representation & Math 📐

Second Brain markdown supports rich formatting, KaTeX mathematical notation, callouts, and interactive task lists.

## 🧮 LaTeX Mathematical Equations

Inline equation: The famous mass-energy equivalence $E = mc^2$ and the Euler identity $e^{i\pi} + 1 = 0$.

Block math equation:
$$
\int_{-\infty}^{+\infty} e^{-x^2} dx = \sqrt{\pi}
$$

The Schrödinger wave equation:
$$
i\hbar \frac{\partial}{\partial t} \Psi(\mathbf{r}, t) = \hat{H} \Psi(\mathbf{r}, t)
$$

## 📋 Interactive Task Checklist
- [x] Create Tauri backend with custom file vault APIs
- [x] Implement configurable assets storage location
- [x] Build Live Preview, Source, Reading, Split, and Browser view modes
- [x] Implement 60fps canvas Synapses Graph with force physics
- [ ] Connect custom external Obsidian vault

## 💬 Callouts / Admonitions

> [!NOTE] Information Box
> Standard informational note callout.

> [!WARNING] Important Warning
> Check your assets path configuration if images do not resolve.

> [!SUCCESS] Achievement
> Successfully replaced Obsidian vault with native Tauri application!

#math #representation #callouts #latex
"#;
    let _ = fs::write(architecture_dir.join("Knowledge Representation.md"), rep_note);

    // Quantum Computing Note
    let quantum_note = r#"# Quantum Computing ⚛️

Quantum computing uses qubits that exploit superposition and entanglement to compute exponentially faster for certain algorithms.

## Superposition Principle

A qubit state $|\psi\rangle$ is a linear combination of basis states:
$$
|\psi\rangle = \alpha |0\rangle + \beta |1\rangle
$$
where $|\alpha|^2 + |\beta|^2 = 1$.

## Connections
- Connects to [[Artificial Intelligence]] for Quantum Machine Learning
- Influenced by [[Neural Synapses]]

#quantum #physics #computing #algorithms
"#;
    let _ = fs::write(research_dir.join("Quantum Computing.md"), quantum_note);

    // Artificial Intelligence Note
    let ai_note = r#"# Artificial Intelligence & Second Brains 🤖

AI enhances second brains by discovering unlinked semantic connections between thoughts.

## Synaptic Weights

In artificial neural networks, synapses have weights:
$$
y = \sigma\left(\sum_{i=1}^n w_i x_i + b\right)
$$

## Related Network Nodes
- [[Neural Synapses]]
- [[Quantum Computing]]
- [[Welcome to Second Brain]]

#ai #deeplearning #knowledge #future
"#;
    let _ = fs::write(research_dir.join("Artificial Intelligence.md"), ai_note);

    Ok(())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            get_default_vault_path,
            list_vault_tree,
            read_file_content,
            write_file_content,
            create_new_file,
            create_new_folder,
            delete_file_or_folder,
            rename_file_or_folder,
            save_asset_file,
            read_asset_file,
            search_vault,
            get_vault_stats,
            init_sample_vault
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
