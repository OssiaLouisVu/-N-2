# 🛠️ Tài liệu kỹ thuật - Hệ thống Quản lý Giảng viên

## 📁 Cấu trúc dự án

```
backend/
  ├── routes/
  │   └── instructorRoutes.js     # API endpoints cho giảng viên
  ├── migrations/
  │   └── 016_create_instructors.sql  # Database schema
  └── server.js                    # Mount instructorRoutes

frontend/
  ├── src/
  │   ├── api/
  │   │   └── instructorApi.js    # API client functions
  │   ├── components/instructor/
  │   │   ├── AddInstructorPanel.jsx       # Panel thêm/sửa giảng viên
  │   │   ├── ActiveInstructorsPanel.jsx   # Panel giảng viên đang dạy
  │   │   └── InactiveInstructorsPanel.jsx # Panel giảng viên không hoạt động
  │   └── pages/
  │       └── StaffDashboard.jsx   # Tích hợp instructor section
```

## 🗄️ Database Schema

### Bảng: `instructors`
```sql
CREATE TABLE instructors (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT DEFAULT NULL,
    full_name VARCHAR(255) NOT NULL,
    phone VARCHAR(20) DEFAULT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    date_of_birth DATE DEFAULT NULL,
    address TEXT DEFAULT NULL,
    specialization VARCHAR(100) DEFAULT NULL,  -- IELTS, TOEIC, etc.
    level ENUM('Junior','Senior','Expert') DEFAULT NULL,
    experience_years INT DEFAULT 0,
    bio TEXT DEFAULT NULL,
    certifications TEXT DEFAULT NULL,
    hourly_rate DECIMAL(10,2) DEFAULT 0,
    payment_method ENUM('cash','bank_transfer') DEFAULT 'cash',
    bank_account VARCHAR(50) DEFAULT NULL,
    bank_name VARCHAR(100) DEFAULT NULL,
    status ENUM('NEW','ACTIVE','INACTIVE','ON_LEAVE') DEFAULT 'NEW',
    note TEXT DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_status (status),
    INDEX idx_email (email)
);
```

### Bảng: `instructor_schedules`
```sql
CREATE TABLE instructor_schedules (
    id INT AUTO_INCREMENT PRIMARY KEY,
    instructor_id INT NOT NULL,
    day_of_week TINYINT NOT NULL,  -- 0=CN, 1=T2, ..., 6=T7
    time_start TIME NOT NULL,
    time_end TIME NOT NULL,
    note VARCHAR(255) DEFAULT NULL,
    status ENUM('ACTIVE','INACTIVE') DEFAULT 'ACTIVE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (instructor_id) REFERENCES instructors(id) ON DELETE CASCADE,
    INDEX idx_instructor_day (instructor_id, day_of_week)
);
```

### Bảng: `instructor_class_history`
```sql
CREATE TABLE instructor_class_history (
    id INT AUTO_INCREMENT PRIMARY KEY,
    instructor_id INT NOT NULL,
    class_id INT NOT NULL,
    role ENUM('MAIN','ASSISTANT') DEFAULT 'MAIN',
    started_at DATE NOT NULL,
    ended_at DATE DEFAULT NULL,
    note TEXT DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (instructor_id) REFERENCES instructors(id) ON DELETE CASCADE,
    FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE,
    INDEX idx_instructor_class (instructor_id, class_id)
);
```

## 🔌 Backend API

### Base URL
```
http://localhost:8080/api/instructors
```

### Endpoints

#### 1. GET /api/instructors
**Mô tả**: Lấy danh sách giảng viên với filter

**Query Parameters**:
- `status` (optional): NEW | ACTIVE | INACTIVE | ON_LEAVE
- `keyword` (optional): Tìm theo tên/email/SĐT

**Response**:
```json
{
  "success": true,
  "instructors": [
    {
      "id": 1,
      "full_name": "Nguyễn Văn A",
      "email": "nguyenvana@gmail.com",
      "phone": "0987654321",
      "specialization": "IELTS",
      "level": "Senior",
      "experience_years": 5,
      "hourly_rate": 150000,
      "status": "ACTIVE",
      "active_classes_count": 3,
      "created_at": "2024-12-08T10:00:00.000Z"
    }
  ]
}
```

#### 2. GET /api/instructors/:id
**Mô tả**: Lấy chi tiết giảng viên

**Response**:
```json
{
  "success": true,
  "instructor": {
    "id": 1,
    "full_name": "Nguyễn Văn A",
    "email": "nguyenvana@gmail.com",
    "bio": "10 năm kinh nghiệm...",
    "active_classes_count": 3,
    "total_classes_count": 15,
    "schedules": [
      {
        "day_of_week": 1,
        "time_start": "18:00:00",
        "time_end": "20:00:00",
        "note": "Thứ 2 tối"
      }
    ]
  }
}
```

#### 3. GET /api/instructors/:id/classes
**Mô tả**: Lấy danh sách lớp của giảng viên

**Query Parameters**:
- `status` (optional): ACTIVE | COMPLETED

**Response**:
```json
{
  "success": true,
  "classes": [
    {
      "id": 10,
      "name": "IELTS 6.0 - K12",
      "start_date": "2024-01-15",
      "end_date": "2024-06-15",
      "status": "ACTIVE",
      "role": "MAIN",
      "student_count": 15
    }
  ]
}
```

#### 4. POST /api/instructors
**Mô tả**: Tạo giảng viên mới

**Request Body**:
```json
{
  "full_name": "Nguyễn Văn A",
  "email": "nguyenvana@gmail.com",
  "phone": "0987654321",
  "specialization": "IELTS",
  "level": "Senior",
  "experience_years": 5,
  "hourly_rate": 150000,
  "bio": "Giảng viên IELTS 10 năm kinh nghiệm",
  "note": "Ưu tiên lớp tối",
  "status": "NEW"
}
```

**Response**:
```json
{
  "success": true,
  "message": "Đã lưu thông tin giảng viên và tạo tài khoản.",
  "id": 1,
  "username": "instructor1",
  "tempPassword": "pass1234",
  "email": "nguyenvana@gmail.com",
  "emailResult": {
    "sent": true
  }
}
```

**Auto Actions**:
1. Tạo user account với username = `instructor{id}`
2. Hash password = `pass1234`
3. Gửi email thông báo credentials
4. Liên kết user_id với instructor

#### 5. PUT /api/instructors/:id
**Mô tả**: Cập nhật thông tin giảng viên

**Request Body** (partial update):
```json
{
  "status": "ACTIVE",
  "hourly_rate": 200000,
  "note": "Đã tăng lương"
}
```

**Response**:
```json
{
  "success": true,
  "message": "Đã cập nhật thông tin giảng viên."
}
```

#### 6. DELETE /api/instructors/:id
**Mô tả**: Xóa giảng viên

**Validation**:
- Không được có lớp đang ACTIVE
- Cascade delete schedules và history

**Response**:
```json
{
  "success": true,
  "message": "Đã xóa giảng viên."
}
```

#### 7. POST /api/instructors/:id/schedules
**Mô tả**: Cập nhật lịch rảnh

**Request Body**:
```json
{
  "schedules": [
    {
      "day_of_week": 1,
      "time_start": "18:00",
      "time_end": "20:00",
      "note": "Thứ 2 tối"
    },
    {
      "day_of_week": 3,
      "time_start": "18:00",
      "time_end": "20:00",
      "note": "Thứ 4 tối"
    }
  ]
}
```

#### 8. GET /api/instructors/:id/statistics
**Mô tả**: Thống kê giảng viên

**Response**:
```json
{
  "success": true,
  "statistics": {
    "total_classes": 15,
    "active_classes": 3,
    "completed_classes": 12,
    "total_students": 45
  }
}
```

## 🎨 Frontend API Client

### File: `instructorApi.js`

```javascript
// Tìm giảng viên theo status
export async function searchInstructors({ status, keyword })

// Shortcuts
export async function searchNewInstructors(keyword)
export async function searchActiveInstructors(keyword)
export async function searchInactiveInstructors(keyword)

// CRUD
export async function getInstructorDetail(id)
export async function getInstructorClasses(id, status)
export async function createInstructor(payload)
export async function updateInstructor(id, payload)
export async function deleteInstructor(id)

// Schedules & Stats
export async function updateInstructorSchedules(id, schedules)
export async function getInstructorStatistics(id)
```

## 🧩 React Components

### AddInstructorPanel.jsx

**Props**:
```jsx
{
  onGlobalMessage: (msg) => void,  // Hiển thị message global
  onRefreshAll: () => void,        // Refresh tất cả panels
  refreshToken: number             // Trigger reload
}
```

**State**:
```javascript
// Form fields
fullName, phone, email, specialization, level
experienceYears, hourlyRate, bio, note

// List
newInstructors: []
searchKeyword: ""
editingId: null | number
```

**Functions**:
- `handleSubmit()`: Tạo/Cập nhật giảng viên
- `handleActivate(instructor)`: Chuyển NEW → ACTIVE
- `handleEditFromList(instructor)`: Load form để sửa
- `loadNewInstructors()`: Fetch list từ API

### ActiveInstructorsPanel.jsx

**Functions**:
- `handleViewClasses(instructor)`: Hiển thị modal danh sách lớp
- `handleSetOnLeave(instructor)`: Chuyển ACTIVE → ON_LEAVE
- `handleSetInactive(instructor)`: Chuyển ACTIVE → INACTIVE

### InactiveInstructorsPanel.jsx

**Functions**:
- `handleViewHistory(instructor)`: Xem lịch sử lớp đã dạy
- `handleReactivate(instructor)`: Chuyển INACTIVE → ACTIVE
- `handleDelete(instructor)`: Xóa vĩnh viễn (có double confirm)

## 🔄 State Management

### Refresh Flow
```
Component Action
  → API Call
  → Update Local State
  → onRefreshAll() // Refresh other panels
  → onGlobalMessage() // Show success/error
```

### refreshToken Pattern
```javascript
// Parent (StaffDashboard)
const [refreshToken, setRefreshToken] = useState(0);
const handleRefresh = () => setRefreshToken(prev => prev + 1);

// Child Component
useEffect(() => {
  loadData();
}, [refreshToken]);
```

## 🎨 UI/UX Features

### Validation
- Email format: `/^[^\s@]+@[^\s@]+\.[^\s@]+$/`
- Phone: `/^[0-9]{10,11}$/`
- Experience: 0-50 years
- Hourly rate: >= 0

### Messages
- ✅ Success: Green background, checkmark icon
- ❌ Error: Red text, X icon
- ⚠️ Warning: Orange, warning icon
- ℹ️ Info: Blue background

### Confirmations
- Single confirm: Simple actions (activate, set leave)
- Double confirm: Destructive actions (delete)
  - Step 1: Yes/No dialog
  - Step 2: Type exact name

### Colors
```css
NEW: #5865f2 (Blue)
ACTIVE: #10b981 (Green)
ON_LEAVE: #f59e0b (Orange)
INACTIVE: #6b7280 (Gray)
DELETE: #ef4444 (Red)
```

## 🔐 Security

### Password Management
- Default password: `pass1234`
- Hashed with bcrypt (10 rounds)
- Stored in `users` table
- Email sent with credentials

### Authorization
- Only STAFF and ADMIN can access
- Check role in StaffDashboard
- Backend validates on each request

### Data Validation
- Backend: Full validation before DB
- Frontend: Client-side validation for UX
- SQL injection protection: Parameterized queries

## 📧 Email Integration

### Nodemailer Setup
```javascript
const mailTransporter = nodemailer.createTransport({
    service: process.env.MAIL_SERVICE || 'gmail',
    auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
    },
});
```

### Email Template
```
Subject: Tài khoản giảng viên - instructor{id}

Xin chào {fullName},

Tài khoản giảng viên đã được tạo cho bạn:
- Username: instructor{id}
- Mật khẩu tạm thời: pass1234

Vui lòng đăng nhập và đổi mật khẩu ngay sau khi đăng nhập.

Trân trọng,
Trung tâm
```

## 🐛 Error Handling

### Backend Errors
```javascript
try {
    // Business logic
} catch (err) {
    console.error('[CREATE INSTRUCTOR] Error:', err);
    return res.status(500).json({
        success: false,
        message: 'Lỗi server: ' + err.message
    });
}
```

### Frontend Errors
```javascript
try {
    const data = await createInstructor(payload);
    if (!data || !data.success) {
        showMessage("❌ " + (data?.message || "Lỗi server"));
        return;
    }
    // Success
} catch (err) {
    console.error(err);
    showMessage("❌ Lỗi kết nối");
}
```

## 🧪 Testing

### Manual Test Scenarios

1. **Create Instructor**
   - Fill valid data → Success
   - Missing email → Error "Email là bắt buộc"
   - Invalid email → Error "Email không hợp lệ"
   - Duplicate email → Error "Email đã tồn tại"

2. **Update Instructor**
   - Edit NEW instructor → Success
   - Change status → Updates in correct panel

3. **Delete Instructor**
   - Delete with active classes → Error
   - Delete inactive instructor → Success

4. **Search**
   - Search by name → Filtered results
   - Search by email → Filtered results
   - Empty search → All results

## 📊 Performance

### Optimization
- Debounce search input (300ms)
- Lazy load large lists
- Index on status, email columns
- Connection pooling in db.js

### Query Optimization
```sql
-- Use index for status filter
WHERE i.status = 'ACTIVE'

-- Subquery for class count
(SELECT COUNT(*) FROM class_teachers WHERE ...) as active_classes_count
```

## 🚀 Deployment

### Environment Variables
```bash
# .env
MAIL_SERVICE=gmail
MAIL_USER=your-email@gmail.com
MAIL_PASS=your-app-password
MAIL_FROM=noreply@englishcenter.com
```

### Migration
```bash
mysql -u root -p < backend/migrations/016_create_instructors.sql
```

### Start Backend
```bash
cd backend
npm install
node server.js
```

### Start Frontend
```bash
cd frontend
npm install
npm run dev
```

## 📝 Changelog

### Version 1.0 (2024-12-08)
- ✅ Initial release
- ✅ CRUD operations
- ✅ Status management (NEW/ACTIVE/INACTIVE/ON_LEAVE)
- ✅ Auto account creation
- ✅ Email integration
- ✅ Search functionality
- ✅ Class history tracking
- ✅ Validation & error handling

---

**Maintainer**: AI Assistant  
**Last Updated**: 8/12/2024
