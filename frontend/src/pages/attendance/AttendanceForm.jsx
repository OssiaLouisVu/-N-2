// src/pages/attendance/AttendanceForm.jsx
import { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import AttendanceTable from "../../components/attendance/AttendanceTable";
import {
  fetchClassStudents,
  saveAttendanceRecords,
} from "../../api/attendanceApi";

export default function AttendanceForm() {
  const { classId, sessionId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const className = location.state?.className || classId;
  const date = location.state?.date || "";

  const [students, setStudents] = useState([]);
  const [attendanceMap, setAttendanceMap] = useState({});
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        setError("");
        const data = await fetchClassStudents(classId);
        setStudents(data);
      } catch (err) {
        console.error(err);
        setError(err.message || "Không tải được danh sách học viên");
      }
    }
    load();
  }, [classId]);

  const handleSave = async () => {
    try {
      setLoading(true);
      setError("");
      setMessage("");

      const records = Object.entries(attendanceMap).map(
        ([studentId, v]) => ({
          studentId,
          status: v.status,
          reason: v.reason,
        })
      );

      await saveAttendanceRecords(sessionId, records);
      setMessage("Lưu điểm danh thành công");
    } catch (err) {
      console.error(err);
      setError(err.message || "Lỗi khi lưu điểm danh");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: 24 }}>
      <button onClick={() => navigate(-1)}>← Quay lại buổi học</button>

      <h2 style={{ marginTop: 12 }}>
        Điểm danh lớp {className} – {date}
      </h2>

      {error && <p style={{ color: "red" }}>{error}</p>}
      {message && <p style={{ color: "green" }}>{message}</p>}

      <div style={{ marginTop: 16 }}>
        <AttendanceTable students={students} onChange={setAttendanceMap} />
      </div>

      <div style={{ marginTop: 16 }}>
        <button onClick={handleSave} disabled={loading || students.length === 0}>
          {loading ? "Đang lưu..." : "Lưu điểm danh"}
        </button>
      </div>
    </div>
  );
}
