use std::fs;
use std::path::Path;
use serde::{Deserialize, Serialize};
use walkdir::WalkDir;

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct SearchResult {
    pub path: String,
    pub relative_path: String,
    pub title: String,
    pub line_number: usize,
    pub snippet: String,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct VaultStats {
    pub total_notes: usize,
    pub total_assets: usize,
    pub total_size_bytes: u64,
}

#[tauri::command]
pub fn search_vault(vault_path: String, query: String) -> Result<Vec<SearchResult>, String> {
    let root = Path::new(&vault_path);
    if !root.exists() {
        return Err("Vault path not found".to_string());
    }

    let q_lower = query.to_lowercase();
    let mut results = Vec::new();

    for entry in WalkDir::new(root).into_iter().filter_map(|e| e.ok()) {
        let p = entry.path();
        if p.is_file() {
            let ext = p.extension().and_then(|s| s.to_str()).unwrap_or("").to_lowercase();
            if matches!(ext.as_str(), "md" | "markdown" | "txt" | "py" | "rs" | "js" | "ts" | "tsx" | "json" | "html" | "css" | "sh" | "yaml" | "yml" | "toml") {
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
                            if results.len() >= 150 {
                                return Ok(results);
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
pub fn get_vault_stats(vault_path: String) -> Result<VaultStats, String> {
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
                if ext_lower == "md" || ext_lower == "markdown" || ext_lower == "txt" {
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
