// src/components/attendance/AttendancePanel.jsx
import { useEffect, useState } from "react";
import {
  fetchClassStudents,
  fetchAttendanceSessions,
  createAttendanceSession,
  saveAttendanceRecords,
} from "../../api/attendanceApi";
import AttendanceTable from "./AttendanceTable";

export default function AttendancePanel() {
  const [classOptions, setClassOptions] = useState([]);
  const [selectedClassId, setSelectedClassId] = useState("");
  const [students, setStudents] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const [newDate, setNewDate] = useState(
    () => new Date().toISOString().substring(0, 10)
  );
  const [newNote, setNewNote] = useState("");

  const [selectedSession, setSelectedSession] = useState(null);
  const [attendanceRecords, setAttendanceRecords] = useState({});
  const [sendNotification, setSendNotification] = useState(true);

  // Load danh sách lớp của giảng viên
  useEffect(() => {
    const loadTeacherClasses = async () => {
      try {
        const user = JSON.parse(localStorage.getItem("currentUser"));
        if (!user || !user.username) return;

        const res = await fetch(`http://localhost:8080/api/teacher/${user.username}/classes`);
        const data = await res.json();
        
        if (data.success && data.classes) {
          setClassOptions(data.classes);
          // Auto-select first class
          if (data.classes.length > 0) {
            setSelectedClassId(data.classes[0].id);
          }
        }
      } catch (err) {
        console.error('Error loading teacher classes:', err);
      }
    };

    loadTeacherClasses();
  }, []);

  // ===== Xem danh sách lớp học (load học viên + buổi dạy) =====
  const loadClassData = async () => {
    if (!selectedClassId) return;
    setLoading(true);
    setMessage("");
    try {
      const [stuRes, sesRes] = await Promise.all([
        fetchClassStudents(selectedClassId),
        fetchAttendanceSessions(selectedClassId),
      ]);
      setStudents(stuRes);
      setSessions(sesRes);
      setSelectedSession(null);
      setAttendanceRecords({});
    } catch (err) {
      console.error(err);
      setMessage(err.message || "Lỗi khi tải dữ liệu lớp");
    } finally {
      setLoading(false);
    }
  };

  // Lần đầu / khi đổi lớp thì load luôn
  useEffect(() => {
    loadClassData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedClassId]);

  // ===== Thêm buổi dạy =====
  const handleCreateSession = async () => {
    if (!newDate) {
      setMessage("Vui lòng chọn ngày cho buổi dạy mới");
      return;
    }
    setLoading(true);
    setMessage("");
    try {
      const created = await createAttendanceSession({
        classId: selectedClassId,
        date: newDate,
        note: newNote,
      });
      setSessions((prev) => [...prev, created]);
      setNewNote("");
      setMessage("Đã tạo buổi dạy mới.");
    } catch (err) {
      console.error(err);
      setMessage(err.message || "Không tạo được buổi dạy");
    } finally {
      setLoading(false);
    }
  };

  // ===== Thực hiện điểm danh: chọn 1 buổi =====
  const handleSelectSession = (session) => {
    setSelectedSession(session);
    const initial = {};
    students.forEach((s) => {
      initial[s.id] = { status: "PRESENT", reason: "" };
    });
    setAttendanceRecords(initial);
  };

  // ===== Lưu kết quả điểm danh (+ extend gửi thông báo) =====
  const handleSaveRecords = async () => {
    if (!selectedSession) {
      setMessage("Hãy chọn một buổi dạy để điểm danh.");
      return;
    }

    const recordsArr = students.map((s) => {
      const rec = attendanceRecords[s.id] || { status: "PRESENT", reason: "" };
      return {
        studentId: s.id,
        status: rec.status,
        reason: rec.reason,
      };
    });

    setLoading(true);
    setMessage("");
    try {
      await saveAttendanceRecords(
        selectedSession.id,
        recordsArr,
        sendNotification
      );
      setMessage(
        sendNotification
          ? "Đã lưu kết quả điểm danh và gửi thông báo cho học viên."
          : "Đã lưu kết quả điểm danh."
      );
    } catch (err) {
      console.error(err);
      setMessage(err.message || "Không lưu được kết quả điểm danh");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        padding: 20,
        borderRadius: 12,
        background: "#ffffff",
        boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
      }}
    >
      {/* 1. Chọn lớp (Xem danh sách lớp học) */}
      <div style={{ display: "flex", gap: 16, marginBottom: 16 }}>
        <div>
          <div style={{ marginBottom: 4, fontWeight: 600 }}>
            Chọn lớp để điểm danh
          </div>
          <select
            value={selectedClassId}
            onChange={(e) => setSelectedClassId(e.target.value)}
            style={{ padding: "8px 12px", borderRadius: 6, border: "1px solid #ccc" }}
          >
            {CLASS_OPTIONS.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} ({c.id})
              </option>
            ))}
          </select>
        </div>


      </div>

      {/* 2. Thêm buổi dạy */}
      <div
        style={{
          marginTop: 8,
          marginBottom: 24,
          padding: 12,
          borderRadius: 8,
          background: "#f8f9fb",
          border: "1px dashed #d0d0e0",
        }}
      >
        <div style={{ fontWeight: 600, marginBottom: 8 }}>Thêm buổi dạy</div>
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <label>
            Ngày:&nbsp;
            <input
              type="date"
              value={newDate}
              onChange={(e) => setNewDate(e.target.value)}
            />
          </label>
          <input
            type="text"
            placeholder="Ghi chú (tuỳ chọn)..."
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            style={{
              flex: 1,
              padding: "6px 10px",
              borderRadius: 6,
              border: "1px solid #ccc",
            }}
          />
          <button
            onClick={handleCreateSession}
            style={{
              padding: "8px 14px",
              borderRadius: 6,
              border: "1px solid #28a745",
              background: "#28a745",
              color: "#fff",
              cursor: "pointer",
            }}
          >
            Thêm buổi
          </button>
        </div>
      </div>

      {/* 3. Danh sách buổi dạy – chọn để Thực hiện điểm danh */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontWeight: 600, marginBottom: 8 }}>Danh sách buổi dạy</div>
        {sessions.length === 0 ? (
          <p>Chưa có buổi dạy nào cho lớp này.</p>
        ) : (
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              background: "#fff",
              border: "1px solid #e0e0e0",
              borderRadius: 8,
              overflow: "hidden",
            }}
          >
            <thead>
              <tr>
                <th style={thStyle}>Mã buổi</th>
                <th style={thStyle}>Ngày</th>
                <th style={thStyle}>Ghi chú</th>
                <th style={thStyle}>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {sessions.map((s) => (
                <tr key={s.id}>
                  <td style={tdStyle}>{s.id}</td>
                  <td style={tdStyle}>{s.date}</td>
                  <td style={tdStyle}>{s.note}</td>
                  <td style={tdStyle}>
                    <button
                      onClick={() => handleSelectSession(s)}
                      style={{
                        padding: "6px 10px",
                        borderRadius: 6,
                        border: "1px solid #1677ff",
                        background:
                          selectedSession && selectedSession.id === s.id
                            ? "#1677ff"
                            : "#fff",
                        color:
                          selectedSession && selectedSession.id === s.id
                            ? "#fff"
                            : "#1677ff",
                        cursor: "pointer",
                      }}
                    >
                      Thực hiện điểm danh
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* 4. Bảng điểm danh */}
      {selectedSession && (
        <div>
          <h4>
            Thực hiện điểm danh cho buổi {selectedSession.id} - ngày{" "}
            {selectedSession.date}
          </h4>

          <AttendanceTable
            students={students}
            attendanceRecords={attendanceRecords}
            setAttendanceRecords={setAttendanceRecords}
          />

          <div style={{ marginTop: 16, display: "flex", alignItems: "center", gap: 12 }}>
            <label style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <input
                type="checkbox"
                checked={sendNotification}
                onChange={(e) => setSendNotification(e.target.checked)}
              />
              Gửi thông báo cho học viên sau khi lưu
            </label>

            <button
              onClick={handleSaveRecords}
              style={{
                padding: "8px 16px",
                borderRadius: 6,
                border: "1px solid #1677ff",
                background: "#1677ff",
                color: "#fff",
                cursor: "pointer",
              }}
            >
              Lưu kết quả điểm danh
            </button>
          </div>
        </div>
      )}

      {loading && <p style={{ marginTop: 12 }}>Đang xử lý...</p>}
      {message && (
        <p style={{ marginTop: 8, color: "#333" }}>
          <b>Thông báo:</b> {message}
        </p>
      )}
    </div>
  );
}

const thStyle = {
  padding: "10px 12px",
  background: "#fafafa",
  borderBottom: "1px solid #e0e0e0",
  textAlign: "left",
  fontWeight: 600,
};

const tdStyle = {
  padding: "10px 12px",
  borderBottom: "1px solid #f0f0f0",
};
