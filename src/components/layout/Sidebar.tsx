import { FormatSettings } from "../settings/FormatSettings";
import { ResizeSettings } from "../settings/ResizeSettings";
import { QualitySettings } from "../settings/QualitySettings";
import { OutputSettings } from "../settings/OutputSettings";

export function Sidebar() {
    return (
        <aside className="sidebar">
            <div className="sidebar-header">
                <h2>Settings</h2>
            </div>

            <div className="sidebar-content">
                <FormatSettings />
                <ResizeSettings />
                <QualitySettings />
                <OutputSettings />
            </div>
        </aside>
    );
}
