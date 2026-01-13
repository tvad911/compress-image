# Implementation Plan - Advanced Features

## Overview
Thêm các tính năng nâng cao cho RustyPixel Forge:
1. Preview ảnh gốc và sau compress
2. Processing với filter theo status
3. Stop processing
4. Filter files theo status
5. Preserve folder structure

---

## 1. Preview Images (Xem ảnh gốc & sau compress)

### Frontend
- [ ] Tạo `ImagePreview` component modal
- [ ] Hiển thị ảnh gốc và ảnh compressed side-by-side
- [ ] Zoom in/out, pan
- [ ] Hiển thị thông tin: size, dimensions, format
- [ ] Keyboard shortcuts (ESC to close, arrow keys to navigate)

### Backend
- [ ] Command `get_image_preview` - Load ảnh gốc
- [ ] Command `get_compressed_preview` - Load ảnh đã compress
- [ ] Convert image to base64 hoặc data URL
- [ ] Handle large images (resize for preview)

### UI/UX
- [ ] Click vào Eye icon → Mở preview modal
- [ ] Tabs: "Original" | "Compressed" | "Compare"
- [ ] Slider để compare (before/after)

---

## 2. Start Processing với Filter

### Store Updates
- [ ] Add `isProcessing` state
- [ ] Add `currentProcessingId` state
- [ ] Add `processingAborted` flag
- [ ] Add `statusFilter` state

### Processing Logic
- [ ] Filter files theo status trước khi process
- [ ] Process từng file tuần tự
- [ ] Update progress real-time
- [ ] Handle errors gracefully
- [ ] Skip files nếu aborted

### UI
- [ ] Start button disabled khi đang process
- [ ] Progress bar hiển thị % complete
- [ ] Current file being processed highlight
- [ ] Estimated time remaining

---

## 3. Stop Processing

### Implementation
- [ ] Add `stopProcessing()` action to store
- [ ] Set abort flag
- [ ] Current file completes, then stop
- [ ] Update UI to show "Stopped" state
- [ ] Re-enable Start button

### UI
- [ ] Stop button appears khi đang process
- [ ] Confirm dialog: "Stop processing?"
- [ ] Show stopped files count

---

## 4. Filter by Status

### Store
- [ ] Add `statusFilter` state: "all" | "pending" | "processing" | "completed" | "error"
- [ ] Filter function for files
- [ ] Update file count display

### UI
- [ ] Dropdown/Tabs for status filter
- [ ] Show count for each status
- [ ] Highlight active filter
- [ ] "All (25)" | "Pending (10)" | "Completed (15)" | "Error (0)"

### Implementation
```typescript
const filteredFiles = files.filter(file => {
    if (statusFilter === 'all') return true;
    return file.status === statusFilter;
});
```

---

## 5. Preserve Folder Structure

### Store
- [ ] Add `preserveFolderStructure` boolean to config
- [ ] Store `basePath` when scanning folder
- [ ] Store relative path for each file

### Backend
- [ ] Update `scan_directory` to return relative paths
- [ ] Update `process_single_image` to create nested folders
- [ ] Create directory structure in output path

### Logic
```
Input:  /home/user/images/photos/2024/img1.jpg
Base:   /home/user/images
Output: /output/photos/2024/img1_optimized.jpg
```

### UI
- [ ] Checkbox in OutputSettings: "Preserve folder structure"
- [ ] Show folder path in file list (optional)
- [ ] Tooltip explaining the feature

---

## Implementation Order

### Phase 1: Core Processing (Priority 1)
1. ✅ Start processing basic
2. ✅ Stop processing
3. ✅ Filter by status

### Phase 2: Preview (Priority 2)
4. ✅ Image preview modal
5. ✅ Original vs Compressed comparison

### Phase 3: Advanced (Priority 3)
6. ✅ Preserve folder structure

---

## Files to Modify

### Frontend
- `src/store/appStore.ts` - Add states and actions
- `src/components/layout/StatusBar.tsx` - Start/Stop buttons, progress
- `src/components/file-list/FileList.tsx` - Status filter
- `src/components/file-list/FileRow.tsx` - Preview button
- `src/components/preview/ImagePreview.tsx` - NEW
- `src/components/settings/OutputSettings.tsx` - Preserve structure checkbox

### Backend
- `src-tauri/src/commands/process.rs` - Processing logic
- `src-tauri/src/commands/preview.rs` - NEW - Preview commands
- `src-tauri/src/core/processor.rs` - Folder structure preservation

### Types
- `src/types/index.ts` - Add new types for preview, filter

---

## Next Steps

Start with Phase 1 - Core Processing features as they are most critical for user workflow.
