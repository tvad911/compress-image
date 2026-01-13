import { useAppStore } from "../../store/appStore";
import { invoke } from "@tauri-apps/api/core";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { useState, useEffect } from "react";
import { FileText } from "lucide-react";

export function Header() {
    const files = useAppStore((state) => state.files);
    const setShowLogs = useAppStore((state) => state.setShowLogs);
    const [isMaximized, setIsMaximized] = useState(false);

    useEffect(() => {
        checkMaximized();

        // Listen for window resize events to update maximize state
        const appWindow = getCurrentWindow();
        const unlisten = appWindow.onResized(() => {
            checkMaximized();
        });

        return () => {
            unlisten.then(fn => fn());
        };
    }, []);

    const checkMaximized = async () => {
        try {
            const maximized = await invoke<boolean>("is_maximized");
            setIsMaximized(maximized);
        } catch (error) {
            console.error("Error checking maximized state:", error);
        }
    };

    const handleMinimize = async () => {
        try {
            await invoke("minimize_window");
        } catch (error) {
            console.error("Error minimizing window:", error);
        }
    };

    const handleToggleMaximize = async () => {
        try {
            await invoke("toggle_maximize");
            // Update state immediately for better UX
            setIsMaximized(!isMaximized);
            // Then verify the actual state
            setTimeout(checkMaximized, 100);
        } catch (error) {
            console.error("Error toggling maximize:", error);
        }
    };

    const handleClose = async () => {
        try {
            await invoke("close_window");
        } catch (error) {
            console.error("Error closing window:", error);
        }
    };

    const totalSize = files.reduce((sum, f) => sum + f.size, 0);
    const completedFiles = files.filter((f) => f.status === "completed");
    const totalSaved = completedFiles.reduce(
        (sum, f) => sum + (f.result ? f.result.originalSize - f.result.newSize : 0),
        0
    );

    const formatSize = (bytes: number) => {
        if (bytes === 0) return "0 B";
        const k = 1024;
        const sizes = ["B", "KB", "MB", "GB"];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
    };

    return (
        <header className="header">
            <div className="header-left" data-tauri-drag-region>
                <h1>RustyPixel Forge</h1>
                <p className="subtitle">High-Performance Image Optimizer</p>
            </div>

            <div className="header-stats" data-tauri-drag-region>
                <div className="stat">
                    <span className="stat-label">Files</span>
                    <span className="stat-value">{files.length}</span>
                </div>
                <div className="stat">
                    <span className="stat-label">Total Size</span>
                    <span className="stat-value">{formatSize(totalSize)}</span>
                </div>
                {totalSaved > 0 && (
                    <div className="stat stat-success">
                        <span className="stat-label">Saved</span>
                        <span className="stat-value">{formatSize(totalSaved)}</span>
                    </div>
                )}
                <button
                    className="btn-icon"
                    onClick={() => setShowLogs(true)}
                    title="View Logs"
                    style={{ marginLeft: '12px' }}
                >
                    <FileText size={18} />
                </button>
            </div>

            <div className="window-controls">
                <button
                    className="window-btn"
                    onClick={handleMinimize}
                    title="Minimize"
                    aria-label="Minimize window"
                >
                    <svg width="12" height="12" viewBox="0 0 12 12">
                        <rect x="0" y="5" width="12" height="2" fill="currentColor" />
                    </svg>
                </button>
                <button
                    className="window-btn"
                    onClick={handleToggleMaximize}
                    title={isMaximized ? "Restore" : "Maximize"}
                    aria-label={isMaximized ? "Restore window" : "Maximize window"}
                >
                    {isMaximized ? (
                        <svg width="12" height="12" viewBox="0 0 12 12">
                            <rect x="2.5" y="0.5" width="9" height="9" fill="none" stroke="currentColor" strokeWidth="1.5" />
                            <rect x="0.5" y="2.5" width="9" height="9" fill="var(--bg-secondary)" stroke="currentColor" strokeWidth="1.5" />
                        </svg>
                    ) : (
                        <svg width="12" height="12" viewBox="0 0 12 12">
                            <rect x="0.5" y="0.5" width="11" height="11" fill="none" stroke="currentColor" strokeWidth="1.5" />
                        </svg>
                    )}
                </button>
                <button
                    className="window-btn window-btn-close"
                    onClick={handleClose}
                    title="Close"
                    aria-label="Close window"
                >
                    <svg width="12" height="12" viewBox="0 0 12 12">
                        <path d="M1 1 L11 11 M11 1 L1 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
                </button>
            </div>
        </header>
    );
}
