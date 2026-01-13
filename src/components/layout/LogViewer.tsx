import { useAppStore } from "../../store/appStore";
import { X, Trash2 } from "lucide-react";
import "./LogViewer.css";

export function LogViewer() {
    const showLogs = useAppStore((state) => state.showLogs);
    const logs = useAppStore((state) => state.logs);
    const setShowLogs = useAppStore((state) => state.setShowLogs);
    const clearLogs = useAppStore((state) => state.clearLogs);

    if (!showLogs) return null;

    const getLogClass = (level: string) => {
        switch (level) {
            case "error":
                return "log-error";
            case "warning":
                return "log-warning";
            case "success":
                return "log-success";
            default:
                return "log-info";
        }
    };

    return (
        <div className="log-viewer-overlay" onClick={() => setShowLogs(false)}>
            <div className="log-viewer" onClick={(e) => e.stopPropagation()}>
                <div className="log-header">
                    <h3>Processing Logs</h3>
                    <div className="log-actions">
                        <button onClick={clearLogs} className="btn-icon" title="Clear Logs">
                            <Trash2 size={16} />
                        </button>
                        <button onClick={() => setShowLogs(false)} className="btn-icon" title="Close">
                            <X size={20} />
                        </button>
                    </div>
                </div>

                <div className="log-content">
                    {logs.length === 0 ? (
                        <div className="log-empty">
                            <p>No logs yet. Start processing to see logs.</p>
                        </div>
                    ) : (
                        logs.map((log, index) => (
                            <div key={index} className={`log-entry ${getLogClass(log.level)}`}>
                                <span className="log-time">{log.timestamp}</span>
                                <span className="log-level">[{log.level.toUpperCase()}]</span>
                                <span className="log-message">{log.message}</span>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
