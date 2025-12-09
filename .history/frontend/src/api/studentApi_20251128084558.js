// frontend/src/api/studentApi.js
const API_BASE_URL = "http://localhost:8080/api";

// Đã dùng cho "Thêm học viên mới + cấp tài khoản"
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

// Lấy danh sách học viên (có keyword tìm kiếm)
export async function searchStudents(keyword = "") {
    const params = new URLSearchParams();
    if (keyword && keyword.trim() !== "") {
        params.append("keyword", keyword.trim());
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

// Cập nhật thông tin học viên
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