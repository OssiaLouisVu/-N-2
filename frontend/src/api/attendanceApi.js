// src/api/attendanceApi.js
const BASE_URL = "http://localhost:8080";

async function handleRes(res, defaultMsg) {
    if (!res.ok) {
        const text = await res.text();
        throw new Error(defaultMsg + " - " + text);
    }
    return res.json();
}

// Lấy danh sách học viên của 1 lớp
export async function fetchClassStudents(classId) {
    const res = await fetch(`${BASE_URL}/api/classes/${classId}/students`);
    return handleRes(res, "Không lấy được danh sách học viên");
}

// Lấy danh sách buổi dạy / điểm danh của 1 lớp
export async function fetchAttendanceSessions(classId) {
    const url = `${BASE_URL}/api/attendance/sessions?classId=${encodeURIComponent(
        classId
    )}`;
    const res = await fetch(url);
    return handleRes(res, "Không lấy được danh sách buổi học");
}

// Tạo buổi dạy mới (Thêm buổi dạy)
export async function createAttendanceSession({ classId, date, note }) {
    const res = await fetch(`${BASE_URL}/api/attendance/sessions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ classId, date, note }),
    });
    return handleRes(res, "Không tạo được buổi dạy mới");
}

// Lưu kết quả điểm danh (+ gửi thông báo tuỳ chọn)
// Nếu không truyền sendNotification thì mặc định = true (có gửi email)
export async function saveAttendanceRecords(
    sessionId,
    records,
    sendNotification = true
) {
    const res = await fetch(
        `${BASE_URL}/api/attendance/sessions/${sessionId}/records`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                records,
                sendNotification, // luôn có true/false rõ ràng
            }),
        }
    );
    return handleRes(res, "Không lưu được kết quả điểm danh");
}

// ===== Employee attendance (manager) – new helper APIs =====

export async function notifyDailyAttendance({ date, target = 'all', role = 'ALL', search = '', active = 'true' }) {
    const res = await fetch(`${BASE_URL}/api/attendance/notify/daily`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date, target, role, search, active })
    });
    return handleRes(res, 'Không gửi được email chấm công ngày');
}

export async function getMonthlyAttendance({ month, role = 'ALL', search = '', active = 'true' }) {
    const params = new URLSearchParams({ month, role, search, active });
    const res = await fetch(`${BASE_URL}/api/attendance/monthly?${params.toString()}`);
    return handleRes(res, 'Không lấy được tổng hợp chấm công tháng');
}

export async function notifyMonthlyAttendance({ month, role = 'ALL', search = '', active = 'true' }) {
    const res = await fetch(`${BASE_URL}/api/attendance/notify/monthly`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ month, role, search, active })
    });
    return handleRes(res, 'Không gửi được email tổng hợp tháng');
}