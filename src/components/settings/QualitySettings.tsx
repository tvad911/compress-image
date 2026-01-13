import { useAppStore } from "../../store/appStore";
import { OutputFormat, PngEncoder, JpegEncoder, WebPEncoder } from "../../types";

export function QualitySettings() {
    const config = useAppStore((state) => state.config);
    const updatePngOptions = useAppStore((state) => state.updatePngOptions);
    const updateJpegOptions = useAppStore((state) => state.updateJpegOptions);
    const updateWebPOptions = useAppStore((state) => state.updateWebPOptions);

    return (
        <div className="settings-section">
            <h3>Quality & Compression</h3>

            {config.outputFormat === OutputFormat.Png && (
                <>
                    <div className="form-group">
                        <label>Encoder Library</label>
                        <select
                            value={config.pngOptions.encoder}
                            onChange={(e) =>
                                updatePngOptions({ encoder: e.target.value as PngEncoder })
                            }
                        >
                            <option value={PngEncoder.Imagequant}>
                                Imagequant (Best for lossy)
                            </option>
                            <option value={PngEncoder.Standard}>
                                Standard PNG (Lossless)
                            </option>
                            <option value={PngEncoder.OxiPng}>
                                OxiPNG (Optimized lossless)
                            </option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label className="checkbox-label">
                            <input
                                type="checkbox"
                                checked={config.pngOptions.lossy}
                                onChange={(e) =>
                                    updatePngOptions({ lossy: e.target.checked })
                                }
                            />
                            <span>lossy compression (TinyPNG-style)</span>
                        </label>
                    </div>

                    {config.pngOptions.lossy && (
                        <>
                            <div className="form-group">
                                <label>
                                    Quality: {config.pngOptions.quality}
                                    <span className="label-hint">
                                        (Higher = More colors, larger file)
                                    </span>
                                </label>
                                <input
                                    type="range"
                                    min="0"
                                    max="100"
                                    value={config.pngOptions.quality}
                                    onChange={(e) =>
                                        updatePngOptions({ quality: parseInt(e.target.value) })
                                    }
                                />
                            </div>

                            <div className="form-group">
                                <label className="checkbox-label">
                                    <input
                                        type="checkbox"
                                        checked={config.pngOptions.dithering}
                                        onChange={(e) =>
                                            updatePngOptions({ dithering: e.target.checked })
                                        }
                                    />
                                    <span>enable dithering</span>
                                </label>
                            </div>
                        </>
                    )}

                    <div className="form-group">
                        <label className="checkbox-label">
                            <input
                                type="checkbox"
                                checked={config.pngOptions.preserveTransparency}
                                onChange={(e) =>
                                    updatePngOptions({ preserveTransparency: e.target.checked })
                                }
                            />
                            <span>preserve transparency</span>
                        </label>
                    </div>
                </>
            )}

            {config.outputFormat === OutputFormat.Jpeg && (
                <>
                    <div className="form-group">
                        <label>Encoder Library</label>
                        <select
                            value={config.jpegOptions.encoder}
                            onChange={(e) =>
                                updateJpegOptions({ encoder: e.target.value as JpegEncoder })
                            }
                        >
                            <option value={JpegEncoder.MozJpeg}>
                                MozJPEG (Best compression)
                            </option>
                            <option value={JpegEncoder.Standard}>
                                Standard JPEG (Fast)
                            </option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label>
                            Quality: {config.jpegOptions.quality}
                            <span className="label-hint">(0-100)</span>
                        </label>
                        <input
                            type="range"
                            min="0"
                            max="100"
                            value={config.jpegOptions.quality}
                            onChange={(e) =>
                                updateJpegOptions({ quality: parseInt(e.target.value) })
                            }
                        />
                    </div>

                    <div className="form-group">
                        <label className="checkbox-label">
                            <input
                                type="checkbox"
                                checked={config.jpegOptions.progressive}
                                onChange={(e) =>
                                    updateJpegOptions({ progressive: e.target.checked })
                                }
                            />
                            <span>progressive JPEG (web-optimized)</span>
                        </label>
                    </div>

                    <div className="form-group">
                        <label className="checkbox-label">
                            <input
                                type="checkbox"
                                checked={config.jpegOptions.optimizeCoding}
                                onChange={(e) =>
                                    updateJpegOptions({ optimizeCoding: e.target.checked })
                                }
                            />
                            <span>optimize Huffman tables</span>
                        </label>
                    </div>
                </>
            )}

            {config.outputFormat === OutputFormat.WebP && (
                <>
                    <div className="form-group">
                        <label>Encoder Library</label>
                        <select
                            value={config.webpOptions.encoder}
                            onChange={(e) =>
                                updateWebPOptions({ encoder: e.target.value as WebPEncoder })
                            }
                        >
                            <option value={WebPEncoder.LibWebP}>
                                libwebp (Standard)
                            </option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label className="checkbox-label">
                            <input
                                type="checkbox"
                                checked={config.webpOptions.lossy}
                                onChange={(e) =>
                                    updateWebPOptions({ lossy: e.target.checked })
                                }
                            />
                            <span>lossy compression</span>
                        </label>
                    </div>

                    <div className="form-group">
                        <label>
                            Quality: {config.webpOptions.quality}
                            <span className="label-hint">(0-100)</span>
                        </label>
                        <input
                            type="range"
                            min="0"
                            max="100"
                            value={config.webpOptions.quality}
                            onChange={(e) =>
                                updateWebPOptions({ quality: parseInt(e.target.value) })
                            }
                        />
                    </div>

                    <div className="form-group">
                        <label>
                            Compression Method: {config.webpOptions.method}
                            <span className="label-hint">(0=Fast, 6=Best)</span>
                        </label>
                        <input
                            type="range"
                            min="0"
                            max="6"
                            value={config.webpOptions.method}
                            onChange={(e) =>
                                updateWebPOptions({ method: parseInt(e.target.value) })
                            }
                        />
                    </div>
                </>
            )}
        </div>
    );
}
