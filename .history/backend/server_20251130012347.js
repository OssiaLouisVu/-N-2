// ======================================================
// =============== BACKEND ENGLISH CENTER ===============
// ======================================================
const express = require("express");
const cors = require("cors");
const nodemailer = require("nodemailer");
require("dotenv").config();
const db = require("./db");
const bcrypt = require('bcryptjs');

// Router quản lý học viên (STAFF)
const studentRoutes = require("./routes/studentRoutes");
// Router quản lý lịch (assign / finish)
const scheduleRoutes = require("./routes/scheduleRoutes");
// Router quản lý lớp
const classRoutes = require("./routes/classRoutes");
// Router quản lý session (timetable)
const sessionRoutes = require("./routes/sessionRoutes");

const app = express();
const PORT = process.env.PORT || 8080;

// Debug xem env đã load chưa
console.log("MAIL_USER =", process.env.MAIL_USER);
console.log(
    "MAIL_PASS length =",
    process.env.MAIL_PASS ? process.env.MAIL_PASS.length : "undefined"
);

app.use(
    cors({
        origin: "http://localhost:5173",
    })
);
app.use(express.json());

// ======================================================
// =============== EMAIL CONFIG (GMAIL) =================
// ======================================================

const mailTransporter = nodemailer.createTransport({
    service: process.env.MAIL_SERVICE || "gmail",
    auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
    },
});

async function sendAttendanceEmail({
    to,
    studentName,
    className,
    date,
    status,
    reason,
}) {
    console.log("📧 Gửi email tới:", to);
    console.log("   - Học viên:", studentName);
    console.log("   - Lớp:", className);
    console.log("   - Ngày:", date);
    console.log("   - Trạng thái:", status);
    console.log("   - Lý do:", reason || "(không)");

    const subject = `[Thông báo điểm danh] Lớp ${className} - Ngày ${date}`;
    const text =
        `Xin chào ${studentName},\n\n` +
        `Kết quả điểm danh buổi học ngày ${date} cho lớp ${className}:\n` +
        `Trạng thái: ${status}\n` +
        (reason ? `Ghi chú: ${reason}\n` : "") +
        `\nTrân trọng,\nTrung tâm tiếng Trung`;

    try {
        await mailTransporter.sendMail({
            from: '"Trung tâm tiếng Trung" <sonlouisvu@gmail.com>',
            to,
            subject,
            text,
        });
        console.log("✅ Email gửi thành công!");
    } catch (err) {
        console.error("❌ Lỗi gửi email:", err.message);
    }
}

// test nhanh gửi mail
app.get("/test-send", async(req, res) => {
    try {
        await sendAttendanceEmail({
            to: "anhkha19012004@gmail.com",
            studentName: "Test Student",
            className: "HSK2 - Cơ bản (C001)",
            date: "2025-11-21",
            status: "Có mặt",
            reason: "",
        });
        res.send("✅ Email test đã được gửi!");
    } catch (err) {
        console.error("Lỗi khi gửi email test:", err);
        res.status(500).send("❌ Lỗi: " + err.message);
    }
});

// ======================================================
// 1) DEMO USER LOGIN
// ======================================================

app.post("/api/auth/login", async(req, res) => {
    const { username, password } = req.body;

    try {
        const [rows] = await db.execute(
            "SELECT username, password, role FROM users WHERE username = ?", [username]
        );

        if (rows.length === 0) {
            return res
                .status(401)
                .json({ message: "Sai tên đăng nhập hoặc mật khẩu" });
        }

        const user = rows[0];

        // Compare hashed password
        const match = await bcrypt.compare(password, user.password);
        if (!match) {
            return res.status(401).json({ message: "Sai tên đăng nhập hoặc mật khẩu" });
        }

        return res.json({
            username: user.username,
            role: user.role,
        });
    } catch (err) {
        console.error("Lỗi khi đăng nhập:", err);
        return res.status(500).json({ message: "Lỗi server khi đăng nhập" });
    }
});

// ======================================================
// 2) LỊCH HỌC HỌC VIÊN – LẤY TỪ CSDL THẬT
// ======================================================

app.get("/api/students/:username/schedule", async (req, res) => {
    // Returns upcoming sessions for a student.
    // :username may be either the login username or the numeric student id.
    const { username } = req.params;
    try {
        let studentId = null;

        // If numeric, treat as student id
        if (/^\d+$/.test(username)) {
            studentId = parseInt(username, 10);
        } else {
            // try to find mapping in users table (username -> student_id)
            try {
                const [urows] = await db.execute('SELECT student_id FROM users WHERE username = ?', [username]);
                if (urows && urows.length > 0) {
                    studentId = urows[0].student_id;
                }
            } catch (e) {
                // users table may not exist; fall through and return not found
                console.warn('users table lookup failed or users table missing:', e.message);
            }
        }

        if (!studentId) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy học viên' });
        }

        // Join class_sessions with class_students to compute student's upcoming sessions
        const [rows] = await db.execute(
            `SELECT cs.date, cs.time_start, cs.time_end, c.name AS class_name, cs.room
             FROM class_sessions cs
             JOIN classes c ON c.id = cs.class_id
             JOIN class_students cls ON cls.class_id = cs.class_id
             WHERE cls.student_id = ?
                 AND cs.date >= CURDATE()
             ORDER BY cs.date ASC`,
            [studentId]
        );

        return res.json({
            success: true,
            schedule: rows.map((r) => ({
                date: r.date,
                timeStart: r.time_start,
                timeEnd: r.time_end,
                className: r.class_name,
                room: r.room,
            })),
        });
    } catch (err) {
        console.error('Lỗi lấy lịch học:', err);
        return res.status(500).json({ success: false, message: 'Lỗi server khi lấy lịch học' });
    }
});

// ======================================================
// 3) THI THỬ HỌC VIÊN (ca thi, đăng ký, kết quả)
// ======================================================

app.get("/api/students/:username/mock-exams", async(req, res) => {
    const { username } = req.params;

    try {
        // 1. Danh sách ca thi
        const [shiftRows] = await db.execute(
            `SELECT 
         id,
         exam_name  AS examName,
         date,
         start_time AS startTime,
         end_time   AS endTime,
         room,
         level
       FROM mock_exam_shifts
       ORDER BY date`
        );

        // 2. Đăng ký của học viên
        const [regRows] = await db.execute(
            `SELECT id, username, shift_id, date_registered, status
       FROM mock_exam_registrations
       WHERE username = ?`, [username]
        );

        const registeredShiftIds = regRows.map((r) => r.shift_id);

        // 3. Ca thi + cờ isRegistered
        const availableShifts = shiftRows.map((s) => ({
            id: s.id,
            examName: s.examName,
            date: s.date,
            startTime: s.startTime,
            endTime: s.endTime,
            room: s.room,
            level: s.level,
            isRegistered: registeredShiftIds.includes(s.id),
        }));

        // 4. Lịch thi thử đã đăng ký
        const registered = regRows.map((r) => {
            const shift = shiftRows.find((s) => s.id === r.shift_id);
            return {
                id: r.id,
                username: r.username,
                shiftId: r.shift_id,
                dateRegistered: r.date_registered,
                status: r.status,
                shift,
            };
        });

        // 5. Kết quả thi thử theo từng kỳ thi
        const [resultRows] = await db.execute(
            `SELECT id, exam_name AS examName, date, score, feedback
       FROM mock_exam_results
       WHERE username = ?`, [username]
        );

        const results = [];
        for (const r of resultRows) {
            const [sections] = await db.execute(
                `SELECT section_name AS name, score, max_score
         FROM mock_exam_result_sections
         WHERE result_id = ?`, [r.id]
            );
            results.push({
                id: r.id,
                examName: r.examName,
                date: r.date,
                score: r.score,
                feedback: r.feedback,
                sections,
            });
        }

        return res.json({
            success: true,
            availableShifts,
            registered,
            results,
        });
    } catch (err) {
        console.error("Lỗi /mock-exams:", err);
        return res
            .status(500)
            .json({ success: false, message: "Lỗi server khi lấy thi thử" });
    }
});

app.post("/api/students/:username/mock-exams/register", async(req, res) => {
    const { username } = req.params;
    const { shiftId } = req.body;

    try {
        const [existedRows] = await db.execute(
            "SELECT id FROM mock_exam_registrations WHERE username = ? AND shift_id = ?", [username, shiftId]
        );

        if (existedRows.length > 0) {
            return res.json({
                success: true,
                message: "Bạn đã đăng ký ca thi này rồi",
            });
        }

        const [result] = await db.execute(
            "INSERT INTO mock_exam_registrations (username, shift_id, date_registered, status) VALUES (?, ?, CURDATE(), 'REGISTERED')", [username, shiftId]
        );

        return res.json({
            success: true,
            message: "Đăng ký thi thử thành công",
            registration: {
                id: result.insertId,
                username,
                shiftId,
                dateRegistered: new Date().toISOString().split("T")[0],
                status: "REGISTERED",
            },
        });
    } catch (err) {
        console.error("Lỗi POST /mock-exams/register:", err);
        return res.status(500).json({
            success: false,
            message: "Lỗi server khi đăng ký ca thi",
        });
    }
});

app.post("/api/students/:username/mock-exams/cancel", async(req, res) => {
    const { username } = req.params;
    const { shiftId } = req.body;

    try {
        const [result] = await db.execute(
            "DELETE FROM mock_exam_registrations WHERE username = ? AND shift_id = ?", [username, shiftId]
        );

        if (result.affectedRows === 0) {
            return res.json({
                success: false,
                message: "Không tìm thấy đăng ký để huỷ",
            });
        }

        return res.json({ success: true, message: "Huỷ đăng ký thành công" });
    } catch (err) {
        console.error("Lỗi POST /mock-exams/cancel:", err);
        return res.status(500).json({
            success: false,
            message: "Lỗi server khi huỷ ca thi",
        });
    }
});

// ======================================================
// MOUNT ROUTER QUẢN LÝ HỌC VIÊN (STAFF)
// ======================================================
// Đặt SAU các route /api/students/:username/... để không bị "nuốt" route.
app.use("/api/students", studentRoutes);

// Router cho quản lý lịch học: assign / finish -> tự động cập nhật trạng thái học viên
app.use("/api/schedules", scheduleRoutes);

// Router quản lý lớp (CRUD + assign/remove/finish)
app.use('/api/classes', classRoutes);

// Session/timetable routes
app.use('/api', sessionRoutes);

// ======================================================
// 4) GIÁO VIÊN – DANH SÁCH LỚP (DEMO FIXED DATA)
// ======================================================

const teacherClassesUpcoming = [{
        id: 101,
        name: "HSK3 - Giao tiếp (Lớp 01)",
        startDate: "2025-11-20",
        shift: "Ca tối",
        room: "P301",
    },
    
    {
        id: 102,
        name: "HSK4 - Ngữ pháp (Lớp 02)",
        startDate: "2025-12-01",
        shift: "Ca sáng",
        room: "P204",
    },
];

const teacherClassesOngoing = [{
        id: 201,
        name: "HSK2 - Cơ bản (Lớp 05)",
        startDate: "2025-10-10",
        shift: "Ca chiều",
        students: 18,
    },
    {
        id: 202,
        name: "HSK2 - Cơ bản (Lớp 04)",
        startDate: "2025-10-10",
        shift: "Ca chiều",
        students: 10,
    },
];

const teacherClassesFinished = [
    { id: 301, name: "HSK1 - Lớp 03", endDate: "2025-08-01", totalSessions: 24 },
    { id: 302, name: "HSK2 - Lớp 04", endDate: "2025-07-20", totalSessions: 20 },
];

app.get("/api/teacher/classes/upcoming", (req, res) => {
    res.json({ success: true, data: teacherClassesUpcoming });
});

app.get("/api/teacher/classes/ongoing", (req, res) => {
    res.json({ success: true, data: teacherClassesOngoing });
});

app.get("/api/teacher/classes/finished", (req, res) => {
    res.json({ success: true, data: teacherClassesFinished });
});

// ======================================================
// 5) LỊCH GIẢNG DẠY CỦA GIÁO VIÊN (DEMO FIXED DATA)
// ======================================================

const teacherTeachingSchedule = {
    teacher1: [{
            id: 1,
            classId: 201,
            className: "HSK2 - Cơ bản (Lớp 05)",
            date: "2025-11-10",
            timeStart: "18:00",
            timeEnd: "19:30",
            room: "P201",
            topic: "Ngữ pháp cơ bản",
            materials: ["Slide1.pdf"],
            notes: "Ổn định",
        },
        {
            id: 2,
            classId: 201,
            className: "HSK2 - Cơ bản (Lớp 05)",
            date: "2025-11-12",
            timeStart: "18:00",
            timeEnd: "19:30",
            room: "P201",
            topic: "Luyện đọc",
            materials: ["Reading.pdf"],
            notes: "Tiến bộ tốt",
        },
    ],
};

app.get("/api/teacher/:username/teaching-schedule", (req, res) => {
    const { username } = req.params;
    const sessions = teacherTeachingSchedule[username] || [];

    return res.json({
        success: true,
        schedule: sessions,
    });
});

app.get("/api/teacher/schedule/:id/detail", (req, res) => {
    const { id } = req.params;

    const all = Object.values(teacherTeachingSchedule).flat();
    const session = all.find((s) => s.id == id);

    return res.json({
        success: true,
        detail: session || null,
    });
});

// ======================================================
// 6.1) GIÁO VIÊN – DANH SÁCH CÁC KỲ THI THỬ (NHÁNH 1)
// ======================================================

app.get("/api/teacher/mock-exam-shifts", async(req, res) => {
    const { examName, date } = req.query;

    try {
        let sql = `
      SELECT
        s.id,
        s.exam_name  AS examName,
        s.date       AS examDate,
        s.start_time AS startTime,
        s.end_time   AS endTime,
        s.room       AS room,
        s.level      AS level,
        COUNT(r.id)  AS registeredCount
      FROM mock_exam_shifts s
      LEFT JOIN mock_exam_registrations r
        ON r.shift_id = s.id
      WHERE 1 = 1
    `;
        const params = [];

        if (examName) {
            sql += " AND s.exam_name LIKE ?";
            params.push(`%${examName}%`);
        }

        if (date) {
            sql += " AND s.date = ?";
            params.push(date);
        }

        sql += `
      GROUP BY
        s.id, s.exam_name, s.date, s.start_time, s.end_time, s.room, s.level
      ORDER BY s.date ASC, s.exam_name ASC
    `;

        const [rows] = await db.execute(sql, params);

        const todayStr = new Date().toISOString().split("T")[0];
        const today = new Date(todayStr);

        const shifts = rows.map((r) => {
            const examDate = new Date(r.examDate);
            let status = "UPCOMING";

            if (examDate < today) status = "FINISHED";
            else if (examDate.getTime() === today.getTime()) status = "ONGOING";

            return {
                id: r.id,
                examName: r.examName,
                date: r.examDate,
                startTime: r.startTime,
                endTime: r.endTime,
                room: r.room,
                level: r.level,
                registeredCount: r.registeredCount,
                status,
            };
        });

        return res.json({ success: true, shifts });
    } catch (err) {
        console.error("Lỗi GET /api/teacher/mock-exam-shifts:", err);
        return res.status(500).json({
            success: false,
            message: "Lỗi server khi lấy danh sách ca thi thử",
        });
    }
});

// Xem danh sách học viên đăng ký theo từng ca thi
app.get(
    "/api/teacher/mock-exam-shifts/:shiftId/students",
    async(req, res) => {
        const { shiftId } = req.params;

        try {
            const [rows] = await db.execute(
                `
        SELECT
          r.id              AS registrationId,
          r.username        AS username,
          r.status          AS status,
          r.date_registered AS dateRegistered
        FROM mock_exam_registrations r
        WHERE r.shift_id = ?
        ORDER BY r.username ASC
      `, [shiftId]
            );

            const students = rows.map((r) => ({
                id: r.registrationId,
                username: r.username,
                status: r.status,
                dateRegistered: r.dateRegistered,
            }));

            return res.json({ success: true, students });
        } catch (err) {
            console.error(
                "Lỗi GET /api/teacher/mock-exam-shifts/:shiftId/students:",
                err
            );
            return res.status(500).json({
                success: false,
                message: "Lỗi server khi lấy danh sách học viên đăng ký",
            });
        }
    }
);

// ======================================================
// 6.2) GIÁO VIÊN – XEM DANH SÁCH ĐIểm THI THỬ
// ======================================================

app.get("/api/teacher/mock-exam-results", async(req, res) => {
    const { examName, date } = req.query;

    try {
        let sql = `
      SELECT
        res.id,
        res.username,
        res.exam_name AS examName,
        res.date      AS examDate,
        res.score,
        res.feedback,
        s.start_time  AS startTime,
        s.end_time    AS endTime,
        s.room        AS room
      FROM mock_exam_results res
      LEFT JOIN mock_exam_shifts s
        ON s.exam_name = res.exam_name
       AND s.date      = res.date
      WHERE 1 = 1
    `;
        const params = [];

        if (examName) {
            sql += " AND res.exam_name LIKE ?";
            params.push(`%${examName}%`);
        }

        if (date) {
            sql += " AND res.date = ?";
            params.push(date);
        }

        sql += `
      ORDER BY
        res.date DESC,
        res.exam_name ASC,
        res.username ASC
    `;

        const [rows] = await db.execute(sql, params);

        const results = rows.map((r) => ({
            id: r.id,
            username: r.username,
            examName: r.examName,
            date: r.examDate,
            startTime: r.startTime,
            endTime: r.endTime,
            room: r.room,
            score: r.score,
            feedback: r.feedback,
            status: "FINISHED",
        }));

        return res.json({ success: true, results });
    } catch (err) {
        console.error("Lỗi GET /api/teacher/mock-exam-results:", err);
        return res
            .status(500)
            .json({ success: false, message: "Lỗi server khi lấy điểm thi thử" });
    }
});

// ======================================================
// =============== MODULE ĐIỂM DANH LỚP HỌC ==============
// ======================================================

const CLASS_STUDENTS = {
    C001: [
        { id: "S001", name: "Nguyen Van A", email: "tanletrongtan52@gmail.com" },
        { id: "S002", name: "Tran Thi B", email: "anhkha19012004@gmail.com" },
    ],
    C002: [
        { id: "S003", name: "Le Van C", email: "anhkha19012004@gmail.com" },
    ],
};

let attendanceSessionAutoId = 1;
let attendanceRecordAutoId = 1;

const ATTENDANCE_SESSIONS = []; // { id, classId, date, note }
const ATTENDANCE_RECORDS = []; // { id, sessionId, studentId, status, recordedAt, reason }

// 1) Lấy danh sách học viên của một lớp
app.get("/api/classes/:classId/students", (req, res) => {
    const { classId } = req.params;
    const students = CLASS_STUDENTS[classId] || [];
    res.json(students);
});

// 2) Lấy danh sách buổi điểm danh theo lớp
app.get("/api/attendance/sessions", (req, res) => {
    const { classId } = req.query;
    const sessions = ATTENDANCE_SESSIONS.filter((s) => s.classId === classId);
    res.json(sessions);
});

// 3) Tạo buổi dạy mới
app.post("/api/attendance/sessions", (req, res) => {
    const { classId, date, note } = req.body;
    if (!classId || !date) {
        return res.status(400).json({ message: "Thiếu classId hoặc date" });
    }

    const newSession = {
        id: `AS${attendanceSessionAutoId++}`,
        classId,
        date,
        note: note || "",
    };
    ATTENDANCE_SESSIONS.push(newSession);
    res.status(201).json(newSession);
});

// 4) Lưu kết quả điểm danh + (tuỳ chọn) gửi email thông báo
app.post("/api/attendance/sessions/:sessionId/records", async(req, res) => {
    const { sessionId } = req.params;
    const { records, sendNotification } = req.body;

    console.log(">>> API saveAttendanceRecords:", {
        sessionId,
        sendNotification,
        recordsLength: Array.isArray(records) ? records.length : null,
    });

    if (!Array.isArray(records)) {
        return res.status(400).json({ message: "records phải là mảng" });
    }

    const now = new Date().toISOString();

    const created = records.map((r) => {
        const rec = {
            id: `AR${attendanceRecordAutoId++}`,
            sessionId,
            studentId: r.studentId,
            status: r.status,
            reason: r.reason || "",
            recordedAt: now,
        };
        ATTENDANCE_RECORDS.push(rec);
        return rec;
    });

    if (sendNotification) {
        try {
            let classId = "UNKNOWN";
            let date = new Date().toISOString().split("T")[0];
            let className = classId;

            const session = ATTENDANCE_SESSIONS.find((s) => s.id === sessionId);
            if (session) {
                classId = session.classId || classId;
                date = session.date || date;
                className = classId;
            } else {
                console.log(
                    "Không tìm thấy session để gửi email, dùng giá trị mặc định:",
                    sessionId
                );
            }

            const allStudents = Object.entries(CLASS_STUDENTS).flatMap(
                ([cid, students]) => students.map((st) => ({...st, classId: cid }))
            );

            const promises = created
                .map((rec) => {
                    const student = allStudents.find((s) => s.id === rec.studentId);
                    if (!student || !student.email) {
                        console.log(
                            `Không tìm thấy email cho studentId=${rec.studentId}`
                        );
                        return null;
                    }

                    return sendAttendanceEmail({
                        to: student.email,
                        studentName: student.name,
                        className,
                        date,
                        status: rec.status,
                        reason: rec.reason,
                    });
                })
                .filter(Boolean);

            await Promise.all(promises);
            console.log("Đã gửi xong email thông báo điểm danh.");
        } catch (err) {
            console.error("Lỗi khi gửi email thông báo:", err);
        }
    }

    return res.status(201).json(created);
});

// ======================================================
// TEST API
// ======================================================

app.get("/", (req, res) => {
    res.send("Backend English Center đang chạy!");
});

// ======================================================
// START SERVER (only when run directly)
// ======================================================

if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`Backend đang chạy tại http://localhost:${PORT}`);
    });
}

// Export app for testing
module.exports = app;