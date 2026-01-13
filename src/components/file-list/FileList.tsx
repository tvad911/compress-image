import { useAppStore } from "../../store/appStore";
import { FileRow } from "./FileRow";
import { DropZone } from "./DropZone";

export function FileList() {
    const files = useAppStore((state) => state.files);
    const selectedFiles = useAppStore((state) => state.selectedFiles);
    const selectAll = useAppStore((state) => state.selectAll);
    const deselectAll = useAppStore((state) => state.deselectAll);
    const clearFiles = useAppStore((state) => state.clearFiles);

    // Filter state
    const statusFilter = useAppStore((state) => state.statusFilter);
    const setStatusFilter = useAppStore((state) => state.setStatusFilter);
    const getFilteredFiles = useAppStore((state) => state.getFilteredFiles);
    const getStatusCounts = useAppStore((state) => state.getStatusCounts);

    const filteredFiles = getFilteredFiles();
    const counts = getStatusCounts();

    const allSelected = files.length > 0 && selectedFiles.size === files.length;

    const handleToggleAll = () => {
        if (allSelected) {
            deselectAll();
        } else {
            selectAll();
        }
    };

    const formatSize = (bytes: number) => {
        if (bytes === 0) return "0 B";
        const k = 1024;
        const sizes = ["B", "KB", "MB", "GB"];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
    };

    return (
        <div className="file-list-container">
            {files.length === 0 ? (
                <DropZone />
            ) : (
                <>
                    <div className="file-list-header">
                        <div className="file-list-actions">
                            <button
                                onClick={handleToggleAll}
                                className="btn-text"
                                title={allSelected ? "Deselect All" : "Select All"}
                            >
                                {allSelected ? "Deselect All" : "Select All"}
                            </button>
                            <span className="separator">|</span>
                            <button onClick={clearFiles} className="btn-text btn-danger">
                                Clear All
                            </button>
                            <span className="file-count">
                                {selectedFiles.size > 0
                                    ? `${selectedFiles.size} of ${files.length} selected`
                                    : `${files.length} file(s)`}
                            </span>
                        </div>
                    </div>

                    {/* Status Filter Tabs */}
                    <div className="status-filter-tabs">
                        <button
                            className={statusFilter === "all" ? "active" : ""}
                            onClick={() => setStatusFilter("all")}
                        >
                            All ({counts.all})
                        </button>
                        <button
                            className={statusFilter === "pending" ? "active" : ""}
                            onClick={() => setStatusFilter("pending")}
                        >
                            Pending ({counts.pending})
                        </button>
                        <button
                            className={statusFilter === "processing" ? "active" : ""}
                            onClick={() => setStatusFilter("processing")}
                        >
                            Processing ({counts.processing})
                        </button>
                        <button
                            className={statusFilter === "completed" ? "active" : ""}
                            onClick={() => setStatusFilter("completed")}
                        >
                            Completed ({counts.completed})
                        </button>
                        <button
                            className={statusFilter === "error" ? "active" : ""}
                            onClick={() => setStatusFilter("error")}
                        >
                            Error ({counts.error})
                        </button>
                    </div>

                    <div className="file-list-table">
                        <div className="table-header">
                            <div className="col-number">#</div>
                            <div className="col-checkbox">
                                <input
                                    type="checkbox"
                                    checked={allSelected}
                                    onChange={handleToggleAll}
                                />
                            </div>
                            <div className="col-name">Name</div>
                            <div className="col-output-type">Output</div>
                            <div className="col-size">Original</div>
                            <div className="col-estimated">Estimated</div>
                            <div className="col-compressed">Actual</div>
                            <div className="col-status">Status</div>
                            <div className="col-actions">Actions</div>
                        </div>

                        <div className="table-body">
                            {filteredFiles.length === 0 ? (
                                <div className="empty-state">
                                    <p>No files match the current filter</p>
                                </div>
                            ) : (
                                filteredFiles.map((file, index) => (
                                    <FileRow
                                        key={file.id}
                                        file={file}
                                        index={index + 1}
                                        formatSize={formatSize}
                                    />
                                ))
                            )}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
