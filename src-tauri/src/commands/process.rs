use crate::core::{process_image, FileConflictMode, ProcessConfig, ProcessResult};
use rayon::prelude::*;
use std::path::PathBuf;

// Helper function to resolve output path based on conflict mode
fn resolve_output_path(
    base_path: PathBuf,
    conflict_mode: &FileConflictMode,
) -> Result<Option<PathBuf>, String> {
    match conflict_mode {
        FileConflictMode::Overwrite => Ok(Some(base_path)),
        FileConflictMode::Skip => {
            if base_path.exists() {
                Ok(None) // Skip this file
            } else {
                Ok(Some(base_path))
            }
        }
        FileConflictMode::Rename => {
            if !base_path.exists() {
                return Ok(Some(base_path));
            }

            let stem = base_path
                .file_stem()
                .and_then(|s| s.to_str())
                .ok_or("Invalid filename")?;
            let ext = base_path
                .extension()
                .and_then(|s| s.to_str())
                .ok_or("Invalid extension")?;
            let parent = base_path.parent().ok_or("Invalid parent directory")?;

            let mut counter = 1;
            loop {
                let new_path = parent.join(format!(
                    "{}_({}){}",
                    stem,
                    counter,
                    if ext.is_empty() {
                        String::new()
                    } else {
                        format!(".{}", ext)
                    }
                ));
                if !new_path.exists() {
                    return Ok(Some(new_path));
                }
                counter += 1;
                if counter > 1000 {
                    return Err("Too many conflicting files".to_string());
                }
            }
        }
    }
}

#[tauri::command]
pub async fn process_single_image(
    input_path: String,
    config: ProcessConfig,
) -> Result<ProcessResult, String> {
    let path = PathBuf::from(&input_path);

    // Generate output filename
    let input_filename = path
        .file_stem()
        .and_then(|s| s.to_str())
        .unwrap_or("output");

    let ext = match config.output_format {
        crate::core::OutputFormat::Png => "png",
        crate::core::OutputFormat::Jpeg => "jpg",
        crate::core::OutputFormat::WebP => "webp",
    };

    let output_filename = format!("{}_optimized.{}", input_filename, ext);

    // Calculate output path with folder structure preservation
    let base_output_path = if config.preserve_folder_structure {
        if let Some(base_path) = &config.base_path {
            // Calculate relative path from base_path
            if let Ok(relative) = path.strip_prefix(base_path) {
                // Get the parent directory of the file (relative to base)
                if let Some(parent) = relative.parent() {
                    // Combine output_path + relative_parent + filename
                    config.output_path.join(parent).join(output_filename)
                } else {
                    // File is directly in base_path
                    config.output_path.join(output_filename)
                }
            } else {
                // Fallback if strip_prefix fails
                config.output_path.join(output_filename)
            }
        } else {
            // No base_path, use default
            config.output_path.join(output_filename)
        }
    } else {
        // Don't preserve structure
        config.output_path.join(output_filename)
    };

    // Resolve conflicts
    let output_path = match resolve_output_path(base_output_path, &config.file_conflict_mode)? {
        Some(path) => path,
        None => {
            // File skipped
            return Ok(ProcessResult {
                success: true,
                original_size: 0,
                new_size: 0,
                compression_ratio: 0.0,
                output_path: String::from("Skipped (file exists)"),
                error: None,
            });
        }
    };

    // Create output directory if it doesn't exist
    if let Some(parent) = output_path.parent() {
        std::fs::create_dir_all(parent).map_err(|e| e.to_string())?;
    }

    // Update config with full output path
    let mut file_config = config.clone();
    file_config.output_path = output_path;

    process_image(&path, file_config, None)
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn process_batch_images(
    input_paths: Vec<String>,
    config: ProcessConfig,
    _app_handle: tauri::AppHandle,
) -> Result<Vec<ProcessResult>, String> {
    let paths: Vec<PathBuf> = input_paths.iter().map(PathBuf::from).collect();

    // Process in parallel using rayon
    let results: Vec<ProcessResult> = paths
        .par_iter()
        .enumerate()
        .map(|(_index, path)| {
            // Create unique output path for each file
            let mut file_config = config.clone();
            let output_name = path
                .file_stem()
                .and_then(|s| s.to_str())
                .unwrap_or("output");

            let ext = match config.output_format {
                crate::core::OutputFormat::Png => "png",
                crate::core::OutputFormat::Jpeg => "jpg",
                crate::core::OutputFormat::WebP => "webp",
            };

            file_config.output_path = config
                .output_path
                .join(format!("{}_optimized.{}", output_name, ext));

            // Process image
            let result = tokio::runtime::Handle::current()
                .block_on(async { process_image(path, file_config, None).await });

            // TODO: Emit progress event to frontend
            // let _ = app_handle.emit("process-progress", serde_json::json!({
            //     "index": index,
            //     "total": paths.len(),
            //     "file": path.to_string_lossy(),
            //     "success": result.is_ok(),
            // }));

            result.unwrap_or_else(|e| ProcessResult {
                success: false,
                original_size: 0,
                new_size: 0,
                compression_ratio: 0.0,
                output_path: String::new(),
                error: Some(e.to_string()),
            })
        })
        .collect();

    Ok(results)
}
