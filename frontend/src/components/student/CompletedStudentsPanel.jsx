// src/components/student/CompletedStudentsPanel.jsx
import { useEffect, useState } from "react";
import { searchStudents } from "../../api/studentApi";
import StudentSearchBar from "./StudentSearchBar";

export default function CompletedStudentsPanel({
  onGlobalMessage,
  onRefreshAll, // hiện chưa dùng nhưng để sẵn cho sau này
  refreshToken,
}) {
  const [keyword, setKeyword] = useState("");
  const [filterStatus, setFilterStatus] = useState("COMPLETED");
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [localMessage, setLocalMessage] = useState("");

  const showMessage = (msg) => {
    setLocalMessage(msg);
    if (onGlobalMessage) onGlobalMessage(msg);
  };

  const loadStudents = async (statusToUse = "COMPLETED") => {
    try {
      const data = await searchStudents({ status: statusToUse, keyword: keyword.trim() });

      if (!data || !data.success) {
        showMessage((data && data.message) || "Lỗi server khi tải danh sách học viên đã học.");
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
    loadStudents(filterStatus);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshToken]);

  const handleSearch = async () => {
    await loadStudents(filterStatus);
  };

 const handleViewDetail = (st) => {
  // Nếu đang mở đúng học viên này => bấm lần nữa sẽ đóng
  if (selectedStudent && selectedStudent.id === st.id) {
    setSelectedStudent(null);      // đóng
  } else {
    setSelectedStudent(st);        // mở / chuyển sang học viên khác
  }
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
      <StudentSearchBar
        keyword={keyword}
        setKeyword={setKeyword}
        status={filterStatus}
        setStatus={setFilterStatus}
        onSearch={handleSearch}
      />

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

