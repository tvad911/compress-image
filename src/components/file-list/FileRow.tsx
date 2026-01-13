import { FileQueueItem, OutputFormat } from "../../types";
import { useAppStore } from "../../store/appStore";
import { Trash2, Eye, FolderOpen } from "lucide-react";

interface FileRowProps {
    file: FileQueueItem;
    index: number;
    formatSize: (bytes: number) => string;
}

export function FileRow({ file, index, formatSize }: FileRowProps) {
    const selectedFiles = useAppStore((state) => state.selectedFiles);
    const toggleFileSelection = useAppStore((state) => state.toggleFileSelection);
    const removeFile = useAppStore((state) => state.removeFile);
    const setPreview = useAppStore((state) => state.setPreview);
    const config = useAppStore((state) => state.config);

    const isSelected = selectedFiles.has(file.id);

    const getStatusBadge = () => {
        switch (file.status) {
            case "pending":
                return <span className="badge badge-pending">Pending</span>;
            case "processing":
                return (
                    <span className="badge badge-processing">
                        Processing{file.progress !== undefined ? ` ${Math.round(file.progress)}%` : '...'}
                    </span>
                );
            case "completed":
                return (
                    <span className="badge badge-success">
                        Completed
                    </span>
                );
            case "error":
                return <span className="badge badge-error">Error</span>;
        }
    };

    const getCompressionRatio = () => {
        if (file.result && file.result.originalSize > 0) {
            const saved = ((file.result.originalSize - file.result.newSize) / file.result.originalSize) * 100;
            return saved.toFixed(1);
        }
        return null;
    };

    // Estimate compressed size based on settings
    const getEstimatedSize = () => {
        let estimatedRatio = 1.0;

        // Base estimation on output format and quality
        switch (config.outputFormat) {
            case OutputFormat.Png:
                if (config.pngOptions.lossy) {
                    // Lossy PNG can achieve 50-80% reduction depending on quality
                    estimatedRatio = 0.2 + (config.pngOptions.quality / 100) * 0.3;
                } else {
                    // Lossless PNG typically 10-30% reduction
                    estimatedRatio = 0.7 + (config.pngOptions.quality / 100) * 0.2;
                }
                break;
            case OutputFormat.Jpeg:
                // JPEG compression ratio based on quality
                estimatedRatio = 0.1 + (config.jpegOptions.quality / 100) * 0.4;
                break;
            case OutputFormat.WebP:
                if (config.webpOptions.lossy) {
                    // Lossy WebP is very efficient
                    estimatedRatio = 0.15 + (config.webpOptions.quality / 100) * 0.35;
                } else {
                    // Lossless WebP
                    estimatedRatio = 0.6 + (config.webpOptions.quality / 100) * 0.2;
                }
                break;
        }

        // Apply resize factor if enabled
        if (config.resize.enabled) {
            const resizeRatio = 0.5; // Assume 50% size reduction from resize
            estimatedRatio *= resizeRatio;
        }

        return Math.round(file.size * estimatedRatio);
    };

    const estimatedSize = getEstimatedSize();
    const estimatedSavings = ((file.size - estimatedSize) / file.size * 100).toFixed(1);
    const compressionRatio = getCompressionRatio();

    return (
        <div className={`table-row ${isSelected ? "selected" : ""}`}>
            <div className="col-number">{index}</div>
            <div className="col-checkbox">
                <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => toggleFileSelection(file.id)}
                />
            </div>
            <div className="col-name" title={file.path}>
                {file.name}
            </div>
            <div className="col-output-type">
                <span className="format-badge">{config.outputFormat}</span>
            </div>
            <div className="col-size">
                {formatSize(file.size)}
            </div>
            <div className="col-estimated">
                <span className="size-estimated">
                    {formatSize(estimatedSize)}
                    <span className="compression-ratio"> (-{estimatedSavings}%)</span>
                </span>
            </div>
            <div className="col-compressed">
                {file.result ? (
                    <span className="size-new">
                        {formatSize(file.result.newSize)}
                        {compressionRatio && (
                            <span className="compression-ratio"> (-{compressionRatio}%)</span>
                        )}
                    </span>
                ) : (
                    <span className="text-muted">—</span>
                )}
            </div>
            <div className="col-status">{getStatusBadge()}</div>
            <div className="col-actions">
                <button
                    className="btn-icon"
                    onClick={() => setPreview(file.id)}
                    title="Preview"
                >
                    <Eye size={16} />
                </button>
                {file.status === "completed" && file.result?.outputPath && (
                    <button
                        className="btn-icon"
                        onClick={async () => {
                            try {
                                const { invoke } = await import("@tauri-apps/api/core");
                                await invoke("open_output_folder", {
                                    filePath: file.result!.outputPath,
                                });
                            } catch (error) {
                                console.error("Failed to open folder:", error);
                            }
                        }}
                        title="Open Output Folder"
                    >
                        <FolderOpen size={16} />
                    </button>
                )}
                <button
                    className="btn-icon btn-danger"
                    onClick={() => removeFile(file.id)}
                    title="Remove"
                >
                    <Trash2 size={16} />
                </button>
            </div>
        </div>
    );
}
