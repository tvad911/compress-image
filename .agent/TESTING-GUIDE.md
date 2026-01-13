# 🧪 TESTING GUIDE - Preserve Folder Structure

## 📋 Chuẩn bị Test Data

### Tạo cấu trúc thư mục test:
```bash
mkdir -p /tmp/test-images/2024/vacation
mkdir -p /tmp/test-images/2024/work
mkdir -p /tmp/test-images/2023/birthday
mkdir -p /tmp/output-test
```

### Tạo hoặc copy một số ảnh mẫu:
```bash
# Copy ảnh có sẵn vào các thư mục
cp ~/Pictures/sample1.jpg /tmp/test-images/2024/vacation/beach.jpg
cp ~/Pictures/sample2.jpg /tmp/test-images/2024/work/meeting.jpg
cp ~/Pictures/sample3.jpg /tmp/test-images/2023/birthday/party.jpg
```

---

## ✅ Test Cases

### Test 1: Preserve Folder Structure = ON

**Steps:**
1. Mở RustyPixel Forge
2. Click "Select Folder" → Chọn `/tmp/test-images`
3. Trong Settings → Output:
   - Output Folder: `/tmp/output-test`
   - ☑ **Preserve folder structure** (CHECKED)
   - File Conflict: Rename
4. Click "Start Processing"

**Expected Result:**
```
/tmp/output-test/
├── 2024/
│   ├── vacation/
│   │   └── beach_optimized.png
│   └── work/
│       └── meeting_optimized.png
└── 2023/
    └── birthday/
        └── party_optimized.png
```

**Verify:**
```bash
tree /tmp/output-test
# Should show nested structure matching input
```

---

### Test 2: Preserve Folder Structure = OFF

**Steps:**
1. Clear queue (nếu cần)
2. Click "Select Folder" → Chọn `/tmp/test-images`
3. Trong Settings → Output:
   - Output Folder: `/tmp/output-test-flat`
   - ☐ **Preserve folder structure** (UNCHECKED)
   - File Conflict: Rename
4. Click "Start Processing"

**Expected Result:**
```
/tmp/output-test-flat/
├── beach_optimized.png
├── meeting_optimized.png
└── party_optimized.png
```

**Verify:**
```bash
ls -la /tmp/output-test-flat
# Should show all files in one directory
```

---

### Test 3: File Conflict with Nested Folders

**Steps:**
1. Run Test 1 again (same input, same output)
2. File Conflict: **Rename**

**Expected Result:**
```
/tmp/output-test/
├── 2024/
│   ├── vacation/
│   │   ├── beach_optimized.png
│   │   └── beach_optimized_(1).png  ← NEW!
│   └── work/
│       ├── meeting_optimized.png
│       └── meeting_optimized_(1).png  ← NEW!
└── 2023/
    └── birthday/
        ├── party_optimized.png
        └── party_optimized_(1).png  ← NEW!
```

---

### Test 4: Deep Nested Structure

**Prepare:**
```bash
mkdir -p /tmp/test-deep/a/b/c/d/e
cp ~/Pictures/sample.jpg /tmp/test-deep/a/b/c/d/e/deep.jpg
```

**Steps:**
1. Select Folder: `/tmp/test-deep`
2. Output: `/tmp/output-deep`
3. ☑ Preserve folder structure
4. Process

**Expected Result:**
```
/tmp/output-deep/
└── a/
    └── b/
        └── c/
            └── d/
                └── e/
                    └── deep_optimized.png
```

---

### Test 5: Mixed File Selection

**Steps:**
1. Click "Select Files" (not folder) → Chọn nhiều files từ các thư mục khác nhau
2. ☑ Preserve folder structure

**Expected Result:**
- basePath sẽ là `null` (vì không scan folder)
- Files sẽ được lưu flat vào output folder
- Preserve setting không ảnh hưởng

---

## 🐛 Edge Cases to Test

### Edge Case 1: File ở root của base folder
```
Input:  /tmp/test/image.jpg  (no subdirectory)
Base:   /tmp/test
Output: /tmp/out/image_optimized.png  (directly in output)
```

### Edge Case 2: Special characters in folder names
```bash
mkdir -p "/tmp/test-special/folder with spaces/sub-folder_123"
# Should handle correctly
```

### Edge Case 3: Very long path
```bash
mkdir -p /tmp/test/$(printf 'a%.0s' {1..100})/$(printf 'b%.0s' {1..100})
# Should handle or show error gracefully
```

---

## 📊 Verification Commands

### Check structure:
```bash
tree /tmp/output-test
```

### Count files:
```bash
find /tmp/output-test -type f | wc -l
```

### Check permissions:
```bash
ls -laR /tmp/output-test
```

### Verify file sizes:
```bash
du -sh /tmp/output-test/*
```

---

## ✅ Success Criteria

- [ ] Nested folders created correctly
- [ ] Files placed in correct subdirectories
- [ ] Relative paths calculated accurately
- [ ] Works with all file conflict modes
- [ ] No errors in console
- [ ] UI checkbox toggles correctly
- [ ] basePath saved when scanning folder
- [ ] basePath null when selecting individual files

---

## 🚀 Quick Test Script

```bash
#!/bin/bash
# quick-test.sh

echo "🧪 Setting up test environment..."

# Cleanup
rm -rf /tmp/test-images /tmp/output-test

# Create structure
mkdir -p /tmp/test-images/2024/{vacation,work}
mkdir -p /tmp/test-images/2023/birthday
mkdir -p /tmp/output-test

# Create dummy images (if you have imagemagick)
if command -v convert &> /dev/null; then
    convert -size 800x600 xc:blue /tmp/test-images/2024/vacation/beach.jpg
    convert -size 800x600 xc:red /tmp/test-images/2024/work/meeting.jpg
    convert -size 800x600 xc:green /tmp/test-images/2023/birthday/party.jpg
    echo "✅ Created test images"
else
    echo "⚠️  Install imagemagick to auto-create test images"
    echo "   Or manually copy images to /tmp/test-images/"
fi

echo ""
echo "📁 Test structure created:"
tree /tmp/test-images

echo ""
echo "🚀 Now:"
echo "1. Open RustyPixel Forge"
echo "2. Select Folder: /tmp/test-images"
echo "3. Output Folder: /tmp/output-test"
echo "4. Enable 'Preserve folder structure'"
echo "5. Click Start"
echo ""
echo "Then run: tree /tmp/output-test"
```

---

## 📝 Test Results Template

```
Date: ___________
Tester: ___________

Test 1 - Preserve ON:  ☐ Pass  ☐ Fail
Test 2 - Preserve OFF: ☐ Pass  ☐ Fail
Test 3 - File Conflict: ☐ Pass  ☐ Fail
Test 4 - Deep Nested:  ☐ Pass  ☐ Fail
Test 5 - Mixed Files:  ☐ Pass  ☐ Fail

Edge Case 1: ☐ Pass  ☐ Fail
Edge Case 2: ☐ Pass  ☐ Fail
Edge Case 3: ☐ Pass  ☐ Fail

Notes:
_________________________________
_________________________________
_________________________________
```

---

## 🎯 Performance Test

```bash
# Create 100 files in nested structure
for i in {1..10}; do
  for j in {1..10}; do
    mkdir -p /tmp/perf-test/folder$i/subfolder$j
    convert -size 1920x1080 xc:blue /tmp/perf-test/folder$i/subfolder$j/image.jpg
  done
done

# Time the processing
time ./rusty-pixel-forge
# Process all 100 files with preserve structure ON
```

---

🎉 **Happy Testing!**
