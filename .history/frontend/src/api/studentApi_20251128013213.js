// src/api/studentApi.js
const BASE_URL = "http://localhost:8080";

async function handleRes(res, defaultMsg) {
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
        throw new Error(data.message || defaultMsg);
    }
    return data;
}

export async function createStudent(payload) {
    const res = await fetch(`${BASE_URL}/api/staff/students`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
    });
    return handleRes(res, "Tạo học viên thất bại");
}

export async function searchStudents(keyword) {
    const q = encodeURIComponent(keyword || "");
    const res = await fetch(
        `${BASE_URL}/api/staff/students/search?keyword=${q}`
    );
    return handleRes(res, "Tìm kiếm học viên thất bại");
}

export async function updateStudent(id, payload) {
    const res = await fetch(`${BASE_URL}/api/staff/students/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
    });
    return handleRes(res, "Cập nhật học viên thất bại");
}