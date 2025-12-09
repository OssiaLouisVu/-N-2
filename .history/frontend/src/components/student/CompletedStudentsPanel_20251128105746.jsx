// frontend/src/components/student/CompletedStudentsPanel.jsx
import { useState } from "react";

const API_BASE = "http://localhost:8080";

export default function CompletedStudentsPanel() {
  const [keyword, setKeyword] = useState("");
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleSearch = async () => {
    setLoading(true);
    setMessage("");
    setSelectedStudent(null);

    try {
      const params = new URLSearchParams();
      if (keyword.trim()) params.append("keyword", keyword.trim());

      const res = await fetch(
        `${API_BASE}/api/students/completed?${params.toString()}`
      );
      const data = await res.json();

      if (data.success) {
        setStudents(data.students || []);
        if ((data.students || []).length === 0) {
          setMessage("Không tìm thấy học viên đã học nào phù hợp.");
        }
      } else {
        setMessage(data.message || "Không lấy được danh sách học viên đã học.");
      }
    } catch (err) {
      console.error(err);
      setMessage("Lỗi kết nối khi tìm kiếm học viên đã học.");
    } finally {
      setLoading(false);
    }
  };

  const cardStyle = {
    borderRadius: 24,
    backgroundColor: "#ffffff",
    boxShadow: "0 18px 40px rgba(15, 23, 42, 0.08)",
    padding: 28,
    border: "1px solid #eef0ff",
    marginTop: 24,
  };

  const tableStyle = {
    width: "100%",
    borderCollapse: "collapse",
    fontSize: 14,
  };

  const thStyle = {
    textAlign: "left",
    padding: "10px 12px",
    borderBottom: "1px solid #f0f0f0",
    backgroundColor: "#fafafa",
    fontWeight: 600,
    color: "#333",
    whiteSpace: "nowrap",
  };

  const tdStyle = {
    padding: "10px 12px",
    borderBottom: "1px solid #f5f5f5",
    fontSize: 14,
  };

  return (
    <div style={cardStyle}>
      <h3
        style={{
          fontSize: 18,
          fontWeight: 700,
          marginBottom: 8,
          display: "flex",
          alignItems: "center",
          gap: 8,
        }}
      >
        <span role="img" aria-label="graduate">
          ✅
        </span>
        Học viên đã học & kết quả quá trình học
      </h3>
      <p style={{ color: "#555", marginBottom: 16, lineHeight: 1.5 }}>
        Use case: <b>Học viên đã học</b> – Nhân viên có thể tìm kiếm các học viên
        đã hoàn thành khoá học tại trung tâm (status ={" "}
        <code>COMPLETED</code>), xem thông tin cơ bản và mở ra phần{" "}
        <b>Khoá học đã học</b>, <b>Kết quả và quá trình học tập</b>.
      </p>

      {/* Ô tìm kiếm */}
      <div
        style={{
          display: "flex",
          gap: 12,
          marginBottom: 16,
          maxWidth: 520,
        }}
      >
        <input
          type="text"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          placeholder="Nhập họ tên, SĐT hoặc email học viên..."
          style={{
            flex: 1,
            padding: "10px 14px",
            borderRadius: 999,
            border: "1px solid #d0d7ff",
            outline: "none",
            fontSize: 14,
          }}
        />
        <button
          onClick={handleSearch}
          style={{
            padding: "10px 22px",
            borderRadius: 999,
            border: "none",
            background:
              "linear-gradient(135deg, #22c55e 0%, #16a34a 50%, #0f766e 100%)",
            color: "#fff",
            fontWeight: 600,
            fontSize: 14,
            cursor: "pointer",
            boxShadow: "0 10px 20px rgba(34, 197, 94, 0.35)",
            whiteSpace: "nowrap",
          }}
        >
          Tìm học viên đã học
        </button>
      </div>

      {/* Thông báo / Loading */}
      {loading && (
        <div
          style={{
            marginBottom: 12,
            padding: "8px 12px",
            borderRadius: 8,
            backgroundColor: "#e0f2fe",
            color: "#0369a1",
            fontSize: 13,
          }}
        >
          Đang tải danh sách học viên đã học...
        </div>
      )}
      {message && !loading && (
        <div
          style={{
            marginBottom: 12,
            padding: "8px 12px",
            borderRadius: 8,
            backgroundColor: "#fff7ed",
            color: "#c2410c",
            fontSize: 13,
          }}
        >
          {message}
        </div>
      )}

      {/* Bảng kết quả */}
      {students.length > 0 && (
        <table style={tableStyle}>
          <thead>
            <tr>
              <th style={thStyle}>STT</th>
              <th style={thStyle}>Họ tên</th>
              <th style={thStyle}>SĐT</th>
              <th style={thStyle}>Email</th>
              <th style={thStyle}>Level</th>
              <th style={thStyle}>Trạng thái</th>
              <th style={thStyle}>Xem</th>
            </tr>
          </thead>
          <tbody>
            {students.map((s, idx) => (
              <tr key={s.id}>
                <td style={tdStyle}>{idx + 1}</td>
                <td style={tdStyle}>{s.full_name}</td>
                <td style={tdStyle}>{s.phone}</td>
                <td style={tdStyle}>{s.email}</td>
                <td style={tdStyle}>{s.level}</td>
                <td style={tdStyle}>
                  <span
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      padding: "4px 10px",
                      borderRadius: 999,
                      fontSize: 12,
                      fontWeight: 600,
                      backgroundColor: "#dcfce7",
                      color: "#15803d",
                    }}
                  >
                    COMPLETED
                  </span>
                </td>
                <td style={tdStyle}>
                  <button
                    onClick={() => setSelectedStudent(s)}
                    style={{
                      padding: "6px 12px",
                      borderRadius: 999,
                      border: "none",
                      backgroundColor: "#2563eb",
                      color: "#fff",
                      fontSize: 13,
                      fontWeight: 600,
                      cursor: "pointer",
                    }}
                  >
                    Xem chi tiết
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Khung chi tiết học viên đã học – placeholder cho "Khoá học đã học" + "Kết quả" */}
      {selectedStudent && (
        <div
          style={{
            marginTop: 20,
            padding: 16,
            borderRadius: 16,
            backgroundColor: "#f9fafb",
            border: "1px dashed #d4d4d8",
          }}
        >
          <div
            style={{
              fontWeight: 700,
              marginBottom: 8,
              fontSize: 15,
            }}
          >
            Thông tin chi tiết – {selectedStudent.full_name} (
            {selectedStudent.phone})
          </div>
          <p style={{ margin: "4px 0", color: "#555", fontSize: 14 }}>
            Email: <b>{selectedStudent.email || "—"}</b> | Level lúc hoàn thành:{" "}
            <b>{selectedStudent.level || "—"}</b>
          </p>
          <p style={{ margin: "4px 0", color: "#555", fontSize: 14 }}>
            Ngày tạo hồ sơ:{" "}
            <b>{selectedStudent.created_at || "chưa có thông tin"}</b>
          </p>

          <div style={{ marginTop: 12, fontSize: 14, color: "#444" }}>
            <ul style={{ marginLeft: 18, marginTop: 4, lineHeight: 1.6 }}>
              <li>
                Sau này sẽ hiển thị <b>danh sách các khoá học đã tham gia</b>{" "}
                (Khoá học đã học) với thời gian học, phòng học, giảng viên.
              </li>
              <li>
                Hiển thị <b>kết quả và quá trình học tập</b>: điểm thi từng
                kỹ năng, nhận xét của giáo viên, tổng kết khoá.
              </li>
              <li>
                Có thể xuất báo cáo kết quả học tập cho học viên / phụ huynh.
              </li>
            </ul>
          </div>

          <button
            onClick={() => setSelectedStudent(null)}
            style={{
              marginTop: 12,
              padding: "6px 14px",
              borderRadius: 999,
              border: "1px solid #d4d4d8",
              backgroundColor: "#ffffff",
              cursor: "pointer",
              fontSize: 13,
              fontWeight: 500,
            }}
          >
            Đóng
          </button>
        </div>
      )}
    </div>
  );
}
