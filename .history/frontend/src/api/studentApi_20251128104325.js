// frontend/src/api/studentApi.js
const API_BASE = "http://localhost:8080";

export async function searchStudents({ keyword = "", status = "" } = {}) {
    const params = new URLSearchParams();
    if (keyword) params.append("keyword", keyword);
    if (status) params.append("status", status);

    const res = await fetch(`${API_BASE}/api/students?${params.toString()}`);
    if (!res.ok) {
        throw new Error("Không lấy được danh sách học viên");
    }
    const data = await res.json();
    return data.students || [];
}

export async function createStudent(payload) {
    const res = await fetch(`${API_BASE}/api/students`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
    });

    if (!res.ok) {
        const text = await res.text();
        throw new Error(`Không tạo được học viên: ${text}`);
    }

    const data = await res.json();
    return data.student;
}

export async function updateStudent(id, payload) {
    const res = await fetch(`${API_BASE}/api/students/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
    });

    if (!res.ok) {
        const text = await res.text();
        throw new Error(`Không cập nhật được học viên: ${text}`);
    }

    const data = await res.json();
    return data.student;
}