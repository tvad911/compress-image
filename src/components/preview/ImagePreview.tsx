import { useEffect, useState } from "react";
import { useAppStore } from "../../store/appStore";
import { X, ZoomIn, ZoomOut, Maximize2 } from "lucide-react";
import { invoke } from "@tauri-apps/api/core";

export function ImagePreview() {
    const showPreview = useAppStore((state) => state.showPreview);
    const previewFileId = useAppStore((state) => state.previewFileId);
    const setPreview = useAppStore((state) => state.setPreview);
    const files = useAppStore((state) => state.files);

    const [view, setView] = useState<"original" | "compressed">("original");
    const [originalSrc, setOriginalSrc] = useState<string>("");
    const [compressedSrc, setCompressedSrc] = useState<string>("");
    const [loading, setLoading] = useState(true);
    const [zoom, setZoom] = useState(100);

    const file = files.find((f) => f.id === previewFileId);

    useEffect(() => {
        if (!file || !showPreview) return;

        const loadPreviews = async () => {
            setLoading(true);
            try {
                // Load original image preview
                const originalPreview = await invoke<string>("get_image_preview", {
                    filePath: file.path,
                });
                setOriginalSrc(`data:image/jpeg;base64,${originalPreview}`);

                // Load compressed preview if available
                if (file.status === "completed" && file.result?.outputPath) {
                    try {
                        const compressedPreview = await invoke<string>("get_image_preview", {
                            filePath: file.result.outputPath,
                        });
                        setCompressedSrc(`data:image/jpeg;base64,${compressedPreview}`);
                    } catch (err) {
                        console.error("Failed to load compressed preview:", err);
                    }
                }
            } catch (error) {
                console.error("Failed to load preview:", error);
            } finally {
                setLoading(false);
            }
        };

        loadPreviews();
    }, [file, showPreview]);

    if (!showPreview || !file) return null;

    const handleClose = () => {
        setPreview(null);
        setZoom(100);
    };

    const handleZoomIn = () => setZoom((z) => Math.min(z + 25, 200));
    const handleZoomOut = () => setZoom((z) => Math.max(z - 25, 25));
    const handleZoomReset = () => setZoom(100);

    const canShowCompressed = file.status === "completed" && compressedSrc;

    return (
        <div className="preview-modal-overlay" onClick={handleClose}>
            <div className="preview-modal" onClick={(e) => e.stopPropagation()}>
                {/* Header */}
                <div className="preview-header">
                    <div className="preview-title">
                        <h3>{file.name}</h3>
                        <p className="preview-subtitle">
                            {file.size ? `${(file.size / 1024 / 1024).toFixed(2)} MB` : ""}
                            {file.result && ` → ${(file.result.newSize / 1024 / 1024).toFixed(2)} MB`}
                            {file.result && ` (${file.result.compressionRatio.toFixed(1)}%)`}
                        </p>
                    </div>

                    <div className="preview-controls">
                        <button onClick={handleZoomOut} title="Zoom Out" disabled={zoom <= 25}>
                            <ZoomOut size={16} />
                        </button>
                        <span className="zoom-level">{zoom}%</span>
                        <button onClick={handleZoomIn} title="Zoom In" disabled={zoom >= 200}>
                            <ZoomIn size={16} />
                        </button>
                        <button onClick={handleZoomReset} title="Reset Zoom">
                            <Maximize2 size={16} />
                        </button>
                        <button onClick={handleClose} className="close-btn" title="Close">
                            <X size={20} />
                        </button>
                    </div>
                </div>

                {/* View Tabs */}
                <div className="preview-tabs">
                    <button
                        className={view === "original" ? "active" : ""}
                        onClick={() => setView("original")}
                    >
                        Original
                    </button>
                    <button
                        className={view === "compressed" ? "active" : ""}
                        onClick={() => setView("compressed")}
                        disabled={!canShowCompressed}
                    >
                        Compressed {!canShowCompressed && "(Not available)"}
                    </button>
                </div>

                {/* Image Display */}
                <div className="preview-content">
                    {loading ? (
                        <div className="preview-loading">
                            <div className="spinner"></div>
                            <p>Loading preview...</p>
                        </div>
                    ) : (
                        <div className="preview-image-container">
                            {view === "original" && originalSrc && (
                                <img
                                    src={originalSrc}
                                    alt="Original"
                                    style={{ transform: `scale(${zoom / 100})` }}
                                />
                            )}
                            {view === "compressed" && compressedSrc && (
                                <img
                                    src={compressedSrc}
                                    alt="Compressed"
                                    style={{ transform: `scale(${zoom / 100})` }}
                                />
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
