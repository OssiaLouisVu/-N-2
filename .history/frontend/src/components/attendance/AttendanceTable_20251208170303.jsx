// src/components/attendance/AttendanceTable.jsx

export default function AttendanceTable({
  students,
  attendanceRecords,
  setAttendanceRecords,
}) {
  const handleStatusChange = (studentId, value) => {
    setAttendanceRecords((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        status: value,
      },
    }));
  };

  const handleReasonChange = (studentId, value) => {
    setAttendanceRecords((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        reason: value,
      },
    }));
  };

  if (!students || students.length === 0) {
    return <p>Chưa có học viên trong lớp.</p>;
  }

  return (
    <table
      style={{
        width: "100%",
        borderCollapse: "collapse",
        background: "#fff",
        border: "1px solid #e0e0e0",
        borderRadius: 8,
        overflow: "hidden",
        marginTop: 16,
      }}
    >
      <thead>
        <tr>
          <th style={thStyle}>Mã HV</th>
          <th style={thStyle}>Họ tên</th>
          <th style={thStyle}>Trạng thái</th>
          <th style={thStyle}>Lý do (nếu vắng / muộn)</th>
        </tr>
      </thead>
      <tbody>
        {students.map((stu) => {
          const rec = attendanceRecords[stu.id] || {
            status: "PRESENT",
            reason: "",
          };
          return (
            <tr key={stu.id}>
              <td style={tdStyle}>{stu.id}</td>
              <td style={tdStyle}>{stu.full_name}</td>
              <td style={tdStyle}>
                <select
                  value={rec.status}
                  onChange={(e) =>
                    handleStatusChange(stu.id, e.target.value)
                  }
                >
                  <option value="PRESENT">Có mặt</option>
                  <option value="ABSENT">Vắng</option>
                  <option value="LATE">Đi muộn</option>
                </select>
              </td>
              <td style={tdStyle}>
                <input
                  type="text"
                  value={rec.reason}
                  onChange={(e) =>
                    handleReasonChange(stu.id, e.target.value)
                  }
                  placeholder="Nhập lý do nếu cần..."
                  style={{ width: "100%" }}
                />
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
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
