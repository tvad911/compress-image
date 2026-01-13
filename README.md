# 🖼️ Compress Image (RustyPixel Forge)

**Compress Image** là một ứng dụng desktop chuyên nghiệp được xây dựng bằng **Rust + Tauri + React**, giúp nén và chuyển đổi định dạng hình ảnh hiệu quả với tốc độ cao.

---

## ✨ Tính năng chính (Features)

- 🖼️ **Hỗ trợ đa định dạng** - PNG, JPEG, WebP.
- 🎯 **Nén thông minh** - Tùy chọn nén Lossy (có tổn hao) & Lossless (không tổn hao).
- 📏 **Thay đổi kích thước linh hoạt** - Hỗ trợ 6 chế độ resize khác nhau.
- ⚡ **Xử lý cực nhanh** - Tận dụng sức mạnh của Rust để xử lý song song.
- 📁 **Giữ nguyên cấu trúc thư mục** - Duy trì phân cấp thư mục khi xử lý hàng loạt.
- 👁️ **Xem trước trực quan** - So sánh ảnh gốc và ảnh đã nén kèm công cụ zoom.

---

## 🚀 Hướng dẫn cài đặt (Installation Guide)

### Yêu cầu hệ thống (Prerequisites)
- **Node.js**: Phiên bản 20.19+ hoặc 22.12+
- **Rust**: Phiên bản 1.70+
- **Tauri CLI**: `npm install -g @tauri-apps/cli`

### Các bước cài đặt
1. **Clone repository:**
   ```bash
   git clone git@github.com:tvad911/compress-image.git
   cd compress-image
   ```

2. **Cài đặt dependencies:**
   ```bash
   npm install
   ```

3. **Chạy ứng dụng ở chế độ phát triển (Development):**
   ```bash
   npm run tauri dev
   ```

4. **Biên dịch ứng dụng (Production Build):**
   ```bash
   npm run tauri build
   ```
   *Kết quả sẽ nằm trong thư mục `src-tauri/target/release/bundle/`.*

---

## 📖 Hướng dẫn sử dụng (Usage Guide)

1. **Chọn hình ảnh:**
   - Nhấn **"Select Files"** để chọn từng ảnh lẻ.
   - Nhấn **"Select Folder"** để chọn toàn bộ thư mục.

2. **Cấu hình thông số:**
   - Chọn định dạng đầu ra (PNG/JPEG/WebP).
   - Điều chỉnh chất lượng (Quality) mong muốn.
   - Thiết lập kích thước (Resize) nếu cần.
   - Chọn thư mục lưu kết quả (Output Folder).

3. **Tiến hành xử lý:**
   - Nhấn **"Start Processing"** để bắt đầu.
   - Theo dõi tiến độ thời gian thực trên danh sách.
   - Sử dụng biểu tượng 👁️ để xem trước và so sánh kết quả.

---

## 🛠️ Công nghệ sử dụng (Tech Stack)

- **Frontend:** React 18, TypeScript, Zustand, Vite.
- **Backend:** Tauri 2.x, Rust.
- **Thư viện nén:** imagequant, mozjpeg, libwebp.

---

## 📄 Giấy phép (License)

[MIT License](LICENSE)

---

**Made with ❤️ using Rust + Tauri + React**
