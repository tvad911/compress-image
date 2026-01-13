import { useAppStore } from "../../store/appStore";
import { ResizeMode, ResizeAlgorithm } from "../../types";

export function ResizeSettings() {
    const resize = useAppStore((state) => state.config.resize);
    const updateResizeConfig = useAppStore((state) => state.updateResizeConfig);

    return (
        <div className="settings-section">
            <h3>Resize</h3>

            <div className="form-group">
                <label className="checkbox-label">
                    <input
                        type="checkbox"
                        checked={resize.enabled}
                        onChange={(e) => updateResizeConfig({ enabled: e.target.checked })}
                    />
                    <span>enable resize</span>
                </label>
            </div>

            {resize.enabled && (
                <>
                    <div className="form-group">
                        <label>Mode</label>
                        <select
                            value={resize.mode}
                            onChange={(e) =>
                                updateResizeConfig({ mode: e.target.value as ResizeMode })
                            }
                        >
                            <option value={ResizeMode.Percentage}>Percentage</option>
                            <option value={ResizeMode.FixedWidth}>Fixed Width</option>
                            <option value={ResizeMode.FixedHeight}>Fixed Height</option>
                            <option value={ResizeMode.Exact}>Exact Dimensions</option>
                            <option value={ResizeMode.FitBox}>Fit in Box</option>
                            <option value={ResizeMode.FillBox}>Fill Box</option>
                        </select>
                    </div>

                    {resize.mode === ResizeMode.Percentage && (
                        <div className="form-group">
                            <label>Scale (%)</label>
                            <input
                                type="number"
                                min="1"
                                max="200"
                                value={resize.scale || 100}
                                onChange={(e) =>
                                    updateResizeConfig({ scale: parseInt(e.target.value) })
                                }
                            />
                        </div>
                    )}

                    {resize.mode === ResizeMode.FixedWidth && (
                        <div className="form-group">
                            <label>Width (px)</label>
                            <input
                                type="number"
                                min="1"
                                value={resize.width || 800}
                                onChange={(e) =>
                                    updateResizeConfig({ width: parseInt(e.target.value) })
                                }
                            />
                        </div>
                    )}

                    {resize.mode === ResizeMode.FixedHeight && (
                        <div className="form-group">
                            <label>Height (px)</label>
                            <input
                                type="number"
                                min="1"
                                value={resize.height || 600}
                                onChange={(e) =>
                                    updateResizeConfig({ height: parseInt(e.target.value) })
                                }
                            />
                        </div>
                    )}

                    {(resize.mode === ResizeMode.Exact || resize.mode === ResizeMode.FillBox) && (
                        <>
                            <div className="form-group">
                                <label>Width (px)</label>
                                <input
                                    type="number"
                                    min="1"
                                    value={resize.width || 800}
                                    onChange={(e) =>
                                        updateResizeConfig({ width: parseInt(e.target.value) })
                                    }
                                />
                            </div>
                            <div className="form-group">
                                <label>Height (px)</label>
                                <input
                                    type="number"
                                    min="1"
                                    value={resize.height || 600}
                                    onChange={(e) =>
                                        updateResizeConfig({ height: parseInt(e.target.value) })
                                    }
                                />
                            </div>
                        </>
                    )}

                    {resize.mode === ResizeMode.FitBox && (
                        <>
                            <div className="form-group">
                                <label>Max Width (px)</label>
                                <input
                                    type="number"
                                    min="1"
                                    value={resize.maxWidth || 1920}
                                    onChange={(e) =>
                                        updateResizeConfig({ maxWidth: parseInt(e.target.value) })
                                    }
                                />
                            </div>
                            <div className="form-group">
                                <label>Max Height (px)</label>
                                <input
                                    type="number"
                                    min="1"
                                    value={resize.maxHeight || 1080}
                                    onChange={(e) =>
                                        updateResizeConfig({ maxHeight: parseInt(e.target.value) })
                                    }
                                />
                            </div>
                        </>
                    )}

                    <div className="form-group">
                        <label>Algorithm</label>
                        <select
                            value={resize.algorithm}
                            onChange={(e) =>
                                updateResizeConfig({ algorithm: e.target.value as ResizeAlgorithm })
                            }
                        >
                            <option value={ResizeAlgorithm.Lanczos3}>Lanczos3 (Best Quality)</option>
                            <option value={ResizeAlgorithm.CatmullRom}>CatmullRom (Balanced)</option>
                            <option value={ResizeAlgorithm.Mitchell}>Mitchell (Sharp)</option>
                            <option value={ResizeAlgorithm.Nearest}>Nearest (Fastest)</option>
                        </select>
                    </div>
                </>
            )}
        </div>
    );
}
