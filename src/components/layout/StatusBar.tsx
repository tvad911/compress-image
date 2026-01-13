import { useAppStore } from "../../store/appStore";
import { Play, Square } from "lucide-react";

export function StatusBar() {
    const files = useAppStore((state) => state.files);
    const selectedFiles = useAppStore((state) => state.selectedFiles);
    const isProcessing = useAppStore((state) => state.isProcessing);
    const currentProcessingIndex = useAppStore((state) => state.currentProcessingIndex);
    const startProcessing = useAppStore((state) => state.startProcessing);
    const stopProcessing = useAppStore((state) => state.stopProcessing);

    const pendingFiles = files.filter((f) => f.status === "pending");
    const completedFiles = files.filter((f) => f.status === "completed");
    const errorFiles = files.filter((f) => f.status === "error");

    const handleStart = () => {
        startProcessing();
    };

    const handleStop = () => {
        stopProcessing();
    };

    const getProgress = () => {
        if (files.length === 0) return 0;
        return (completedFiles.length / files.length) * 100;
    };

    return (
        <div className="status-bar">
            <div className="status-bar-left">
                <div className="progress-container">
                    <div className="progress-bar">
                        <div
                            className="progress-fill"
                            style={{ width: `${getProgress()}%` }}
                        />
                    </div>
                    <span className="progress-text">
                        {isProcessing
                            ? `Processing ${currentProcessingIndex + 1} of ${files.length} (${Math.round(getProgress())}%)...`
                            : `${completedFiles.length} of ${files.length} completed (${Math.round(getProgress())}%)`}
                    </span>
                </div>
            </div>

            <div className="status-bar-center">
                <div className="status-stats">
                    <span className="stat-item">
                        <span className="stat-label">Pending:</span>
                        <span className="stat-value">{pendingFiles.length}</span>
                    </span>
                    <span className="stat-item">
                        <span className="stat-label">Completed:</span>
                        <span className="stat-value stat-success">{completedFiles.length}</span>
                    </span>
                    {errorFiles.length > 0 && (
                        <span className="stat-item">
                            <span className="stat-label">Errors:</span>
                            <span className="stat-value stat-error">{errorFiles.length}</span>
                        </span>
                    )}
                </div>
            </div>

            <div className="status-bar-right">
                {!isProcessing ? (
                    <button
                        onClick={handleStart}
                        disabled={selectedFiles.size === 0}
                        className="btn-primary btn-large"
                    >
                        <Play size={16} />
                        Start Processing
                    </button>
                ) : (
                    <button onClick={handleStop} className="btn-warning btn-large">
                        <Square size={16} />
                        Stop
                    </button>
                )}
            </div>
        </div>
    );
}
