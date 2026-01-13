# 🖼️ Compress Image (RustyPixel Forge)

**Compress Image** is a professional desktop application built with **Rust + Tauri + React**, designed for high-performance image compression and format conversion.

---

## ✨ Key Features

- 🖼️ **Multi-format Support** - PNG, JPEG, WebP.
- 🎯 **Smart Compression** - Lossy & Lossless compression options.
- 📏 **Flexible Resizing** - Supports 6 different resize modes.
- ⚡ **Lightning Fast** - Leverages Rust's power for parallel processing.
- 📁 **Preserve Folder Structure** - Maintain directory hierarchy during batch processing.
- 👁️ **Visual Preview** - Side-by-side comparison of original and compressed images with zoom tools.

---

## 🚀 Installation Guide

### Prerequisites
- **Node.js**: Version 20.19+ or 22.12+
- **Rust**: Version 1.70+
- **Tauri CLI**: `npm install -g @tauri-apps/cli`

### Setup Steps
1. **Clone the repository:**
   ```bash
   git clone git@github.com:tvad911/compress-image.git
   cd compress-image
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Run in Development Mode:**
   ```bash
   npm run tauri dev
   ```

4. **Production Build:**
   ```bash
   npm run tauri build
   ```
   *Artifacts will be located in `src-tauri/target/release/bundle/`.*

---

## 📖 Usage Guide

1. **Select Images:**
   - Click **"Select Files"** for individual images.
   - Click **"Select Folder"** for batch processing.

2. **Configuration:**
   - Select output format (PNG/JPEG/WebP).
   - Adjust desired **Quality**.
   - Set **Resize** options if needed.
   - Select the **Output Folder**.

3. **Processing:**
   - Click **"Start Processing"**.
   - Monitor real-time progress in the list.
   - Use the 👁️ icon to preview and compare results.

---

## 🛠️ Tech Stack

- **Frontend:** React 18, TypeScript, Zustand, Vite.
- **Backend:** Tauri 2.x, Rust.
- **Compression Libraries:** imagequant, mozjpeg, libwebp.

---

## 📄 License

[MIT License](LICENSE)

---

**Made with ❤️ using Rust + Tauri + React**
