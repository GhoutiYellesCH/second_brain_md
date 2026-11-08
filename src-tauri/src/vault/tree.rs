use std::fs;
use std::path::{Path, PathBuf};
use std::time::UNIX_EPOCH;
use serde::{Deserialize, Serialize};

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

#[tauri::command]
pub fn list_vault_tree(vault_path: String) -> Result<FileEntry, String> {
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
                        // ignore hidden files/directories like .git or .synapse
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
