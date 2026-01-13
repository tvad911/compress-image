# 📋 TÍNH NĂNG CÒN THIẾU - ĐỀ XUẤT IMPLEMENTATION

## ✅ ĐÃ HOÀN THÀNH (100%)

### Backend Integration
- ✅ Real image compression
- ✅ Config serialization
- ✅ Error handling with messages
- ✅ Output path generation
- ✅ Compression ratio calculation (including negative)
- ✅ Chrome DevTools enabled

### UI/UX
- ✅ File list with detailed info
- ✅ Estimated size preview
- ✅ Start/Stop processing
- ✅ Progress tracking
- ✅ Status badges
- ✅ Button styling (Start, Stop, Clear, Delete)

---

## 🆕 TÍNH NĂNG MỚI - FILE CONFLICT HANDLING

### 1. Overwrite/Rename Option

**Mô tả:**
Khi output file đã tồn tại, cho phép user chọn:
- **Overwrite**: Ghi đè file cũ
- **Rename**: Tự động thêm số (1), (2), (3)...
- **Skip**: Bỏ qua file này

**Implementation:**

#### A. Add to Config (TypeScript)
```typescript
// src/types/index.ts
export enum FileConflictMode {
    Overwrite = "overwrite",
    Rename = "rename",
    Skip = "skip",
}

export interface ProcessConfig {
    // ... existing fields
    fileConflictMode: FileConflictMode;
}
```

#### B. Add to Config (Rust)
```rust
// src-tauri/src/core/config.rs
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub enum FileConflictMode {
    Overwrite,
    Rename,
    Skip,
}

pub struct ProcessConfig {
    // ... existing fields
    pub file_conflict_mode: FileConflictMode,
}
```

#### C. Update Processing Logic
```rust
// src-tauri/src/commands/process.rs
fn resolve_output_path(
    base_path: PathBuf,
    conflict_mode: &FileConflictMode,
) -> PathBuf {
    match conflict_mode {
        FileConflictMode::Overwrite => base_path,
        FileConflictMode::Rename => {
            if !base_path.exists() {
                return base_path;
            }
            
            let stem = base_path.file_stem().unwrap().to_str().unwrap();
            let ext = base_path.extension().unwrap().to_str().unwrap();
            let parent = base_path.parent().unwrap();
            
            let mut counter = 1;
            loop {
                let new_path = parent.join(format!("{}_({}).{}", stem, counter, ext));
                if !new_path.exists() {
                    return new_path;
                }
                counter += 1;
            }
        }
        FileConflictMode::Skip => base_path,
    }
}
```

#### D. UI Settings
```tsx
// src/components/settings/OutputSettings.tsx
<div className="setting-group">
    <label>File Conflict</label>
    <select
        value={config.fileConflictMode}
        onChange={(e) => updateConfig({ 
            fileConflictMode: e.target.value as FileConflictMode 
        })}
    >
        <option value="overwrite">Overwrite existing files</option>
        <option value="rename">Rename (add number)</option>
        <option value="skip">Skip existing files</option>
    </select>
</div>
```

**Ước tính:** 20-30 phút

---

## 📋 CÁC TÍNH NĂNG CÒN THIẾU (Từ yêu cầu ban đầu)

### 2. Image Preview (CHƯA LÀM)

**Mô tả:**
- Xem ảnh gốc
- Xem ảnh sau compress
- So sánh side-by-side
- Slider compare

**Implementation:**

#### A. Create Preview Component
```tsx
// src/components/preview/ImagePreview.tsx
interface ImagePreviewProps {
    fileId: string;
    onClose: () => void;
}

export function ImagePreview({ fileId, onClose }: ImagePreviewProps) {
    const [view, setView] = useState<"original" | "compressed" | "compare">("original");
    const [originalSrc, setOriginalSrc] = useState<string>("");
    const [compressedSrc, setCompressedSrc] = useState<string>("");
    
    useEffect(() => {
        // Load images
        loadImages();
    }, [fileId]);
    
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
                {view === "compare" && (
                    <div className="compare-view">
                        <div className="compare-slider">
                            {/* Image comparison slider */}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
```

#### B. Backend Commands
```rust
// src-tauri/src/commands/preview.rs
#[tauri::command]
pub async fn get_image_preview(file_path: String) -> Result<String, String> {
    let img = image::open(&file_path)
        .map_err(|e| e.to_string())?;
    
    // Generate base64 preview
    generate_preview(&img, 800)
}

#[tauri::command]
pub async fn get_compressed_preview(file_path: String) -> Result<String, String> {
    // Load compressed file and return base64
}
```

**Ước tính:** 45-60 phút

---

### 3. Preserve Folder Structure (CHƯA LÀM)

**Mô tả:**
Khi add folder, giữ nguyên cấu trúc thư mục trong output

**Ví dụ:**
```
Input:  /photos/2024/vacation/img1.jpg
Base:   /photos
Output: /output/2024/vacation/img1_optimized.png
```

**Implementation:**

#### A. Store Base Path
```typescript
// src/store/appStore.ts
interface AppState {
    basePath: string | null;  // Base path when scanning folder
}

// When scanning folder
const basePath = selectedFolder;
set({ basePath });
```

#### B. Calculate Relative Path
```typescript
// When adding files
const relativePath = file.path.replace(basePath, "");
const outputPath = path.join(config.outputPath, relativePath);
```

#### C. Update Backend
```rust
// src-tauri/src/commands/process.rs
// Create nested directories
if let Some(parent) = output_path.parent() {
    std::fs::create_dir_all(parent)?;
}
```

#### D. UI Checkbox
```tsx
// src/components/settings/OutputSettings.tsx
<div className="setting-group">
    <label>
        <input
            type="checkbox"
            checked={config.preserveFolderStructure}
            onChange={(e) => updateConfig({ 
                preserveFolderStructure: e.target.checked 
            })}
        />
        Preserve folder structure
    </label>
</div>
```

**Ước tính:** 30-40 phút

---

### 4. Filter by Status (CHƯA LÀM)

**Mô tả:**
Tabs để filter files: All | Pending | Processing | Completed | Error

**Implementation:**

#### A. Already in Store! ✅
```typescript
// Store đã có:
statusFilter: StatusFilter
setStatusFilter(filter)
getFilteredFiles()
getStatusCounts()
```

#### B. Add UI Tabs
```tsx
// src/components/file-list/FileList.tsx
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
    {/* ... other tabs */}
</div>
```

#### C. CSS (Already exists!)
```css
.status-filter-tabs { /* ... */ }
.status-filter-tabs button.active { /* ... */ }
```

**Ước tính:** 10-15 phút (logic đã có, chỉ cần UI)

---

## 🎯 PRIORITY & TIMELINE

### Priority 1 (HIGH) - 1 hour total
1. **File Conflict Handling** (30 mins) - YÊU CẦU MỚI
2. **Filter by Status** (15 mins) - Logic đã có
3. **Preserve Folder Structure** (35 mins) - Hữu ích

### Priority 2 (MEDIUM) - 1 hour
4. **Image Preview** (60 mins) - Nice to have

---

## 📊 IMPLEMENTATION ORDER (ĐỀ XUẤT)

### Session 1: Core Features (1h)
1. ✅ File Conflict Handling
2. ✅ Filter by Status
3. ✅ Preserve Folder Structure

### Session 2: Polish (1h)
4. ✅ Image Preview
5. ✅ Testing & Bug fixes

---

## 🎨 MOCKUPS

### File Conflict Setting:
```
┌─────────────────────────────────────┐
│ Output Settings                     │
├─────────────────────────────────────┤
│ Output Folder: /tmp/optimized  [📁] │
│                                     │
│ File Conflict:                      │
│ ┌─────────────────────────────────┐ │
│ │ Overwrite existing files      ▼ │ │
│ └─────────────────────────────────┘ │
│   • Overwrite existing files        │
│   • Rename (add number)             │
│   • Skip existing files             │
└─────────────────────────────────────┘
```

### Status Filter:
```
┌──────────────────────────────────────────────────────┐
│ [All (25)] [Pending (10)] [Processing (0)] [Completed (15)] [Error (0)] │
└──────────────────────────────────────────────────────┘
```

### Folder Structure:
```
┌─────────────────────────────────────┐
│ Output Settings                     │
├─────────────────────────────────────┤
│ ☑ Preserve folder structure         │
│                                     │
│ Input:  /photos/2024/img.jpg        │
│ Output: /output/2024/img_opt.png    │
└─────────────────────────────────────┘
```

---

## ❓ QUESTIONS CHO BẠN

1. **File Conflict:**
   - Default mode: Overwrite hay Rename?
   - Có cần confirm dialog không?

2. **Folder Structure:**
   - Default ON hay OFF?
   - Chỉ áp dụng khi scan folder?

3. **Filter:**
   - Vị trí tabs: Trên hay dưới file list header?

4. **Preview:**
   - Có cần zoom/pan không?
   - Có cần download button không?

5. **Priority:**
   - Làm tất cả 4 tính năng?
   - Hay chọn 2-3 quan trọng nhất?

---

## 🚀 READY TO START

**Bạn muốn:**
- **A.** Làm tất cả 4 tính năng (2 hours)
- **B.** Chọn 2-3 tính năng quan trọng nhất (1 hour)
- **C.** Chỉ làm File Conflict (30 mins)
- **D.** Điều chỉnh requirements

Hãy cho tôi biết! 🎨✨
