// scripts/e2e_class_workflow.js
// Simple E2E script that calls local backend API to create student -> create class -> assign -> finish
// Requires backend server to be running at http://localhost:8080
const BASE = 'http://localhost:8080';

async function fetchJson(url, opts = {}) {
    const res = await fetch(url, opts);
    const text = await res.text();
    try { return JSON.parse(text); } catch (e) { return { ok: res.ok, status: res.status, text }; }
}

async function run() {
    console.log('E2E: start');

    // 1) create student
    const studentPayload = { full_name: 'E2E Test Student', phone: '0900000000', email: 'e2e@example.com', level: 'HSK2', note: 'e2e', status: 'NEW' };
    let res = await fetchJson(`${BASE}/api/students`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(studentPayload) });
    console.log('Create student ->', res);
    if (!res || !res.success) { console.error('Create student failed'); return; }
    const studentId = res.id;

    // 2) create class
    const classPayload = { name: 'E2E Class', teacher_id: null, capacity: 10, level: 'HSK2' };
    res = await fetchJson(`${BASE}/api/classes`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(classPayload) });
    console.log('Create class ->', res);
    if (!res || !res.success) { console.error('Create class failed'); return; }
    const classId = res.id;

    // 3) assign student to class
    res = await fetchJson(`${BASE}/api/classes/${classId}/assign`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ studentId }) });
    console.log('Assign ->', res);
    if (!res || !res.success) { console.error('Assign failed'); return; }

    // 4) get class details
    res = await fetchJson(`${BASE}/api/classes/${classId}`);
    console.log('Class detail ->', res && res.class ? `students=${(res.students||[]).length}` : res);

    // 5) finish student
    res = await fetchJson(`${BASE}/api/classes/${classId}/finish`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ studentId }) });
    console.log('Finish ->', res);

    console.log('E2E: done');
}

run().catch(err => { console.error('E2E error', err);
    process.exit(1); });