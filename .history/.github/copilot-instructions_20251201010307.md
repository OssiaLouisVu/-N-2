# Copilot Instructions for English Center Project

These guidelines help AI agents work productively in this monorepo (backend Node.js + MySQL, frontend React/Vite). Keep changes focused and follow existing patterns.

## Architecture Overview
- Backend (`backend/`): Express app (`server.js`) exposing REST endpoints for auth, students, classes, schedules, sessions, mock exams, attendance. Uses MySQL via `mysql2/promise` pool in `db.js`. Migrations live in `backend/migrations/*.sql` (note: students table is NOT defined there – assume it exists already; verify before adding FK-sensitive changes).
- Frontend (`frontend/`): React + Vite. API access via simple `fetch` wrappers in `src/api/*.js` (no centralized Axios instance except attendance utilities). Components grouped by domain (`components/student/*`, `components/class/*`, etc.).
- Data flow: UI calls `src/api/*` functions → REST endpoints → MySQL. Some backend routes copy class-level schedules into per-student schedule rows.

## Key Domain Concepts & Status Logic
- Student lifecycle (`students.status`): NEW → ACTIVE → COMPLETED. Transition to ACTIVE occurs on assignment to a class (`class_students` with status ACTIVE). Transition to COMPLETED only when no remaining ACTIVE classes (`POST /api/classes/:id/finish`).
- Class membership: `class_students` (unique class_id + student_id, status ACTIVE/COMPLETED/LEFT). Cascade deletes from classes and students.
- Scheduling:
  - Class-level templates: `class_schedules` rows (action defaults 'CLASS_SCHEDULE'). May be bulk replaced (`replaceAll` flag) – see `POST /api/classes/:id/schedules`.
  - Per-student schedules: `schedules` rows (action ASSIGNED/FINISHED) created on assignment and copied from `class_schedules`. `meta` JSON holds session attributes (`providedSessionDate`, `start`, `end`, `room`, `classScheduleId`).
- Sessions (timetable): `class_sessions` represent actual teaching occurrences with conflict checks for room and teacher.
- Attendance: In production variant lives in DB; in `server-clean.js` a mock in-memory implementation exists.
- Users: Auto-created for new students (`username = student<id>`, default temp password hashed). FK `users.student_id` can be NULL if student deleted.

## Backend Conventions
- Always use parameterized queries (`?` placeholders) via pool/query/execute.
- Multi-step writes use explicit transactions (`getConnection()`, `beginTransaction()`, `commit()/rollback()`), especially in class assignment and schedule creation.
- Error handling: Return `{ success:false, message: '...' }` with appropriate HTTP status (400/404/409/500). Keep messages in Vietnamese consistent with existing code.
- JSON `meta` fields: Treat as opaque string in DB; parse defensively (wrap JSON.parse in try/catch). Add only keys already used (`providedSessionDate`, `start`, `end`, `room`, `classScheduleId`).

## Frontend Patterns
- API modules build URLs with `URLSearchParams`; expect backend returns shape `{ success, ... }`. Throw on `!res.ok` to let caller handle errors.
- Date normalization: `mockExamApi.js` uses `normalizeDateForBackend` to accept `YYYY-MM-DD` or `dd/mm/yyyy`.
- State separation: Panels (e.g. `OngoingStudentsPanel`, `CompletedStudentsPanel`) call different filtered endpoints rather than client-side filtering.

## Essential Workflows
- Dev backend: `npm run dev` (nodemon) in `backend/`.
- Run migrations: `npm run migrate` or `node backend/scripts/runMigrations.js` (files execute alphabetically; keep id prefixes numeric).
- E2E demo script: `node backend/scripts/e2e_class_workflow.js` (simulate class assignment workflow).
- Tests: Jest + Supertest (`backend/test/classWorkflow.test.js`). Add new tests near existing naming; prefer isolated DB state setup/teardown.

## Adding Features Safely
1. For new tables: create a numbered migration (e.g. `005_add_mock_exam.sql`) – avoid editing old migrations; scripts rely on alphabetical order.
2. When modifying student/class lifecycle, update both: status changes in `classRoutes.js` and any schedule propagation logic to keep consistency.
3. When extending schedule metadata, ensure existing consumers ignore unknown keys (no strict schema enforced).
4. Prefer new route modules under `backend/routes/` with clear prefixes; mount in `server.js` using `/api/<domain>`.
5. For bulk operations affecting schedules, keep `replaceAll` semantics (wipe class-level + per-student copies) consistent.

## Common Pitfalls (Avoid)
- Adding non-parameterized string interpolation in SQL (risk of injection).
- Forgetting to commit/rollback after transaction errors → leaves connection open.
- Introducing new student statuses without updating filters in `studentApi.js` and panels.
- Parsing `meta` assuming object without try/catch.
- Editing old migration files (breaks historical reproducibility) – add new file instead.

## Example Patterns
- Transaction template:
  ```js
  const conn = await db.getConnection();
  try { await conn.beginTransaction(); /* queries */ await conn.commit(); }
  catch(e){ await conn.rollback(); throw e; } finally { conn.release(); }
  ```
- Defensive meta parse:
  ```js
  let metaObj = {}; try { metaObj = typeof row.meta === 'string' ? JSON.parse(row.meta) : row.meta || {}; } catch(_) {}
  ```

## When Unsure
- Search existing route for closest domain (e.g. schedule logic lives in both `classRoutes.js` and `scheduleRoutes.js` – read both before changes).
- If students table absent in migrations, check DB directly before crafting migrations referencing it.

## Style & Language
- Maintain Vietnamese user-facing messages; keep technical variable names in English.
- Keep responses consistent: `{ success: true, ... }` or `{ success: false, message }`.

Provide feedback if anything here is unclear or missing (e.g., actual students table schema, auth expansion). We'll iterate.
