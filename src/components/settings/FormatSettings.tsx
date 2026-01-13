import { useAppStore } from "../../store/appStore";
import { OutputFormat, MetadataMode } from "../../types";

export function FormatSettings() {
    const config = useAppStore((state) => state.config);
    const updateConfig = useAppStore((state) => state.updateConfig);

    return (
        <div className="settings-section">
            <h3>Output Format</h3>

            <div className="form-group">
                <label>Format</label>
                <select
                    value={config.outputFormat}
                    onChange={(e) =>
                        updateConfig({ outputFormat: e.target.value as OutputFormat })
                    }
                >
                    <option value={OutputFormat.Png}>PNG</option>
                    <option value={OutputFormat.Jpeg}>JPEG</option>
                    <option value={OutputFormat.WebP}>WebP</option>
                </select>
            </div>

            <div className="form-group">
                <label>Metadata</label>
                <select
                    value={config.metadataMode}
                    onChange={(e) =>
                        updateConfig({ metadataMode: e.target.value as MetadataMode })
                    }
                >
                    <option value={MetadataMode.StripAll}>Strip All</option>
                    <option value={MetadataMode.KeepOrientation}>Keep Orientation</option>
                    <option value={MetadataMode.KeepColorProfile}>Keep Color Profile</option>
                </select>
            </div>
        </div>
    );
}
