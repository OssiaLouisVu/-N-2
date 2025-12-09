const request = require('supertest');
const { execSync } = require('child_process');
const app = require('../server');

jest.setTimeout(30000);

describe('Class workflow (create student -> create class -> assign)', () => {
    beforeAll(() => {
        // Ensure migrations are applied so tables exist
        try {
            execSync('node scripts/runMigrations.js', { stdio: 'inherit' });
        } catch (e) {
            // continue; migration script may already have been run
            console.warn('Migration runner failed or already applied:', e.message || e);
        }
    });

    test('create student, create class, assign student -> student becomes ACTIVE', async() => {
        // 1) create student
        const studentRes = await request(app)
            .post('/api/students')
            .send({ full_name: 'Test Student X', phone: '0900000000' })
            .set('Accept', 'application/json');

        expect(studentRes.statusCode).toBe(200);
        expect(studentRes.body).toHaveProperty('id');
        const studentId = studentRes.body.id;

        // 2) create class
        const classRes = await request(app)
            .post('/api/classes')
            .send({ name: 'Test Class for e2e', capacity: 5 })
            .set('Accept', 'application/json');

        expect(classRes.statusCode).toBe(200);
        expect(classRes.body).toHaveProperty('id');
        const classId = classRes.body.id;

        // 3) assign student to class
        const assignRes = await request(app)
            .post(`/api/classes/${classId}/assign`)
            .send({ studentId })
            .set('Accept', 'application/json');

        expect(assignRes.statusCode).toBe(200);
        expect(assignRes.body.success).toBe(true);

        // 4) fetch students and find student status
        const listRes = await request(app).get('/api/students');
        expect(listRes.statusCode).toBe(200);
        const found = (listRes.body.students || []).find((s) => s.id === studentId);
        expect(found).toBeDefined();
        expect(found.status).toBe('ACTIVE');
    });
});