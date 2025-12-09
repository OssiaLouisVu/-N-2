const express = require("express");
const cors = require("cors");
const nodemailer = require("nodemailer");
require("dotenv").config();

const app = express();
const PORT = 8080;

console.log("MAIL_USER =", process.env.MAIL_USER);
console.log("MAIL_PASS length =", process.env.MAIL_PASS ? process.env.MAIL_PASS.length : "undefined");

app.use(cors({ origin: "http://localhost:5173" }));
app.use(express.json());

// Email transporter
const mailTransporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
    },
});

// Test email
app.get("/test-send", async(req, res) => {
    try {
        await sendAttendanceEmail({
            to: "sonlouisvu@gmail.com",
            studentName: "Test Student",
            className: "HSK2 - Cơ bản (Lớp 05)",
            date: "2025-11-21",
            status: "Có mặt",
            reason: ""
        });
        res.send("✅ Email test đã được gửi!");
    } catch (err) {
        console.error("Lỗi khi gửi email test:", err);
        res.status(500).send("❌ Lỗi: " + err.message);
    }
});

async function sendAttendanceEmail({ to, studentName, className, date, status, reason }) {
    console.log("📧 Gửi email tới:", to);
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
            text
        });
        console.log("✅ Email gửi thành công!");
    } catch (err) {
        console.error("❌ Lỗi gửi email:", err.message);
    }
}

// ====== 1. LOGIN ======
const USERS = [
    { username: "student1", password: "pass12345", role: "STUDENT" },
    { username: "teacher1", password: "pass1234", role: "TEACHER" },
    { username: "staff1", password: "pass1234", role: "STAFF" },
    { username: "accountant1", password: "pass1234", role: "ACCOUNTANT" },
    { username: "manager1", password: "manager1", role: "MANAGER" },
];

app.post("/api/auth/login", (req, res) => {
    const { username, password } = req.body;
    const user = USERS.find(u => u.username === username && u.password === password);
    if (!user) {
        return res.status(401).json({ message: "Sai tên đăng nhập hoặc mật khẩu" });
    }
    return res.json({
        username: user.username,
        role: user.role,
    });
});

// ====== 2. LỊCH HỌC HỌC VIÊN ======
const studentSchedules = {
    student1: [{
            date: "2025-11-20",
            timeStart: "18:00",
            timeEnd: "19:30",
            className: "HSK2 - Cơ bản (Lớp 05)",
            room: "P201",
        },
        {
            date: "2025-11-22",
            timeStart: "18:00",
            timeEnd: "19:30",
            className: "HSK2 - Cơ bản (Lớp 05)",
            room: "P201",
        },
    ],
};

app.get("/api/students/:username/schedule", (req, res) => {
    const { username } = req.params;
    const schedule = studentSchedules[username] || [];
    return res.json({ success: true, schedule });
});

// ====== 3. THI THỬ ======
const examShifts = [{
        id: 1,
        examName: "HSK3 Mock Test 01",
        date: "2025-12-01",
        startTime: "18:00",
        endTime: "19:30",
        room: "P201",
        level: "HSK3",
    },
    {
        id: 2,
        examName: "HSK3 Mock Test 02",
        date: "2025-12-05",
        startTime: "18:00",
        endTime: "19:30",
        room: "P202",
        level: "HSK3",
    },
];

let examRegistrations = [];

const examResults = [{
    id: 1,
    username: "student1",
    examName: "HSK3 Mock Test 00",
    date: "2025-10-20",
    score: 185,
    feedback: "Nghe tốt, cần cải thiện phần viết.",
    sections: [
        { name: "Nghe", score: 80, maxScore: 100 },
        { name: "Đọc", score: 70, maxScore: 100 },
        { name: "Viết", score: 35, maxScore: 50 },
    ],
}];

app.get("/api/students/:username/mock-exams", (req, res) => {
    const { username } = req.params;
    const userRegs = examRegistrations.filter(r => r.username === username);
    const registeredShiftIds = userRegs.map(r => r.shiftId);
    const availableShifts = examShifts.map(s => ({
        ...s,
        isRegistered: registeredShiftIds.includes(s.id),
    }));
    const registered = userRegs.map(r => ({
        ...r,
        shift: examShifts.find(s => s.id === r.shiftId),
    }));
    const results = examResults.filter(r => r.username === username);
    return res.json({
        success: true,
        availableShifts,
        registered,
        results,
    });
});

app.post("/api/students/:username/mock-exams/register", (req, res) => {
    const { username } = req.params;
    const { shiftId } = req.body;
    const existed = examRegistrations.find(r => r.username === username && r.shiftId === shiftId);
    if (existed) {
        return res.json({ success: true, message: "Bạn đã đăng ký ca thi này rồi" });
    }
    const newReg = {
        id: examRegistrations.length + 1,
        username,
        shiftId,
        dateRegistered: new Date().toISOString().split("T")[0],
        status: "REGISTERED",
    };
    examRegistrations.push(newReg);
    return res.json({
        success: true,
        message: "Đăng ký thi thử thành công",
        registration: newReg,
    });
});

app.post("/api/students/:username/mock-exams/cancel", (req, res) => {
    const { username } = req.params;
    const { shiftId } = req.body;
    const before = examRegistrations.length;
    examRegistrations = examRegistrations.filter(r => !(r.username === username && r.shiftId === shiftId));
    if (before === examRegistrations.length) {
        return res.json({ success: false, message: "Không tìm thấy đăng ký để hủy" });
    }
    return res.json({ success: true, message: "Huỷ đăng ký thành công" });
});

// ====== 4. GIÁO VIÊN - DANH SÁCH LỚP ======
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

// ====== 5. LỊCH GIẢNG DẠY ======
const teacherTeachingSchedule = {
    teacher1: [{
            id: 1,
            classId: 201,
            className: "HSK2 - Cơ bản (Lớp 05)",
            date: "2025-11-20",
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
            date: "2025-11-22",
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
    const session = all.find(s => s.id == id);
    return res.json({
        success: true,
        detail: session || null,
    });
});

// ====== 6. ĐIỂM DANH ======
const CLASS_STUDENTS = {
    "HSK2 - Cơ bản (Lớp 05)": [
        { id: "S001", name: "Nguyen Van A", email: "tanletrongtan52@gmail.com" },
        { id: "S002", name: "Tran Thi B", email: "sonlouisvu@gmail.com" },
    ],
};

let attendanceSessionAutoId = 1;
let attendanceRecordAutoId = 1;
const ATTENDANCE_SESSIONS = [];
const ATTENDANCE_RECORDS = [];

app.get("/api/classes/:classId/students", (req, res) => {
    const { classId } = req.params;
    const students = CLASS_STUDENTS[classId] || [];
    res.json(students);
});

app.get("/api/attendance/sessions", (req, res) => {
    const { classId } = req.query;
    const sessions = ATTENDANCE_SESSIONS.filter(s => s.classId === classId);
    res.json(sessions);
});

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
            }

            const allStudents = Object.entries(CLASS_STUDENTS).flatMap(
                ([cid, students]) => students.map((st) => ({...st, classId: cid }))
            );

            const promises = created
                .map((rec) => {
                    const student = allStudents.find((s) => s.id === rec.studentId);
                    if (!student || !student.email) {
                        console.log(`Không tìm thấy email cho studentId=${rec.studentId}`);
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

// Test
app.get("/", (req, res) => {
    res.send("Backend English Center đang chạy!");
});

app.listen(PORT, () => {
    console.log(`Backend đang chạy tại http://localhost:${PORT}`);
});