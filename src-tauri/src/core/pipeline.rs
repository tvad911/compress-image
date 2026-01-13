use crate::core::compress::{compress_jpeg, compress_png, compress_webp};
use crate::core::config::{OutputFormat, ProcessConfig, ProcessResult, ProgressEvent};
use crate::core::resize::resize_image;
use crate::error::AppResult;
use image::DynamicImage;
use std::path::Path;
use tokio::sync::mpsc;

pub async fn process_image(
    input_path: &Path,
    config: ProcessConfig,
    progress_tx: Option<mpsc::Sender<ProgressEvent>>,
) -> AppResult<ProcessResult> {
    let original_size = std::fs::metadata(input_path)?.len();

    // Send loading event
    if let Some(ref tx) = progress_tx {
        let _ = tx.send(ProgressEvent::Loading).await;
    }

    // 1. Load image
    let img = image::open(input_path)?;

    // 2. Resize (if needed)
    if let Some(ref tx) = progress_tx {
        let _ = tx.send(ProgressEvent::Resizing).await;
    }
    let img = resize_image(&img, &config.resize)?;

    // 3. Compress based on output format
    if let Some(ref tx) = progress_tx {
        let _ = tx.send(ProgressEvent::Compressing).await;
    }

    let output_data = match config.output_format {
        OutputFormat::Png => compress_png(&img, &config.png_options)?,
        OutputFormat::Jpeg => compress_jpeg(&img, &config.jpeg_options)?,
        OutputFormat::WebP => compress_webp(&img, &config.webp_options)?,
    };

    // 4. Write to file
    if let Some(ref tx) = progress_tx {
        let _ = tx.send(ProgressEvent::WritingMetadata).await;
    }

    std::fs::write(&config.output_path, &output_data)?;

    let new_size = output_data.len() as u64;
    let compression_ratio = if original_size > 0 {
        if new_size <= original_size {
            ((original_size - new_size) as f32 / original_size as f32) * 100.0
        } else {
            // Negative compression (file got bigger)
            -((new_size - original_size) as f32 / original_size as f32) * 100.0
        }
    } else {
        0.0
    };

    // Send done event
    if let Some(ref tx) = progress_tx {
        let _ = tx.send(ProgressEvent::Done).await;
    }

    Ok(ProcessResult {
        success: true,
        original_size,
        new_size,
        compression_ratio,
        output_path: config.output_path.to_string_lossy().to_string(),
        error: None,
    })
}

pub fn generate_preview(img: &DynamicImage, max_size: u32) -> AppResult<String> {
    // Resize for preview (max 800px)
    let width = img.width();
    let height = img.height();
    let scale = (max_size as f32 / width.max(height) as f32).min(1.0);

    let preview_width = (width as f32 * scale) as u32;
    let preview_height = (height as f32 * scale) as u32;

    let preview = img.resize_exact(
        preview_width,
        preview_height,
        image::imageops::FilterType::Lanczos3,
    );

    // Encode to JPEG for preview
    let mut jpeg_data = Vec::new();
    {
        let mut encoder = image::codecs::jpeg::JpegEncoder::new_with_quality(&mut jpeg_data, 85);
        let rgb = preview.to_rgb8();
        encoder.encode(
            rgb.as_raw(),
            preview_width,
            preview_height,
            image::ExtendedColorType::Rgb8,
        )?;
    }

    // Convert to base64
    Ok(base64::Engine::encode(
        &base64::engine::general_purpose::STANDARD,
        jpeg_data,
    ))
}
