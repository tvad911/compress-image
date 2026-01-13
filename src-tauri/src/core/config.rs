use serde::{Deserialize, Serialize};
use std::path::PathBuf;

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub enum OutputFormat {
    Png,
    Jpeg,
    WebP,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub enum ResizeMode {
    FixedWidth { width: u32 },
    FixedHeight { height: u32 },
    Exact { width: u32, height: u32 },
    Percentage { scale: f32 },
    FitBox { max_width: u32, max_height: u32 },
    FillBox { width: u32, height: u32 },
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub enum ResizeAlgorithm {
    Lanczos3,
    CatmullRom,
    Nearest,
    Mitchell,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ResizeConfig {
    pub enabled: bool,
    pub mode: ResizeMode,
    pub algorithm: ResizeAlgorithm,
}

// PNG Encoder Options
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(rename_all = "camelCase")]
pub enum PngEncoder {
    /// Imagequant - Best for lossy compression with high quality
    Imagequant,
    /// Standard PNG - Lossless compression
    Standard,
    /// OxiPNG - Optimized lossless compression (slower but better)
    #[serde(rename = "oxipng")]
    OxiPng,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct PngOptions {
    pub encoder: PngEncoder,
    pub lossy: bool,
    pub quality: u8, // 0-100, maps to color count
    pub dithering: bool,
    pub preserve_transparency: bool,
}

// JPEG Encoder Options
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(rename_all = "camelCase")]
pub enum JpegEncoder {
    /// MozJPEG - Best compression, slower (recommended)
    #[serde(rename = "mozjpeg")]
    MozJpeg,
    /// Standard JPEG - Fast, good quality
    #[serde(rename = "standard")]
    Standard,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct JpegOptions {
    pub encoder: JpegEncoder,
    pub quality: u8, // 0-100
    pub progressive: bool,
    pub optimize_coding: bool, // Optimize Huffman tables
}

// WebP Encoder Options
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(rename_all = "camelCase")]
pub enum WebPEncoder {
    /// libwebp - Standard WebP encoder (recommended)
    #[serde(rename = "libwebp")]
    LibWebP,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct WebPOptions {
    pub encoder: WebPEncoder,
    pub lossy: bool,
    pub quality: u8, // 0-100
    pub method: u8,  // 0-6, compression method (0=fast, 6=slower but better)
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub enum MetadataMode {
    StripAll,
    KeepOrientation,
    KeepColorProfile,
    Custom,
}

// File Conflict Handling
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(rename_all = "camelCase")]
pub enum FileConflictMode {
    Overwrite,
    Rename,
    Skip,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ProcessConfig {
    pub output_format: OutputFormat,
    pub resize: ResizeConfig,
    pub png_options: PngOptions,
    pub jpeg_options: JpegOptions,
    pub webp_options: WebPOptions,
    pub metadata_mode: MetadataMode,
    pub file_conflict_mode: FileConflictMode,
    pub preserve_folder_structure: bool,
    pub base_path: Option<PathBuf>,
    pub output_path: PathBuf,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct FileInfo {
    pub path: String,
    pub name: String,
    pub size: u64,
    pub width: u32,
    pub height: u32,
    pub format: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ProcessResult {
    pub success: bool,
    pub original_size: u64,
    pub new_size: u64,
    pub compression_ratio: f32,
    pub output_path: String,
    pub error: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub enum ProgressEvent {
    Loading,
    Resizing,
    Compressing,
    WritingMetadata,
    Done,
    Error(String),
}

impl Default for ResizeConfig {
    fn default() -> Self {
        Self {
            enabled: false,
            mode: ResizeMode::Percentage { scale: 100.0 },
            algorithm: ResizeAlgorithm::Lanczos3,
        }
    }
}

impl Default for PngOptions {
    fn default() -> Self {
        Self {
            encoder: PngEncoder::Imagequant, // Best for lossy compression
            lossy: true,                     // Enable lossy for better compression
            quality: 80,                     // Reduce from 85 to 80
            dithering: true,
            preserve_transparency: true,
        }
    }
}

impl Default for JpegOptions {
    fn default() -> Self {
        Self {
            encoder: JpegEncoder::Standard, // MozJPEG would be better but requires additional setup
            quality: 60, // Reduced to 60 to avoid enlarging already-compressed JPGs
            progressive: true,
            optimize_coding: true,
        }
    }
}

impl Default for WebPOptions {
    fn default() -> Self {
        Self {
            encoder: WebPEncoder::LibWebP,
            lossy: true,
            quality: 85,
            method: 4, // Good balance between speed and compression
        }
    }
}
