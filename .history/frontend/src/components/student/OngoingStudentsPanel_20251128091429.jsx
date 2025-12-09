// frontend/src/components/student/OngoingStudentsPanel.jsx
import { useState } from "react";
import { searchStudents, getStudentSchedule } from "../../api/studentApi";

export default function OngoingStudentsPanel() {
  const [keyword, setKeyword] = useState("");
  const [students, setStudents] = useState([]);
  const [loadingList, setLoadingList] = useState(false);
  const [error, setError] = useState("");

  // học viên đang được xem quá trình học
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [schedule, setSchedule] = useState([]);
  const [loadingSchedule, setLoadingSchedule] = useState(false);
  const [scheduleError, setScheduleError] = useState("");

  const cardStyle = {
    padding: 24,
    borderRadius: 16,
    background: "#fff",
    boxShadow: "0 8px 24px rgba(15, 23, 42, 0.08)",
    maxWidth: 900,
    margin: "32px auto 0 auto",
  };

  const inputStyle = {
    width: "100%",
    padding: "10px 12px",
    borderRadius: 10,
    border: "1px solid #e5e7eb",
    fontSize: 14,
  };

  const tableStyle = {
    width: "100%",
    borderCollapse: "collapse",
    background: "#fff",
    borderRadius: 12,
    overflow: "hidden",
    border: "1px solid #e5e7eb",
    marginTop: 12,
  };

  const thStyle = {
    padding: "8px 10px",
    background: "#f9fafb",
    borderBottom: "1px solid #e5e7eb",
    fontSize: 13,
    fontWeight: 600,
    textAlign: "left",
  };

  const tdStyle = {
    padding: "8px 10px",
    borderBottom: "1px solid #f3f4f6",
    fontSize: 13,
  };

  const handleSearch = async () => {
    setLoadingList(true);
    setError("");
    setSelectedStudent(null);
    setSchedule([]);
    try {
      const data = await searchStudents(keyword);
      setStudents(data || []);
    } catch (err) {
      console.error(err);
      setError(err.message || "Không tải được danh sách học viên.");
    } finally {
      setLoadingList(false);
    }
  };

  const handleViewSchedule = async (student) => {
    if (!student.username) {
      setSelectedStudent(student);
      setSchedule([]);
      setScheduleError("Học viên chưa có username / tài khoản đăng nhập.");
      return;
    }

    setSelectedStudent(student);
    setSchedule([]);
    setScheduleError("");
    setLoadingSchedule(true);
    try {
      const data = await getStudentSchedule(student.username);
      if (!data.success) {
        setScheduleError(
          data.message || "Không lấy được quá trình học hiện tại."
        );
        setSchedule([]);
      } else {
        setSchedule(data.schedule || []); // [{date, timeStart, timeEnd, className, room}]
      }
    } catch (err) {
      console.error(err);
      setScheduleError(
        err.message || "Không lấy được quá trình học hiện tại."
      );
    } finally {
      setLoadingSchedule(false);
    }
  };

  return (
    <div style={cardStyle}>
      <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>
        👨‍🎓 Học viên đang học &amp; quá trình học hiện tại
      </h3>
      <p style={{ fontSize: 14, color: "#6b7280", marginBottom: 16 }}>
        Use case: <b>Học viên đang học</b> – Nhân viên có thể tìm kiếm học viên,
        xem nhanh thông tin cơ bản và xem <b>các buổi học sắp tới</b> mà học viên
        đang tham gia.
      </p>

      {/* Ô tìm kiếm */}
      <div
        style={{
          display: "flex",
          gap: 12,
          alignItems: "center",
          marginBottom: 12,
        }}
      >
        <input
          style={{ ...inputStyle, maxWidth: 280 }}
          placeholder="Nhập tên / SĐT / email / username..."
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
        />
        <button
          type="button"
          onClick={handleSearch}
          disabled={loadingList}
          style={{
            padding: "9px 18px",
            borderRadius: 999,
            border: "none",
            background: "linear-gradient(135deg, #22c55e 0%, #16a34a 100%)",
            color: "#fff",
            fontSize: 14,
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          {loadingList ? "Đang tải..." : "Tìm học viên đang học"}
        </button>
      </div>

      {error && (
        <p style={{ color: "red", fontSize: 13, marginBottom: 8 }}>{error}</p>
      )}

      {/* Bảng danh sách học viên */}
      <table style={tableStyle}>
        <thead>
          <tr>
            <th style={thStyle}>STT</th>
            <th style={thStyle}>Họ tên</th>
            <th style={thStyle}>Username</th>
            <th style={thStyle}>SĐT</th>
            <th style={thStyle}>Level</th>
            <th style={thStyle}></th>
          </tr>
        </thead>
        <tbody>
          {students.map((s, idx) => (
            <tr key={s.id}>
              <td style={tdStyle}>{idx + 1}</td>
              <td style={tdStyle}>{s.full_name}</td>
              <td style={tdStyle}>{s.username || "(chưa có)"}</td>
              <td style={tdStyle}>{s.phone}</td>
              <td style={tdStyle}>{s.level}</td>
              <td style={tdStyle}>
                <button
                  type="button"
                  onClick={() => handleViewSchedule(s)}
                  style={{
                    padding: "4px 10px",
                    borderRadius: 999,
                    border: "none",
                    background: "#3b82f6",
                    color: "#fff",
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  Xem quá trình hiện tại
                </button>
              </td>
            </tr>
          ))}
          {students.length === 0 && !loadingList && (
            <tr>
              <td style={tdStyle} colSpan={6}>
                Chưa có học viên nào được tìm thấy.
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Khối hiển thị quá trình học hiện tại */}
      {selectedStudent && (
        <div
          style={{
            marginTop: 20,
            paddingTop: 16,
            borderTop: "1px solid #e5e7eb",
          }}
        >
          <h4 style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>
            Quá trình học hiện tại của: {selectedStudent.full_name}{" "}
            {selectedStudent.username && `(${selectedStudent.username})`}
          </h4>
          {loadingSchedule && (
            <p style={{ fontSize: 13 }}>Đang tải lịch học hiện tại...</p>
          )}
          {scheduleError && (
            <p style={{ fontSize: 13, color: "red" }}>{scheduleError}</p>
          )}
          {!loadingSchedule && !scheduleError && schedule.length === 0 && (
            <p style={{ fontSize: 13, color: "#6b7280" }}>
              Không có buổi học sắp tới nào (có thể lớp đã kết thúc hoặc chưa
              xếp lịch).
            </p>
          )}

          {schedule.length > 0 && (
            <table style={{ ...tableStyle, marginTop: 10 }}>
              <thead>
                <tr>
                  <th style={thStyle}>Ngày</th>
                  <th style={thStyle}>Giờ học</th>
                  <th style={thStyle}>Lớp</th>
                  <th style={thStyle}>Phòng</th>
                </tr>
              </thead>
              <tbody>
                {schedule.map((ses, idx) => (
                  <tr key={idx}>
                    <td style={tdStyle}>{ses.date}</td>
                    <td style={tdStyle}>
                      {ses.timeStart} - {ses.timeEnd}
                    </td>
                    <td style={tdStyle}>{ses.className}</td>
                    <td style={tdStyle}>{ses.room}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}
