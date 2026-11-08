use std::fs;
use std::path::{Path, PathBuf};

#[tauri::command]
pub fn get_default_vault_path() -> Result<String, String> {
    let local_help = PathBuf::from("obsidian_help_vault");
    if local_help.exists() && local_help.is_dir() {
        if let Ok(abs) = fs::canonicalize(&local_help) {
            return Ok(abs.to_string_lossy().to_string());
        }
    }

    let home = std::env::var("HOME").or_else(|_| std::env::var("USERPROFILE")).map_err(|e| e.to_string())?;
    let default_path = PathBuf::from(home).join("synapse_vault");
    if !default_path.exists() {
        fs::create_dir_all(&default_path).map_err(|e| e.to_string())?;
        init_sample_vault_internal(&default_path)?;
    }
    Ok(default_path.to_string_lossy().to_string())
}

#[tauri::command]
pub fn init_sample_vault(vault_path: String) -> Result<(), String> {
    let root = Path::new(&vault_path);
    if !root.exists() {
        fs::create_dir_all(root).map_err(|e| e.to_string())?;
    }
    init_sample_vault_internal(root)
}

pub fn init_sample_vault_internal(root: &Path) -> Result<(), String> {
    let notes_dir = root.join("Notes");
    let architecture_dir = root.join("Architecture");
    let research_dir = root.join("Research");
    let attachments_dir = root.join("Attachments");

    fs::create_dir_all(&notes_dir).map_err(|e| e.to_string())?;
    fs::create_dir_all(&architecture_dir).map_err(|e| e.to_string())?;
    fs::create_dir_all(&research_dir).map_err(|e| e.to_string())?;
    fs::create_dir_all(&attachments_dir).map_err(|e| e.to_string())?;

    let welcome_note = r#"# Welcome to Synapse 🧠✨

Synapse is an ultra-fast, offline-first knowledge engine and code editor featuring an interactive neural graph and full Markdown support.

## Key Features
- **Neural Synapse Graph**: Visualize dynamic connections between concepts in Tokyo Night aesthetic.
- **Production-Ready Markdown Engine**: Live synchronized preview, KaTeX math formulas, Mermaid diagrams, footnotes, callouts.
- **Code & Text Editor**: Edit any code file (`.py`, `.rs`, `.js`, `.ts`, `.json`, `.css`, etc.) with syntax highlighting.
- **Bi-directional Wikilinks**: Type `[[Note Name]]` to create instant interconnections.
- **Zettelkasten & Daily Notes**: Daily journal and timestamped atomic ideas.

## Get Started
Explore notes by clicking wikilinks:
- [[Neural Synapses]]
- [[Knowledge Representation]]
- [[Quantum Computing]]
- [[Artificial Intelligence]]

#synapse #knowledge #secondbrain #welcome
"#;
    let _ = fs::write(root.join("Welcome to Synapse.md"), welcome_note);

    let synapse_note = r#"# Neural Synapses ⚡

A synapse is a structure that permits a neuron to pass an electrical or chemical signal to another neuron. In Synapse, notes act as neurons and wikilinks act as axons creating living neural pathways.

## Mathematical Model of Action Potentials

The Hodgkin-Huxley model describes how action potentials in neurons are initiated:
$$
I = C_m \frac{dV}{dt} + \bar{g}_{Na} m^3 h (V - E_{Na}) + \bar{g}_K n^4 (V - E_K) + g_L (V - E_L)
$$

## Interconnected Ideas
- Connects back to [[Welcome to Synapse]]
- Related to [[Artificial Intelligence]]
- Implemented in [[Knowledge Representation]]

#neuroscience #synapse #math #biology
"#;
    let _ = fs::write(notes_dir.join("Neural Synapses.md"), synapse_note);

    let rep_note = r#"# Knowledge Representation 📊

Knowledge graphs structure interconnected information through nodes and edges.

```mermaid
graph TD
    A[Perception] --> B(Synapse Engine)
    B --> C{Memory Store}
    C -->|Short-term| D[Daily Notes]
    C -->|Long-term| E[Permanent Knowledge]
    E --> F((Neural Synapse Graph))
```

> [!NOTE] Tokyo Night Aesthetic
> The Synapse Graph uses Tokyo Night neon palette for high contrast and focus.

#math #representation #callouts #latex
"#;
    let _ = fs::write(architecture_dir.join("Knowledge Representation.md"), rep_note);

    let quantum_note = r#"# Quantum Computing ⚛️

Quantum computing uses qubits that exploit superposition and entanglement to compute exponentially faster for certain algorithms.

## Superposition Principle

A qubit state $|\psi\rangle$ is a linear combination of basis states:
$$
|\psi\rangle = \alpha |0\rangle + \beta |1\rangle
$$
where $|\alpha|^2 + |\beta|^2 = 1$.

## Connections
- Connects to [[Artificial Intelligence]]
- Influenced by [[Neural Synapses]]

#quantum #physics #computing #algorithms
"#;
    let _ = fs::write(research_dir.join("Quantum Computing.md"), quantum_note);

    let ai_note = r#"# Artificial Intelligence & Synapse 🤖

AI enhances knowledge management by discovering unlinked semantic connections between thoughts.

## Synaptic Weights

In artificial neural networks, synapses have weights:
$$
y = \sigma\left(\sum_{i=1}^n w_i x_i + b\right)
$$

## Related Network Nodes
- [[Neural Synapses]]
- [[Quantum Computing]]
- [[Welcome to Synapse]]

#ai #deeplearning #knowledge #future
"#;
    let _ = fs::write(research_dir.join("Artificial Intelligence.md"), ai_note);

    Ok(())
}
