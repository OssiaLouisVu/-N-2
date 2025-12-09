// src/components/student/CompletedStudentsPanel.jsx
import { useEffect, useState } from "react";
import axios from "axios";

export default function CompletedStudentsPanel({
  onGlobalMessage,
  onRefreshAll, // hiện chưa dùng nhưng để sẵn cho sau này
  refreshToken,
}) {
  const [keyword, setKeyword] = useState("");
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [localMessage, setLocalMessage] = useState("");

  const showMessage = (msg) => {
    setLocalMessage(msg);
    if (onGlobalMessage) onGlobalMessage(msg);
  };

  const loadCompletedStudents = async () => {
    try {
      const params = new URLSearchParams();
      params.append("status", "COMPLETED");
      if (keyword.trim()) {
        params.append("keyword", keyword.trim());
      }

      const res = await fetch(`${API_BASE}/api/students?${params.toString()}`);
      const data = await res.json();

      if (!data.success) {
        showMessage(
          data.message || "Lỗi server khi tải danh sách học viên đã học."
        );
        return;
      }

      setStudents(data.students || []);
      setLocalMessage("");
    } catch (err) {
      console.error(err);
      showMessage("Lỗi kết nối khi tìm kiếm học viên đã học.");
    }
  };

  useEffect(() => {
    loadCompletedStudents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshToken]);

  const handleSearch = async () => {
    await loadCompletedStudents();
  };

  const handleViewDetail = (st) => {
    setSelectedStudent(st);
  };

  return (
    <section
      style={{
        borderRadius: 20,
        border: "1px solid #f3f3f3",
        padding: 20,
        marginBottom: 8,
        background: "#fff",
      }}
    >
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
        <span role="img" aria-label="check">
          ✅
        </span>
        Học viên đã học & kết quả quá trình học
      </h3>
      <p style={{ fontSize: 13, color: "#555", marginBottom: 12 }}>
        Use case: <b>Học viên đã học</b> – Nhân viên có thể tìm kiếm các học viên đã
        hoàn thành khoá học tại trung tâm (<b>status = COMPLETED</b>), xem thông
        tin cơ bản và mở ra phần <b>Khoá học đã học, Kết quả & quá trình học tập</b>.
      </p>

      {localMessage && (
        <div
          style={{
            marginBottom: 12,
            padding: "8px 12px",
            borderRadius: 10,
            background: "#fff1f0",
            borderLeft: "4px solid #ff4d4f",
            fontSize: 13,
            color: "#a8071a",
          }}
        >
          {localMessage}
        </div>
      )}

      {/* Search */}
      <div style={{ display: "flex", gap: 12, marginBottom: 12 }}>
        <input
          type="text"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          placeholder="Nhập họ tên, SĐT hoặc email học viên..."
          style={{
            flex: 1,
            padding: "10px 12px",
            borderRadius: 999,
            border: "1px solid #e0e0e0",
            outline: "none",
          }}
        />
        <button
          type="button"
          onClick={handleSearch}
          style={{
            padding: "10px 20px",
            borderRadius: 999,
            border: "none",
            background:
              "linear-gradient(135deg, #52c41a 0%, #73d13d 100%)",
            color: "#fff",
            cursor: "pointer",
            fontWeight: 600,
          }}
        >
          Tìm học viên đã học
        </button>
      </div>

      {/* Table COMPLETED students */}
      <div style={{ overflowX: "auto" }}>
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            background: "#fff",
          }}
        >
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
            {students.length === 0 ? (
              <tr>
                <td style={tdStyle} colSpan={7}>
                  Chưa có học viên nào ở trạng thái COMPLETED phù hợp.
                </td>
              </tr>
            ) : (
              students.map((st, idx) => (
                <tr key={st.id}>
                  <td style={tdStyle}>{idx + 1}</td>
                  <td style={tdStyle}>{st.full_name}</td>
                  <td style={tdStyle}>{st.phone}</td>
                  <td style={tdStyle}>{st.email}</td>
                  <td style={tdStyle}>{st.level}</td>
                  <td style={tdStyle}>{st.status}</td>
                  <td style={tdStyle}>
                    <button
                      type="button"
                      onClick={() => handleViewDetail(st)}
                      style={{
                        padding: "6px 12px",
                        borderRadius: 999,
                        border: "none",
                        background: "#1677ff",
                        color: "#fff",
                        cursor: "pointer",
                        fontSize: 13,
                      }}
                    >
                      Xem chi tiết
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Detail placeholder */}
      {selectedStudent && (
        <div
          style={{
            marginTop: 16,
            borderRadius: 16,
            border: "1px dashed #d9d9d9",
            padding: 16,
            background: "#fafafa",
          }}
        >
          <p style={{ fontWeight: 600, marginBottom: 8 }}>
            Khoá học đã học & kết quả của: {selectedStudent.full_name} (
            {selectedStudent.phone})
          </p>
          <p style={{ fontSize: 13, color: "#555" }}>
            Hiện tại phần chi tiết khoá học đã học đang để placeholder. Sau này khi
            có bảng <b>Khoá học, Lớp, Kết quả thi</b>, ta sẽ hiện:
          </p>
          <ul style={{ fontSize: 13, color: "#555", marginLeft: 18 }}>
            <li>Danh sách các khoá học đã tham gia.</li>
            <li>Điểm thi cuối khoá, chứng chỉ đạt được.</li>
            <li>Nhận xét của giáo viên, mức độ tiến bộ.</li>
          </ul>
          <p
            style={{
              fontSize: 12,
              fontStyle: "italic",
              color: "#999",
              marginTop: 8,
            }}
          >
            Hiện tại: chỉ mới tạo khung use case đúng với “Học viên đã học & kết quả
            quá trình học”.
          </p>
        </div>
      )}
    </section>
  );
}

const thStyle = {
  padding: "8px 10px",
  textAlign: "left",
  fontSize: 13,
  borderBottom: "1px solid #f0f0f0",
  background: "#fafafa",
  fontWeight: 600,
};

const tdStyle = {
  padding: "8px 10px",
  fontSize: 13,
  borderBottom: "1px solid #f5f5f5",
};

