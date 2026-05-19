# 🎮 Quiz Game - Nhận Diện Nghiêng Đầu

Game trắc nghiệm điều khiển bằng cử chỉ nghiêng đầu, sử dụng AI nhận diện khuôn mặt (MediaPipe FaceMesh). Được xây dựng bằng **Tauri** — nhẹ, nhanh và hiệu quả.

---

## 📋 Yêu Cầu Hệ Thống

- **Hệ điều hành:** Windows 10/11 (64-bit)
- **Camera/Webcam:** Bắt buộc (dùng để nhận diện cử chỉ)
- **Kết nối Internet:** Cần thiết lần đầu (tải model AI từ CDN)

---

## 🚀 Cài Đặt Cho Người Dùng

### Cách 1: Tải file cài đặt (Khuyến nghị)

1. Vào trang [Releases](https://github.com/chaudan0304/tro_choi_nghieng_dau/releases) trên GitHub.
2. Tải file `Quiz.Game_x.x.x_x64-setup.exe`.
3. Chạy file và làm theo hướng dẫn cài đặt.
4. Mở ứng dụng **Quiz Game** từ Desktop hoặc Start Menu.

### Cách 2: Chạy file portable

1. Tải file `.msi` từ trang Releases.
2. Chạy trực tiếp, không cần cài đặt.

---

## 🛠️ Cài Đặt Cho Lập Trình Viên

### Bước 1: Cài đặt công cụ cần thiết

| Công cụ | Phiên bản | Link tải |
|---|---|---|
| **Node.js** | >= 18.x | [nodejs.org](https://nodejs.org/) |
| **Rust** | >= 1.77 | [rustup.rs](https://rustup.rs/) |
| **Visual Studio 2022** | Community | [visualstudio.microsoft.com](https://visualstudio.microsoft.com/) |

> ⚠️ **Quan trọng:** Khi cài Visual Studio 2022, bắt buộc chọn workload **"Desktop development with C++"** để có MSVC build tools và Windows SDK.

### Bước 2: Cài đặt Rust

```powershell
winget install Rustlang.Rustup
rustup default stable
```

Sau khi cài, **đóng và mở lại Terminal**, kiểm tra:

```powershell
rustc --version
cargo --version
```

### Bước 3: Clone dự án

```powershell
git clone https://github.com/chaudan0304/tro_choi_nghieng_dau.git
cd tro_choi_nghieng_dau
git checkout tauri
```

### Bước 4: Cài dependencies

```powershell
npm install
```

### Bước 5: Chạy ứng dụng (Dev mode)

> ⚠️ Phải chạy trong **"Developer Command Prompt for VS 2022"** hoặc **"Developer PowerShell for VS 2022"** để Rust tìm được thư viện C++.

```powershell
npx tauri dev
```

Lần đầu chạy sẽ mất **5-10 phút** để compile Rust. Các lần sau chỉ mất vài giây.

### Bước 6: Build file cài đặt (.exe)

```powershell
npx tauri build
```

File output sẽ nằm tại:

```
src-tauri/target/release/bundle/
├── nsis/
│   └── Quiz Game_1.0.0_x64-setup.exe    ← Installer
└── msi/
    └── Quiz Game_1.0.0_x64_en-US.msi    ← MSI package
```

---

## 🎯 Hướng Dẫn Sử Dụng

### Điều khiển bằng cử chỉ

| Cử chỉ | Đáp án |
|---|---|
| 👈 Nghiêng đầu sang **TRÁI** | Chọn **A** |
| 👉 Nghiêng đầu sang **PHẢI** | Chọn **B** |
| 👆 **Ngẩng** đầu lên | Chọn **C** |
| 👇 **Cúi** đầu xuống | Chọn **D** |

> 💡 Giữ cử chỉ khoảng **1 giây** để xác nhận lựa chọn (có vòng tròn tiến trình hiện trên camera).

### Tính năng chính

- ✅ Hỗ trợ **1-4 đội** chơi cùng lúc
- ✅ Quản lý câu hỏi (thêm/sửa/xóa)
- ✅ Import câu hỏi từ file **Excel (.xlsx)**
- ✅ Nhạc nền tùy chỉnh
- ✅ Đếm ngược thời gian cho mỗi câu
- ✅ Hiệu ứng pháo giấy khi trả lời đúng

---

## 📁 Cấu Trúc Dự Án

```
tro_choi_nghieng_dau/
├── web/                    # File giao diện (HTML/CSS/JS)
│   ├── index.html          # Giao diện chính
│   ├── script.js           # Logic game + FaceMesh
│   └── style.css           # Giao diện CSS
├── src-tauri/              # Tauri backend (Rust)
│   ├── src/
│   │   ├── main.rs
│   │   └── lib.rs
│   ├── tauri.conf.json     # Cấu hình Tauri
│   ├── Cargo.toml          # Dependencies Rust
│   └── icons/              # Icon ứng dụng
├── package.json            # NPM config
├── .gitignore
└── README.md               # File này
```

---

## 🌿 Các Nhánh Git

| Nhánh | Mô tả |
|---|---|
| `main` | Nhánh chính |
| `tauri` | Phiên bản Tauri (nhẹ ~5-10MB) |
| `electron` | Phiên bản Electron (nặng ~80-100MB) |

---

## 📝 Ghi Chú

- Dữ liệu câu hỏi được lưu trong **localStorage** của trình duyệt nội bộ Tauri.
- Nếu camera không nhận, nhấn nút **"🔄 Thử lại Camera"** trên giao diện.
- Khi build trên máy mới, đảm bảo đã cài đầy đủ **MSVC C++ Build Tools** và **Windows SDK**.

---

## 📄 License

ISC
