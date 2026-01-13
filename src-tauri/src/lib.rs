// Core modules
pub mod commands;
pub mod core;
pub mod error;
pub mod utils;

use commands::*;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .invoke_handler(tauri::generate_handler![
            scan_directory,
            get_file_info_command,
            process_single_image,
            process_batch_images,
            generate_image_preview,
            get_image_preview,
            open_output_folder,
            minimize_window,
            maximize_window,
            unmaximize_window,
            toggle_maximize,
            close_window,
            is_maximized,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
