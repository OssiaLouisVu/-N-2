// src/components/student/OngoingStudentsPanel.jsx
import { useEffect, useState } from "react";
import { searchActiveStudents, updateStudent } from "../../api/studentApi";

export default function OngoingStudentsPanel({ onGlobalMessage, onRefreshAll, refreshToken, showEditButton }) {
  const [keyword, setKeyword] = useState("");
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [localMessage, setLocalMessage] = useState("");

  const showMessage = (msg) => {
    setLocalMessage(msg);
    if (onGlobalMessage) onGlobalMessage(msg);
  };

  const loadActiveStudents = async () => {
    try {
      const data = await searchActiveStudents(keyword.trim());

      if (!data || !data.success) {
        showMessage((data && data.message) || "Lỗi server khi tải học viên đang học.");
        return;
      }

      setStudents(data.students || []);
      setLocalMessage("");
    } catch (err) {
      console.error(err);
      showMessage("Lỗi kết nối khi tải học viên đang học.");
    }
  };

  useEffect(() => {
    loadActiveStudents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshToken]);

  const handleSearch = async () => {
    await loadActiveStudents();
  };

  const handleViewProgress = (st) => {
    setSelectedStudent(st);
  };

  const handleMarkCompleted = async (st) => {
    if (!window.confirm(`Chuyển "${st.full_name}" sang trạng thái ĐÃ HỌC?`)) {
      return;
    }

    try {
      // Sử dụng API client chung để cập nhật (PUT /api/students/:id)
      await updateStudent(st.id, { status: "COMPLETED" });

      showMessage(
        `Đã chuyển "${st.full_name}" sang trạng thái COMPLETED – Đã học.`
      );
      setSelectedStudent(null);
      await loadActiveStudents();
      if (onRefreshAll) onRefreshAll();
    } catch (err) {
      console.error(err);
      showMessage("Lỗi kết nối khi cập nhật trạng thái học viên.");
    }
  };

  return (
    <section
      style={{
        borderRadius: 20,
        border: "1px solid #f3f3f3",
        padding: 20,
        marginBottom: 32,
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
        <span role="img" aria-label="student">
          🧑‍🎓
        </span>
        Học viên đang học & quá trình học hiện tại
      </h3>
      <p style={{ fontSize: 13, color: "#555", marginBottom: 12 }}>
        Use case: <b>Học viên đang học</b> – nhân viên có thể tìm kiếm học viên đã
        được xếp lớp (<b>status = ACTIVE</b>), xem thông tin cơ bản và theo dõi các
        buổi học sắp tới. Khi học viên kết thúc khoá, có thể chuyển trạng thái sang{" "}
        <b>COMPLETED</b>.
      </p>

      {localMessage && (
        <div
          style={{
            marginBottom: 12,
            padding: "8px 12px",
            borderRadius: 10,
            background: "#fff7e6",
            borderLeft: "4px solid #faad14",
            fontSize: 13,
            color: "#ad6800",
          }}
        >
          {localMessage}
        </div>
      )}

      {/* Search line */}
      <div style={{ display: "flex", gap: 12, marginBottom: 12 }}>
        <input
          type="text"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          placeholder="Nhập SĐT / tên / email học viên đang học..."
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
              "linear-gradient(135deg, #1677ff 0%, #40a9ff 100%)",
            color: "#fff",
            cursor: "pointer",
            fontWeight: 600,
          }}
        >
          Tìm học viên đang học
        </button>
      </div>

      {/* Table ACTIVE students */}
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
                <td style={tdStyleOngoing} colSpan={7}>
                  Chưa có học viên nào đang học phù hợp.
                </td>
              </tr>
            ) : (
              students.map((st, idx) => (
                <tr key={st.id}>
                  <td style={tdStyleOngoing}>{idx + 1}</td>
                  <td style={tdStyleOngoing}>{st.full_name}</td>
                  <td style={tdStyleOngoing}>{st.phone}</td>
                  <td style={tdStyleOngoing}>{st.email}</td>
                  <td style={tdStyleOngoing}>{st.level}</td>
                  <td style={tdStyleOngoing}>{st.status}</td>
                  <td style={tdStyleOngoing}>
                    <button
                      type="button"
                      onClick={() => handleViewProgress(st)}
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
                      Xem quá trình hiện tại
                    </button>
                    {showEditButton && (
                      <button
                        onClick={() => handleMarkCompleted(st)}
                        style={{
                          marginLeft: 8,
                          padding: "6px 12px",
                          borderRadius: 999,
                          border: "none",
                          background:
                            "linear-gradient(135deg, #52c41a 0%, #73d13d 100%)",
                          color: "#fff",
                          cursor: "pointer",
                          fontSize: 13,
                        }}
                      >
                        Kết thúc khoá
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Placeholder progress box */}
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
            Quá trình học hiện tại của: {selectedStudent.full_name} (
            {selectedStudent.phone})
          </p>
          <p style={{ fontSize: 13, color: "#555" }}>
            Hiện tại phần lịch buổi học đang để placeholder. Sau này khi bạn thiết
            kế CSDL lớp học, thời khoá biểu, ta sẽ:
          </p>
          <ul style={{ fontSize: 13, color: "#555", marginLeft: 18 }}>
            <li>Xem lớp học mà học viên đang tham gia.</li>
            <li>Danh sách các buổi học sắp tới.</li>
            <li>Tổng số buổi đã tham gia / vắng mặt (dựa trên bảng điểm danh).</li>
          </ul>
          <p
            style={{
              fontSize: 12,
              fontStyle: "italic",
              color: "#999",
              marginTop: 8,
            }}
          >
            Hiện tại: chỉ mới tạo được khung use case đúng với “Học viên đang học &
            xem quá trình học hiện tại”.
          </p>

          <button
            type="button"
            onClick={() => handleMarkCompleted(selectedStudent)}
            style={{
              marginTop: 12,
              padding: "8px 16px",
              borderRadius: 999,
              border: "none",
              background:
                "linear-gradient(135deg, #52c41a 0%, #73d13d 100%)",
              color: "#fff",
              cursor: "pointer",
              fontWeight: 600,
              fontSize: 13,
            }}
          >
            ✅ Chuyển sang ĐÃ HỌC (COMPLETED)
          </button>
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

const tdStyleOngoing = {
  padding: "8px 10px",
  fontSize: 13,
  borderBottom: "1px solid #f5f5f5",
};
