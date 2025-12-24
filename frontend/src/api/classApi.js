const API_BASE = "http://localhost:8080";

// Lấy danh sách lớp học
export async function getClasses(query = {}) {
    const params = new URLSearchParams();
    for (const k of Object.keys(query)) {
        if (query[k] != null && query[k] !== "") params.append(k, query[k]);
    }
    const res = await fetch(`${API_BASE}/api/classes?${params.toString()}`);
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    return res.json();
}

// Tạo lớp mới
export async function createClass(payload) {
    const res = await fetch(`${API_BASE}/api/classes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
    });
    return res.json();
}

// Lấy chi tiết lớp
export async function getClass(id) {
    const res = await fetch(`${API_BASE}/api/classes/${id}`);
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    return res.json();
}

// Cập nhật lớp
export async function updateClass(id, payload) {
    const res = await fetch(`${API_BASE}/api/classes/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
    });
    return res.json();
}

// Xoá lớp
export async function deleteClass(id) {
    const res = await fetch(`${API_BASE}/api/classes/${id}`, { method: "DELETE" });
    return res.json();
}

// Gán học viên vào lớp
export async function assignStudentToClass(classId, studentId, courseId, sessionDates, sessionTimeStart, sessionTimeEnd) {
    const res = await fetch(`${API_BASE}/api/classes/${classId}/assign`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentId, courseId, sessionDates, sessionTimeStart, sessionTimeEnd }),
    });

    return res.json(); // ✅ thay handle(res)
}

// Gán giảng viên vào lớp
export async function assignInstructorToClass(classId, instructorId, role = "MAIN") {
    const res = await fetch(`${API_BASE}/api/classes/${classId}/assign-instructor`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ instructorId, role }),
    });
    return res.json();
}

// Đánh dấu học viên hoàn thành
export async function finishStudentInClass(classId, studentId) {
    const res = await fetch(`${API_BASE}/api/classes/${classId}/finish`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentId }),
    });
    return res.json();
}

// Tạo lịch học lớp
export async function createClassSchedules(classId, sessionDates, sessionTimeStart, sessionTimeEnd, room, replaceAll = true) {
    const res = await fetch(`${API_BASE}/api/classes/${classId}/schedules`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionDates, sessionTimeStart, sessionTimeEnd, room, replaceAll }),
    });
    return res.json();
}

export default {
    getClasses,
    createClass,
    getClass,
    updateClass,
    deleteClass,
    assignStudentToClass,
    assignInstructorToClass,
    finishStudentInClass,
    createClassSchedules,
};