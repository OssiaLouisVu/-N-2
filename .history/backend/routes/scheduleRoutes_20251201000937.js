const express = require('express');
const router = express.Router();
const db = require('../db');

// POST /api/schedules/assign
// Body: { studentId, classId?, startDate? }
// - Cập nhật students.status = 'ACTIVE'
// - Nếu có bảng schedules, cố gắng insert một bản ghi (không fail nếu table không tồn tại)
router.post('/assign', async(req, res) => {
    const { studentId, classId, startDate } = req.body;
    if (!studentId) {
        return res.status(400).json({ success: false, message: 'studentId is required' });
    }

    try {
        // Cập nhật trạng thái học viên
        await db.query('UPDATE students SET status = ?, updated_at = NOW() WHERE id = ?', ['ACTIVE', studentId]);

        // Thử insert vào bảng schedules nếu có (không bắt buộc)
        try {
            await db.query(
                'INSERT INTO schedules (student_id, class_id, start_date, created_at) VALUES (?, ?, ?, NOW())', [studentId, classId || null, startDate || null]
            );
        } catch (err) {
            // Bỏ qua lỗi nếu table schedules không tồn tại hoặc lỗi khác
            console.warn('Unable to insert into schedules (may be missing):', err.message);
        }

        return res.json({ success: true, message: 'Assigned schedule and set student status to ACTIVE' });
    } catch (err) {
        console.error('Error in /api/schedules/assign:', err);
        return res.status(500).json({ success: false, message: 'Lỗi server khi gán lịch' });
    }
});

// POST /api/schedules/finish
// Body: { studentId?, scheduleId? }
// - Nếu scheduleId cung cấp, cố gắng mark schedule finished và lấy studentId từ đó
// - Cập nhật students.status = 'COMPLETED'
router.post('/finish', async(req, res) => {
    let { studentId, scheduleId } = req.body;

    if (!studentId && !scheduleId) {
        return res.status(400).json({ success: false, message: 'studentId or scheduleId is required' });
    }

    try {
        if (scheduleId) {
            try {
                await db.query('UPDATE schedules SET status = ?, finished_at = NOW() WHERE id = ?', ['FINISHED', scheduleId]);
            } catch (err) {
                console.warn('Unable to update schedules (may be missing):', err.message);
            }

            try {
                const [rows] = await db.query('SELECT student_id FROM schedules WHERE id = ?', [scheduleId]);
                if (rows && rows.length > 0) {
                    studentId = rows[0].student_id;
                }
            } catch (err) {
                console.warn('Unable to read schedules (may be missing):', err.message);
            }
        }

        if (!studentId) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy studentId để cập nhật' });
        }

        await db.query('UPDATE students SET status = ?, updated_at = NOW() WHERE id = ?', ['COMPLETED', studentId]);

        return res.json({ success: true, message: 'Student marked COMPLETED' });
    } catch (err) {
        console.error('Error in /api/schedules/finish:', err);
        return res.status(500).json({ success: false, message: 'Lỗi server khi kết thúc lịch' });
    }
});

module.exports = router;
// POST /api/schedules/generate-latest
// Body: { studentId, classId, startDate, room }
// Trả về 5 ngày học mới nhất, cùng 1 phòng học
router.post('/generate-latest', async(req, res) => {
    const { studentId, classId, startDate, room } = req.body;
    if (!studentId || !classId || !startDate || !room) {
        return res.status(400).json({ success: false, message: 'studentId, classId, startDate, room đều là bắt buộc' });
    }

    // Tạo 5 ngày học liên tiếp, bắt đầu từ startDate
    const schedules = [];
    let currentDate = new Date(startDate);
    for (let i = 0; i < 5; i++) {
        const dateStr = currentDate.toISOString().slice(0, 10);
        schedules.push({
            date: dateStr,
            time: '09:00 - 11:00',
            class: 'hsk5', // hoặc lấy từ classId nếu cần
            room: room
        });
        // Tăng 1 tháng cho mỗi lịch (hoặc đổi thành tuần/ngày nếu muốn)
        currentDate.setMonth(currentDate.getMonth() + 1);
    }

    // Có thể lưu vào DB nếu muốn, ở đây chỉ trả về danh sách
    return res.json({ success: true, schedules });
});