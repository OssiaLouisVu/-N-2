const express = require('express');
const router = express.Router();
// Ensure db is a connection pool configured with Promise (e.g., mysql2/promise)
const db = require('../db');

// --- HELPER FUNCTIONS ---

const handleError = (res, err, endpointName) => {
    console.error(`${endpointName} error`, err);
    res.status(500).json({ success: false, message: 'DB error' });
};

const parseDateToYMD = (raw) => {
    if (!raw || typeof raw !== 'string') return null;
    const d = new Date(raw);
    if (!isNaN(d.getTime())) {
        const yyyy = d.getFullYear();
        const mm = String(d.getMonth() + 1).padStart(2, '0');
        const dd = String(d.getDate()).padStart(2, '0');
        return `${yyyy}-${mm}-${dd}`;
    }
    const m = raw.match(/^([0-3]?\d)\/(0?\d|1[0-2])\/(\d{4})$/);
    if (m) {
        const dd = m[1].padStart(2, '0');
        const mm = m[2].padStart(2, '0');
        const yyyy = m[3];
        const chk = new Date(`${yyyy}-${mm}-${dd}T00:00:00Z`);
        if (isNaN(chk.getTime())) return null;
        return `${yyyy}-${mm}-${dd}`;
    }
    return null;
};

// Helper Function to check for Instructor Schedule Conflicts
const checkScheduleConflict = async(conn, classId, newSessionDates) => {
    // 1. Get the main instructor for the current class
    const [
        [mainInstructor]
    ] = await conn.query(
        'SELECT teacher_id FROM class_teachers WHERE class_id = ? AND role = "MAIN"', [classId]
    );

    if (!mainInstructor) return { conflict: false };

    const instructorId = mainInstructor.teacher_id;

    // 2. Get all other classes this instructor is teaching (including schedules)
    const [otherClasses] = await conn.query(
        `SELECT DISTINCT ct.class_id, c.name FROM class_teachers ct
         JOIN classes c ON c.id = ct.class_id
         WHERE ct.teacher_id = ? AND ct.class_id != ?`, [instructorId, classId]
    );

    if (otherClasses.length === 0) return { conflict: false };

    const otherClassIds = otherClasses.map(r => r.class_id);
    const [otherScheds] = await conn.query(
        `SELECT scheduled_at, meta FROM class_schedules WHERE class_id IN (?)`, [otherClassIds]
    );

    // 3. Compare new schedule with existing schedules
    for (const raw of newSessionDates) {
        const dateStr = parseDateToYMD(raw);
        if (!dateStr) continue;

        // Check for date conflict
        const conflict = otherScheds.find(o =>
            o.scheduled_at && new Date(o.scheduled_at).toISOString().split('T')[0] === dateStr
        );

        if (conflict) {
            const conflictingClass = otherClasses.find(c => c.class_id === conflict.class_id);
            return {
                conflict: true,
                message: `Trùng lịch với lớp ${conflictingClass ? conflictingClass.name : 'khác'} vào ngày ${dateStr}. Giảng viên chính bị trùng lịch.`
            };
        }
    }

    return { conflict: false };
};


// --- CLASS ENDPOINTS (/api/classes) ---

/**
 * GET /api/classes
 * Get list of classes. Supports filtering by status and search.
 */
/**
 * GET /api/classes
 * Lấy danh sách lớp kèm theo: Số lượng học viên & Phòng học
 */
// --- API LẤY DANH SÁCH LỚP (Đã nâng cấp) ---
router.get('/', async(req, res) => {
    try {
        const { q } = req.query || {};
        const where = [];
        const params = [];

        // 1. Bộ lọc tìm kiếm (Theo tên lớp)
        if (q && String(q).trim() !== '') {
            where.push('(c.name LIKE ? OR c.level LIKE ?)');
            const like = `%${String(q).trim()}%`;
            params.push(like, like);
        }

        const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';

        // 2. QUERY SQL NÂNG CẤP
        // - Tính toán trạng thái (Sắp/Đang/Đã) dựa trên ngày tháng
        // - Lấy phòng từ meta của lịch học đầu tiên
        // - Đếm số học viên Active
        const query = `
            SELECT 
                c.id, c.name, c.level, c.capacity,
                c.start_date, c.end_date,
                
                -- LOGIC TÍNH TRẠNG THÁI --
                CASE 
                    WHEN c.start_date > CURDATE() THEN 'UPCOMING'
                    WHEN c.end_date < CURDATE() THEN 'FINISHED'
                    ELSE 'ONGOING'
                END as calculated_status,

                -- Subquery: Đếm học viên --
                (SELECT COUNT(*) FROM class_students cs WHERE cs.class_id = c.id AND cs.status = 'ACTIVE') as student_count,
                
                -- Subquery: Lấy meta lịch học để tìm phòng --
                (SELECT meta FROM class_schedules sch WHERE sch.class_id = c.id ORDER BY sch.scheduled_at ASC LIMIT 1) as first_schedule_meta
            
            FROM classes c
            ${whereSql} 
            ORDER BY c.id DESC
        `;

        const [rows] = await db.query(query, params);

        // 3. Xử lý dữ liệu đầu ra
        const classes = rows.map(cls => {
            let room = "Chưa xếp";

            // Xử lý lấy phòng từ JSON meta
            if (cls.first_schedule_meta) {
                try {
                    const metaObj = typeof cls.first_schedule_meta === 'string' ?
                        JSON.parse(cls.first_schedule_meta) :
                        cls.first_schedule_meta;
                    if (metaObj && metaObj.room) room = metaObj.room;
                } catch (e) {}
            }

            // Dịch trạng thái sang tiếng Việt để hiển thị (nếu cần dùng luôn ở Frontend)
            let statusText = "Đang dạy";
            if (cls.calculated_status === 'UPCOMING') statusText = "Sắp dạy";
            if (cls.calculated_status === 'FINISHED') statusText = "Đã dạy";

            return {
                id: cls.id,
                name: cls.name, // Tên lớp
                start_date: cls.start_date, // Ngày bắt đầu
                end_date: cls.end_date, // Ngày kết thúc (ĐÃ CÓ Ở ĐÂY)
                status_code: cls.calculated_status, // Mã trạng thái: UPCOMING, ONGOING, FINISHED
                status_view: statusText, // Chữ hiển thị: Sắp dạy, Đang dạy...
                student_count: cls.student_count || 0,
                room: room,
                capacity: cls.capacity
            };
        });

        res.json({ success: true, classes: classes });
    } catch (err) {
        handleError(res, err, 'GET /api/classes');
    }
});
/**
 * POST /api/classes
 * Create a new class.
 */
router.post('/', async(req, res) => {
    try {
        const { name, teacher_id, capacity, level, start_date, end_date, note } = req.body;
        const [result] = await db.query(
            `INSERT INTO classes (name, teacher_id, capacity, level, start_date, end_date, note)
             VALUES (?, ?, ?, ?, ?, ?, ?)`, [
                name,
                teacher_id || null,
                capacity != null ? capacity : 20,
                level || null,
                start_date || null,
                end_date || null,
                note || null
            ]
        );
        res.json({ success: true, id: result.insertId });
    } catch (err) {
        handleError(res, err, 'POST /api/classes');
    }
});

/**
 * PUT /api/classes/:id
 * Update class information.
 */
router.put('/:id', async(req, res) => {
    const id = parseInt(req.params.id, 10);
    try {
        const { name, teacher_id, capacity, level, start_date, end_date, note } = req.body || {};

        const [
            [cls]
        ] = await db.query('SELECT * FROM classes WHERE id = ?', [id]);
        if (!cls) return res.status(404).json({ success: false, message: 'Class not found' });

        const [result] = await db.query(
            `UPDATE classes 
             SET name = ?, 
                 teacher_id = ?, 
                 capacity = ?, 
                 level = ?, 
                 start_date = ?, 
                 end_date = ?, 
                 note = ?, 
                 updated_at = NOW()
             WHERE id = ?`, [
                name || cls.name,
                teacher_id === '' ? null : teacher_id,
                capacity != null ? capacity : cls.capacity,
                level || cls.level,
                start_date === '' ? null : start_date || cls.start_date,
                end_date === '' ? null : end_date || cls.end_date,
                note || cls.note,
                id,
            ]
        );
        if (result.affectedRows === 0) return res.status(404).json({ success: false, message: 'Class not found' });
        res.json({ success: true });
    } catch (err) {
        handleError(res, err, 'PUT /api/classes/:id');
    }
});

/**
 * GET /api/classes/:id
 * Get details of a class, including students, schedules, and instructor.
 */
router.get('/:id', async(req, res) => {
    const id = parseInt(req.params.id, 10);
    try {
        const [
            [cls]
        ] = await db.query(`
            SELECT *, 
            (end_date IS NOT NULL AND end_date < CURDATE()) as is_expired 
            FROM classes 
            WHERE id = ?
        `, [id]);
        if (!cls) return res.status(404).json({ success: false, message: 'Class not found' });

        const [students] = await db.query(
            `SELECT s.*, cs.status as class_status 
             FROM class_students cs 
             JOIN students s ON cs.student_id = s.id 
             WHERE cs.class_id = ?`, [id]
        );

        const [schedules] = await db.query(
            `SELECT id, action, scheduled_at, meta 
             FROM class_schedules 
             WHERE class_id = ? 
             ORDER BY scheduled_at`, [id]
        );

        const [
            [instructor]
        ] = await db.query(`
            SELECT i.id, i.full_name, i.phone, i.email
            FROM class_teachers ct
            JOIN instructors i ON i.id = ct.teacher_id
            WHERE ct.class_id = ? AND ct.role = 'MAIN'
            LIMIT 1
        `, [id]);

        res.json({
            success: true,
            class: cls,
            students,
            schedules,
            instructor: instructor || null
        });

    } catch (err) {
        handleError(res, err, 'GET /api/classes/:id');
    }
});

/**
 * DELETE /api/classes/:id
 * Delete a class and all related data.
 * LOGIC: Prevent deletion if the class is ongoing (Start Date <= CURDATE <= End Date).
/**
 * DELETE /api/classes/:id
 * Xóa lớp học và tất cả dữ liệu liên quan.
 * LOGIC MỚI: 
 * 1. Chặn xóa nếu lớp đang diễn ra.
 * 2. Cập nhật lại trạng thái Giảng viên (về NEW/ACTIVE).
 * 3. Cập nhật lại trạng thái Học viên (về NEW nếu không còn lớp nào).
 */
router.delete('/:id', async(req, res) => {
    const id = parseInt(req.params.id, 10);
    let conn;
    try {
        const [
            [cls]
        ] = await db.query('SELECT start_date, end_date FROM classes WHERE id = ?', [id]);
        if (!cls) {
            return res.status(404).json({ success: false, message: 'Class not found' });
        }

        // 1. LOGIC CHẶN XÓA: Nếu lớp đang diễn ra (Start <= Now <= End)
        const [
            [isCurrentlyActive]
        ] = await db.query(
            `SELECT start_date, end_date FROM classes WHERE id = ? AND start_date IS NOT NULL AND CURDATE() >= start_date AND (end_date IS NULL OR CURDATE() <= end_date)`, [id]
        );

        if (isCurrentlyActive) {
            const startDateStr = isCurrentlyActive.start_date.toISOString().split('T')[0];
            return res.status(400).json({
                success: false,
                message: `Không thể xóa lớp. Lớp đã bắt đầu từ ${startDateStr} và đang diễn ra.`
            });
        }

        conn = await db.getConnection();
        await conn.beginTransaction();

        // 2. Lấy danh sách giảng viên và học viên TRƯỚC KHI XÓA để cập nhật trạng thái sau này
        const [teachers] = await conn.query('SELECT teacher_id FROM class_teachers WHERE class_id = ?', [id]);
        const teacherIds = teachers.map(t => t.teacher_id);

        const [students] = await conn.query('SELECT student_id FROM class_students WHERE class_id = ?', [id]);
        const studentIds = students.map(s => s.student_id);

        // 3. Xóa dữ liệu liên quan
        await conn.query('DELETE FROM class_schedules WHERE class_id = ?', [id]);
        await conn.query('DELETE FROM schedules WHERE class_id = ?', [id]);
        await conn.query('DELETE FROM class_students WHERE class_id = ?', [id]);
        await conn.query('DELETE FROM class_teachers WHERE class_id = ?', [id]);
        await conn.query('DELETE FROM instructor_class_history WHERE class_id = ?', [id]);

        // 4. Xóa lớp học
        const [result] = await conn.query('DELETE FROM classes WHERE id = ?', [id]);
        if (result.affectedRows === 0) {
            await conn.rollback();
            return res.status(404).json({ success: false, message: 'Class not found' });
        }

        // 5. Cập nhật lại trạng thái giảng viên (Nếu không còn dạy lớp nào -> NEW)
        if (teacherIds.length > 0) {
            for (const tId of teacherIds) {
                const [
                    [cnt]
                ] = await conn.query(
                    'SELECT COUNT(*) AS cnt FROM class_teachers WHERE teacher_id = ?', [tId]
                );
                await conn.query(
                    'UPDATE instructors SET status = ? WHERE id = ?', [cnt.cnt > 0 ? 'ACTIVE' : 'NEW', tId]
                );
            }
        }

        // 6. CẬP NHẬT LẠI TRẠNG THÁI HỌC VIÊN (Fix lỗi không gán lại được)
        if (studentIds.length > 0) {
            for (const sId of studentIds) {
                // Kiểm tra xem học viên này còn đang ACTIVE ở lớp nào khác không
                const [
                    [activeCount]
                ] = await conn.query(
                    'SELECT COUNT(*) as cnt FROM class_students WHERE student_id = ? AND status = "ACTIVE"', [sId]
                );

                // Nếu không còn lớp nào Active, trả trạng thái về NEW để có thể gán lại
                if (activeCount.cnt === 0) {
                    // Lưu ý: Có thể set về 'NEW' hoặc giữ nguyên nếu họ đã 'COMPLETED' khóa trước.
                    // Ở đây ta ưu tiên set về 'NEW' để hiện trong danh sách "Chọn học viên (NEW)".
                    // Hoặc bạn có thể kiểm tra nếu status hiện tại là ACTIVE thì mới reset.
                    await conn.query('UPDATE students SET status = "NEW" WHERE id = ? AND status = "ACTIVE"', [sId]);
                }
            }
        }

        await conn.commit();
        res.json({ success: true, message: 'Đã xóa lớp học và cập nhật trạng thái liên quan thành công.' });
    } catch (err) {
        if (conn) await conn.rollback();
        handleError(res, err, 'DELETE /api/classes/:id');
    } finally {
        if (conn) conn.release();
    }
});
/**
 * GET /api/classes/:id/students
 * Get list of students in a class.
 */
router.get('/:id/students', async(req, res) => {
    const classId = parseInt(req.params.id, 10);
    try {
        const [rows] = await db.query(
            `SELECT s.id, s.full_name, s.phone, s.email, cs.status AS class_status
             FROM class_students cs
             JOIN students s ON cs.student_id = s.id
             WHERE cs.class_id = ?
             ORDER BY s.full_name`, [classId]
        );

        res.json({ success: true, students: rows });
    } catch (err) {
        handleError(res, err, 'GET /api/classes/:id/students');
    }
});


// --- STUDENT/INSTRUCTOR ASSIGNMENT ENDPOINTS ---

/**
 * POST /api/classes/:id/assign
 * Assign a student to a class.
 */
router.post('/:id/assign', async(req, res) => {
    const classId = parseInt(req.params.id, 10);
    const { studentId, sessionDates, sessionTimeStart, sessionTimeEnd } = req.body || {};

    if (!studentId) return res.status(400).json({ success: false, message: 'studentId is required' });
    let conn;

    try {
        conn = await db.getConnection();
        await conn.beginTransaction();

        // 1. Check class, capacity, and if expired
        const [
            [cls]
        ] = await db.query('SELECT id, capacity, start_date, end_date FROM classes WHERE id = ?', [classId]);
        if (!cls) throw { code: 'NOT_FOUND', message: 'Class not found' };

        const isExpired = cls.end_date && new Date(cls.end_date) < new Date();
        if (isExpired) throw { code: 'EXPIRED', message: 'Lớp học đã kết thúc, không thể gán học viên mới.' };

        const [
            [cnt]
        ] = await db.query('SELECT COUNT(*) AS cnt FROM class_students WHERE class_id = ? AND status = "ACTIVE"', [classId]);
        if (cnt.cnt >= cls.capacity) throw { code: 'CAPACITY', message: 'Class is full' };

        // 2. Check class schedule
        const [classSchedulesQuery] = await db.query('SELECT id, scheduled_at, meta FROM class_schedules WHERE class_id = ? ORDER BY scheduled_at', [classId]);
        const hasClassSchedules = classSchedulesQuery.length > 0;
        const hasSessionDates = Array.isArray(sessionDates) && sessionDates.length > 0;

        if (!hasClassSchedules && !hasSessionDates) {
            throw { code: 'SCHEDULE_REQUIRED', message: 'Class schedules must be created before assigning students or provide sessionDates' };
        }

        // 3. Check if student is active in another conflicting class
        const [activeOtherClasses] = await db.query(
            `SELECT cs.class_id, c.name
             FROM class_students cs
             JOIN classes c ON c.id = cs.class_id
             WHERE cs.student_id = ?
               AND cs.status = 'ACTIVE'
               AND cs.class_id <> ?
               AND (c.end_date IS NULL OR c.end_date >= CURDATE())
             LIMIT 1`, [studentId, classId]
        );

        if (activeOtherClasses.length > 0) {
            const other = activeOtherClasses[0];
            throw {
                code: 'STUDENT_BUSY',
                message: `Học viên đang học lớp "${other.name}" (ID=${other.class_id}), không thể gán thêm lớp khác.`
            };
        }

        // 4. Check if already assigned
        const [existing] = await db.query('SELECT id FROM class_students WHERE class_id = ? AND student_id = ?', [classId, studentId]);
        if (existing.length > 0) throw { code: 'DUPLICATE', message: 'Student already assigned' };

        // 5. Add student to class and update status
        await db.query('INSERT INTO class_students (class_id, student_id, status) VALUES (?, ?, "ACTIVE")', [classId, studentId]);
        await db.query('INSERT INTO schedules (class_id, student_id, action) VALUES (?, ?, "ASSIGNED")', [classId, studentId]);
        await db.query('UPDATE students SET status = "ACTIVE" WHERE id = ?', [studentId]);

        // 6. Copy class schedule to student schedule
        for (const cs of classSchedulesQuery) {
            try {
                const metaObj = cs.meta ? (typeof cs.meta === 'string' ? JSON.parse(cs.meta) : cs.meta) : {};
                metaObj.classScheduleId = cs.id;
                const metaStr = JSON.stringify(metaObj);
                await db.query(
                    'INSERT INTO schedules (class_id, student_id, action, scheduled_at, meta, created_at) VALUES (?, ?, ?, ?, ?, NOW())', [classId, studentId, 'ASSIGNED', cs.scheduled_at, metaStr]
                );
            } catch (e) {
                console.warn('Error copying class schedule to student schedule:', e);
            }
        }

        // 7. Add specific student schedules
        if (hasSessionDates) {
            const startTime = sessionTimeStart || null;
            const endTime = sessionTimeEnd || null;
            for (const raw of sessionDates) {
                const dateStr = parseDateToYMD(raw);
                if (!dateStr) continue;

                try {
                    const scheduledAt = startTime ? `${dateStr} ${startTime}` : null;
                    const metaObj = { providedSessionDate: dateStr };
                    if (startTime) metaObj.start = startTime;
                    if (endTime) metaObj.end = endTime;
                    const meta = JSON.stringify(metaObj);
                    await db.query(
                        'INSERT INTO schedules (class_id, student_id, action, scheduled_at, meta, created_at) VALUES (?, ?, ?, ?, ?, NOW())', [classId, studentId, 'ASSIGNED', scheduledAt, meta]
                    );
                } catch (e) {
                    console.warn('Error inserting student-specific schedule:', e);
                }
            }
        }

        await conn.commit();
        res.json({ success: true, message: 'Assigned student to class' });
    } catch (err) {
        if (conn) await conn.rollback();
        console.error('POST /api/classes/:id/assign error', err);

        // Handle business logic errors
        if (err.code === 'NOT_FOUND') return res.status(404).json({ success: false, message: err.message });
        if (['EXPIRED', 'STUDENT_BUSY', 'CAPACITY', 'DUPLICATE', 'SCHEDULE_REQUIRED'].includes(err.code)) {
            return res.status(400).json({ success: false, message: err.message, code: err.code });
        }
        // Default to 500
        return res.status(500).json({ success: false, message: 'Server error' });
    } finally {
        if (conn) conn.release();
    }
});


/**
 * POST /api/classes/:id/assign-instructor
 * Assign an instructor to a class.
 * LOGIC: Only allow 'ACTIVE' instructors.
 */
router.post('/:id/assign-instructor', async(req, res) => {
    const classId = parseInt(req.params.id, 10);
    const { instructorId, role = 'MAIN' } = req.body || {};

    if (!instructorId) {
        return res.status(400).json({ success: false, message: 'instructorId is required' });
    }

    let conn;
    try {
        conn = await db.getConnection();
        await conn.beginTransaction();

        // 1. Check class
        const [
            [cls]
        ] = await db.query(
            'SELECT id, name, start_date, end_date FROM classes WHERE id = ?', [classId]
        );
        if (!cls) {
            throw { code: 'NOT_FOUND', message: 'Lớp không tồn tại' };
        }

        // 2. Check instructor and status
        const [
            [instructor]
        ] = await db.query(
            'SELECT id, full_name, status FROM instructors WHERE id = ?', [instructorId]
        );
        if (!instructor) {
            throw { code: 'NOT_FOUND', message: 'Giảng viên không tồn tại' };
        }

        // ❌ LOGIC CHECK: Only allow 'ACTIVE' status
        if (instructor.status !== 'ACTIVE') {
            throw {
                code: 'NOT_ACTIVE',
                message: `Giảng viên đang ở trạng thái "${instructor.status}". Chỉ giảng viên có trạng thái ACTIVE mới được gán vào lớp.`
            };
        }


        // 3. Check if already assigned
        const [
            [existing]
        ] = await db.query(
            'SELECT id FROM class_teachers WHERE class_id = ? AND teacher_id = ?', [classId, instructorId]
        );
        if (existing) {
            throw { code: 'DUPLICATE', message: 'Giảng viên đã được gán vào lớp này rồi' };
        }

        // 4. Get class schedule
        const [classSchedules] = await db.query(
            'SELECT scheduled_at, meta FROM class_schedules WHERE class_id = ? ORDER BY scheduled_at', [classId]
        );

        if (classSchedules.length === 0) {
            throw { code: 'NO_SCHEDULE', message: 'Lớp chưa có lịch học. Vui lòng tạo lịch trước khi gán giảng viên.' };
        }

        // 5. Check for schedule conflicts with other classes
        const [instructorClasses] = await db.query(
            `SELECT DISTINCT ct.class_id 
             FROM class_teachers ct 
             WHERE ct.teacher_id = ? AND ct.class_id != ?`, [instructorId, classId]
        );

        if (instructorClasses.length > 0) {
            const otherClassIds = instructorClasses.map(row => row.class_id);
            const [otherSchedules] = await db.query(
                `SELECT cs.scheduled_at, cs.meta, c.name as class_name
                 FROM class_schedules cs
                 INNER JOIN classes c ON c.id = cs.class_id
                 WHERE cs.class_id IN (?)
                 ORDER BY cs.scheduled_at`, [otherClassIds]
            );

            for (const newSchedule of classSchedules) {
                if (!newSchedule.scheduled_at) continue;
                const newDate = new Date(newSchedule.scheduled_at);
                const newDateStr = newDate.toISOString().split('T')[0];
                const newTime = newDate.toTimeString().slice(0, 5);

                let newMeta = {};
                try { newMeta = newSchedule.meta ? (typeof newSchedule.meta === 'string' ? JSON.parse(newSchedule.meta) : newSchedule.meta) : {}; } catch (e) {}
                const newStartTime = newMeta.start || newTime;
                const newEndTime = newMeta.end || '23:59';

                for (const existingSchedule of otherSchedules) {
                    if (!existingSchedule.scheduled_at) continue;

                    const existingDate = new Date(existingSchedule.scheduled_at);
                    const existingDateStr = existingDate.toISOString().split('T')[0];
                    const existingTime = existingDate.toTimeString().slice(0, 5);

                    if (newDateStr !== existingDateStr) continue;

                    let existingMeta = {};
                    try { existingMeta = existingSchedule.meta ? (typeof existingSchedule.meta === 'string' ? JSON.parse(existingSchedule.meta) : existingSchedule.meta) : {}; } catch (e) {}
                    const existingStartTime = existingMeta.start || existingTime;
                    const existingEndTime = existingMeta.end || '23:59';

                    const isOverlap = (newStartTime < existingEndTime) && (newEndTime > existingStartTime);

                    if (isOverlap) {
                        throw {
                            code: 'SCHEDULE_CONFLICT',
                            message: `Trùng lịch: Ngày ${newDateStr}, giờ ${newStartTime}-${newEndTime} trùng với lớp "${existingSchedule.class_name}" (${existingStartTime}-${existingEndTime})`
                        };
                    }
                }
            }
        }

        // 6. Assign instructor to class
        await db.query(
            'INSERT INTO class_teachers (class_id, teacher_id, role, assigned_at) VALUES (?, ?, ?, NOW())', [classId, instructorId, role]
        );

        // 7. Log assignment history
        await db.query(
            'INSERT INTO instructor_class_history (instructor_id, class_id, role) VALUES (?, ?, ?)', [instructorId, classId, role]
        );

        await conn.commit();

        res.json({
            success: true,
            message: `Đã gán giảng viên "${instructor.full_name}" vào lớp "${cls.name}".`
        });

    } catch (err) {
        if (conn) await conn.rollback();
        console.error('❌ POST /api/classes/:id/assign-instructor error:', err);

        // Handle business logic errors
        if (err.code === 'NOT_FOUND')
            return res.status(404).json({ success: false, message: err.message });
        // Error NOT_ACTIVE returns 400
        if (['DUPLICATE', 'NO_SCHEDULE', 'NOT_ACTIVE'].includes(err.code))
            return res.status(400).json({ success: false, message: err.message });
        if (err.code === 'SCHEDULE_CONFLICT')
            return res.status(409).json({ success: false, message: err.message });

        // Default: other errors
        return res.status(500).json({
            success: false,
            message: 'Lỗi server khi gán giảng viên',
        });
    } finally {
        if (conn) conn.release();
    }
});


/**
 * POST /api/classes/:id/finish (Manual action - Finish/Leave class)
 */
router.post('/:id/finish', async(req, res) => {
    const classId = parseInt(req.params.id, 10);
    const { studentId, note } = req.body;
    if (!studentId) return res.status(400).json({ success: false, message: 'studentId is required' });

    let conn;
    try {
        conn = await db.getConnection();
        await conn.beginTransaction();

        // 1. Get class info to check dates
        const [
            [cls]
        ] = await conn.query('SELECT start_date, end_date FROM classes WHERE id = ?', [classId]);
        if (!cls) {
            await conn.rollback();
            return res.status(404).json({ success: false, message: 'Class not found' });
        }

        // --- LOGIC 1: BLOCK if finishing before Start Date ---
        const [
            [isBeforeStart]
        ] = await conn.query(
            'SELECT 1 AS is_before FROM classes WHERE id = ? AND start_date IS NOT NULL AND CURDATE() < start_date', [classId]
        );

        if (isBeforeStart) {
            const startDateStr = cls.start_date ? cls.start_date.toISOString().split('T')[0] : 'N/A';
            await conn.rollback();
            return res.status(400).json({
                success: false,
                message: `Không thể kết thúc khóa học. Lớp chưa bắt đầu (Start Date: ${startDateStr}).`
            });
        }

        // --- LOGIC 2: REQUIRE NOTE if finishing before End Date ---
        const [
            [isBeforeEnd]
        ] = await conn.query(
            'SELECT 1 AS is_before FROM classes WHERE id = ? AND end_date IS NOT NULL AND CURDATE() < end_date', [classId]
        );

        if (isBeforeEnd) {
            if (!note || String(note).trim() === '') {
                const endDateStr = cls.end_date ? cls.end_date.toISOString().split('T')[0] : 'N/A';
                await conn.rollback();
                return res.status(400).json({
                    success: false,
                    message: `Lớp chưa kết thúc (End Date: ${endDateStr}). Vui lòng cung cấp ghi chú (lý do) kết thúc/rời lớp sớm.`
                });
            }
        }

        // 2. Update status in class (only if ACTIVE)
        const [updateRes] = await conn.query('UPDATE class_students SET status = "COMPLETED", left_at = NOW() WHERE class_id = ? AND student_id = ? AND status = "ACTIVE"', [classId, studentId]);
        if (updateRes.affectedRows === 0) {
            await conn.rollback();
            return res.status(404).json({ success: false, message: 'Học viên không ở trạng thái ACTIVE trong lớp này' });
        }

        // 3. Insert history (schedules) - With NOTE if present
        let meta = {};
        if (note && String(note).trim() !== '') {
            meta.finish_note = String(note).trim();
        }
        const metaStr = JSON.stringify(meta);

        await db.query('INSERT INTO schedules (class_id, student_id, action, meta) VALUES (?, ?, "FINISHED", ?)', [classId, studentId, metaStr]);

        // 4. Update student global status (only if no other ACTIVE classes)
        const [activeClasses] = await db.query(
            'SELECT COUNT(*) as count FROM class_students WHERE student_id = ? AND status = "ACTIVE"', [studentId]
        );

        if (activeClasses[0].count === 0) {
            await db.query('UPDATE students SET status = "COMPLETED" WHERE id = ?', [studentId]);
        }

        await conn.commit();
        res.json({ success: true, message: 'Học viên đã hoàn thành/rời lớp thủ công.' });
    } catch (err) {
        if (conn) await conn.rollback();
        console.error('POST /api/classes/:id/finish error', err);

        if (err.message && (err.message.includes('Không thể kết thúc khóa học.') || err.message.includes('Vui lòng cung cấp ghi chú') || err.message.includes('Học viên không ở trạng thái ACTIVE'))) {
            const status = err.message.includes('Học viên không ở trạng thái ACTIVE') ? 404 : 400;
            return res.status(status).json({ success: false, message: err.message });
        }
        handleError(res, err, 'POST /api/classes/:id/finish');
    } finally {
        if (conn) conn.release();
    }
});


/**
 * POST /api/classes/:id/bulk-complete (System Action/Automatic)
 */
router.post('/:id/bulk-complete', async(req, res) => {
    const classId = parseInt(req.params.id, 10);
    let conn;
    try {
        conn = await db.getConnection();
        await conn.beginTransaction();

        // 1. Check class and end date
        const [
            [cls]
        ] = await conn.query('SELECT name, end_date FROM classes WHERE id = ?', [classId]);
        if (!cls) {
            await conn.rollback();
            return res.status(404).json({ success: false, message: 'Class not found' });
        }

        // --- AUTOMATIC LOGIC: ONLY ALLOW if past End Date ---
        const [
            [isPastEnd]
        ] = await conn.query(
            'SELECT 1 AS is_past FROM classes WHERE id = ? AND end_date IS NOT NULL AND CURDATE() >= end_date', [classId]
        );

        if (!isPastEnd) {
            const endDateStr = cls.end_date ? cls.end_date.toISOString().split('T')[0] : 'N/A';
            await conn.rollback();
            return res.status(400).json({
                success: false,
                message: `Lớp chưa hết hạn (${endDateStr}). Không thể chạy hoàn thành hàng loạt.`
            });
        }

        // 2. Transition all ACTIVE students to COMPLETED
        const [updateRes] = await conn.query(
            'UPDATE class_students SET status = "COMPLETED", left_at = NOW() WHERE class_id = ? AND status = "ACTIVE"', [classId]
        );

        // 3. Log history for this automatic action
        const meta = JSON.stringify({ reason: 'System bulk completed after class end date.' });
        await db.query(
            'INSERT INTO schedules (class_id, action, meta) VALUES (?, "BULK_COMPLETED", ?)', [classId, meta]
        );

        // 4. Update global status of those students
        const [studentsToUpdate] = await db.query(
            'SELECT student_id FROM class_students WHERE class_id = ? AND status = "COMPLETED"', [classId]
        );

        for (const student of studentsToUpdate) {
            const [activeClasses] = await db.query(
                'SELECT COUNT(*) as count FROM class_students WHERE student_id = ? AND status = "ACTIVE"', [student.student_id]
            );
            if (activeClasses[0].count === 0) {
                await db.query('UPDATE students SET status = "COMPLETED" WHERE id = ?', [student.student_id]);
            }
        }

        await conn.commit();
        res.json({
            success: true,
            message: `Đã hoàn thành ${updateRes.affectedRows} học viên trong lớp "${cls.name}" (Tự động).`
        });

    } catch (err) {
        if (conn) await conn.rollback();
        console.error('POST /api/classes/:id/bulk-complete error', err);

        if (err.message && err.message.includes('Lớp chưa hết hạn')) {
            return res.status(400).json({ success: false, message: err.message });
        }
        if (err.message && err.message.includes('Class not found')) {
            return res.status(404).json({ success: false, message: err.message });
        }

        handleError(res, err, 'POST /api/classes/:id/bulk-complete');
    } finally {
        if (conn) conn.release();
    }
});


// --- SCHEDULES & COMPLETION ---

// Update class schedule (Replace Old -> New) - Endpoint PUT
router.put('/:id/schedules', async(req, res) => {
    const classId = parseInt(req.params.id, 10);
    const { sessionDates, sessionTimeStart, sessionTimeEnd, room } = req.body || {};
    if (!Array.isArray(sessionDates) || sessionDates.length === 0) return res.status(400).json({ success: false, message: 'Cần ít nhất 1 ngày học.' });

    let conn;
    try {
        conn = await db.getConnection();
        await conn.beginTransaction();

        // 1. Check if class has started (Hard Constraint)
        const [
            [clsStarted]
        ] = await conn.query(`SELECT start_date FROM classes WHERE id = ? AND start_date IS NOT NULL AND CURDATE() >= start_date`, [classId]);
        if (clsStarted) {
            const d = clsStarted.start_date.toISOString().split('T')[0];
            await conn.rollback();
            return res.status(400).json({ success: false, message: `Không thể sửa lịch. Lớp đã bắt đầu từ ${d}.` });
        }

        // 2. Check if schedule already exists (Only allow creation once)
        const [
            [schedulesExist]
        ] = await conn.query('SELECT 1 FROM class_schedules WHERE class_id = ? LIMIT 1', [classId]);
        if (schedulesExist) {
            await conn.rollback();
            return res.status(400).json({ success: false, message: 'Lịch lớp đã được tạo. Vui lòng không sửa đổi lần nữa.' });
        }

        // ❌ NEW LOGIC: CHECK FOR INSTRUCTOR SCHEDULE CONFLICT
        const conflictCheck = await checkScheduleConflict(conn, classId, sessionDates);
        if (conflictCheck.conflict) {
            await conn.rollback();
            return res.status(409).json({ success: false, message: conflictCheck.message });
        }


        // 3. Delete old schedule
        await conn.query('DELETE FROM schedules WHERE class_id = ? AND action = "ASSIGNED"', [classId]);
        await conn.query('DELETE FROM class_schedules WHERE class_id = ?', [classId]);

        // 4. Create new schedule
        const [students] = await conn.query('SELECT student_id FROM class_students WHERE class_id = ? AND status = "ACTIVE"', [classId]);

        for (const dateRaw of sessionDates) {
            const dateStr = parseDateToYMD(dateRaw);
            if (!dateStr) continue;
            const startTime = sessionTimeStart || null;
            const endTime = sessionTimeEnd || null;
            const scheduledAt = startTime ? `${dateStr} ${startTime}` : null;

            const metaObj = { providedSessionDate: dateStr, start: startTime, end: endTime, room: room };
            const meta = JSON.stringify(metaObj);

            const [r] = await conn.query('INSERT INTO class_schedules (class_id, action, scheduled_at, meta, created_at) VALUES (?, ?, ?, ?, NOW())', [classId, 'CLASS_SCHEDULE', scheduledAt, meta]);

            for (const st of students) {
                const metaCopy = JSON.stringify({...metaObj, classScheduleId: r.insertId });
                await conn.query('INSERT INTO schedules (class_id, student_id, action, scheduled_at, meta, created_at) VALUES (?, ?, ?, ?, ?, NOW())', [classId, st.student_id, 'ASSIGNED', scheduledAt, metaCopy]);
            }
        }

        await conn.commit();
        res.json({ success: true, message: 'Đã cập nhật lịch học thành công.' });
    } catch (err) {
        if (conn) await conn.rollback();
        // Handle 400 and 409 errors
        if (err.message && (err.message.includes('Không thể sửa lịch.') || err.message.includes('Lịch lớp đã được tạo.') || err.message.includes('Trùng lịch với lớp'))) {
            const status = err.message.includes('Trùng lịch') ? 409 : 400;
            return res.status(status).json({ success: false, message: err.message });
        }
        handleError(res, err, 'PUT /schedules');
    } finally {
        if (conn) conn.release();
    }
});

// Create new schedule (Keep logic Delete -> Insert to avoid errors) - Endpoint POST
router.post('/:id/schedules', async(req, res) => {
    const classId = parseInt(req.params.id, 10);
    const { sessionDates, sessionTimeStart, sessionTimeEnd, room } = req.body || {};
    if (!Array.isArray(sessionDates) || sessionDates.length === 0) return res.status(400).json({ success: false, message: 'sessionDates required' });

    let conn;
    try {
        conn = await db.getConnection();
        await conn.beginTransaction();

        // 1. Check if class has started
        const [
            [clsStarted]
        ] = await conn.query(`SELECT start_date FROM classes WHERE id = ? AND start_date IS NOT NULL AND CURDATE() >= start_date`, [classId]);
        if (clsStarted) {
            const d = clsStarted.start_date.toISOString().split('T')[0];
            await conn.rollback();
            return res.status(400).json({ success: false, message: `Không thể tạo lịch mới. Lớp đã bắt đầu từ ${d}.` });
        }

        // 2. Block if schedule already exists
        const [
            [schedulesExist]
        ] = await conn.query('SELECT 1 FROM class_schedules WHERE class_id = ? LIMIT 1', [classId]);
        if (schedulesExist) {
            await conn.rollback();
            return res.status(400).json({ success: false, message: 'Lịch lớp đã được tạo. Không thể tạo lại lần thứ hai.' });
        }

        // ❌ NEW LOGIC: CHECK FOR INSTRUCTOR SCHEDULE CONFLICT
        const conflictCheck = await checkScheduleConflict(conn, classId, sessionDates);
        if (conflictCheck.conflict) {
            await conn.rollback();
            return res.status(409).json({ success: false, message: conflictCheck.message });
        }


        // 3. Delete old schedule (If any)
        await conn.query('DELETE FROM schedules WHERE class_id = ? AND action = "ASSIGNED"', [classId]);
        await conn.query('DELETE FROM class_schedules WHERE class_id = ?', [classId]);

        // 4. Create new schedule
        const [students] = await conn.query('SELECT student_id FROM class_students WHERE class_id = ? AND status = "ACTIVE"', [classId]);

        for (const dateRaw of sessionDates) {
            const dateStr = parseDateToYMD(dateRaw);
            if (!dateStr) continue;
            const startTime = sessionTimeStart || null;
            const endTime = sessionTimeEnd || null;
            const scheduledAt = startTime ? `${dateStr} ${startTime}` : null;

            const metaObj = { providedSessionDate: dateStr, start: startTime, end: endTime, room: room };
            const meta = JSON.stringify(metaObj);

            const [r] = await conn.query('INSERT INTO class_schedules (class_id, action, scheduled_at, meta, created_at) VALUES (?, ?, ?, ?, NOW())', [classId, 'CLASS_SCHEDULE', scheduledAt, meta]);

            for (const st of students) {
                const metaCopy = JSON.stringify({...metaObj, classScheduleId: r.insertId });
                await conn.query('INSERT INTO schedules (class_id, student_id, action, scheduled_at, meta, created_at) VALUES (?, ?, ?, ?, ?, NOW())', [classId, st.student_id, 'ASSIGNED', scheduledAt, metaCopy]);
            }
        }

        await conn.commit();
        res.json({ success: true, message: 'Đã tạo lịch học thành công.' });
    } catch (err) {
        if (conn) await conn.rollback();
        // Handle errors from new blocking logic
        if (err.message && (err.message.includes('Không thể tạo lịch mới.') || err.message.includes('Lịch lớp đã được tạo.') || err.message.includes('Trùng lịch với lớp'))) {
            const status = err.message.includes('Trùng lịch') ? 409 : 400;
            return res.status(status).json({ success: false, message: err.message });
        }
        handleError(res, err, 'POST /schedules');
    } finally {
        if (conn) conn.release();
    }
});

// ... (Other endpoints: PUT /schedules/:id, DELETE /schedules/:id, /finish, /bulk-complete)

module.exports = router;