use crate::core::config::{ResizeAlgorithm, ResizeConfig, ResizeMode};
use crate::error::AppResult;
use fast_image_resize as fir;
use image::DynamicImage;

pub fn resize_image(img: &DynamicImage, config: &ResizeConfig) -> AppResult<DynamicImage> {
    if !config.enabled {
        return Ok(img.clone());
    }

    let orig_width = img.width();
    let orig_height = img.height();

    // Calculate target dimensions
    let (target_width, target_height) = match &config.mode {
        ResizeMode::FixedWidth { width } => {
            let aspect_ratio = orig_height as f32 / orig_width as f32;
            (*width, (*width as f32 * aspect_ratio) as u32)
        }
        ResizeMode::FixedHeight { height } => {
            let aspect_ratio = orig_width as f32 / orig_height as f32;
            ((*height as f32 * aspect_ratio) as u32, *height)
        }
        ResizeMode::Exact { width, height } => (*width, *height),
        ResizeMode::Percentage { scale } => {
            let w = (orig_width as f32 * scale / 100.0) as u32;
            let h = (orig_height as f32 * scale / 100.0) as u32;
            (w, h)
        }
        ResizeMode::FitBox {
            max_width,
            max_height,
        } => {
            let width_ratio = *max_width as f32 / orig_width as f32;
            let height_ratio = *max_height as f32 / orig_height as f32;
            let ratio = width_ratio.min(height_ratio);

            (
                (orig_width as f32 * ratio) as u32,
                (orig_height as f32 * ratio) as u32,
            )
        }
        ResizeMode::FillBox { width, height } => (*width, *height),
    };

    // Skip if dimensions are the same
    if target_width == orig_width && target_height == orig_height {
        return Ok(img.clone());
    }

    // Convert algorithm
    let algorithm = match config.algorithm {
        ResizeAlgorithm::Lanczos3 => fir::ResizeAlg::Convolution(fir::FilterType::Lanczos3),
        ResizeAlgorithm::CatmullRom => fir::ResizeAlg::Convolution(fir::FilterType::CatmullRom),
        ResizeAlgorithm::Nearest => fir::ResizeAlg::Nearest,
        ResizeAlgorithm::Mitchell => fir::ResizeAlg::Convolution(fir::FilterType::Mitchell),
    };

    // Perform resize using fast_image_resize v4 API
    let src_buffer = img.to_rgba8().into_raw();
    let src_image = fir::images::Image::from_vec_u8(
        orig_width.try_into().unwrap(),
        orig_height.try_into().unwrap(),
        src_buffer,
        fir::PixelType::U8x4,
    )
    .map_err(|e| {
        crate::error::AppError::Processing(format!("Failed to create source image: {:?}", e))
    })?;

    let mut dst_image = fir::images::Image::new(
        target_width.try_into().unwrap(),
        target_height.try_into().unwrap(),
        src_image.pixel_type(),
    );

    let mut resizer = fir::Resizer::new();
    resizer
        .resize(
            &src_image,
            &mut dst_image,
            &fir::ResizeOptions::new().resize_alg(algorithm),
        )
        .map_err(|e| crate::error::AppError::Processing(format!("Resize failed: {:?}", e)))?;

    // Convert back to DynamicImage
    let rgba_image = image::RgbaImage::from_raw(target_width, target_height, dst_image.into_vec())
        .ok_or_else(|| {
            crate::error::AppError::Processing("Failed to create image from buffer".to_string())
        })?;

    Ok(DynamicImage::ImageRgba8(rgba_image))
}
