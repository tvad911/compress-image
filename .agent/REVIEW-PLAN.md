# 📊 REVIEW PLAN - Advanced Features Implementation

## ✅ ĐÃ HOÀN THÀNH

### 1. Store Logic (100% Complete)

**File: `src/store/appStore.ts`**

✅ **Added States:**
- `statusFilter`: "all" | "pending" | "processing" | "completed" | "error"
- `processingAborted`: boolean flag để stop

✅ **Added Actions:**
```typescript
// Filter
setStatusFilter(filter) - Đặt filter
getFilteredFiles() - Lấy files theo filter
getStatusCounts() - Đếm số lượng mỗi status

// Processing
startProcessing() - Bắt đầu xử lý (async)
stopProcessing() - Dừng xử lý
```

✅ **Processing Flow:**
1. Get filtered files (chỉ pending)
2. Loop qua từng file
3. Update status: pending → processing → completed/error
4. Check abort flag mỗi iteration
5. Cleanup khi done

**Status:** ✅ READY TO USE

---

## 🔄 ĐANG LÀM (In Progress)

### 2. UI Components (50% Complete)

#### A. Status Filter Tabs
**File:** `src/components/file-list/FileList.tsx`

**Cần thêm:**
```tsx
// Import thêm
const statusFilter = useAppStore((state) => state.statusFilter);
const setStatusFilter = useAppStore((state) => state.setStatusFilter);
const getFilteredFiles = useAppStore((state) => state.getFilteredFiles);
const getStatusCounts = useAppStore((state) => state.getStatusCounts);

// Sử dụng
const filteredFiles = getFilteredFiles();
const counts = getStatusCounts();

// Thêm tabs (sau file-list-header, trước file-list-table)
<div className="status-filter-tabs">
  <button className={statusFilter === "all" ? "active" : ""} onClick={() => setStatusFilter("all")}>
    All ({counts.all})
  </button>
  <button className={statusFilter === "pending" ? "active" : ""} onClick={() => setStatusFilter("pending")}>
    Pending ({counts.pending})
  </button>
  <button className={statusFilter === "processing" ? "active" : ""} onClick={() => setStatusFilter("processing")}>
    Processing ({counts.processing})
  </button>
  <button className={statusFilter === "completed" ? "active" : ""} onClick={() => setStatusFilter("completed")}>
    Completed ({counts.completed})
  </button>
  <button className={statusFilter === "error" ? "active" : ""} onClick={() => setStatusFilter("error")}>
    Error ({counts.error})
  </button>
</div>

// Thay đổi map
{filteredFiles.map((file, index) => ...)}
```

#### B. Start/Stop Buttons
**File:** `src/components/layout/StatusBar.tsx`

**Cần thêm:**
```tsx
import { Play, Square } from "lucide-react";

const isProcessing = useAppStore((state) => state.isProcessing);
const startProcessing = useAppStore((state) => state.startProcessing);
const stopProcessing = useAppStore((state) => state.stopProcessing);
const currentIndex = useAppStore((state) => state.currentProcessingIndex);
const getFilteredFiles = useAppStore((state) => state.getFilteredFiles);

const pendingCount = getFilteredFiles().filter(f => f.status === "pending").length;
const progress = pendingCount > 0 ? ((currentIndex / pendingCount) * 100) : 0;

// Trong render
{!isProcessing ? (
  <button onClick={startProcessing} className="btn-primary" disabled={pendingCount === 0}>
    <Play size={14} />
    Start ({pendingCount})
  </button>
) : (
  <>
    <button onClick={stopProcessing} className="btn-danger">
      <Square size={14} />
      Stop
    </button>
    <div className="progress-bar">
      <div className="progress-fill" style={{ width: `${progress}%` }} />
    </div>
    <span className="progress-text">{currentIndex}/{pendingCount}</span>
  </>
)}
```

#### C. CSS Styles
**File:** `src/App.css`

**Cần thêm:**
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
  font-weight: 500;
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

.status-filter-tabs button:hover:not(.active) {
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

.progress-text {
  font-size: 11px;
  color: var(--text-secondary);
  min-width: 50px;
  text-align: center;
}
```

---

## ⏳ CHƯA LÀM (Pending)

### 3. Backend Integration

**File:** `src/store/appStore.ts` - Update `startProcessing()`

```typescript
// Thay mock bằng real call
const result = await invoke<ProcessResult>("process_single_image", {
    filePath: file.path,
    config: state.config,
});

get().updateFileStatus(file.id, "completed", {
    originalSize: file.size,
    newSize: result.newSize,
    compressionRatio: result.compressionRatio,
    outputPath: result.outputPath,
});
```

### 4. Image Preview

**Files to create:**
- `src/components/preview/ImagePreview.tsx`
- `src-tauri/src/commands/preview.rs`

**Features:**
- View original image
- View compressed image
- Side-by-side comparison
- Slider compare
- Zoom/Pan

### 5. Preserve Folder Structure

**Updates needed:**
- Add `preserveFolderStructure` to config
- Store `basePath` when scanning
- Update backend to create nested folders
- UI checkbox in OutputSettings

---

## 📋 CHECKLIST - Để hoàn thành Phase 1

- [x] Store logic - Filter & Processing
- [ ] FileList - Status filter tabs UI
- [ ] StatusBar - Start/Stop buttons
- [ ] CSS - Styles cho tabs và progress
- [ ] Test filter functionality
- [ ] Test start/stop processing
- [ ] Backend integration

---

## 🎯 NEXT STEPS (Theo thứ tự)

1. **Immediate (5 mins):**
   - Add status filter tabs to FileList
   - Update to use filteredFiles

2. **Next (10 mins):**
   - Add Start/Stop buttons to StatusBar
   - Add progress indicator

3. **Then (5 mins):**
   - Add CSS styles
   - Test UI

4. **After (15 mins):**
   - Integrate real backend call
   - Test end-to-end

5. **Later (Phase 2):**
   - Image preview feature

6. **Later (Phase 3):**
   - Folder structure preservation

---

## 💡 NOTES

### Current Limitations:
- `startProcessing()` uses mock delay (1 second)
- Need to implement real backend call
- Preview feature not started
- Folder structure not implemented

### What Works:
- ✅ Filter state management
- ✅ Status counting
- ✅ Processing loop with abort
- ✅ File status updates

### Testing Plan:
1. Add some files
2. Click filter tabs → Should filter
3. Click Start → Should process pending files
4. Click Stop → Should abort
5. Check status updates in real-time

---

## 🚀 ESTIMATED TIME TO COMPLETE

- Phase 1 (Filter + Processing): **30 mins remaining**
- Phase 2 (Preview): **45 mins**
- Phase 3 (Folder Structure): **30 mins**

**Total:** ~1h 45mins

---

## ❓ QUESTIONS FOR REVIEW

1. **Processing Strategy:**
   - Process only selected files? Or all pending?
   - Currently: All pending files in current filter

2. **UI Placement:**
   - Status tabs above or below file list header?
   - Currently: Below header, above table

3. **Progress Display:**
   - Show percentage or count?
   - Currently: Both (progress bar + "5/10")

4. **Preview Priority:**
   - Implement now or later?
   - Suggestion: Later (Phase 2)

5. **Folder Structure:**
   - Default ON or OFF?
   - Suggestion: OFF by default

---

## 📝 IMPLEMENTATION NOTES

### Store Design:
- Used `get()` to access current state in async functions
- `processingAborted` flag for clean stop
- Separate filter logic from display logic

### UI Design:
- Tabs for easy status switching
- Counts in parentheses for visibility
- Active state with accent color
- Disabled Start when no pending files

### Performance:
- Filter computed on-demand
- Counts cached until files change
- Progress updates don't re-render entire list

