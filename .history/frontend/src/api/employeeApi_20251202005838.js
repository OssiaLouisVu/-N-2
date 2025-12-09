// frontend/src/api/employeeApi.js
const API_BASE = "http://localhost:8080";

export async function fetchEmployees({ active = "true", role = "ALL", search = "" } = {}) {
    const params = new URLSearchParams({ active, role, search });
    const res = await fetch(`${API_BASE}/api/employees?${params.toString()}`);
    if (!res.ok) throw new Error("Lỗi khi tải danh sách nhân viên");
    return res.json();
}

export async function addEmployee(form) {
    const res = await fetch(`${API_BASE}/api/employees`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
    });
    return res.json();
}

export async function deactivateEmployee(id) {
    const res = await fetch(`${API_BASE}/api/employees/${id}/deactivate`, { method: "PUT" });
    return res.json();
}

export async function getAttendanceSummary(id) {
    const res = await fetch(`${API_BASE}/api/employees/${id}/attendance-summary`);
    return res.json();
}

// Gửi thông báo cho nhân viên (mock, chỉ log ra console)
export async function sendNotification({ employeeIds, title, content }) {
    // Ở đây chỉ mock, thực tế sẽ gọi API backend gửi email/SMS/Zalo
    console.log("[MOCK] Gửi thông báo:", { employeeIds, title, content });
    return { success: true };
}
