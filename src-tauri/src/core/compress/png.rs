use crate::core::config::PngOptions;
use crate::error::{AppError, AppResult};
use image::DynamicImage;
use imagequant::Attributes;

pub fn compress_png(img: &DynamicImage, options: &PngOptions) -> AppResult<Vec<u8>> {
    if !options.lossy {
        // Lossless PNG compression
        return compress_png_lossless(img);
    }

    // Lossy PNG compression using imagequant
    let rgba = img.to_rgba8();
    let width = rgba.width();
    let height = rgba.height();

    let mut liq = Attributes::new();

    // Map quality (0-100) to color count (2-256)
    let max_colors = ((options.quality as f32 / 100.0) * 254.0 + 2.0) as u32;
    liq.set_max_colors(max_colors)?;

    if options.dithering {
        liq.set_quality(0, options.quality)?;
    } else {
        liq.set_quality(0, options.quality)?;
    }

    // Convert image data to RGBA format for imagequant
    // imagequant expects &[RGBA<u8>], not &[u8]
    let img_data: &[imagequant::RGBA] = unsafe {
        std::slice::from_raw_parts(
            rgba.as_raw().as_ptr() as *const imagequant::RGBA,
            (width * height) as usize,
        )
    };

    let mut img_liq = liq.new_image(img_data, width as usize, height as usize, 0.0)?;

    let mut res = liq.quantize(&mut img_liq)?;

    if !options.dithering {
        res.set_dithering_level(0.0)?;
    }

    let (palette, pixels) = res.remapped(&mut img_liq)?;

    // Create PNG from quantized data
    let mut png_data = Vec::new();
    {
        let mut encoder = png::Encoder::new(&mut png_data, width, height);
        encoder.set_color(png::ColorType::Indexed);
        encoder.set_depth(png::BitDepth::Eight);

        // Set palette
        let palette_rgb: Vec<u8> = palette
            .iter()
            .flat_map(|rgba| vec![rgba.r, rgba.g, rgba.b])
            .collect();
        encoder.set_palette(palette_rgb);

        if options.preserve_transparency {
            let alpha: Vec<u8> = palette.iter().map(|rgba| rgba.a).collect();
            encoder.set_trns(alpha);
        }

        let mut writer = encoder.write_header()?;
        writer.write_image_data(&pixels)?;
    }

    Ok(png_data)
}

fn compress_png_lossless(img: &DynamicImage) -> AppResult<Vec<u8>> {
    let mut png_data = Vec::new();
    let rgba = img.to_rgba8();
    let width = rgba.width();
    let height = rgba.height();

    {
        let mut encoder = png::Encoder::new(&mut png_data, width, height);
        encoder.set_color(png::ColorType::Rgba);
        encoder.set_depth(png::BitDepth::Eight);
        encoder.set_compression(png::Compression::Best);

        let mut writer = encoder.write_header()?;
        writer.write_image_data(rgba.as_raw())?;
    }

    Ok(png_data)
}

// Implement From trait for imagequant errors
impl From<imagequant::Error> for AppError {
    fn from(err: imagequant::Error) -> Self {
        AppError::Processing(format!("Imagequant error: {:?}", err))
    }
}

impl From<png::EncodingError> for AppError {
    fn from(err: png::EncodingError) -> Self {
        AppError::Processing(format!("PNG encoding error: {}", err))
    }
}
