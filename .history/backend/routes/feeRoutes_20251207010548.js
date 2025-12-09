
const express = require('express');
const router = express.Router();
const pool = require('../db');

// ============================================
// 1. GET /api/fee/students/new
// Lấy danh sách học viên NEW (chưa tạo hoá đơn)
// ============================================
router.get('/students/new', async (req, res) => {
  try {
    const conn = await pool.getConnection();
    
    // Lấy học viên có payment_status = 'NEW' (chưa có hoá đơn nào)
    const [students] = await conn.query(
      `SELECT id, full_name as name, phone, email, payment_status 
       FROM students 
       WHERE payment_status = 'NEW'
       ORDER BY created_at DESC`
    );
    
    conn.release();
    
    res.json({
      success: true,
      students: students || []
    });
  } catch (err) {
    console.error('Error in GET /students/new:', err);
    res.status(500).json({ success: false, message: 'Lỗi server', error: err.message });
  }
});

// ============================================
// 2. GET /api/fee/courses/active
// Lấy danh sách khoá học ACTIVE
// ============================================
router.get('/courses/active', async (req, res) => {
  try {
    const conn = await pool.getConnection();
    
    const [courses] = await conn.query(
      `SELECT id, name, level, tuition_fee, status 
       FROM courses 
       WHERE status = 'ACTIVE'
       ORDER BY name`
    );
    
    conn.release();
    
    res.json({
      success: true,
      courses: courses || []
    });
  } catch (err) {
    console.error('Error in GET /courses/active:', err);
    res.status(500).json({ success: false, message: 'Lỗi server', error: err.message });
  }
});

// ============================================
// 3. POST /api/fee/invoices
// Tạo hoá đơn (PENDING)
// ============================================
router.post('/invoices', async (req, res) => {
  try {
    const { student_id, course_id, amount } = req.body;
    
    // Validate input
    if (!student_id || !course_id || !amount) {
      return res.status(400).json({
        success: false,
        message: 'Thiếu thông tin: student_id, course_id, amount'
      });
    }
    
    if (isNaN(amount) || parseFloat(amount) <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Số tiền phải lớn hơn 0'
      });
    }
    
    const conn = await pool.getConnection();
    
    try {
      // Kiểm tra học viên có tồn tại không
      const [student] = await conn.query(
        `SELECT id, payment_status FROM students WHERE id = ?`,
        [student_id]
      );
      
      if (!student || student.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Học viên không tồn tại'
        });
      }
      
      // Kiểm tra khoá học có tồn tại và ACTIVE không
      const [course] = await conn.query(
        `SELECT id, name, status FROM courses WHERE id = ? AND status = 'ACTIVE'`,
        [course_id]
      );
      
      if (!course || course.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Khoá học không tồn tại hoặc không ACTIVE'
        });
      }
      
      // Kiểm tra học viên đã có hoá đơn cho khoá học này chưa
      const [existing] = await conn.query(
        `SELECT id FROM invoices WHERE student_id = ? AND course_id = ? AND status IN ('PENDING', 'PAID')`,
        [student_id, course_id]
      );
      
      if (existing && existing.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'Học viên đã có hoá đơn cho khoá học này'
        });
      }
      
      // Tạo hoá đơn (PENDING)
      const [result] = await conn.query(
        `INSERT INTO invoices (student_id, course_id, amount, status, created_at)
         VALUES (?, ?, ?, 'PENDING', NOW())`,
        [student_id, course_id, parseFloat(amount)]
      );
      
      const invoice_id = result.insertId;
      
      // Cập nhật trạng thái học viên thành PENDING (nếu còn NEW)
      if (student[0].payment_status === 'NEW') {
        await conn.query(
          `UPDATE students SET payment_status = 'PENDING' WHERE id = ?`,
          [student_id]
        );
      }
      
      res.json({
        success: true,
        message: 'Tạo hoá đơn thành công',
        invoice_id: invoice_id
      });
    } finally {
      conn.release();
    }
  } catch (err) {
    console.error('Error in POST /invoices:', err);
    res.status(500).json({ success: false, message: 'Lỗi server', error: err.message });
  }
});

// ============================================
// 4. GET /api/fee/invoices/pending
// Lấy danh sách hoá đơn PENDING (chưa thanh toán)
// ============================================
router.get('/invoices/pending', async (req, res) => {
  try {
    const conn = await pool.getConnection();
    
    const [invoices] = await conn.query(
      `SELECT 
        i.id,
        i.student_id,
        i.course_id,
        i.amount,
        i.status,
        s.full_name AS student_name,
        s.phone,
        s.email,
        c.name AS course_name,
        c.level,
        i.created_at
       FROM invoices i
       LEFT JOIN students s ON i.student_id = s.id
       LEFT JOIN courses c ON i.course_id = c.id
       WHERE i.status = 'PENDING'
       ORDER BY i.created_at DESC`
    );
    
    conn.release();
    
    res.json({
      success: true,
      invoices: invoices || []
    });
  } catch (err) {
    console.error('Error in GET /invoices/pending:', err);
    res.status(500).json({ success: false, message: 'Lỗi server', error: err.message });
  }
});

// ============================================
// 5. PUT /api/fee/invoices/:id/payment
// Xác nhận thanh toán (PENDING -> PAID)
// ============================================
router.put('/invoices/:id/payment', async (req, res) => {
  try {
    const { id } = req.params;
    const { method, note } = req.body;
    
    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'Thiếu invoice ID'
      });
    }
    
    const conn = await pool.getConnection();
    
    try {
      // Lấy hoá đơn hiện tại
      const [invoice] = await conn.query(
        `SELECT * FROM invoices WHERE id = ?`,
        [id]
      );
      
      if (!invoice || invoice.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Hoá đơn không tồn tại'
        });
      }
      
      const inv = invoice[0];
      
      if (inv.status !== 'PENDING') {
        return res.status(400).json({
          success: false,
          message: `Hoá đơn đã là ${inv.status}, không thể thanh toán lại`
        });
      }
      
      // Cập nhật hoá đơn thành PAID
      await conn.query(
        `UPDATE invoices 
         SET status = 'PAID', 
             payment_method = ?, 
             payment_note = ?,
             paid_at = NOW(),
             updated_at = NOW()
         WHERE id = ?`,
        [method || 'cash', note || '', id]
      );
      
      // Cập nhật trạng thái học viên thành PAID
      await conn.query(
        `UPDATE students 
         SET payment_status = 'PAID'
         WHERE id = ?`,
        [inv.student_id]
      );
      
      res.json({
        success: true,
        message: 'Thanh toán thành công! Học viên chuyển sang PAID'
      });
    } finally {
      conn.release();
    }
  } catch (err) {
    console.error('Error in PUT /invoices/:id/payment:', err);
    res.status(500).json({ success: false, message: 'Lỗi server', error: err.message });
  }
});

// ============================================
// 6. GET /api/fee/invoices/paid
// Lấy danh sách hoá đơn ĐÃ THANH TOÁN (PAID)
// ============================================
router.get('/invoices/paid', async (req, res) => {
  try {
    const conn = await pool.getConnection();
    
    const [invoices] = await conn.query(
      `SELECT 
        i.id,
        i.student_id,
        i.course_id,
        i.amount,
        i.status,
        i.payment_method AS method,
        i.payment_note AS note,
        s.full_name AS student_name,
        s.phone,
        s.email,
        c.name AS course_name,
        c.level,
        i.created_at,
        i.paid_at
       FROM invoices i
       LEFT JOIN students s ON i.student_id = s.id
       LEFT JOIN courses c ON i.course_id = c.id
       WHERE i.status = 'PAID'
       ORDER BY i.paid_at DESC`
    );
    
    conn.release();
    
    res.json({
      success: true,
      invoices: invoices || []
    });
  } catch (err) {
    console.error('Error in GET /invoices/paid:', err);
    res.status(500).json({ success: false, message: 'Lỗi server', error: err.message });
  }
});

// ============================================
// 7. GET /api/fee/invoices/all
// Lấy TẤT CẢ hoá đơn (PENDING + PAID)
// ============================================
router.get('/invoices/all', async (req, res) => {
  try {
    const conn = await pool.getConnection();
    
    const [invoices] = await conn.query(
      `SELECT 
        i.id,
        i.student_id,
        i.course_id,
        i.amount,
        i.status,
        i.payment_method AS method,
        i.payment_note AS note,
        s.name AS student_name,
        s.phone,
        s.email,
        c.name AS course_name,
        c.level,
        i.created_at,
        i.paid_at
       FROM invoices i
       LEFT JOIN students s ON i.student_id = s.id
       LEFT JOIN courses c ON i.course_id = c.id
       ORDER BY i.created_at DESC`
    );
    
    conn.release();
    
    res.json({
      success: true,
      invoices: invoices || []
    });
  } catch (err) {
    console.error('Error in GET /invoices/all:', err);
    res.status(500).json({ success: false, message: 'Lỗi server', error: err.message });
  }
});

// ============================================
// 8. POST /api/fee/students/:id/enroll
// Gán học viên vào lớp (chỉ PAID students)
// Body: { class_id, course_id }
// ============================================
router.post('/students/:id/enroll', async (req, res) => {
  try {
    const { id: student_id } = req.params;
    const { class_id, course_id } = req.body;
    
    if (!student_id || !class_id || !course_id) {
      return res.status(400).json({
        success: false,
        message: 'Thiếu thông tin: student_id, class_id, course_id'
      });
    }
    
    const conn = await pool.getConnection();
    
    try {
      // Kiểm tra học viên có tồn tại không
      const [student] = await conn.query(
        `SELECT id, payment_status FROM students WHERE id = ?`,
        [student_id]
      );
      
      if (!student || student.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Học viên không tồn tại'
        });
      }
      
      // Kiểm tra học viên đã PAID chưa
      if (student[0].payment_status !== 'PAID') {
        return res.status(400).json({
          success: false,
          message: `Học viên chưa thanh toán! Trạng thái hiện tại: ${student[0].payment_status}. Chỉ có thể gán PAID students`
        });
      }
      
      // Kiểm tra lớp có tồn tại không
      const [classData] = await conn.query(
        `SELECT id FROM classes WHERE id = ?`,
        [class_id]
      );
      
      if (!classData || classData.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Lớp không tồn tại'
        });
      }
      
      // Kiểm tra hoá đơn PAID có tồn tại không
      const [invoice] = await conn.query(
        `SELECT id FROM invoices WHERE student_id = ? AND course_id = ? AND status = 'PAID'`,
        [student_id, course_id]
      );
      
      if (!invoice || invoice.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Học viên chưa thanh toán cho khoá học này'
        });
      }
      
      // Kiểm tra học viên đã ở trong lớp này chưa
      const [existing] = await conn.query(
        `SELECT id FROM class_students WHERE class_id = ? AND student_id = ? AND status = 'ACTIVE'`,
        [class_id, student_id]
      );
      
      if (existing && existing.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'Học viên đã ở trong lớp này'
        });
      }
      
      // Gán học viên vào lớp
      await conn.query(
        `INSERT INTO class_students (class_id, student_id, status, created_at)
         VALUES (?, ?, 'ACTIVE', NOW())`,
        [class_id, student_id]
      );
      
      res.json({
        success: true,
        message: '✅ Gán học viên vào lớp thành công!'
      });
    } finally {
      conn.release();
    }
  } catch (err) {
    console.error('Error in POST /students/:id/enroll:', err);
    res.status(500).json({ success: false, message: 'Lỗi server', error: err.message });
  }
});

// ============================================
// 9. DELETE /api/fee/students/:id/unenroll
// Xoá học viên khỏi lớp (quay lại PAID)
// Body: { class_id }
// ============================================
router.delete('/students/:id/unenroll', async (req, res) => {
  try {
    const { id: student_id } = req.params;
    const { class_id } = req.body;
    
    if (!student_id || !class_id) {
      return res.status(400).json({
        success: false,
        message: 'Thiếu thông tin: student_id, class_id'
      });
    }
    
    const conn = await pool.getConnection();
    
    try {
      // Kiểm tra học viên có ở trong lớp không
      const [classStudent] = await conn.query(
        `SELECT id, status FROM class_students WHERE class_id = ? AND student_id = ?`,
        [class_id, student_id]
      );
      
      if (!classStudent || classStudent.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Học viên không ở trong lớp này'
        });
      }
      
      // Xoá học viên khỏi lớp
      await conn.query(
        `UPDATE class_students SET status = 'LEFT', updated_at = NOW()
         WHERE class_id = ? AND student_id = ?`,
        [class_id, student_id]
      );
      
      // Cập nhật lại trạng thái học viên thành PAID (từ khi học viên được gán vào lớp)
      await conn.query(
        `UPDATE students SET payment_status = 'PAID' WHERE id = ?`,
        [student_id]
      );
      
      res.json({
        success: true,
        message: '✅ Xoá học viên khỏi lớp thành công! Học viên quay lại PAID'
      });
    } finally {
      conn.release();
    }
  } catch (err) {
    console.error('Error in DELETE /students/:id/unenroll:', err);
    res.status(500).json({ success: false, message: 'Lỗi server', error: err.message });
  }
});

// ============================================
// 10. DELETE /api/fee/courses/:id
// Xoá khoá học (kiểm tra điều kiện)
// Được xoá nếu: (1) chưa có PAID students
// HOẶC (2) tất cả PAID students đều ở trong lớp
// ============================================
router.delete('/courses/:id', async (req, res) => {
  try {
    const { id: course_id } = req.params;
    
    if (!course_id) {
      return res.status(400).json({
        success: false,
        message: 'Thiếu course_id'
      });
    }
    
    const conn = await pool.getConnection();
    
    try {
      // Kiểm tra khoá học có tồn tại không
      const [course] = await conn.query(
        `SELECT id, name FROM courses WHERE id = ?`,
        [course_id]
      );
      
      if (!course || course.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Khoá học không tồn tại'
        });
      }
      
      // Lấy tất cả PAID students cho khoá học này
      const [paidStudents] = await conn.query(
        `SELECT DISTINCT s.id, s.full_name as name FROM students s
         INNER JOIN invoices i ON s.id = i.student_id
         WHERE i.course_id = ? AND i.status = 'PAID' AND s.payment_status = 'PAID'`,
        [course_id]
      );
      
      // Nếu không có PAID students → có thể xoá
      if (!paidStudents || paidStudents.length === 0) {
        // Xoá hoá đơn PENDING và khoá học
        await conn.query(
          `DELETE FROM invoices WHERE course_id = ?`,
          [course_id]
        );
        
        await conn.query(
          `DELETE FROM courses WHERE id = ?`,
          [course_id]
        );
        
        return res.json({
          success: true,
          message: '✅ Xoá khoá học thành công! (Không có PAID students)'
        });
      }
      
      // Nếu có PAID students → kiểm tra xem tất cả có ở trong lớp không
      const [unenrolledStudents] = await conn.query(
        `SELECT DISTINCT s.id, s.full_name as name FROM students s
         INNER JOIN invoices i ON s.id = i.student_id
         LEFT JOIN class_students cs ON s.id = cs.student_id AND cs.status = 'ACTIVE'
         WHERE i.course_id = ? AND i.status = 'PAID' AND s.payment_status = 'PAID'
         AND cs.id IS NULL`,
        [course_id]
      );
      
      // Nếu có PAID students chưa ở trong lớp → không thể xoá
      if (unenrolledStudents && unenrolledStudents.length > 0) {
        const studentNames = unenrolledStudents.map(s => s.name).join(', ');
        return res.status(400).json({
          success: false,
          message: `❌ Không thể xoá! Có ${unenrolledStudents.length} học viên PAID chưa gán vào lớp: ${studentNames}`,
          blocked_students: unenrolledStudents
        });
      }
      
      // Tất cả PAID students đều ở trong lớp → có thể xoá
      await conn.query(
        `DELETE FROM invoices WHERE course_id = ?`,
        [course_id]
      );
      
      await conn.query(
        `DELETE FROM courses WHERE id = ?`,
        [course_id]
      );
      
      res.json({
        success: true,
        message: '✅ Xoá khoá học thành công! (Tất cả PAID students đã ở trong lớp)'
      });
    } finally {
      conn.release();
    }
  } catch (err) {
    console.error('Error in DELETE /courses/:id:', err);
    res.status(500).json({ success: false, message: 'Lỗi server', error: err.message });
  }
});

module.exports = router;