// src/api/mockExamApi.js
const BASE_URL = "http://localhost:8080";

async function handleRes(res, defaultMsg) {
    if (!res.ok) {
        const text = await res.text();
        throw new Error(defaultMsg + " - " + text);
    }
    return res.json();
}

// Lấy danh sách kết quả thi thử cho giáo viên
// params: { examName?, date? }
export async function fetchTeacherMockExamResults(params = {}) {
    const qs = new URLSearchParams();
    if (params.examName) qs.set("examName", params.examName);
    if (params.date) qs.set("date", params.date);

    const url = `${BASE_URL}/api/teacher/mock-exam-results${
    qs.toString() ? "?" + qs.toString() : ""
  }`;

    const res = await fetch(url);
    const data = await handleRes(res, "Không lấy được danh sách điểm thi thử");

    // data.results: [{ id, username, examName, date, score, feedback, status }]
    return data.results || [];
}
// Lấy danh sách ca thi (kỳ thi) cho giảng viên – dùng cho NHÁNH 1
// params (tuỳ chọn): { examName?, date? }
export async function fetchTeacherMockExamShifts(params = {}) {
    const qs = new URLSearchParams();
    if (params.examName) qs.set("examName", params.examName);
    if (params.date) qs.set("date", params.date);

    const url = `${BASE_URL}/api/teacher/mock-exam-shifts${
        qs.toString() ? "?" + qs.toString() : ""
    }`;

    const res = await fetch(url);
    const data = await handleRes(res, "Không lấy được danh sách ca thi thử");

    // data.shifts: [{ id, examName, date, startTime, endTime, room, level, registeredCount, status }]
    return data.shifts || [];
}

// Lấy danh sách học viên đăng ký theo một ca thi cụ thể – dùng cho NHÁNH 1 (xem danh sách kì thi → xem học viên)
export async function fetchMockExamShiftStudents(shiftId) {
    const url = `${BASE_URL}/api/teacher/mock-exam-shifts/${shiftId}/students`;

    const res = await fetch(url);
    const data = await handleRes(
        res,
        "Không lấy được danh sách học viên đăng ký ca thi"
    );

    // data.students: [{ id (registrationId), username, status, dateRegistered }]
    return data.students || [];
}