// src/api/studentApi.js
const BASE_URL = "http://localhost:8080/api";

async function handleRes(res, defaultMsg) {
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
        throw new Error(data.message || defaultMsg);
    }
    return data;
}

// 1) Thêm học viên + cấp tài khoản
export async function createStudent(payload) {
    const res = await fetch(`${BASE_URL}/staff/students`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
    });
    return handleRes(res, "Tạo học viên thất bại");
}

// 2) Tìm kiếm học viên
export async function searchStudents(params = {}) {
    const { keyword } = params;
    const url = new URL(`${BASE_URL}/staff/students`);
    if (keyword) {
        url.searchParams.set("keyword", keyword);
    }

    const res = await fetch(url.toString(), {
        method: "GET",
    });
    return handleRes(res, "Tìm kiếm học viên thất bại");
}

// 3) Cập nhật thông tin học viên
export async function updateStudent(id, payload) {
    const res = await fetch(`${BASE_URL}/staff/students/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
    });
    return handleRes(res, "Cập nhật học viên thất bại");
}