# 👨‍🏫 Hướng dẫn Quản lý Giảng viên

## 📋 Tổng quan

Hệ thống quản lý giảng viên được thiết kế tương tự như quản lý học viên, bao gồm đầy đủ các chức năng CRUD và quản lý trạng thái.

## 🚀 Các bước triển khai

### 1. Chạy Migration Database

```bash
cd backend
mysql -u root -p english_center < migrations/016_create_instructors.sql
```

Migration này sẽ tạo các bảng:
- `instructors` - Lưu thông tin giảng viên
- `instructor_schedules` - Lưu lịch rảnh của giảng viên
- `instructor_class_history` - Lịch sử giảng dạy

### 2. Khởi động Backend

```bash
cd backend
npm start
```

Backend sẽ tự động load route `/api/instructors` từ file `routes/instructorRoutes.js`

### 3. Khởi động Frontend

```bash
cd frontend
npm run dev
```

## 📊 Cấu trúc Database

### Bảng `instructors`

| Trường | Kiểu | Mô tả |
|--------|------|-------|
| id | INT | ID tự tăng |
| user_id | INT | Liên kết với bảng users |
| full_name | VARCHAR(255) | Họ tên giảng viên |
| phone | VARCHAR(20) | Số điện thoại |
| email | VARCHAR(100) | Email (unique) |
| specialization | VARCHAR(100) | Chuyên môn (IELTS, TOEIC...) |
| level | VARCHAR(50) | Trình độ (Junior, Senior, Expert) |
| experience_years | INT | Số năm kinh nghiệm |
| hourly_rate | DECIMAL(10,2) | Lương theo giờ |
| status | ENUM | NEW, ACTIVE, INACTIVE, ON_LEAVE |
| bio | TEXT | Giới thiệu |
| note | TEXT | Ghi chú |

## 🎯 Các tính năng chính

### 1. Thêm giảng viên mới (NEW)
- Form nhập thông tin đầy đủ
- Tự động tạo tài khoản đăng nhập: `instructor{id}`
- Mật khẩu mặc định: `pass1234`
- Gửi email thông tin tài khoản
- Validate email format

### 2. Giảng viên đang dạy (ACTIVE)
- Hiển thị số lớp đang dạy
- Xem danh sách lớp chi tiết
- Chuyển sang trạng thái:
  - **Nghỉ phép** (ON_LEAVE)
  - **Ngừng hoạt động** (INACTIVE)

### 3. Giảng viên không hoạt động (INACTIVE)
- Xem lịch sử giảng dạy
- Kích hoạt lại
- Xóa vĩnh viễn (nếu không còn lớp active)

## 🔌 API Endpoints

### GET /api/instructors
Lấy danh sách giảng viên
```javascript
Query params:
- status: NEW | ACTIVE | INACTIVE | ON_LEAVE
- keyword: tìm theo tên, email, sđt
```

### POST /api/instructors
Tạo giảng viên mới
```javascript
Body: {
  full_name: string (required),
  email: string (required),
  phone: string,
  specialization: string,
  level: string,
  experience_years: number,
  hourly_rate: number,
  bio: string,
  note: string
}
```

### PUT /api/instructors/:id
Cập nhật thông tin

### DELETE /api/instructors/:id
Xóa giảng viên (chỉ khi không có lớp active)

### GET /api/instructors/:id/classes
Lấy danh sách lớp của giảng viên

### GET /api/instructors/:id/statistics
Thống kê giảng viên

### POST /api/instructors/:id/schedules
Cập nhật lịch rảnh

## 🎨 UI/UX

### Màu sắc section
- Gradient: `#8b5cf6` → `#a78bfa` (Tím)
- Border: `#f3e8ff`

### Các panel
1. **AddInstructorPanel**: Form thêm mới + danh sách NEW
2. **ActiveInstructorsPanel**: Danh sách đang dạy + modal xem lớp
3. **InactiveInstructorsPanel**: Danh sách inactive + modal lịch sử

## 🔐 Tài khoản giảng viên

- Username: `instructor{id}` (ví dụ: instructor1, instructor2...)
- Password mặc định: `pass1234`
- Role: `INSTRUCTOR`
- Tự động gửi email thông báo

## 📝 Luồng sử dụng

1. **Thêm giảng viên mới**
   - Staff điền form thông tin giảng viên
   - Hệ thống tự động tạo tài khoản
   - Gửi email thông tin đăng nhập cho giảng viên
   - Giảng viên ở trạng thái NEW

2. **Kích hoạt giảng viên**
   - Click nút "Kích hoạt" trong danh sách NEW
   - Giảng viên chuyển sang ACTIVE
   - Có thể gán vào lớp (qua ClassManagement)

3. **Quản lý giảng viên đang dạy**
   - Xem số lớp đang dạy
   - Xem chi tiết từng lớp
   - Chuyển trạng thái nếu cần

4. **Giảng viên ngừng hoạt động**
   - Xem lịch sử giảng dạy
   - Có thể kích hoạt lại
   - Xóa nếu không cần thiết

## 🔗 Liên kết với các module khác

### Với Class Management
- Gán giảng viên vào lớp qua bảng `class_teachers`
- Vai trò: MAIN (chính) hoặc ASSISTANT (phụ)

### Với Users
- Liên kết qua trường `user_id`
- Giảng viên có thể đăng nhập hệ thống

### Với Schedule
- Lịch rảnh: `instructor_schedules`
- Lịch dạy thực tế: `class_sessions`

## 🎁 Tính năng bổ sung có thể mở rộng

1. **Dashboard giảng viên riêng**
   - Xem lớp đang dạy
   - Xem lịch dạy
   - Điểm danh học viên

2. **Quản lý lương**
   - Tính lương theo giờ dạy
   - Báo cáo thu nhập

3. **Đánh giá giảng viên**
   - Rating từ học viên
   - Feedback sau mỗi khóa học

4. **Thống kê nâng cao**
   - Số giờ dạy/tháng
   - Tỷ lệ học viên hoàn thành
   - Hiệu suất giảng dạy

## 🐛 Troubleshooting

### Lỗi email không gửi được
- Kiểm tra file `.env`: MAIL_USER, MAIL_PASS
- Đảm bảo đã bật "Less secure app access" cho Gmail

### Lỗi foreign key constraint
- Đảm bảo đã chạy migration `003_create_users.sql` trước
- Chạy migration theo đúng thứ tự

### Không thể xóa giảng viên
- Kiểm tra giảng viên có lớp đang ACTIVE không
- Chuyển lớp sang COMPLETED trước khi xóa

## ✅ Checklist triển khai

- [x] Chạy migration 016_create_instructors.sql
- [x] Restart backend server
- [x] Test API endpoints
- [x] Kiểm tra gửi email
- [x] Test UI components
- [x] Verify tích hợp với StaffDashboard

## 🎉 Hoàn thành!

Bây giờ bạn đã có đầy đủ chức năng Quản lý Giảng viên giống như Quản lý Học viên. Chúc bạn sử dụng hiệu quả!
