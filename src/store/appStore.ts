import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import {
    FileQueueItem,
    ProcessConfig,
    ProcessResult,
    OutputFormat,
    ResizeMode,
    ResizeAlgorithm,
    MetadataMode,
    FileConflictMode,
    PngEncoder,
    JpegEncoder,
    WebPEncoder,
} from "../types";

type StatusFilter = "all" | "pending" | "processing" | "completed" | "error";

interface LogEntry {
    timestamp: string;
    level: "info" | "success" | "warning" | "error";
    message: string;
}

interface AppState {
    // File queue
    files: FileQueueItem[];
    selectedFiles: Set<string>;
    statusFilter: StatusFilter;
    basePath: string | null;  // Base path for folder structure

    // Processing config
    config: ProcessConfig;

    // UI state
    isProcessing: boolean;
    currentProcessingIndex: number;
    processingAborted: boolean;
    showPreview: boolean;
    previewFileId: string | null;
    showLogs: boolean;
    logs: LogEntry[];

    // Actions
    addFiles: (files: FileQueueItem[]) => void;
    removeFile: (id: string) => void;
    clearFiles: () => void;
    toggleFileSelection: (id: string) => void;
    selectAll: () => void;
    deselectAll: () => void;
    setBasePath: (path: string | null) => void;

    updateConfig: (config: Partial<ProcessConfig>) => void;
    updateResizeConfig: (resize: Partial<ProcessConfig["resize"]>) => void;
    updatePngOptions: (options: Partial<ProcessConfig["pngOptions"]>) => void;
    updateJpegOptions: (options: Partial<ProcessConfig["jpegOptions"]>) => void;
    updateWebPOptions: (options: Partial<ProcessConfig["webpOptions"]>) => void;

    setProcessing: (processing: boolean) => void;
    setCurrentProcessingIndex: (index: number) => void;
    updateFileStatus: (id: string, status: FileQueueItem["status"], result?: FileQueueItem["result"]) => void;
    stopProcessing: () => void;
    startProcessing: () => Promise<void>;

    setStatusFilter: (filter: StatusFilter) => void;
    getFilteredFiles: () => FileQueueItem[];
    getStatusCounts: () => Record<StatusFilter, number>;

    setPreview: (fileId: string | null) => void;

    setShowLogs: (show: boolean) => void;
    addLog: (level: LogEntry["level"], message: string) => void;
    clearLogs: () => void;
}

export const useAppStore = create<AppState>()(
    persist(
        (set, get) => ({
            // Initial state
            files: [],
            selectedFiles: new Set(),
            statusFilter: "all",
            basePath: null,

            config: {
                outputFormat: OutputFormat.Jpeg,  // Changed from Png to Jpeg for better JPG compression
                resize: {
                    enabled: false,
                    mode: ResizeMode.Percentage,
                    algorithm: ResizeAlgorithm.Lanczos3,
                    scale: 100,
                },
                pngOptions: {
                    encoder: PngEncoder.Imagequant,
                    lossy: true,  // Enable lossy compression for smaller files
                    quality: 80,  // Reduce from 85 to 80 for better compression
                    dithering: true,
                    preserveTransparency: true,
                },
                jpegOptions: {
                    encoder: JpegEncoder.Standard,
                    quality: 60,  // Reduced to 60 to avoid enlarging already-compressed JPGs
                    progressive: true,
                    optimizeCoding: true,
                },
                webpOptions: {
                    encoder: WebPEncoder.LibWebP,
                    lossy: true,
                    quality: 85,
                    method: 4,
                },
                metadataMode: MetadataMode.StripAll,
                fileConflictMode: FileConflictMode.Rename,
                preserveFolderStructure: false,
                outputPath: "/tmp/optimized",
            },

            isProcessing: false,
            currentProcessingIndex: 0,
            processingAborted: false,
            showPreview: false,
            previewFileId: null,
            showLogs: false,
            logs: [],

            // Actions
            addFiles: (newFiles) =>
                set((state) => ({
                    files: [...state.files, ...newFiles],
                })),

            removeFile: (id) =>
                set((state) => ({
                    files: state.files.filter((f) => f.id !== id),
                    selectedFiles: new Set(
                        Array.from(state.selectedFiles).filter((fid) => fid !== id)
                    ),
                })),

            clearFiles: () =>
                set({
                    files: [],
                    selectedFiles: new Set(),
                }),

            toggleFileSelection: (id) =>
                set((state) => {
                    const newSelected = new Set(state.selectedFiles);
                    if (newSelected.has(id)) {
                        newSelected.delete(id);
                    } else {
                        newSelected.add(id);
                    }
                    return { selectedFiles: newSelected };
                }),

            selectAll: () =>
                set((state) => ({
                    selectedFiles: new Set(state.files.map((f) => f.id)),
                })),

            deselectAll: () =>
                set({
                    selectedFiles: new Set(),
                }),

            setBasePath: (path) =>
                set({
                    basePath: path,
                }),

            updateConfig: (config) =>
                set((state) => ({
                    config: { ...state.config, ...config },
                })),

            updateResizeConfig: (resize) =>
                set((state) => ({
                    config: {
                        ...state.config,
                        resize: { ...state.config.resize, ...resize },
                    },
                })),

            updatePngOptions: (options) =>
                set((state) => ({
                    config: {
                        ...state.config,
                        pngOptions: { ...state.config.pngOptions, ...options },
                    },
                })),

            updateJpegOptions: (options) =>
                set((state) => ({
                    config: {
                        ...state.config,
                        jpegOptions: { ...state.config.jpegOptions, ...options },
                    },
                })),

            updateWebPOptions: (options) =>
                set((state) => ({
                    config: {
                        ...state.config,
                        webpOptions: { ...state.config.webpOptions, ...options },
                    },
                })),

            setProcessing: (processing) =>
                set({ isProcessing: processing }),

            setCurrentProcessingIndex: (index) =>
                set({ currentProcessingIndex: index }),

            updateFileStatus: (id, status, result) =>
                set((state) => ({
                    files: state.files.map((f) =>
                        f.id === id ? { ...f, status, result } : f
                    ),
                })),

            stopProcessing: () =>
                set({ processingAborted: true, isProcessing: false }),

            startProcessing: async () => {
                const state = get();
                const filesToProcess = state.getFilteredFiles().filter(f => f.status === "pending");

                if (filesToProcess.length === 0) return;

                set({ isProcessing: true, processingAborted: false });

                // Log start
                get().addLog("info", `🚀 Starting batch processing...`);
                get().addLog("info", `📁 Processing ${filesToProcess.length} file(s)`);

                for (let i = 0; i < filesToProcess.length; i++) {
                    const currentState = get();
                    if (currentState.processingAborted) break;

                    const file = filesToProcess[i];
                    set({ currentProcessingIndex: i });

                    // Update status to processing
                    get().updateFileStatus(file.id, "processing");

                    // Log file processing
                    get().addLog("info", `⚙️ Processing: ${file.name} (${(file.size / 1024 / 1024).toFixed(2)} MB)`);

                    try {
                        // Import invoke dynamically
                        const { invoke } = await import("@tauri-apps/api/core");

                        // Transform config to match Rust format
                        const getModeKey = (mode: ResizeMode): string => {
                            // Convert enum to camelCase key
                            return mode; // Already camelCase after enum fix
                        };

                        const rustConfig = {
                            outputFormat: state.config.outputFormat,
                            resize: {
                                enabled: state.config.resize.enabled,
                                mode: state.config.resize.enabled ? {
                                    [getModeKey(state.config.resize.mode)]: state.config.resize.mode === ResizeMode.Percentage
                                        ? { scale: state.config.resize.scale || 100 }
                                        : state.config.resize.mode === ResizeMode.FixedWidth
                                            ? { width: state.config.resize.width || 800 }
                                            : state.config.resize.mode === ResizeMode.FixedHeight
                                                ? { height: state.config.resize.height || 600 }
                                                : state.config.resize.mode === ResizeMode.Exact
                                                    ? { width: state.config.resize.width || 800, height: state.config.resize.height || 600 }
                                                    : state.config.resize.mode === ResizeMode.FitBox
                                                        ? { maxWidth: state.config.resize.maxWidth || 1920, maxHeight: state.config.resize.maxHeight || 1080 }
                                                        : { width: state.config.resize.width || 800, height: state.config.resize.height || 600 }
                                } : { percentage: { scale: 100 } },
                                algorithm: state.config.resize.algorithm,
                            },
                            pngOptions: state.config.pngOptions,
                            jpegOptions: state.config.jpegOptions,
                            webpOptions: state.config.webpOptions,
                            metadataMode: state.config.metadataMode,
                            fileConflictMode: state.config.fileConflictMode,
                            preserveFolderStructure: state.config.preserveFolderStructure,
                            basePath: state.basePath,
                            outputPath: state.config.outputPath,
                        };

                        // Call backend process command
                        const result = await invoke<ProcessResult>("process_single_image", {
                            inputPath: file.path,
                            config: rustConfig,
                        });

                        // Update with result
                        get().updateFileStatus(file.id, "completed", {
                            success: result.success,
                            originalSize: result.originalSize,
                            newSize: result.newSize,
                            compressionRatio: result.compressionRatio,
                            outputPath: result.outputPath,
                            error: result.error,
                        });

                        // Log success
                        const savedMB = ((result.originalSize - result.newSize) / 1024 / 1024).toFixed(2);
                        const ratio = result.compressionRatio.toFixed(1);
                        get().addLog("success", `✅ ${file.name} - Saved ${savedMB} MB (${ratio}%)`);
                    } catch (error) {
                        console.error("Processing error:", error);
                        get().updateFileStatus(file.id, "error");

                        // Log error
                        get().addLog("error", `❌ ${file.name} - Error: ${error}`);
                    }
                }

                set({ isProcessing: false, processingAborted: false });

                // Log completion
                const completed = get().files.filter(f => f.status === "completed").length;
                const errors = get().files.filter(f => f.status === "error").length;
                get().addLog("success", `🎉 Batch complete! ${completed} succeeded, ${errors} failed`);
            },

            setStatusFilter: (filter) =>
                set({ statusFilter: filter }),

            getFilteredFiles: () => {
                const state = get();
                if (state.statusFilter === "all") {
                    return state.files;
                }
                return state.files.filter(f => f.status === state.statusFilter);
            },

            getStatusCounts: () => {
                const state = get();
                const counts: Record<StatusFilter, number> = {
                    all: state.files.length,
                    pending: 0,
                    processing: 0,
                    completed: 0,
                    error: 0,
                };

                state.files.forEach(file => {
                    counts[file.status]++;
                });

                return counts;
            },

            setPreview: (fileId) =>
                set({
                    showPreview: fileId !== null,
                    previewFileId: fileId,
                }),

            setShowLogs: (show) => set({ showLogs: show }),

            addLog: (level, message) =>
                set((state) => ({
                    logs: [
                        ...state.logs,
                        {
                            timestamp: new Date().toLocaleTimeString(),
                            level,
                            message,
                        },
                    ],
                })),

            clearLogs: () => set({ logs: [] }),
        }),
        {
            name: "rusty-pixel-forge-storage",
            storage: createJSONStorage(() => localStorage),
            partialize: (state) => ({
                files: state.files,
                config: state.config,
                basePath: state.basePath,
                statusFilter: state.statusFilter,
                isProcessing: state.isProcessing,
                currentProcessingIndex: state.currentProcessingIndex,
                // Don't persist:
                // - selectedFiles (Set can't be serialized)
                // - processingAborted (reset on reload)
                // - showPreview, previewFileId (UI state)
            }),
        }
    )
);
