# 📚 Hướng dẫn sử dụng - Quản lý Giảng viên

## 🎯 Tổng quan

Chức năng **Quản lý Giảng viên** cho phép nhân viên quản lý toàn bộ vòng đời của giảng viên từ lúc thêm mới đến khi kết thúc hợp tác.

## 🔐 Truy cập

1. Đăng nhập với tài khoản **STAFF** hoặc **ADMIN**
2. Vào **Staff Dashboard**
3. Click vào tab **"Quản lý giảng viên"** (màu tím)

## 📋 Các trạng thái giảng viên

| Trạng thái | Icon | Mô tả | Vị trí |
|-----------|------|-------|--------|
| **NEW** | 👨‍🏫 | Giảng viên mới thêm, chưa kích hoạt | Panel 1 |
| **ACTIVE** | ✅ | Giảng viên đang hoạt động, có thể dạy lớp | Panel 2 |
| **ON_LEAVE** | 🏖️ | Giảng viên tạm nghỉ phép | Panel 2 (hidden) |
| **INACTIVE** | 📋 | Giảng viên đã ngừng hoạt động | Panel 3 |

## ➕ Thêm giảng viên mới

### Bước 1: Điền thông tin
Click nút **"+ Thêm giảng viên mới"**, điền các trường:

**Thông tin bắt buộc:**
- ✅ Họ và tên (VD: Nguyễn Văn A)
- ✅ Email (VD: nguyenvana@gmail.com)

**Thông tin tuỳ chọn:**
- Số điện thoại (10-11 số)
- Chuyên môn (IELTS, TOEIC, Giao tiếp, Thiếu nhi, Business English)
- Trình độ (Junior, Senior, Expert)
- Kinh nghiệm (0-50 năm)
- Lương theo giờ (VNĐ)
- Giới thiệu (Bio)
- Ghi chú

### Bước 2: Lưu thông tin
Click nút **"Lưu"** - Hệ thống sẽ:
- ✅ Tạo giảng viên với trạng thái NEW
- ✅ Tự động tạo tài khoản đăng nhập
  - Username: `instructor{ID}` (VD: instructor1)
  - Password: `pass1234`
- ✅ Gửi email thông tin tài khoản (nếu có email)
- ✅ Hiển thị thông tin tài khoản trên màn hình

### Lưu ý quan trọng:
- 📧 **Email**: Phải hợp lệ và chưa tồn tại trong hệ thống
- 📱 **SĐT**: Nếu điền phải có 10-11 chữ số
- 💰 **Lương**: Không được âm
- 📅 **Kinh nghiệm**: Từ 0-50 năm

## ✏️ Chỉnh sửa giảng viên NEW

Trong danh sách **Giảng viên mới (NEW)**:
1. Click nút **"Sửa"** trên hàng giảng viên
2. Form sẽ tự động điền thông tin
3. Chỉnh sửa các trường cần thiết
4. Click **"Cập nhật"** để lưu
5. Click **"Hủy"** để hủy bỏ

## ✅ Kích hoạt giảng viên

Khi giảng viên sẵn sàng dạy:
1. Tìm giảng viên trong danh sách NEW
2. Click nút **"Kích hoạt"**
3. Xác nhận trong hộp thoại
4. Giảng viên chuyển sang trạng thái ACTIVE

## 👁️ Xem lớp đang dạy

Trong panel **Giảng viên đang dạy (ACTIVE)**:
1. Click nút **"Xem lớp"**
2. Modal hiển thị:
   - Tên lớp
   - Mã lớp
   - Vai trò (Chính/Phụ)
   - Số học viên
   - Ngày bắt đầu

## 🏖️ Đặt giảng viên nghỉ phép

Khi giảng viên tạm nghỉ:
1. Tìm giảng viên trong danh sách ACTIVE
2. Click nút **"Nghỉ phép"** (màu cam)
3. Xác nhận
4. Giảng viên chuyển sang ON_LEAVE (không hiển thị trong ACTIVE)

## ⛔ Ngừng hoạt động

Khi giảng viên kết thúc hợp tác:
1. Tìm giảng viên trong danh sách ACTIVE
2. Click nút **"Ngừng hoạt động"** (màu đỏ)
3. Xác nhận
4. Giảng viên chuyển sang INACTIVE

## 🔄 Kích hoạt lại

Kích hoạt lại giảng viên INACTIVE:
1. Vào panel **Giảng viên không hoạt động (INACTIVE)**
2. Click nút **"Kích hoạt lại"** (màu xanh lá)
3. Xác nhận
4. Giảng viên chuyển về ACTIVE

## 🗑️ Xóa vĩnh viễn

⚠️ **CẢNH BÁO**: Thao tác KHÔNG THỂ HOÀN TÁC!

1. Vào panel INACTIVE
2. Click nút **"Xóa"** (màu đỏ)
3. Xác nhận lần 1
4. Nhập chính xác tên giảng viên để xác nhận lần 2
5. Giảng viên và tài khoản bị xóa vĩnh viễn

**Điều kiện xóa:**
- ✅ Giảng viên phải ở trạng thái INACTIVE
- ✅ Không có lớp đang hoạt động

## 🔍 Tìm kiếm

Mỗi panel có thanh tìm kiếm riêng:
- Tìm theo: Tên, SĐT, Email
- Gõ từ khóa → Click **"Tìm"**
- Kết quả hiển thị ngay lập tức

## 💡 Tips & Tricks

### ✨ Luồng làm việc chuẩn
```
Thêm mới (NEW) 
  → Kích hoạt (ACTIVE) 
  → Dạy lớp
  → Nghỉ phép (ON_LEAVE) nếu cần
  → Ngừng hoạt động (INACTIVE) khi kết thúc
  → Xóa (nếu cần thiết)
```

### 🎯 Best Practices
1. **Luôn kiểm tra email** trước khi lưu
2. **Điền đầy đủ thông tin** để dễ quản lý
3. **Sử dụng Ghi chú** để lưu thông tin quan trọng
4. **Không xóa** giảng viên đã dạy nhiều lớp (để giữ lịch sử)
5. **Dùng ON_LEAVE** thay vì INACTIVE nếu nghỉ tạm thời

### ⚡ Validation tự động
- Email phải hợp lệ (@domain.com)
- SĐT phải 10-11 số
- Kinh nghiệm 0-50 năm
- Lương không âm
- Tên giảng viên bắt buộc

### 📊 Theo dõi
- **Số lớp đang dạy**: Hiển thị badge màu xanh trong panel ACTIVE
- **Lịch sử lớp**: Xem qua nút "Xem lịch sử" trong INACTIVE

## 🐛 Xử lý lỗi thường gặp

| Lỗi | Nguyên nhân | Giải pháp |
|-----|------------|-----------|
| "Email đã tồn tại" | Email trùng | Dùng email khác |
| "Email không hợp lệ" | Sai format | Kiểm tra @, .com |
| "SĐT phải 10-11 số" | SĐT sai format | Chỉ nhập số |
| "Không thể xóa giảng viên đang có lớp" | Có lớp ACTIVE | Đợi lớp kết thúc |
| "Lỗi server" | Backend lỗi | Báo IT Support |

## 📞 Hỗ trợ

Nếu gặp vấn đề:
1. Kiểm tra kết nối mạng
2. Refresh trình duyệt (F5)
3. Xóa cache và thử lại
4. Liên hệ IT Support nếu vẫn lỗi

---

## 🔒 Bảo mật

- Tài khoản giảng viên tự động tạo với mật khẩu `pass1234`
- Yêu cầu giảng viên đổi mật khẩu ngay sau lần đăng nhập đầu
- Không chia sẻ thông tin tài khoản qua kênh không an toàn

---

**Phiên bản**: 1.0  
**Cập nhật**: 8/12/2024  
**Người viết**: AI Assistant
