# Hệ thống Quản lý Bảng điểm Sinh viên (Student Grade Management)

Một ứng dụng web siêu nhẹ, tốc độ cao giúp sinh viên quản lý điểm số, tín chỉ và theo dõi kết quả học tập dễ dàng. Dự án được phát triển theo kiến trúc Server-Side Rendering (SSR) kết hợp với Client-side tương tác mượt mà, không sử dụng bất kỳ Framework UI cồng kềnh nào.

## 🚀 Các Tính Năng Nổi Bật (Features)

*   **Quản lý Môn học:** Thêm, sửa, xóa các môn học. Tự động tính toán Điểm Quá Trình (ĐQT) và Điểm Học Phần (ĐHP) dựa trên trọng số cấu hình.
*   **Bảng Thống Kê Real-time:** Tự động tính và cập nhật điểm GPA (Thang 4), tổng tín chỉ, số tín chỉ đạt/nợ, và xếp loại học lực.
*   **Cấu Hình Thang Điểm Tùy Biến:** Cho phép tự định nghĩa hệ số điểm (Ví dụ: Giữa kỳ 30%, Cuối kỳ 70%) và quy đổi điểm chữ (A, B, C, D, F) theo quy chế riêng của từng trường đại học.
*   **Nhập Dữ Liệu Nhanh (Excel/Paste):** 
    *   Hỗ trợ "Copy & Paste" trực tiếp bảng điểm từ Excel vào hệ thống.
    *   Hỗ trợ tải lên file Excel (.xlsx, .xls) để bóc tách dữ liệu thông minh.
*   **Tìm Kiếm & Sắp Xếp (Search & Sort):**
    *   Tìm kiếm môn học theo tên tức thì (Real-time).
    *   Sắp xếp danh sách theo Tên (A-Z), Tín chỉ (Giảm dần), hoặc Điểm HP (Tăng/Giảm dần) ngay tại Frontend.
*   **Tự Động Lưu Đám Mây (Auto-save Cloud Sync):** 
    *   Mọi thay đổi được lưu tạm vào `sessionStorage` và đồng bộ tự động lên Firebase Firestore.
    *   Tích hợp thuật toán **Debounce (Frontend)** và **Rate Limiting (Backend)** để ngăn chặn Spam API, tối ưu hiệu năng.
*   **Hướng dẫn sử dụng tương tác (Guided Tour):** Giao diện Onboarding kiểu "Highlight Focus" thông minh giúp người mới làm quen cực kỳ nhanh.
*   **Bảo Mật:** Đăng nhập an toàn qua Google (Firebase Authentication), bảo vệ các Endpoints lưu dữ liệu bằng Middleware kiểm tra Token.

## 🛠️ Công Nghệ Sử Dụng (Tech Stack)

### Backend (Golang)
*   **Ngôn ngữ:** Go (Golang) 1.25.0
*   **Thư viện/Kiến trúc:** `net/http` thuần, không dùng Web Framework (như Gin hay Echo) để đảm bảo độ nhẹ và hiệu suất tối đa.
*   **Middleware:** Rate Limiting (giới hạn Request), Firebase Auth Validator (Bảo vệ API), NoCache (cho file tĩnh).
*   **Database:** Firebase Firestore (NoSQL).

### Frontend (HTML/CSS/JS thuần)
*   **Kiến trúc:** Vanilla JavaScript (Module hóa cấu trúc file), CSS Variables, Flexbox & CSS Grid.
*   **Không Framework:** Không React/Vue/Angular, không TailwindCSS (Sử dụng CSS thuần để kiểm soát tối đa thiết kế UI/UX theo hướng hiện đại, Glassmorphism).
*   **Auth:** Firebase SDK cho Frontend (Đăng nhập Google).

## 📁 Cấu Trúc Thư Mục (Folder Structure)

```text
go-ssr/
├── cmd/
│   └── server/
│       └── main.go              # Điểm khởi chạy của Backend Golang
├── internal/
│   ├── config/                  # Quản lý biến môi trường (.env)
│   ├── database/                # Khởi tạo kết nối Firebase
│   ├── handler/                 # Controller xử lý các HTTP Routes
│   ├── middleware/              # Các Middleware (Auth, Rate Limit, Logging)
│   ├── repository/              # Tương tác trực tiếp với Database Firestore
│   └── service/                 # Chứa Business Logic (Quy tắc nghiệp vụ)
├── web/
│   ├── static/
│   │   └── assets/              
│   │       ├── css/             # Stylesheet được chia nhỏ (components, responsive,...)
│   │       ├── images/          # Hình ảnh (nếu có)
│   │       └── js/              # Mã nguồn Vanilla JS (core, features, ui,...)
│   └── templates/
│       └── bang_diem.html       # Giao diện chính của ứng dụng
├── .env.example                 # File mẫu khai báo biến môi trường
├── Procfile                     # File cấu hình deploy lên Heroku
├── go.mod / go.sum              # Quản lý thư viện Golang
└── README.md                    # Tài liệu dự án
```

## ⚙️ Hướng Dẫn Cài Đặt (Local Development)

### 1. Yêu cầu hệ thống
*   Go 1.21 trở lên.
*   Tài khoản Firebase (Tạo một Project mới, bật Firestore và Authentication - Google Sign in).

### 2. Thiết lập Môi Trường
1. Clone dự án về máy.
2. Lấy **Service Account JSON** từ Firebase Console -> Project Settings -> Service Accounts -> Generate new private key.
3. Tạo file `.env` ở thư mục gốc và cấu hình như sau:

```env
PORT=8080
FIREBASE_CREDENTIALS_JSON={"type":"service_account","project_id":"...","private_key":"...","client_email":"..."}
```
*(Lưu ý: Bạn phải thu gọn toàn bộ nội dung file JSON của Firebase thành **1 dòng duy nhất** để gắn vào biến `FIREBASE_CREDENTIALS_JSON`)*.

### 3. Chạy Dự Án (Run)
Mở Terminal tại thư mục gốc và chạy lệnh:
```bash
go mod tidy
go run ./cmd/server
```
Truy cập vào trình duyệt: `http://localhost:8080`

## ☁️ Hướng Dẫn Triển Khai Lên Heroku

Dự án đã được cấu hình sẵn `Procfile` để tương thích hoàn toàn với Heroku Go Buildpack.

1. Đẩy code lên GitHub repository của bạn.
2. Đăng nhập vào [Heroku Dashboard](https://dashboard.heroku.com), tạo App mới.
3. Trong tab **Deploy**, kết nối với GitHub Repo của bạn.
4. Chuyển sang tab **Settings** -> **Reveal Config Vars** và thêm:
   *   **KEY**: `FIREBASE_CREDENTIALS_JSON`
   *   **VALUE**: *(Copy toàn bộ nội dung file JSON cấu hình Admin của Firebase dán vào đây)*.
5. Quay lại tab Deploy, nhấn **Deploy Branch**. Quá trình build sẽ tự động nhận diện `go.mod` và `Procfile`.
6. Tận hưởng thành quả!

## 🤝 Giấy phép (License)
Dự án được phân phối dưới dạng mã nguồn mở. Tự do sao chép và phát triển!
