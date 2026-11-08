use std::fs;
use std::path::Path;

#[tauri::command]
pub fn read_file_content(path: String) -> Result<String, String> {
    fs::read_to_string(&path).map_err(|e| format!("Failed to read file {}: {}", path, e))
}

#[tauri::command]
pub fn write_file_content(path: String, content: String) -> Result<(), String> {
    let p = Path::new(&path);
    if let Some(parent) = p.parent() {
        if !parent.exists() {
            fs::create_dir_all(parent).map_err(|e| e.to_string())?;
        }
    }
    fs::write(p, content).map_err(|e| format!("Failed to write file {}: {}", path, e))
}

#[tauri::command]
pub fn create_new_file(path: String, initial_content: Option<String>) -> Result<(), String> {
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
pub fn create_new_folder(path: String) -> Result<(), String> {
    let p = Path::new(&path);
    if p.exists() {
        return Err("Folder already exists".to_string());
    }
    fs::create_dir_all(p).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn delete_file_or_folder(path: String) -> Result<(), String> {
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
pub fn rename_file_or_folder(old_path: String, new_path: String) -> Result<(), String> {
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
