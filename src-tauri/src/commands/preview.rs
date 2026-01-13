use crate::core::pipeline::generate_preview;
use std::path::PathBuf;

#[tauri::command]
pub async fn generate_image_preview(path: String, max_size: Option<u32>) -> Result<String, String> {
    let path = PathBuf::from(&path);

    let img = image::open(&path).map_err(|e| e.to_string())?;

    generate_preview(&img, max_size.unwrap_or(800)).map_err(|e| e.to_string())
}

// Alias for frontend compatibility
#[tauri::command]
pub async fn get_image_preview(file_path: String) -> Result<String, String> {
    generate_image_preview(file_path, Some(800)).await
}
