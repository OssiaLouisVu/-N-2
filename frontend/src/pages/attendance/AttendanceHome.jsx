// src/pages/attendance/AttendanceHome.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchOngoingClasses } from "../../api/attendanceApi";

export default function AttendanceHome() {
  const navigate = useNavigate();
  const [classes, setClasses] = useState([]);
  const [error, setError] = useState("");

  const stored = JSON.parse(localStorage.getItem("currentUser"));
  if (!stored || stored.role !== "TEACHER") {
    window.location.href = "/login";
    return null;
  }

  useEffect(() => {
    async function load() {
      try {
        setError("");
        const data = await fetchOngoingClasses();
        setClasses(data);
      } catch (err) {
        console.error(err);
        setError(err.message || "Không tải được danh sách lớp đang dạy");
      }
    }
    load();
  }, []);

  return (
    <div style={{ padding: 24 }}>
      <button onClick={() => navigate("/teacher/dashboard")}>
        ← Quay lại Dashboard
      </button>

      <h2 style={{ marginTop: 12 }}>Danh sách lớp đang dạy – Điểm danh</h2>

      {error && <p style={{ color: "red" }}>{error}</p>}

      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          marginTop: 16,
          background: "#fff",
        }}
      >
        <thead>
          <tr>
            <th style={{ textAlign: "left", padding: 8 }}>Mã lớp</th>
            <th style={{ textAlign: "left", padding: 8 }}>Tên lớp</th>
            <th style={{ padding: 8 }}>Ca</th>
            <th style={{ padding: 8 }}>Phòng</th>
            <th style={{ padding: 8 }}></th>
          </tr>
        </thead>
        <tbody>
          {classes.map((c) => (
            <tr key={c.id}>
              <td style={{ padding: 8 }}>{c.id}</td>
              <td style={{ padding: 8 }}>{c.name}</td>
              <td style={{ padding: 8 }}>{c.shift}</td>
              <td style={{ padding: 8 }}>{c.room}</td>
              <td style={{ padding: 8 }}>
                <button
                  onClick={() =>
                    navigate(`/teacher/attendance/${c.id}/sessions`, {
                      state: { className: c.name },
                    })
                  }
                >
                  Chọn lớp
                </button>
              </td>
            </tr>
          ))}
          {classes.length === 0 && (
            <tr>
              <td colSpan={5} style={{ padding: 8 }}>
                Không có lớp nào đang dạy.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
