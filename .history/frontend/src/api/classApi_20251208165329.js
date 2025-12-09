// frontend/src/api/classApi.js
const API_BASE = "http://localhost:8080";

export async function getClasses(query = {}) {
    const params = new URLSearchParams();
    for (const k of Object.keys(query)) {
        if (query[k] != null && query[k] !== "") params.append(k, query[k]);
    }
    const res = await fetch(`${API_BASE}/api/classes?${params.toString()}`);
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    return res.json();
}

export async function createClass(payload) {
    const res = await fetch(`${API_BASE}/api/classes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
    });
    return res.json();
}

export async function getClass(id) {
    const res = await fetch(`${API_BASE}/api/classes/${id}`);
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    return res.json();
}

export async function updateClass(id, payload) {
    const res = await fetch(`${API_BASE}/api/classes/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
    });
    return res.json();
}

export async function deleteClass(id) {
    const res = await fetch(`${API_BASE}/api/classes/${id}`, { method: "DELETE" });
    return res.json();
}

export async function assignStudentToClass(classId, studentId, sessionDates, sessionTimeStart, sessionTimeEnd) {
    const body = { studentId };
    if (Array.isArray(sessionDates) && sessionDates.length > 0) body.sessionDates = sessionDates;
    if (sessionTimeStart) body.sessionTimeStart = sessionTimeStart; // format 'HH:MM'
    if (sessionTimeEnd) body.sessionTimeEnd = sessionTimeEnd; // format 'HH:MM'
    const res = await fetch(`${API_BASE}/api/classes/${classId}/assign`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
    });
    return res.json();
}

export async function createClassSchedules(classId, sessionDates, sessionTimeStart, sessionTimeEnd, room) {
    const body = { replaceAll: true }; // Always delete old schedules and create new ones
    if (Array.isArray(sessionDates) && sessionDates.length > 0) body.sessionDates = sessionDates;
    if (sessionTimeStart) body.sessionTimeStart = sessionTimeStart;
    if (sessionTimeEnd) body.sessionTimeEnd = sessionTimeEnd;
    if (room) body.room = room;
    const res = await fetch(`${API_BASE}/api/classes/${classId}/schedules`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
    });
    return res.json();
}

export async function finishStudentInClass(classId, studentId) {
    const res = await fetch(`${API_BASE}/api/classes/${classId}/finish`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentId }),
    });
    return res.json();
}

export async function assignInstructorToClass(classId, instructorId, role = 'MAIN') {
    const res = await fetch(`${API_BASE}/api/classes/${classId}/assign-instructor`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ instructorId, role }),
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
};