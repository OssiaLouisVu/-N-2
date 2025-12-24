// src/api/feeApi.js
const API_BASE =
    import.meta.env.VITE_API_BASE || "http://localhost:8080";

async function handle(res) {
    const data = await res.json().catch(() => ({}));
    return data;
}

// Danh sách khóa học có ít nhất 1 học viên đã thanh toán
export async function getPaidCourses() {
    const res = await fetch(`${API_BASE}/api/fee/paid-courses`);
    return handle(res);
}

// Danh sách học viên đã thanh toán theo khóa
export async function getPaidStudentsByCourse(courseId) {
    const res = await fetch(`${API_BASE}/api/fee/paid-students?courseId=${courseId}`);
    return handle(res);
}