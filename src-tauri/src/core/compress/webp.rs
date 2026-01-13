use crate::core::config::WebPOptions;
use crate::error::AppResult;
use image::DynamicImage;

pub fn compress_webp(img: &DynamicImage, _options: &WebPOptions) -> AppResult<Vec<u8>> {
    let rgba = img.to_rgba8();
    let _width = rgba.width();
    let _height = rgba.height();

    // Use image crate's WebP support via save_buffer
    let mut webp_data = Vec::new();

    // For now, use a simpler approach - convert to WebP using the image crate
    // Note: image v0.25 WebP support might be limited, consider using webp crate directly
    let cursor = std::io::Cursor::new(&mut webp_data);

    // Encode as WebP
    img.write_to(
        &mut std::io::BufWriter::new(cursor),
        image::ImageFormat::WebP,
    )?;

    Ok(webp_data)
}
