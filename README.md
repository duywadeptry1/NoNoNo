# Business Manage — Streamlined Mobile Operations + MongoDB + Android Studio

Ứng dụng quản trị vận hành tinh gọn (**4 nghiệp vụ thiết yếu trên di động**), sử dụng **MongoDB (Mongoose)** làm cơ sở dữ liệu trung tâm, đồng bộ giữa **Web (React + Express)** và **Native Android (Kotlin + Jetpack Compose + Room cache)**.

## 1. Phạm vi nghiệp vụ tinh gọn (4 màn hình)

- **Tổng quan (`Home`)**: 3 chỉ số hành động (`Chờ duyệt ngay`, `Đang triển khai`, `Đã hoàn tất`), nút chấm công GPS 1 chạm và hàng chờ duyệt/hoàn tất nhanh.
- **Công việc (`Tasks`)**: Tìm kiếm, lọc trạng thái, chuyển trạng thái 1 chạm (`Duyệt triển khai` → `Xác nhận hoàn tất`), xem chi tiết và tạo việc nhanh 3 trường.
- **Chấm công (`Check-in`)**: Chọn chi nhánh, chấm công GPS 1 chạm lưu xuống MongoDB và nhật ký thao tác trực tiếp.
- **Cài đặt (`Settings`)**: Đổi Dark/Light mode, kiểm tra trạng thái kết nối MongoDB, đồng bộ lại dữ liệu và khôi phục dữ liệu mẫu.

## 2. Chạy Web + API + MongoDB

### Cách 1: Docker Compose (Kèm MongoDB 7)

```bash
docker compose up --build
```

Ứng dụng chạy tại `http://localhost:3000`, kết nối trực tiếp MongoDB tại `mongodb://mongo:27017/business_manage`.

### Cách 2: Chạy trực tiếp trên máy (Node.js)

```bash
npm install
# Tùy chọn: export MONGODB_URI="mongodb://127.0.0.1:27017/business_manage"
npm run dev
```

- Nếu `MONGODB_URI` được cấu hình và MongoDB đang chạy, dữ liệu được lưu vào 3 collection (`orders`, `checkins`, `activities`).
- Nếu chưa bật MongoDB daemon, API tự chuyển sang bộ nhớ đệm (`memory-fallback`) để giao diện vẫn hoạt động trơn tru.
- **API Endpoints**: `GET /api/workspace`, `GET /orders`, `POST /orders`, `POST /orders/bulk`, `PATCH /orders/:id/status`, `DELETE /orders/:id`, `POST /api/checkin`, `POST /api/workspace/reset`, `GET /api/health` (và các route tương thích `/checkin`, `/workspace`, `/health`).

## 3. Chạy trên Android Studio (`android-studio/`)

1. Mở **Android Studio** → **File > Open...** → chọn thư mục `android-studio/`.
2. Kiểm tra cấu hình kết nối backend trong `android-studio/.env` (tạo từ `android-studio/.env.example`) hoặc `android-studio/gradle.properties`:
   - Android Emulator: `API_BASE_URL=http://10.0.2.2:3000` (mặc định).
   - Thiết bị thật cùng Wi-Fi: `API_BASE_URL=http://<IPv4-máy-tính>:3000`.
3. Project sử dụng **Gradle 9.3.1**, **AGP 9.1.1**, **Kotlin 2.2.10**, **JDK 21**, **Compile/Target SDK 36**, và không còn phụ thuộc `google-services.json`.
4. Nhấn **Sync Project with Gradle Files** → **Run 'app'**.

## 4. Build Cross-Platform với Capacitor (tùy chọn)

```bash
npm run build
npx cap add android
npx cap sync
npx cap open android
```
