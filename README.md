# 🎮 Quiz Game - Nhận Diện Nghiêng Đầu (Phiên bản Web)

Game trắc nghiệm trực tuyến điều khiển bằng cử chỉ nghiêng đầu, sử dụng AI nhận diện khuôn mặt (MediaPipe FaceMesh). Chạy trực tiếp trên trình duyệt — không cần cài đặt!

🔗 **Chơi ngay:** [https://chaudan0304.github.io/tro_choi_nghieng_dau/](https://chaudan0304.github.io/tro_choi_nghieng_dau/)

---

## 📋 Yêu Cầu

- **Trình duyệt:** Chrome, Edge, Firefox, Safari (phiên bản mới nhất)
- **Camera/Webcam:** Bắt buộc (dùng để nhận diện cử chỉ)
- **Kết nối Internet:** Cần thiết (tải model AI từ CDN)
- **HTTPS:** Trang web phải chạy trên HTTPS để sử dụng camera

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
- ✅ Xuất câu hỏi ra file **Excel (.xlsx)**
- ✅ Nhạc nền tùy chỉnh
- ✅ Đếm ngược thời gian cho mỗi câu
- ✅ Hiệu ứng pháo giấy khi trả lời đúng
- ✅ Dữ liệu lưu trữ trong **localStorage** (giữ lại khi reload trang)

---

## 📁 Cấu Trúc Dự Án

```
tro_choi_nghieng_dau/
├── index.html          # Giao diện chính
├── script.js           # Logic game + FaceMesh AI
├── style.css           # Giao diện CSS
├── .gitignore
└── README.md           # File này
```

---

## 🌿 Các Nhánh Git

| Nhánh | Mô tả |
|---|---|
| `main` | Nhánh chính |
| `web` | 🌐 Phiên bản Web (GitHub Pages) |
| `tauri` | 💻 Phiên bản Tauri desktop (~5-10MB) |
| `electron` | 💻 Phiên bản Electron desktop (~80-100MB) |

---

## 🚀 Deploy

Dự án được deploy tự động lên **GitHub Pages** từ nhánh `web`.

### Tự chạy local (cho dev)

```bash
# Sử dụng bất kỳ HTTP server nào
npx serve .
# hoặc
python -m http.server 8000
```

> ⚠️ **Lưu ý:** Phải chạy qua HTTP server (không mở file trực tiếp) để camera hoạt động.

---

## 📝 Ghi Chú

- Dữ liệu câu hỏi được lưu trong **localStorage** của trình duyệt.
- Nếu camera không nhận, nhấn nút **"🔄 Thử lại Camera"** trên giao diện.
- Trên một số trình duyệt mobile, cần cấp quyền camera thủ công trong Settings.

---

## 📄 License

ISC
