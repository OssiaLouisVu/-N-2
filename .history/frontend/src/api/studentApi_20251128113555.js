// frontend/src/api/studentApi.js
const API_BASE = "http://localhost:8080";

// Hàm dùng chung
async function fetchStudentsByStatus(status, keyword = "") {
    const params = new URLSearchParams();
    if (status) params.append("status", status);
    if (keyword) params.append("keyword", keyword);

    const res = await fetch(`${API_BASE}/api/students?` + params.toString());
    return res.json(); // { success, students }
}

// === HÀM MỚI: dùng cho OngoingStudentsPanel, CompletedStudentsPanel ===
export async function searchStudents({ status = "", keyword = "" } = {}) {
    return fetchStudentsByStatus(status, keyword);
}

// --- Học viên mới (NEW) ---
export async function searchNewStudents(keyword) {
    return fetchStudentsByStatus("NEW", keyword);
}

// --- Học viên đang học (ACTIVE) ---
export async function searchActiveStudents(keyword) {
    return fetchStudentsByStatus("ACTIVE", keyword);
}

// --- Học viên đã học (COMPLETED) ---
export async function searchCompletedStudents(keyword) {
    return fetchStudentsByStatus("COMPLETED", keyword);
}

// --- Tạo mới học viên ---
export async function createStudent(payload) {
    const res = await fetch(`${API_BASE}/api/students`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
    });
    return res.json();
}

// --- Cập nhật học viên (sửa + đổi trạng thái) ---
export async function updateStudent(id, payload) {
    const res = await fetch(`${API_BASE}/api/students/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
    });
    return res.json();
}