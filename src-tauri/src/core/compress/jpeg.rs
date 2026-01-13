use crate::core::config::JpegOptions;
use crate::error::AppResult;
use image::DynamicImage;

pub fn compress_jpeg(img: &DynamicImage, options: &JpegOptions) -> AppResult<Vec<u8>> {
    let rgb = img.to_rgb8();
    let width = rgb.width();
    let height = rgb.height();

    let mut jpeg_data = Vec::new();
    {
        let mut encoder =
            image::codecs::jpeg::JpegEncoder::new_with_quality(&mut jpeg_data, options.quality);

        encoder.encode(rgb.as_raw(), width, height, image::ExtendedColorType::Rgb8)?;
    }

    Ok(jpeg_data)
}
