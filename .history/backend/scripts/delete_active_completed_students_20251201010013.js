// Script: delete_active_completed_students.js
// Mục đích: Xoá toàn bộ học viên có status ACTIVE hoặc COMPLETED
// kèm theo tài khoản user STUDENT tương ứng, giữ nguyên cấu trúc bảng.
// Sử dụng: node backend/scripts/delete_active_completed_students.js
// Yêu cầu: đã thiết lập biến kết nối trong backend/db.js.

const db = require('../db');

async function main() {
    console.log('--- Bắt đầu xoá học viên ACTIVE / COMPLETED ---');
    let conn;
    try {
        conn = await db.getConnection();
        await conn.beginTransaction();

        // Đếm trước khi xoá
        const [beforeCounts] = await conn.query(
            `SELECT status, COUNT(*) as cnt FROM students WHERE status IN ('ACTIVE','COMPLETED') GROUP BY status`
        );
        console.table(beforeCounts);

        // Xoá users liên kết tới học viên ACTIVE/COMPLETED (xoá trước để tránh student_id bị SET NULL)
        const [userDeleteResult] = await conn.query(
            `DELETE u FROM users u
       JOIN students s ON u.student_id = s.id
       WHERE s.status IN ('ACTIVE','COMPLETED') AND u.role = 'STUDENT'`
        );
        console.log('Đã xoá user STUDENT liên kết:', userDeleteResult.affectedRows);

        // Xoá học viên (sẽ tự động cascade class_students & schedules do FK ON DELETE CASCADE)
        const [studentDeleteResult] = await conn.query(
            `DELETE FROM students WHERE status IN ('ACTIVE','COMPLETED')`
        );
        console.log('Đã xoá học viên ACTIVE/COMPLETED:', studentDeleteResult.affectedRows);

        // (Tuỳ chọn) Nếu muốn reset AUTO_INCREMENT khi bảng rỗng
        const [remainingRows] = await conn.query(`SELECT COUNT(*) AS remaining FROM students`);
        if (remainingRows[0].remaining === 0) {
            await conn.query('ALTER TABLE students AUTO_INCREMENT = 1');
            console.log('Đặt lại AUTO_INCREMENT về 1 (bảng students hiện rỗng).');
        }

        await conn.commit();
        console.log('--- Hoàn tất xoá ---');

        // Hiển thị kiểm tra sau khi xoá
        const [afterCounts] = await db.query(
            `SELECT status, COUNT(*) as cnt FROM students GROUP BY status`
        );
        console.table(afterCounts);
    } catch (err) {
        if (conn) await conn.rollback();
        console.error('Lỗi khi xoá học viên:', err.message || err);
        process.exitCode = 1;
    } finally {
        if (conn) conn.release && conn.release();
    }
}

main();