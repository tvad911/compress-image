// File info from backend
export interface FileInfo {
    path: string;
    name: string;
    size: number;
    width: number;
    height: number;
    format: string;
}

// Processing configuration
export enum OutputFormat {
    Png = "png",
    Jpeg = "jpeg",
    WebP = "webP",
}

export enum ResizeMode {
    FixedWidth = "fixedWidth",
    FixedHeight = "fixedHeight",
    Exact = "exact",
    Percentage = "percentage",
    FitBox = "fitBox",
    FillBox = "fillBox",
}

export enum ResizeAlgorithm {
    Lanczos3 = "lanczos3",
    CatmullRom = "catmullRom",
    Nearest = "nearest",
    Mitchell = "mitchell",
}

export interface ResizeConfig {
    enabled: boolean;
    mode: ResizeMode;
    algorithm: ResizeAlgorithm;
    width?: number;
    height?: number;
    scale?: number;
    maxWidth?: number;
    maxHeight?: number;
}

// PNG Encoder Options
export enum PngEncoder {
    Imagequant = "imagequant",
    Standard = "standard",
    OxiPng = "oxipng",
}

export interface PngOptions {
    encoder: PngEncoder;
    lossy: boolean;
    quality: number;
    dithering: boolean;
    preserveTransparency: boolean;
}

// JPEG Encoder Options
export enum JpegEncoder {
    MozJpeg = "mozjpeg",
    Standard = "standard",
}

export interface JpegOptions {
    encoder: JpegEncoder;
    quality: number;
    progressive: boolean;
    optimizeCoding: boolean;
}

// WebP Encoder Options
export enum WebPEncoder {
    LibWebP = "libwebp",
}

export interface WebPOptions {
    encoder: WebPEncoder;
    lossy: boolean;
    quality: number;
    method: number; // 0-6
}

export enum MetadataMode {
    StripAll = "stripAll",
    KeepOrientation = "keepOrientation",
    KeepColorProfile = "keepColorProfile",
    Custom = "custom",
}

// File Conflict Handling
export enum FileConflictMode {
    Overwrite = "overwrite",
    Rename = "rename",
    Skip = "skip",
}

export interface ProcessConfig {
    outputFormat: OutputFormat;
    resize: ResizeConfig;
    pngOptions: PngOptions;
    jpegOptions: JpegOptions;
    webpOptions: WebPOptions;
    metadataMode: MetadataMode;
    fileConflictMode: FileConflictMode;
    preserveFolderStructure: boolean;
    outputPath: string;
}

export interface ProcessResult {
    success: boolean;
    originalSize: number;
    newSize: number;
    compressionRatio: number;
    outputPath: string;
    error?: string;
}

// UI State
export interface FileQueueItem extends FileInfo {
    id: string;
    status: "pending" | "processing" | "completed" | "error";
    progress?: number;  // 0-100, for processing files
    result?: ProcessResult;
}
