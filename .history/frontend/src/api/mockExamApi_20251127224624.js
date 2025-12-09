// src/api/mockExamApi.js
const BASE_URL = "http://localhost:8080";

async function handleRes(res, defaultMsg) {
    if (!res.ok) {
        const text = await res.text();
        throw new Error(defaultMsg + " - " + text);
    }
    return res.json();
}

// Chuẩn hoá chuỗi ngày từ input sang dạng backend cần: YYYY-MM-DD
// Hỗ trợ cả:
//   - "2025-06-01"  (nếu dùng <input type="date">)
//   - "01/06/2025"  (nếu gõ tay dd/mm/yyyy)
function normalizeDateForBackend(input) {
    if (!input) return "";

    const trimmed = input.trim();

    // Trường hợp đã đúng dạng yyyy-mm-dd
    if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
        return trimmed;
    }

    // Trường hợp dd/mm/yyyy hoặc d/m/yyyy
    const m = trimmed.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
    if (m) {
        const d = m[1].padStart(2, "0");
        const mo = m[2].padStart(2, "0");
        const y = m[3];
        return `${y}-${mo}-${d}`; // yyyy-mm-dd
    }

    // Không match pattern nào thì trả luôn, để backend tự xử lý (hoặc không ra kết quả)
    return trimmed;
}

// ================= TEACHER – KẾT QUẢ THI THỬ =================

// Lấy danh sách kết quả thi thử cho giáo viên
// params: { examName?, date? }
export async function fetchTeacherMockExamResults(params = {}) {
    const qs = new URLSearchParams();

    if (params.examName) {
        qs.set("examName", params.examName.trim());
    }

    if (params.date) {
        const normalized = normalizeDateForBackend(params.date);
        if (normalized) {
            qs.set("date", normalized);
        }
    }

    const url = `${BASE_URL}/api/teacher/mock-exam-results${
    qs.toString() ? "?" + qs.toString() : ""
  }`;

    const res = await fetch(url);
    const data = await handleRes(res, "Không lấy được danh sách điểm thi thử");

    // data.results: [{ id, username, examName, date, score, feedback, status, ... }]
    return data.results || [];
}

// ================= TEACHER – DANH SÁCH CA THI =================

// Lấy danh sách ca thi (kỳ thi) cho giảng viên – dùng cho phần “Lịch thi / ca thi”
export async function fetchTeacherMockExamShifts(params = {}) {
    const qs = new URLSearchParams();
    if (params.examName) qs.set("examName", params.examName);
    if (params.date) {
        const normalized = normalizeDateForBackend(params.date);
        if (normalized) qs.set("date", normalized);
    }

    const url = `${BASE_URL}/api/teacher/mock-exam-shifts${
    qs.toString() ? "?" + qs.toString() : ""
  }`;

    const res = await fetch(url);
    const data = await handleRes(res, "Không lấy được danh sách ca thi thử");

    // data.shifts: [{ id, examName, date, startTime, endTime, room, level, registeredCount, status }]
    return data.shifts || [];
}

// Lấy danh sách học viên đăng ký theo một ca thi cụ thể
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