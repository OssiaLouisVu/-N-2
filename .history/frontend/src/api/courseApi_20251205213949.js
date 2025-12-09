// src/api/courseApi.js
const API_BASE = 'http://localhost:8080/api';

// ==================== COURSES ====================

export async function getCourses({ status, level, search } = {}) {
  const params = new URLSearchParams();
  if (status) params.append('status', status);
  if (level) params.append('level', level);
  if (search) params.append('search', search);

  const url = `${API_BASE}/courses?${params.toString()}`;
  const res = await fetch(url);
  return res.json();
}

export async function getCourse(id) {
  const res = await fetch(`${API_BASE}/courses/${id}`);
  return res.json();
}

export async function createCourse(data) {
  const res = await fetch(`${API_BASE}/courses`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function updateCourse(id, data) {
  const res = await fetch(`${API_BASE}/courses/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function deleteCourse(id) {
  const res = await fetch(`${API_BASE}/courses/${id}`, {
    method: 'DELETE',
  });
  return res.json();
}

// ==================== LESSONS ====================

export async function getLessons(courseId) {
  const res = await fetch(`${API_BASE}/courses/${courseId}/lessons`);
  return res.json();
}

export async function createLesson(courseId, data) {
  const res = await fetch(`${API_BASE}/courses/${courseId}/lessons`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function updateLesson(id, data) {
  const res = await fetch(`${API_BASE}/courses/lessons/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function deleteLesson(id) {
  const res = await fetch(`${API_BASE}/courses/lessons/${id}`, {
    method: 'DELETE',
  });
  return res.json();
}

// ==================== SUB-LESSONS ====================

export async function getSubLessons(lessonId) {
  const res = await fetch(`${API_BASE}/courses/lessons/${lessonId}/sub-lessons`);
  return res.json();
}

export async function createSubLesson(lessonId, data) {
  const res = await fetch(`${API_BASE}/courses/lessons/${lessonId}/sub-lessons`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function deleteSubLesson(id) {
  const res = await fetch(`${API_BASE}/courses/sub-lessons/${id}`, {
    method: 'DELETE',
  });
  return res.json();
}

// ==================== MATERIALS ====================

export async function getMaterials(courseId) {
  const res = await fetch(`${API_BASE}/courses/${courseId}/materials`);
  return res.json();
}

export async function createMaterial(courseId, data) {
  const res = await fetch(`${API_BASE}/courses/${courseId}/materials`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function deleteMaterial(id) {
  const res = await fetch(`${API_BASE}/materials/${id}`, {
    method: 'DELETE',
  });
  return res.json();
}

// ==================== HISTORY ====================

export async function getCourseHistory(courseId) {
  const res = await fetch(`${API_BASE}/courses/${courseId}/history`);
  return res.json();
}
