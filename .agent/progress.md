# Implementation Progress - Advanced Features

## ✅ Đã hoàn thành (Step 1)

### 1. Store Updates - Status Filter & Processing Control

**File: `src/store/appStore.ts`**

#### Thêm States:
- `statusFilter: StatusFilter` - Filter hiện tại ("all" | "pending" | "processing" | "completed" | "error")
- `processingAborted: boolean` - Flag để stop processing

#### Thêm Actions:
```typescript
// Filter actions
setStatusFilter(filter: StatusFilter) - Set filter
getFilteredFiles() - Lấy files đã filter
getStatusCounts() - Đếm số lượng mỗi status

// Processing actions  
startProcessing() - Bắt đầu xử lý files (async)
stopProcessing() - Dừng xử lý
```

#### Processing Logic:
1. Lấy files theo filter hiện tại
2. Chỉ process files có status "pending"
3. Loop qua từng file:
   - Check `processingAborted` flag
   - Update status: pending → processing → completed/error
   - Call backend command (TODO)
4. Cleanup khi xong

---

## 📋 Tiếp theo cần làm

### Step 2: UI Components

#### A. FileList - Status Filter Tabs
**File: `src/components/file-list/FileList.tsx`**

```tsx
// Thêm filter tabs
<div className="status-filter-tabs">
  <button onClick={() => setStatusFilter("all")}>
    All ({counts.all})
  </button>
  <button onClick={() => setStatusFilter("pending")}>
    Pending ({counts.pending})
  </button>
  <button onClick={() => setStatusFilter("completed")}>
    Completed ({counts.completed})
  </button>
  <button onClick={() => setStatusFilter("error")}>
    Error ({counts.error})
  </button>
</div>

// Sử dụng filtered files
const filteredFiles = getFilteredFiles();
{filteredFiles.map((file, index) => ...)}
```

#### B. StatusBar - Start/Stop Buttons
**File: `src/components/layout/StatusBar.tsx`**

```tsx
const { isProcessing, startProcessing, stopProcessing } = useAppStore();

{!isProcessing ? (
  <button onClick={startProcessing} className="btn-primary">
    <Play size={16} />
    Start Processing
  </button>
) : (
  <button onClick={stopProcessing} className="btn-danger">
    <Square size={16} />
    Stop
  </button>
)}

// Progress indicator
{isProcessing && (
  <div className="progress-bar">
    <div className="progress-fill" style={{ width: `${progress}%` }} />
  </div>
)}
```

#### C. CSS Styles
**File: `src/App.css`**

```css
/* Status Filter Tabs */
.status-filter-tabs {
  display: flex;
  gap: 8px;
  padding: 12px 16px;
  background: var(--bg-secondary);
  border-bottom: 1px solid var(--border);
}

.status-filter-tabs button {
  padding: 6px 12px;
  border-radius: 4px;
  font-size: 11px;
  background: transparent;
  border: 1px solid var(--border);
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.2s;
}

.status-filter-tabs button.active {
  background: var(--accent);
  border-color: var(--accent);
  color: white;
}

.status-filter-tabs button:hover {
  border-color: var(--accent);
  color: var(--accent);
}

/* Progress Bar */
.progress-bar {
  height: 4px;
  background: var(--bg-tertiary);
  border-radius: 2px;
  overflow: hidden;
  flex: 1;
  max-width: 200px;
}

.progress-fill {
  height: 100%;
  background: var(--accent);
  transition: width 0.3s ease;
}
```

---

### Step 3: Backend Integration

**File: `src-tauri/src/commands/process.rs`**

Cập nhật `startProcessing()` để call backend:

```typescript
const result = await invoke<ProcessResult>("process_single_image", {
    filePath: file.path,
    config: state.config,
});

get().updateFileStatus(file.id, "completed", result);
```

---

### Step 4: Image Preview (Phase 2)

#### A. Create Preview Component
**File: `src/components/preview/ImagePreview.tsx` (NEW)**

```tsx
interface ImagePreviewProps {
  fileId: string;
  onClose: () => void;
}

export function ImagePreview({ fileId, onClose }: ImagePreviewProps) {
  const [view, setView] = useState<"original" | "compressed" | "compare">("original");
  
  return (
    <div className="preview-modal">
      <div className="preview-header">
        <div className="preview-tabs">
          <button onClick={() => setView("original")}>Original</button>
          <button onClick={() => setView("compressed")}>Compressed</button>
          <button onClick={() => setView("compare")}>Compare</button>
        </div>
        <button onClick={onClose}>×</button>
      </div>
      
      <div className="preview-content">
        {view === "original" && <img src={originalSrc} />}
        {view === "compressed" && <img src={compressedSrc} />}
        {view === "compare" && <CompareSlider />}
      </div>
    </div>
  );
}
```

#### B. Backend Commands
**File: `src-tauri/src/commands/preview.rs` (NEW)**

```rust
#[tauri::command]
pub async fn get_image_preview(file_path: String) -> Result<String, String> {
    // Load image
    // Convert to base64 or data URL
    // Return for display
}
```

---

### Step 5: Preserve Folder Structure (Phase 3)

#### A. Store Updates
```typescript
interface ProcessConfig {
  // ... existing fields
  preserveFolderStructure: boolean;
  basePath?: string;  // Base path when scanning folder
}
```

#### B. Backend Updates
```rust
// When scanning folder, store base path
// When processing, create nested folders in output
// Maintain relative path structure
```

---

## 🎯 Priority Order

1. **HIGHEST** - Step 2A: Status Filter UI (FileList)
2. **HIGHEST** - Step 2B: Start/Stop Buttons (StatusBar)
3. **HIGH** - Step 2C: CSS Styles
4. **MEDIUM** - Step 3: Backend Integration
5. **MEDIUM** - Step 4: Image Preview
6. **LOW** - Step 5: Preserve Folder Structure

---

## 📊 Current Status

- ✅ Store logic complete
- ⏳ UI components pending
- ⏳ Backend integration pending
- ⏳ Preview feature pending
- ⏳ Folder structure pending

**Next immediate task:** Implement Step 2A - Status Filter Tabs in FileList

---

## 🚀 Estimated Time

- Step 2 (UI): ~30 minutes
- Step 3 (Backend): ~20 minutes
- Step 4 (Preview): ~45 minutes
- Step 5 (Folder): ~30 minutes

**Total remaining:** ~2 hours

