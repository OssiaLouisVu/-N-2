// src/pages/attendance/AttendanceSession.jsx
import { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import {
  fetchAttendanceSessions,
  createAttendanceSession,
} from "../../api/attendanceApi";

export default function AttendanceSession() {
  const { classId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const className = location.state?.className || classId;

  const [sessions, setSessions] = useState([]);
  const [date, setDate] = useState(
    new Date().toISOString().substring(0, 10)
  );
  const [note, setNote] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        setError("");
        const data = await fetchAttendanceSessions(classId);
        setSessions(data);
      } catch (err) {
        console.error(err);
        setError(err.message || "Không tải được danh sách buổi học");
      }
    }
    load();
  }, [classId]);

  const handleCreate = async () => {
    try {
      setError("");
      await createAttendanceSession({ classId, date, note });
      const data = await fetchAttendanceSessions(classId);
      setSessions(data);
      setNote("");
    } catch (err) {
      console.error(err);
      setError(err.message || "Không tạo được buổi học mới");
    }
  };

  return (
    <div style={{ padding: 24 }}>
      <button onClick={() => navigate(-1)}>← Quay lại danh sách lớp</button>

      <h2 style={{ marginTop: 12 }}>Buổi học – Lớp {className}</h2>

      {error && <p style={{ color: "red" }}>{error}</p>}

      <div
        style={{
          marginTop: 16,
          padding: 12,
          border: "1px solid #ddd",
          borderRadius: 6,
        }}
      >
        <h3>Thêm buổi học mới</h3>
        <div style={{ display: "flex", gap: 16, marginTop: 8 }}>
          <div>
            <label>Ngày học: </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>
          <div style={{ flex: 1 }}>
            <label>Ghi chú: </label>
            <input
              type="text"
              style={{ width: "100%" }}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="VD: Buổi 5 - Luyện nghe"
            />
          </div>
          <button onClick={handleCreate}>Thêm buổi</button>
        </div>
      </div>

      <h3 style={{ marginTop: 24 }}>Danh sách buổi học</h3>
      <ul>
        {sessions.map((s) => (
          <li key={s.id} style={{ marginBottom: 8 }}>
            {s.id} – {s.date} – {s.note || "Không ghi chú"}{" "}
            <button
              onClick={() =>
                navigate(
                  `/teacher/attendance/${classId}/sessions/${s.id}/form`,
                  { state: { className, date: s.date } }
                )
              }
            >
              Điểm danh
            </button>
          </li>
        ))}
        {sessions.length === 0 && <li>Chưa có buổi học nào.</li>}
      </ul>
    </div>
  );
}
