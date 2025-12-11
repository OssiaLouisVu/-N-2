// src/components/student/OngoingStudentsPanel.jsx
import { useEffect, useState } from "react";
import { searchStudents } from "../../api/studentApi";
import StudentSearchBar from "./StudentSearchBar";

export default function OngoingStudentsPanel({
  onGlobalMessage,
  onRefreshAll,
  refreshToken,
  showEditButton, // vẫn nhận prop nhưng không dùng nữa
}) {
  const [keyword, setKeyword] = useState("");
  const [filterStatus, setFilterStatus] = useState("ACTIVE");
  const [students, setStudents] = useState([]);
  const [localMessage, setLocalMessage] = useState("");

  const showMessage = (msg) => {
    setLocalMessage(msg);
    if (onGlobalMessage) onGlobalMessage(msg);
  };

  const loadStudents = async (statusToUse = "ACTIVE") => {
    try {
      const data = await searchStudents({
        status: statusToUse,
        keyword: keyword.trim(),
      });

      if (!data || !data.success) {
        showMessage(
          (data && data.message) || "Lỗi server khi tải danh sách học viên."
        );
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
    loadStudents(filterStatus || "ACTIVE");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshToken]);

  const handleSearch = async () => {
    await loadStudents(filterStatus);
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
        Học viên đang học
      </h3>
      <p style={{ fontSize: 13, color: "#555", marginBottom: 12 }}>
        Use case: <b>Học viên đang học</b> – nhân viên có thể tìm kiếm học viên đã
        được xếp lớp (<b>status = ACTIVE</b>). Khi học viên kết thúc khoá, việc đổi
        sang <b>COMPLETED</b> sẽ thực hiện ở use case khác (sau khi gán vào lớp).
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
      <StudentSearchBar
        keyword={keyword}
        setKeyword={setKeyword}
        status={filterStatus}
        setStatus={setFilterStatus}
        onSearch={handleSearch}
      />

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
            </tr>
          </thead>
          <tbody>
            {students.length === 0 ? (
              <tr>
                <td style={tdStyleOngoing} colSpan={6}>
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
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
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
