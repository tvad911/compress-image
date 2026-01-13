use crate::core::FileInfo;
use crate::error::AppResult;
use std::path::{Path, PathBuf};
use walkdir::WalkDir;

const SUPPORTED_EXTENSIONS: &[&str] = &["png", "jpg", "jpeg", "webp", "bmp", "tiff", "gif"];

#[tauri::command]
pub async fn scan_directory(
    path: String,
    recursive: bool,
    max_depth: Option<usize>,
) -> Result<Vec<FileInfo>, ()> {
    let path = PathBuf::from(path);

    if !path.exists() {
        return Err(());
    }

    let mut files = Vec::new();
    let walker = if recursive {
        WalkDir::new(&path).max_depth(max_depth.unwrap_or(10))
    } else {
        WalkDir::new(&path).max_depth(1)
    };

    for entry in walker.into_iter().filter_map(|e| e.ok()) {
        if entry.file_type().is_file() {
            if let Some(ext) = entry.path().extension() {
                if SUPPORTED_EXTENSIONS.contains(&ext.to_string_lossy().to_lowercase().as_str()) {
                    if let Ok(file_info) = get_file_info(entry.path()) {
                        files.push(file_info);
                    }
                }
            }
        }
    }

    Ok(files)
}

#[tauri::command]
pub async fn get_file_info_command(path: String) -> Result<FileInfo, ()> {
    get_file_info(Path::new(&path)).map_err(|_| ())
}

fn get_file_info(path: &Path) -> AppResult<FileInfo> {
    let metadata = std::fs::metadata(path)?;
    let size = metadata.len();

    // Fast dimension reading - only read image headers, don't decode full image
    let (width, height, format) = match get_image_dimensions_fast(path) {
        Ok((w, h)) => {
            let fmt = path
                .extension()
                .and_then(|s| s.to_str())
                .unwrap_or("unknown")
                .to_uppercase();
            (w, h, fmt)
        }
        Err(_) => (0, 0, "unknown".to_string()),
    };

    Ok(FileInfo {
        path: path.to_string_lossy().to_string(),
        name: path
            .file_name()
            .and_then(|s| s.to_str())
            .unwrap_or("unknown")
            .to_string(),
        size,
        width,
        height,
        format,
    })
}

// Fast dimension reading - only reads image headers
fn get_image_dimensions_fast(path: &Path) -> Result<(u32, u32), Box<dyn std::error::Error>> {
    let file = std::fs::File::open(path)?;
    let reader = std::io::BufReader::new(file);

    // Use ImageReader for fast header-only reading
    let reader = image::ImageReader::new(reader).with_guessed_format()?;
    let dimensions = reader.into_dimensions()?;
    Ok(dimensions)
}

#[tauri::command]
pub async fn open_output_folder(file_path: String) -> Result<(), String> {
    let path = PathBuf::from(&file_path);

    // Get the parent directory
    let folder = path.parent().ok_or("Failed to get parent directory")?;

    // Open the folder in file explorer
    #[cfg(target_os = "linux")]
    {
        std::process::Command::new("xdg-open")
            .arg(folder)
            .spawn()
            .map_err(|e| format!("Failed to open folder: {}", e))?;
    }

    #[cfg(target_os = "windows")]
    {
        std::process::Command::new("explorer")
            .arg(folder)
            .spawn()
            .map_err(|e| format!("Failed to open folder: {}", e))?;
    }

    #[cfg(target_os = "macos")]
    {
        std::process::Command::new("open")
            .arg(folder)
            .spawn()
            .map_err(|e| format!("Failed to open folder: {}", e))?;
    }

    Ok(())
}
