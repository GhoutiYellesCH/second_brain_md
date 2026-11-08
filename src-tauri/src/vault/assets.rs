use std::fs;
use std::path::Path;
use serde::{Deserialize, Serialize};
use base64::engine::general_purpose::STANDARD as BASE64_STANDARD;
use base64::Engine;

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct AssetData {
    pub mime_type: String,
    pub base64_data: String,
    pub file_size: u64,
}

pub fn get_mime_type(ext: &str) -> &'static str {
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
        "py" => "text/x-python",
        "js" => "text/javascript",
        "ts" | "tsx" => "text/typescript",
        "rs" => "text/rust",
        "html" => "text/html",
        "css" => "text/css",
        _ => "application/octet-stream",
    }
}

#[tauri::command]
pub fn save_asset_file(target_path: String, base64_data: String) -> Result<String, String> {
    let p = Path::new(&target_path);
    if let Some(parent) = p.parent() {
        if !parent.exists() {
            fs::create_dir_all(parent).map_err(|e| e.to_string())?;
        }
    }
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
pub fn read_asset_file(path: String) -> Result<AssetData, String> {
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
