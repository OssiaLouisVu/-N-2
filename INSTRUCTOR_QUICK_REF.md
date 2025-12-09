# 📋 Quick Reference - Quản lý Giảng viên

## 🚀 Truy cập nhanh
```
URL: http://localhost:5173/staff/dashboard
Tab: "Quản lý giảng viên" (màu tím)
```

## ⚡ Shortcuts

### Thêm giảng viên mới
1. Click "+" Thêm giảng viên mới
2. Điền Họ tên + Email (bắt buộc)
3. Click "Lưu"
4. Ghi nhớ: `instructor{id}` / `pass1234`

### Kích hoạt
1. Panel NEW → Click "Kích hoạt"
2. Confirm → Chuyển sang ACTIVE

### Nghỉ phép
1. Panel ACTIVE → Click "Nghỉ phép"
2. Confirm → Chuyển ON_LEAVE

### Ngừng hoạt động
1. Panel ACTIVE → Click "Ngừng hoạt động"
2. Confirm → Chuyển INACTIVE

### Xóa
1. Panel INACTIVE → Click "Xóa"
2. Confirm lần 1
3. Nhập tên chính xác
4. Deleted

## ✅ Validation Rules

| Field | Rule | Example |
|-------|------|---------|
| Email | Must have @ and domain | abc@gmail.com |
| Phone | 10-11 digits | 0987654321 |
| Experience | 0-50 years | 5 |
| Hourly Rate | >= 0 | 150000 |

## 🎨 Status Colors

| Status | Color | Icon |
|--------|-------|------|
| NEW | Blue #5865f2 | 👨‍🏫 |
| ACTIVE | Green #10b981 | ✅ |
| ON_LEAVE | Orange #f59e0b | 🏖️ |
| INACTIVE | Gray #6b7280 | 📋 |

## 📧 Auto Account

```
Username: instructor{id}
Password: pass1234
Role: INSTRUCTOR
Email: Sent automatically
```

## 🔍 Search

```
Keywords: Tên, Email, SĐT
Location: Each panel has search bar
```

## 🐛 Common Errors

| Error | Fix |
|-------|-----|
| "Email đã tồn tại" | Use different email |
| "Email không hợp lệ" | Check @ and .com |
| "SĐT phải 10-11 số" | Only numbers |
| "Không thể xóa có lớp" | Wait class end |

## 📱 Contact

- Technical issues → Check backend log
- Feature requests → Contact developer
- Usage questions → Read USER_GUIDE.md

## 🔗 Files

- User Guide: `/INSTRUCTOR_USER_GUIDE.md`
- Tech Docs: `/INSTRUCTOR_TECHNICAL_DOCS.md`
- Summary: `/FINAL_SUMMARY.md`

---
**Version**: 2.0 | **Updated**: 8/12/2024
