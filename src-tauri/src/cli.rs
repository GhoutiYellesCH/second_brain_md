use std::path::Path;
use std::sync::Mutex;
use serde::{Deserialize, Serialize};

#[derive(Default)]
pub struct PendingFiles(Mutex<Vec<String>>);

impl PendingFiles {
    pub fn push_and_notify(&self, path: String, notify: impl FnOnce()) {
        self.0.lock().unwrap().push(path);
        notify();
    }

    pub fn take(&self) -> Vec<String> {
        std::mem::take(&mut *self.0.lock().unwrap())
    }
}

pub fn is_existing_file(path: &str) -> bool {
    Path::new(path).is_file()
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct CliVaultArgs {
    pub vault_path: Option<String>,
    pub initial_file: Option<String>,
}

#[tauri::command]
pub fn take_pending_files(state: tauri::State<'_, PendingFiles>) -> Vec<String> {
    state.take()
}

#[tauri::command]
pub fn get_cli_vault_args() -> CliVaultArgs {
    let args: Vec<String> = std::env::args().collect();
    let mut vault_path = None;
    let mut initial_file = None;

    let mut i = 1;
    while i < args.len() {
        let arg = &args[i];
        if (arg == "-v" || arg == "--vault") && i + 1 < args.len() {
            let candidate = &args[i + 1];
            let p = Path::new(candidate);
            if p.is_dir() {
                vault_path = Some(p.canonicalize().unwrap_or(p.to_path_buf()).to_string_lossy().to_string());
            }
            i += 1;
        } else if !arg.starts_with('-') {
            let p = Path::new(arg);
            if p.is_dir() {
                if vault_path.is_none() {
                    vault_path = Some(p.canonicalize().unwrap_or(p.to_path_buf()).to_string_lossy().to_string());
                }
            } else if p.is_file() {
                let abs_file = p.canonicalize().unwrap_or(p.to_path_buf());
                initial_file = Some(abs_file.to_string_lossy().to_string());
                if vault_path.is_none() {
                    if let Some(parent) = abs_file.parent() {
                        vault_path = Some(parent.to_string_lossy().to_string());
                    }
                }
            }
        }
        i += 1;
    }

    CliVaultArgs {
        vault_path,
        initial_file,
    }
}
