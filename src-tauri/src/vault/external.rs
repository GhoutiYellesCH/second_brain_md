use std::path::Path;

#[tauri::command]
pub fn pick_vault_folder() -> Result<Option<String>, String> {
    // 1. Try zenity first (standard on Linux/GNOME)
    let output = std::process::Command::new("zenity")
        .args(["--file-selection", "--directory", "--title=Select Vault Folder"])
        .output();
    if let Ok(o) = output {
        if o.status.success() {
            let path_str = String::from_utf8_lossy(&o.stdout).trim().to_string();
            if !path_str.is_empty() {
                return Ok(Some(path_str));
            }
        }
    }

    // 2. Try kdialog (KDE)
    let koutput = std::process::Command::new("kdialog")
        .args(["--getexistingdirectory", "."])
        .output();
    if let Ok(o) = koutput {
        if o.status.success() {
            let path_str = String::from_utf8_lossy(&o.stdout).trim().to_string();
            if !path_str.is_empty() {
                return Ok(Some(path_str));
            }
        }
    }

    Ok(None)
}

#[tauri::command]
pub fn open_in_synapse_graph(vault_path: String) -> Result<(), String> {
    let home = std::env::var("HOME").unwrap_or_default();
    let local_bin = format!("{}/.local/bin/synapse-graph", home);

    let bin = if std::process::Command::new("which")
        .arg("synapse-graph")
        .output()
        .map(|o| o.status.success())
        .unwrap_or(false)
    {
        "synapse-graph".to_string()
    } else if Path::new(&local_bin).exists() {
        local_bin
    } else {
        "synapse-graph".to_string()
    };

    std::process::Command::new(&bin)
        .arg(&vault_path)
        .spawn()
        .map_err(|e| format!("Failed to spawn synapse-graph: {}", e))?;
    Ok(())
}
