import { useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { useAppStore } from "../../store/appStore";
import { FileInfo, FileQueueItem } from "../../types";
import { Upload, FolderOpen } from "lucide-react";

export function DropZone() {
    const addFiles = useAppStore((state) => state.addFiles);
    const setBasePath = useAppStore((state) => state.setBasePath);
    const [isDragging, setIsDragging] = useState(false);

    const handleAddFiles = async () => {
        try {
            const selected = await invoke<string[] | string | null>("plugin:dialog|open", {
                options: {
                    multiple: true,
                    filters: [{
                        name: "Images",
                        extensions: ["png", "jpg", "jpeg", "webp", "bmp", "tiff", "gif"],
                    }],
                }
            });

            if (selected) {
                const paths = Array.isArray(selected) ? selected : [selected];
                await loadFiles(paths);
            }
        } catch (error) {
            console.error("Failed to select files:", error);
        }
    };

    const handleAddFolder = async () => {
        try {
            const selected = await invoke<string | null>("plugin:dialog|open", {
                options: {
                    directory: true,
                    multiple: false,
                }
            });

            if (selected) {
                // Store base path for folder structure preservation
                setBasePath(selected);

                const files = await invoke<FileInfo[]>("scan_directory", {
                    path: selected,
                    recursive: true,
                    maxDepth: 10,
                });

                const queueItems: FileQueueItem[] = files.map((f) => ({
                    ...f,
                    id: `${f.path}-${Date.now()}-${Math.random()}`,
                    status: "pending" as const,
                }));

                addFiles(queueItems);
            }
        } catch (error) {
            console.error("Failed to scan folder:", error);
        }
    };

    const loadFiles = async (paths: string[]) => {
        try {
            const fileInfos = await Promise.all(
                paths.map((path) =>
                    invoke<FileInfo>("get_file_info_command", { path })
                )
            );

            const queueItems: FileQueueItem[] = fileInfos.map((f) => ({
                ...f,
                id: `${f.path}-${Date.now()}-${Math.random()}`,
                status: "pending" as const,
            }));

            addFiles(queueItems);
        } catch (error) {
            console.error("Failed to load files:", error);
        }
    };

    return (
        <div
            className={`drop-zone ${isDragging ? "dragging" : ""}`}
            onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={(e) => {
                e.preventDefault();
                setIsDragging(false);
                // TODO: Handle file drop when Tauri supports it
            }}
        >
            <div className="drop-zone-content">
                <Upload size={32} className="drop-zone-icon" />
                <h3>Drop images here or</h3>
                <div className="drop-zone-buttons">
                    <button onClick={handleAddFiles} className="btn-primary">
                        <Upload size={14} />
                        Select Files
                    </button>
                    <button onClick={handleAddFolder} className="btn-secondary">
                        <FolderOpen size={14} />
                        Select Folder
                    </button>
                </div>
                <p className="drop-zone-hint">
                    PNG, JPG, WebP, BMP, TIFF, GIF
                </p>
            </div>
        </div>
    );
}
