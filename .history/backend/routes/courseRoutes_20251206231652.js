// routes/courseRoutes.js
const express = require('express');
const router = express.Router();
const db = require('../db');

// ==================== COURSES ====================

// GET /api/courses - Lấy danh sách khóa học (có filter)
router.get('/', async(req, res) => {
    try {
        const { status, level, search } = req.query;
        let query = 'SELECT * FROM courses WHERE 1=1';
        const params = [];

        if (status) {
            query += ' AND status = ?';
            params.push(status);
        }

        if (level) {
            query += ' AND level = ?';
            params.push(level);
        }

        if (search) {
            query += ' AND (name LIKE ? OR course_code LIKE ?)';
            params.push(`%${search}%`, `%${search}%`);
        }

        query += ' ORDER BY created_at DESC';

        const [rows] = await db.query(query, params);
        res.json({ success: true, courses: rows });
    } catch (error) {
        console.error('Error fetching courses:', error);
        res.status(500).json({ success: false, message: 'Lỗi khi lấy danh sách khóa học' });
    }
});

// GET /api/courses/:id - Lấy chi tiết khóa học
router.get('/:id', async(req, res) => {
    try {
        const { id } = req.params;
        const [rows] = await db.query('SELECT * FROM courses WHERE id = ?', [id]);

        if (rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy khóa học' });
        }

        res.json({ success: true, course: rows[0] });
    } catch (error) {
        console.error('Error fetching course:', error);
        res.status(500).json({ success: false, message: 'Lỗi khi lấy thông tin khóa học' });
    }
});

// POST /api/courses - Tạo khóa học mới
router.post('/', async(req, res) => {
    try {
        const {
            course_code,
            name,
            level,
            short_description,
            detailed_description,
            duration_weeks,
            sessions_per_week,
            hours_per_session,
            tuition_fee,
            requirements,
            objectives,
            status = 'ACTIVE'
        } = req.body;

        // Validate required fields
        if (!course_code || !name) {
            return res.status(400).json({ success: false, message: 'Thiếu thông tin bắt buộc' });
        }

        const [result] = await db.query(
            `INSERT INTO courses (
        course_code, name, level, short_description, detailed_description,
        duration_weeks, sessions_per_week, hours_per_session, tuition_fee,
        requirements, objectives, status, created_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, [
                course_code, name, level, short_description, detailed_description,
                duration_weeks, sessions_per_week, hours_per_session, tuition_fee,
                requirements, objectives, status, req.body.created_by || 1
            ]
        );

        const courseId = result.insertId;
        const [courseRows] = await db.query('SELECT * FROM courses WHERE id = ?', [courseId]);

        // Log history
        await db.query(
            `INSERT INTO course_history (course_id, action, changed_by)
       VALUES (?, 'CREATE', ?)`, [courseId, req.body.created_by || 1]
        );

        res.json({ success: true, course: courseRows[0] });
    } catch (error) {
        console.error('Error creating course:', error);
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ success: false, message: 'Mã khóa học đã tồn tại' });
        }
        res.status(500).json({ success: false, message: 'Lỗi khi tạo khóa học' });
    }
});

// PUT /api/courses/:id - Cập nhật khóa học
router.put('/:id', async(req, res) => {
    try {
        const { id } = req.params;

        // Lấy dữ liệu cũ
        const [oldRows] = await db.query('SELECT * FROM courses WHERE id = ?', [id]);
        if (oldRows.length === 0) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy khóa học' });
        }

        // Chỉ update status nếu chỉ truyền status
        if (Object.keys(req.body).length === 1 && req.body.status) {
            await db.query(
                `UPDATE courses SET status = ?, updated_at = NOW() WHERE id = ?`, [req.body.status, id]
            );

            // Lưu lịch sử
            if (oldRows[0].status !== req.body.status) {
                await db.query(
                    `INSERT INTO course_history (course_id, action, field_changed, old_value, new_value, reason, changed_by)
           VALUES (?, 'UPDATE', 'status', ?, ?, 'Chuyển trạng thái', 1)`, [id, oldRows[0].status, req.body.status]
                );
            }

            const [rows] = await db.query('SELECT * FROM courses WHERE id = ?', [id]);
            return res.json({ success: true, course: rows[0] });
        }

        // Update đầy đủ
        const {
            name,
            level,
            short_description,
            detailed_description,
            duration_weeks,
            sessions_per_week,
            hours_per_session,
            tuition_fee,
            requirements,
            objectives,
            status
        } = req.body;

        await db.query(
            `UPDATE courses SET
        name = ?, level = ?, short_description = ?, detailed_description = ?,
        duration_weeks = ?, sessions_per_week = ?, hours_per_session = ?,
        tuition_fee = ?, requirements = ?, objectives = ?, status = ?,
        updated_at = NOW()
      WHERE id = ?`, [
                name, level, short_description, detailed_description,
                duration_weeks, sessions_per_week, hours_per_session,
                tuition_fee, requirements, objectives, status, id
            ]
        );

        // Log history
        await db.query(
            `INSERT INTO course_history (course_id, action, changed_by)
       VALUES (?, 'UPDATE', ?)`, [id, req.body.changed_by || 1]
        );

        const [rows] = await db.query('SELECT * FROM courses WHERE id = ?', [id]);
        res.json({ success: true, course: rows[0] });
    } catch (error) {
        console.error('Error updating course:', error);
        res.status(500).json({ success: false, message: 'Lỗi khi cập nhật khóa học' });
    }
});

// PUT /api/courses/:id/archive - Kết thúc khóa học
router.put('/:id/archive', async(req, res) => {
    try {
        const { id } = req.params;
        const { changed_by } = req.body;

        const [courseRows] = await db.query('SELECT * FROM courses WHERE id = ?', [id]);
        if (courseRows.length === 0) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy khóa học' });
        }

        if (courseRows[0].status === 'ARCHIVED') {
            return res.status(400).json({
                success: false,
                message: 'Khóa học đã được lưu trữ'
            });
        }

        await db.query(
            `UPDATE courses SET status = 'ARCHIVED', updated_at = NOW() WHERE id = ?`, [id]
        );

        await db.query(
            `INSERT INTO course_history (course_id, action, field_changed, old_value, new_value, reason, changed_by)
       VALUES (?, 'UPDATE', 'status', ?, 'ARCHIVED', 'Kết thúc khóa học', ?)`, [id, courseRows[0].status, changed_by || 1]
        );

        const [rows] = await db.query('SELECT * FROM courses WHERE id = ?', [id]);
        res.json({ success: true, message: 'Đã kết thúc khóa học', course: rows[0] });
    } catch (error) {
        console.error('Error archiving course:', error);
        res.status(500).json({ success: false, message: 'Lỗi khi kết thúc khóa học' });
    }
});

// DELETE /api/courses/:id - Xóa khóa học
router.delete('/:id', async(req, res) => {
    try {
        const { id } = req.params;
        const pool = db; // db là pool connection

        // Kiểm tra khóa học có tồn tại không
        const [course] = await pool.query('SELECT * FROM courses WHERE id = ?', [id]);
        
        if (course.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Khóa học không tồn tại'
            });
        }

        // Lấy tất cả PAID students cho khoá học này
        const [paidStudents] = await pool.query(
            `SELECT DISTINCT s.id, s.name FROM students s
             INNER JOIN invoices i ON s.id = i.student_id
             WHERE i.course_id = ? AND i.status = 'PAID' AND s.payment_status = 'PAID'`,
            [id]
        );

        // Nếu không có PAID students → có thể xoá
        if (!paidStudents || paidStudents.length === 0) {
            // Xoá hoá đơn PENDING và khoá học
            await pool.query('DELETE FROM invoices WHERE course_id = ?', [id]);
            await pool.query('DELETE FROM courses WHERE id = ?', [id]);
            
            return res.json({
                success: true,
                message: '✅ Xóa khóa học thành công! (Không có PAID students)'
            });
        }

        // Nếu có PAID students → kiểm tra xem tất cả có ở trong lớp không
        const [unenrolledStudents] = await pool.query(
            `SELECT DISTINCT s.id, s.name FROM students s
             INNER JOIN invoices i ON s.id = i.student_id
             LEFT JOIN class_students cs ON s.id = cs.student_id AND cs.status = 'ACTIVE'
             WHERE i.course_id = ? AND i.status = 'PAID' AND s.payment_status = 'PAID'
             AND cs.id IS NULL`,
            [id]
        );

        // Nếu có PAID students chưa ở trong lớp → không thể xoá
        if (unenrolledStudents && unenrolledStudents.length > 0) {
            const studentNames = unenrolledStudents.map(s => s.name).join(', ');
            return res.status(400).json({
                success: false,
                message: `❌ Không thể xóa! Có ${unenrolledStudents.length} học viên PAID chưa gán vào lớp: ${studentNames}`,
                blocked_students: unenrolledStudents
            });
        }

        // Tất cả PAID students đều ở trong lớp → có thể xoá
        await pool.query('DELETE FROM invoices WHERE course_id = ?', [id]);
        await pool.query('DELETE FROM courses WHERE id = ?', [id]);

        res.json({
            success: true,
            message: '✅ Xóa khóa học thành công! (Tất cả PAID students đã ở trong lớp)'
        });
    } catch (error) {
        console.error('Error deleting course:', error);
        res.status(500).json({ success: false, message: 'Lỗi khi xóa khóa học', error: error.message });
    }
});

// ==================== LESSONS ====================

// GET /api/courses/:id/lessons - Lấy danh sách bài học
router.get('/:id/lessons', async(req, res) => {
    try {
        const { id } = req.params;
        const [rows] = await db.query(
            'SELECT * FROM course_lessons WHERE course_id = ? ORDER BY lesson_number', [id]
        );
        res.json({ success: true, lessons: rows });
    } catch (error) {
        console.error('Error fetching lessons:', error);
        res.status(500).json({ success: false, message: 'Lỗi khi lấy danh sách bài học' });
    }
});

// POST /api/courses/:id/lessons - Thêm bài học
router.post('/:id/lessons', async(req, res) => {
    try {
        const { id } = req.params;
        const { lesson_number, title, description, content, duration_minutes } = req.body;

        const [result] = await db.query(
            `INSERT INTO course_lessons (course_id, lesson_number, title, description, content, duration_minutes)
       VALUES (?, ?, ?, ?, ?, ?)`, [id, lesson_number, title, description, content, duration_minutes]
        );

        const [rows] = await db.query('SELECT * FROM course_lessons WHERE id = ?', [result.insertId]);
        res.json({ success: true, lesson: rows[0] });
    } catch (error) {
        console.error('Error creating lesson:', error);
        res.status(500).json({ success: false, message: 'Lỗi khi tạo bài học' });
    }
});

// PUT /api/lessons/:id - Cập nhật bài học
router.put('/lessons/:id', async(req, res) => {
    try {
        const { id } = req.params;
        const { title, description, content, duration_minutes } = req.body;

        await db.query(
            `UPDATE course_lessons SET
        title = ?, description = ?, content = ?, duration_minutes = ?
      WHERE id = ?`, [title, description, content, duration_minutes, id]
        );

        const [rows] = await db.query('SELECT * FROM course_lessons WHERE id = ?', [id]);
        if (rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy bài học' });
        }

        res.json({ success: true, lesson: rows[0] });
    } catch (error) {
        console.error('Error updating lesson:', error);
        res.status(500).json({ success: false, message: 'Lỗi khi cập nhật bài học' });
    }
});

// DELETE /api/lessons/:id - Xóa bài học
router.delete('/lessons/:id', async(req, res) => {
    try {
        const { id } = req.params;
        await db.query('DELETE FROM course_lessons WHERE id = ?', [id]);
        res.json({ success: true, message: 'Đã xóa bài học' });
    } catch (error) {
        console.error('Error deleting lesson:', error);
        res.status(500).json({ success: false, message: 'Lỗi khi xóa bài học' });
    }
});

// ==================== SUB-LESSONS ====================

// GET /api/lessons/:id/sub-lessons - Lấy danh sách bài tập
router.get('/lessons/:id/sub-lessons', async(req, res) => {
    try {
        const { id } = req.params;
        const [rows] = await db.query(
            'SELECT * FROM course_sub_lessons WHERE lesson_id = ? ORDER BY sub_lesson_number', [id]
        );
        res.json({ success: true, subLessons: rows });
    } catch (error) {
        console.error('Error fetching sub-lessons:', error);
        res.status(500).json({ success: false, message: 'Lỗi khi lấy danh sách bài tập' });
    }
});

// POST /api/lessons/:id/sub-lessons - Thêm bài tập
router.post('/lessons/:id/sub-lessons', async(req, res) => {
    try {
        const { id } = req.params;
        const { sub_lesson_number, title, type, content, answer_key } = req.body;

        const [result] = await db.query(
            `INSERT INTO course_sub_lessons (lesson_id, sub_lesson_number, title, type, content, answer_key)
       VALUES (?, ?, ?, ?, ?, ?)`, [id, sub_lesson_number, title, type, content, answer_key]
        );

        const [rows] = await db.query('SELECT * FROM course_sub_lessons WHERE id = ?', [result.insertId]);
        res.json({ success: true, subLesson: rows[0] });
    } catch (error) {
        console.error('Error creating sub-lesson:', error);
        res.status(500).json({ success: false, message: 'Lỗi khi tạo bài tập' });
    }
});

// DELETE /api/sub-lessons/:id - Xóa bài tập
router.delete('/sub-lessons/:id', async(req, res) => {
    try {
        const { id } = req.params;
        await db.query('DELETE FROM course_sub_lessons WHERE id = ?', [id]);
        res.json({ success: true, message: 'Đã xóa bài tập' });
    } catch (error) {
        console.error('Error deleting sub-lesson:', error);
        res.status(500).json({ success: false, message: 'Lỗi khi xóa bài tập' });
    }
});

// ==================== MATERIALS ====================

// GET /api/courses/:id/materials - Lấy danh sách tài liệu
router.get('/:id/materials', async(req, res) => {
    try {
        const { id } = req.params;
        const [rows] = await db.query(
            'SELECT * FROM course_materials WHERE course_id = ? ORDER BY uploaded_at DESC', [id]
        );
        res.json({ success: true, materials: rows });
    } catch (error) {
        console.error('Error fetching materials:', error);
        res.status(500).json({ success: false, message: 'Lỗi khi lấy danh sách tài liệu' });
    }
});

// POST /api/courses/:id/materials - Thêm tài liệu
router.post('/:id/materials', async(req, res) => {
    try {
        const { id } = req.params;
        const { lesson_id, title, type, file_path, url, description, uploaded_by } = req.body;

        const [result] = await db.query(
            `INSERT INTO course_materials (course_id, lesson_id, title, type, file_path, url, description, uploaded_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`, [id, lesson_id, title, type, file_path, url, description, uploaded_by || 1]
        );

        const [rows] = await db.query('SELECT * FROM course_materials WHERE id = ?', [result.insertId]);
        res.json({ success: true, material: rows[0] });
    } catch (error) {
        console.error('Error creating material:', error);
        res.status(500).json({ success: false, message: 'Lỗi khi thêm tài liệu' });
    }
});

// DELETE /api/materials/:id - Xóa tài liệu
router.delete('/materials/:id', async(req, res) => {
    try {
        const { id } = req.params;
        await db.query('DELETE FROM course_materials WHERE id = ?', [id]);
        res.json({ success: true, message: 'Đã xóa tài liệu' });
    } catch (error) {
        console.error('Error deleting material:', error);
        res.status(500).json({ success: false, message: 'Lỗi khi xóa tài liệu' });
    }
});

// ==================== HISTORY ====================

// GET /api/courses/:id/history - Lấy lịch sử chỉnh sửa
router.get('/:id/history', async(req, res) => {
    try {
        const { id } = req.params;
        const [rows] = await db.query(
            `SELECT h.*, e.full_name as changed_by_name
       FROM course_history h
       LEFT JOIN employees e ON h.changed_by = e.id
       WHERE h.course_id = ?
       ORDER BY h.changed_at DESC`, [id]
        );
        res.json({ success: true, history: rows });
    } catch (error) {
        console.error('Error fetching history:', error);
        res.status(500).json({ success: false, message: 'Lỗi khi lấy lịch sử' });
    }
});

module.exports = router;