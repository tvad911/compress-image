pub mod jpeg;
pub mod png;
pub mod webp;

pub use jpeg::compress_jpeg;
pub use png::compress_png;
pub use webp::compress_webp;
