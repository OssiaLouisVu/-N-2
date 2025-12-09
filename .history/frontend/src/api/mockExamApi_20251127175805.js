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