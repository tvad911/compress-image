import { useState } from "react";
import { useAppStore } from "../../store/appStore";
import { Folder } from "lucide-react";
import { invoke } from "@tauri-apps/api/core";

export function OutputSettings() {
    const outputPath = useAppStore((state) => state.config.outputPath);
    const updateConfig = useAppStore((state) => state.updateConfig);
    const [localPath, setLocalPath] = useState(outputPath);

    const handleSelectFolder = async () => {
        try {
            // Use Tauri's dialog command
            const selected = await invoke<string | null>("plugin:dialog|open", {
                options: {
                    directory: true,
                    multiple: false,
                    title: "Select Output Folder",
                }
            });

            if (selected) {
                setLocalPath(selected);
                updateConfig({ outputPath: selected });
            }
        } catch (error) {
            console.error("Failed to select folder:", error);
        }
    };

    return (
        <div className="settings-section">
            <h3>Output</h3>

            <div className="form-group">
                <label>Output Folder</label>
                <div className="input-with-button">
                    <input
                        type="text"
                        value={localPath}
                        onChange={(e) => setLocalPath(e.target.value)}
                        onBlur={() => updateConfig({ outputPath: localPath })}
                        placeholder="/path/to/output"
                    />
                    <button onClick={handleSelectFolder} className="btn-secondary">
                        <Folder size={14} />
                        Browse
                    </button>
                </div>
            </div>

            <div className="form-group">
                <label>File Conflict</label>
                <select
                    value={useAppStore((state) => state.config.fileConflictMode)}
                    onChange={(e) => updateConfig({
                        fileConflictMode: e.target.value as any
                    })}
                >
                    <option value="overwrite">Overwrite existing files</option>
                    <option value="rename">Rename (add number)</option>
                    <option value="skip">Skip existing files</option>
                </select>
                <p className="hint">
                    How to handle files that already exist in the output folder.
                </p>
            </div>

            <div className="form-group">
                <label className="checkbox-label">
                    <input
                        type="checkbox"
                        checked={useAppStore((state) => state.config.preserveFolderStructure)}
                        onChange={(e) => updateConfig({
                            preserveFolderStructure: e.target.checked
                        })}
                    />
                    <span>Preserve folder structure</span>
                </label>
                <p className="hint">
                    Maintain the original directory hierarchy in output folder.
                    <br />
                    Example: <code>/photos/2024/img.jpg</code> → <code>/output/2024/img_optimized.png</code>
                </p>
            </div>

            <div className="form-group">
                <p className="hint">
                    Processed images will be saved to this folder with "_optimized" suffix.
                </p>
            </div>
        </div>
    );
}
