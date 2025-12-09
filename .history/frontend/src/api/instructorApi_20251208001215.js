// frontend/src/api/instructorApi.js
const API_BASE = "http://localhost:8080";

/**
 * Hàm tổng quát: tìm giảng viên theo status + keyword
 */
export async function searchInstructors({ status = "", keyword = "" } = {}) {
    const params = new URLSearchParams();
    if (status) params.append("status", status);
    if (keyword) params.append("keyword", keyword);

    const res = await fetch(`${API_BASE}/api/instructors?${params.toString()}`);

    if (!res.ok) {
        throw new Error(`HTTP error ${res.status}`);
    }

    return res.json();
}

/**
 * Giảng viên mới (NEW)
 */
export async function searchNewInstructors(keyword) {
    return searchInstructors({ status: "NEW", keyword });
}

/**
 * Giảng viên đang dạy (ACTIVE)
 */
export async function searchActiveInstructors(keyword) {
    return searchInstructors({ status: "ACTIVE", keyword });
}

/**
 * Giảng viên không hoạt động (INACTIVE)
 */
export async function searchInactiveInstructors(keyword) {
    return searchInstructors({ status: "INACTIVE", keyword });
}

/**
 * Giảng viên nghỉ phép (ON_LEAVE)
 */
export async function searchOnLeaveInstructors(keyword) {
    return searchInstructors({ status: "ON_LEAVE", keyword });
}

/**
 * Lấy chi tiết giảng viên
 */
export async function getInstructorDetail(id) {
    const res = await fetch(`${API_BASE}/api/instructors/${id}`);
    if (!res.ok) {
        throw new Error(`HTTP error ${res.status}`);
    }
    return res.json();
}

/**
 * Lấy danh sách lớp của giảng viên
 */
export async function getInstructorClasses(id, status = "") {
    const params = new URLSearchParams();
    if (status) params.append("status", status);

    const res = await fetch(`${API_BASE}/api/instructors/${id}/classes?${params.toString()}`);
    if (!res.ok) {
        throw new Error(`HTTP error ${res.status}`);
    }
    return res.json();
}

/**
 * Lấy thống kê giảng viên
 */
export async function getInstructorStatistics(id) {
    const res = await fetch(`${API_BASE}/api/instructors/${id}/statistics`);
    if (!res.ok) {
        throw new Error(`HTTP error ${res.status}`);
    }
    return res.json();
}

/**
 * Tạo mới giảng viên
 */
export async function createInstructor(payload) {
    const res = await fetch(`${API_BASE}/api/instructors`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
    });
    return res.json();
}

/**
 * Cập nhật thông tin giảng viên
 */
export async function updateInstructor(id, payload) {
    const res = await fetch(`${API_BASE}/api/instructors/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
    });
    return res.json();
}

/**
 * Xóa giảng viên
 */
export async function deleteInstructor(id) {
    const res = await fetch(`${API_BASE}/api/instructors/${id}`, {
        method: "DELETE",
    });
    return res.json();
}

/**
 * Cập nhật lịch rảnh của giảng viên
 */
export async function updateInstructorSchedules(id, schedules) {
    const res = await fetch(`${API_BASE}/api/instructors/${id}/schedules`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ schedules }),
    });
    return res.json();
}