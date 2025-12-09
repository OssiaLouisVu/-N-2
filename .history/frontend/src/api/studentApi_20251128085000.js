// src/api/studentApi.js
const BASE_URL = "http://localhost:8080/api";

async function handleRes(res, defaultMsg) {
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
        throw new Error(data.message || defaultMsg);
    }
    return data;
}

// Tạo học viên mới + cấp tài khoản (STAFF dùng)
export async function createStudent(payload) {
    const res = await fetch(`${BASE_URL}/staff/students`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
    });
    return handleRes(res, "Tạo học viên thất bại");
}