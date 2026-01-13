use thiserror::Error;

#[derive(Error, Debug)]
pub enum AppError {
    #[error("IO error: {0}")]
    Io(#[from] std::io::Error),

    #[error("Image error: {0}")]
    Image(#[from] image::ImageError),

    #[error("Invalid configuration: {0}")]
    InvalidConfig(String),

    #[error("Processing error: {0}")]
    Processing(String),

    #[error("File not found: {0}")]
    FileNotFound(String),

    #[error("Unsupported format: {0}")]
    UnsupportedFormat(String),

    #[error("Metadata error: {0}")]
    Metadata(String),
}

pub type AppResult<T> = std::result::Result<T, AppError>;
