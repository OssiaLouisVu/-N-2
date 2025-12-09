// frontend/src/api/studentApi.js
const API_BASE_URL = "http://localhost:8080/api";

// Thêm học viên mới + cấp tài khoản (status = NEW mặc định phía DB)
export async function createStudentWithAccount(payload) {
    const res = await fetch(`${API_BASE_URL}/auth/register-student`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
    });

    if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || "Không tạo được tài khoản học viên");
    }
    return res.json();
}

// Lấy danh sách học viên (có keyword, có thể lọc status)
export async function searchStudents(keyword = "", status = "") {
    const params = new URLSearchParams();
    if (keyword && keyword.trim() !== "") {
        params.append("keyword", keyword.trim());
    }
    if (status && status.trim() !== "") {
        params.append("status", status.trim());
    }

    const url =
        params.toString().length > 0 ?
        `${API_BASE_URL}/students?${params.toString()}` :
        `${API_BASE_URL}/students`;

    const res = await fetch(url);
    if (!res.ok) {
        throw new Error("Không tải được danh sách học viên");
    }
    return res.json();
}

// Cập nhật thông tin học viên (kèm status nếu muốn)
export async function updateStudent(id, payload) {
    const res = await fetch(`${API_BASE_URL}/students/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
    });

    if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || "Không cập nhật được thông tin học viên");
    }

    return res.json();
}

// Chỉ đổi status (dùng sau này khi xếp lớp / kết thúc lớp)
export async function updateStudentStatus(id, status) {
    const res = await fetch(`${API_BASE_URL}/students/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
    });

    if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || "Không cập nhật được trạng thái học viên");
    }

    return res.json();
}

// Học viên đã học
export async function searchCompletedStudents(keyword = "") {
    const params = new URLSearchParams();
    if (keyword && keyword.trim() !== "") {
        params.append("keyword", keyword.trim());
    }

    const url =
        params.toString().length > 0 ?
        `${API_BASE_URL}/students/completed?${params.toString()}` :
        `${API_BASE_URL}/students/completed`;

    const res = await fetch(url);
    if (!res.ok) {
        throw new Error("Không tải được danh sách học viên đã học");
    }
    return res.json();
}

// Lấy thông tin thi thử / quá trình học (đã có sẵn API mock-exams)
export async function getStudentMockExamSummary(username) {
    const res = await fetch(
        `${API_BASE_URL}/students/${encodeURIComponent(username)}/mock-exams`
    );
    if (!res.ok) {
        throw new Error("Không lấy được thông tin thi thử của học viên");
    }
    return res.json();
}