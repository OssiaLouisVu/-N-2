// src/pages/TeacherDashboard.jsx
import { useEffect, useState } from "react";
import AttendancePanel from "../components/attendance/AttendancePanel.jsx";
import MockExamPanel from "../components/mockExam/MockExamPanel.jsx";

export default function TeacherDashboard() {
  // Kiểm tra đăng nhập
  const stored = JSON.parse(localStorage.getItem("currentUser"));
  if (!stored) {
    window.location.href = "/login";
    return null;
  }
  const username = stored.username;

  // State chính
  const [showClasses, setShowClasses] = useState(false);
  const [showAttendance, setShowAttendance] = useState(true);
  const [showMockExamScores, setShowMockExamScores] = useState(false);

  const [teachingSchedule, setTeachingSchedule] = useState([]);
  const [detail, setDetail] = useState(null);

  const [activeClasses, setActiveClasses] = useState([]); // Gộp UPCOMING + ACTIVE
  const [completedClasses, setCompletedClasses] = useState([]);

  const [searchKeyword, setSearchKeyword] = useState("");

  // Style bảng
  const tableStyle = {
    width: "100%",
    borderCollapse: "collapse",
    background: "#fff",
    border: "1px solid #e0e0e0",
    borderRadius: 8,
    overflow: "hidden",
  };
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

  // Load lịch giảng dạy
  useEffect(() => {
    const u = stored.username;
    fetch(`http://localhost:8080/api/teacher/${u}/teaching-schedule`)
      .then((res) => res.json())
      .then((data) => setTeachingSchedule(data.schedule || []))
      .catch((err) => console.error(err));
  }, []);

  const loadDetail = (id) => {
    fetch(`http://localhost:8080/api/teacher/schedule/${id}/detail`)
      .then((res) => res.json())
      .then((data) => setDetail(data.detail))
      .catch((err) => console.error(err));
  };

  const closeDetail = () => setDetail(null);

  // Load danh sách lớp từ API
  useEffect(() => {
    const u = stored.username;
    fetch(`http://localhost:8080/api/teacher/${u}/classes`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.classes) {
          // Phân loại: UPCOMING + ACTIVE vào 1 nhóm, COMPLETED riêng
          const active = data.classes.filter(
            (c) => c.status === "UPCOMING" || c.status === "ACTIVE"
          );
          const completed = data.classes.filter((c) => c.status === "COMPLETED");
          
          setActiveClasses(active);
          setCompletedClasses(completed);
        }
      })
      .catch((err) => console.error(err));
  }, []);

  const filterList = (list) => {
    if (!searchKeyword.trim()) return list;
    return list.filter((c) =>
      c.name?.toLowerCase().includes(searchKeyword.toLowerCase())
    );
  };

  return (
    <div
      style={{
        width: "100%",
        minHeight: "100vh",
        background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
        paddingTop: 0,
      }}
    >
      {/* Header */}
      <div
        style={{
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          color: "white",
          padding: "40px 20px",
          boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
          marginBottom: 30,
        }}
      >
        <div
          style={{
            maxWidth: 1050,
            margin: "0 auto",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div>
            <h1 style={{ margin: 0, fontSize: 32, fontWeight: 700 }}>
              Dashboard Giáo viên
            </h1>
            <p style={{ margin: "8px 0 0 0", fontSize: 16, opacity: 0.9 }}>
              Xin chào, <b>{username}</b>
            </p>
          </div>

          <button
            onClick={() => {
              localStorage.removeItem("currentUser");
              window.location.href = "/login";
            }}
            style={{
              padding: "10px 24px",
              background: "rgba(255,255,255,0.2)",
              color: "white",
              border: "2px solid white",
              borderRadius: 6,
              cursor: "pointer",
              fontWeight: 600,
              transition: "all 0.3s",
              fontSize: 14,
            }}
            onMouseOver={(e) => {
              e.target.style.background = "rgba(255,255,255,0.3)";
            }}
            onMouseOut={(e) => {
              e.target.style.background = "rgba(255,255,255,0.2)";
            }}
          >
            Đăng xuất
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          paddingBottom: 40,
        }}
      >
        <div style={{ width: 1050 }}>
          {/* Khối chức năng */}
          <div style={{ marginTop: 24, marginBottom: 24, clear: "both" }}>
            <div
              style={{
                fontWeight: 700,
                marginBottom: 16,
                fontSize: 18,
                color: "#333",
              }}
            >
              📚 Chức năng
            </div>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              {/* Nút xem danh sách lớp */}
              <button
                onClick={() => setShowClasses((prev) => !prev)}
                style={{
                  padding: "12px 20px",
                  borderRadius: 8,
                  border: "none",
                  background:
                    "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  color: "#fff",
                  cursor: "pointer",
                  fontWeight: 600,
                  boxShadow: "0 4px 12px rgba(102, 126, 234, 0.4)",
                  transition: "all 0.3s",
                  fontSize: 14,
                }}
                onMouseOver={(e) => {
                  e.target.style.transform = "translateY(-2px)";
                  e.target.style.boxShadow =
                    "0 6px 16px rgba(102, 126, 234, 0.6)";
                }}
                onMouseOut={(e) => {
                  e.target.style.transform = "translateY(0)";
                  e.target.style.boxShadow =
                    "0 4px 12px rgba(102, 126, 234, 0.4)";
                }}
              >
                {showClasses
                  ? "📍 Đóng danh sách lớp"
                  : "📚 Xem danh sách lớp học"}
              </button>

              {/* Nút điểm danh */}
              <button
                onClick={() => setShowAttendance((prev) => !prev)}
                style={{
                  padding: "12px 20px",
                  borderRadius: 8,
                  border: "none",
                  background:
                    "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
                  color: "#fff",
                  cursor: "pointer",
                  fontWeight: 600,
                  boxShadow: "0 4px 12px rgba(245, 87, 108, 0.4)",
                  transition: "all 0.3s",
                  fontSize: 14,
                }}
                onMouseOver={(e) => {
                  e.target.style.transform = "translateY(-2px)";
                  e.target.style.boxShadow =
                    "0 6px 16px rgba(245, 87, 108, 0.6)";
                }}
                onMouseOut={(e) => {
                  e.target.style.transform = "translateY(0)";
                  e.target.style.boxShadow =
                    "0 4px 12px rgba(245, 87, 108, 0.4)";
                }}
              >
                {showAttendance ? "✖️ Ẩn điểm danh" : "✏️ Điểm danh lớp học"}
              </button>

              {/* Nút xem danh sách điểm thi thử */}
              <button
                onClick={() => setShowMockExamScores((prev) => !prev)}
                style={{
                  padding: "12px 20px",
                  borderRadius: 8,
                  border: "none",
                  background:
                    "linear-gradient(135deg, #34d399 0%, #059669 100%)",
                  color: "#fff",
                  cursor: "pointer",
                  fontWeight: 600,
                  boxShadow: "0 4px 12px rgba(16, 185, 129, 0.4)",
                  transition: "all 0.3s",
                  fontSize: 14,
                }}
                onMouseOver={(e) => {
                  e.target.style.transform = "translateY(-2px)";
                  e.target.style.boxShadow =
                    "0 6px 16px rgba(16, 185, 129, 0.6)";
                }}
                onMouseOut={(e) => {
                  e.target.style.transform = "translateY(0)";
                  e.target.style.boxShadow =
                    "0 4px 12px rgba(16, 185, 129, 0.4)";
                }}
              >
                {showMockExamScores
                  ? "📊 Đóng danh sách điểm thi thử"
                  : "📊 Xem danh sách điểm thi thử"}
              </button>
            </div>
          </div>

          {/* ===== PHẦN DANH SÁCH LỚP ===== */}
          {showClasses && (
            <div style={{ marginTop: 30 }}>
              <h2
                style={{
                  fontSize: 24,
                  fontWeight: 700,
                  color: "#333",
                  marginBottom: 16,
                }}
              >
                📅 Lịch giảng dạy sắp tới
              </h2>
              <div
                style={{
                  background: "#fff",
                  borderRadius: 12,
                  padding: 16,
                  boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                  marginBottom: 24,
                }}
              >
                <table style={tableStyle}>
                  <thead>
                    <tr>
                      <th style={thStyle}>Ngày</th>
                      <th style={thStyle}>Thời gian</th>
                      <th style={thStyle}>Lớp</th>
                      <th style={thStyle}>Phòng</th>
                      <th style={thStyle}>Chi tiết</th>
                    </tr>
                  </thead>
                  <tbody>
                    {teachingSchedule.map((item) => (
                      <tr key={item.id}>
                        <td style={tdStyle}>{item.date}</td>
                        <td style={tdStyle}>
                          {item.timeStart} - {item.timeEnd}
                        </td>
                        <td style={tdStyle}>{item.className}</td>
                        <td style={tdStyle}>{item.room}</td>
                        <td style={tdStyle}>
                          <button
                            onClick={() => loadDetail(item.id)}
                            style={{
                              padding: "6px 14px",
                              background: "#1677ff",
                              color: "#fff",
                              border: 0,
                              borderRadius: 6,
                              cursor: "pointer",
                            }}
                          >
                            Xem
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Hộp chi tiết buổi giảng */}
              {detail && (
                <div
                  style={{
                    border: "1px solid #d9d9d9",
                    padding: 20,
                    marginTop: 20,
                    borderRadius: 12,
                    background: "#ffffff",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
                  }}
                >
                  <h3 style={{ marginTop: 0 }}>Chi tiết buổi giảng</h3>
                  <p>
                    <b>Lớp:</b> {detail.className}
                  </p>
                  <p>
                    <b>Ngày:</b> {detail.date}
                  </p>
                  <p>
                    <b>Chủ đề:</b> {detail.topic}
                  </p>
                  <p>
                    <b>Tài liệu:</b> {detail.materials.join(", ")}
                  </p>
                  <p>
                    <b>Ghi chú:</b> {detail.notes}
                  </p>

                  <button
                    onClick={closeDetail}
                    style={{
                      marginTop: 10,
                      padding: "8px 18px",
                      background: "#666",
                      color: "#fff",
                      borderRadius: 6,
                      border: 0,
                      cursor: "pointer",
                    }}
                  >
                    Đóng
                  </button>
                </div>
              )}

              {/* Tìm kiếm lớp */}
              <h2
                style={{
                  marginTop: 40,
                  fontSize: 24,
                  fontWeight: 700,
                  color: "#333",
                  marginBottom: 16,
                }}
              >
                🔍 Tìm kiếm lớp học
              </h2>
              <div
                style={{
                  display: "flex",
                  gap: 12,
                  marginBottom: 25,
                  flexWrap: "wrap",
                }}
              >
                <select
                  value={searchType}
                  onChange={(e) => setSearchType(e.target.value)}
                  style={{
                    padding: "10px 12px",
                    borderRadius: 8,
                    border: "1px solid #ddd",
                    width: 230,
                    background: "#fff",
                    fontWeight: 500,
                    cursor: "pointer",
                  }}
                >
                  <option value="ALL">Tất cả lớp học</option>
                  <option value="UPCOMING">Lớp học sắp dạy</option>
                  <option value="ONGOING">Lớp học đang dạy</option>
                  <option value="FINISHED">Lớp học đã dạy</option>
                </select>

                <input
                  value={searchKeyword}
                  onChange={(e) => setSearchKeyword(e.target.value)}
                  placeholder="Nhập tên lớp..."
                  style={{
                    padding: "10px 12px",
                    flex: 1,
                    borderRadius: 8,
                    border: "1px solid #ddd",
                    fontWeight: 500,
                  }}
                />
              </div>

              {(searchType === "UPCOMING" || searchType === "ALL") && (
                <>
                  <h3
                    style={{
                      marginTop: 24,
                      fontSize: 18,
                      fontWeight: 700,
                      color: "#333",
                    }}
                  >
                    🚀 Lớp học sắp dạy
                  </h3>
                  <div
                    style={{
                      background: "#fff",
                      borderRadius: 12,
                      padding: 16,
                      boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                      marginBottom: 24,
                    }}
                  >
                    <table style={tableStyle}>
                      <thead>
                        <tr>
                          <th style={thStyle}>Tên lớp</th>
                          <th style={thStyle}>Ngày bắt đầu</th>
                          <th style={thStyle}>Ca</th>
                          <th style={thStyle}>Phòng</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filterList(upcoming).map((c) => (
                          <tr key={c.id}>
                            <td style={tdStyle}>{c.name}</td>
                            <td style={tdStyle}>{c.startDate}</td>
                            <td style={tdStyle}>{c.shift}</td>
                            <td style={tdStyle}>{c.room}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              )}

              {(searchType === "ONGOING" || searchType === "ALL") && (
                <>
                  <h3
                    style={{
                      marginTop: 24,
                      fontSize: 18,
                      fontWeight: 700,
                      color: "#333",
                    }}
                  >
                    ⚡ Lớp học đang dạy
                  </h3>
                  <div
                    style={{
                      background: "#fff",
                      borderRadius: 12,
                      padding: 16,
                      boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                      marginBottom: 24,
                    }}
                  >
                    <table style={tableStyle}>
                      <thead>
                        <tr>
                          <th style={thStyle}>Tên lớp</th>
                          <th style={thStyle}>Ngày bắt đầu</th>
                          <th style={thStyle}>Ca</th>
                          <th style={thStyle}>Số học viên</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filterList(ongoing).map((c) => (
                          <tr key={c.id}>
                            <td style={tdStyle}>{c.name}</td>
                            <td style={tdStyle}>{c.startDate}</td>
                            <td style={tdStyle}>{c.shift}</td>
                            <td style={tdStyle}>{c.students}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              )}

              {(searchType === "FINISHED" || searchType === "ALL") && (
                <>
                  <h3
                    style={{
                      marginTop: 24,
                      fontSize: 18,
                      fontWeight: 700,
                      color: "#333",
                    }}
                  >
                    ✅ Lớp học đã dạy
                  </h3>
                  <div
                    style={{
                      background: "#fff",
                      borderRadius: 12,
                      padding: 16,
                      boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                      marginBottom: 24,
                    }}
                  >
                    <table style={tableStyle}>
                      <thead>
                        <tr>
                          <th style={thStyle}>Tên lớp</th>
                          <th style={thStyle}>Ngày kết thúc</th>
                          <th style={thStyle}>Tổng buổi</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filterList(finished).map((c) => (
                          <tr key={c.id}>
                            <td style={tdStyle}>{c.name}</td>
                            <td style={tdStyle}>{c.endDate}</td>
                            <td style={tdStyle}>{c.totalSessions}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
            </div>
          )}

          {/* ===== PHẦN ĐIỂM DANH TRÊN CÙNG DASHBOARD ===== */}
          {showAttendance && (
            <div style={{ marginTop: 40 }}>
              <h2
                style={{
                  fontSize: 24,
                  fontWeight: 700,
                  color: "#333",
                  marginBottom: 16,
                }}
              >
                📋 Điểm danh lớp học
              </h2>
              <div
                style={{
                  background: "#f0f4ff",
                  borderLeft: "4px solid #667eea",
                  padding: 16,
                  borderRadius: 8,
                  marginBottom: 24,
                }}
              >
                <p
                  style={{
                    marginBottom: 0,
                    color: "#555",
                    fontSize: 14,
                    lineHeight: 1.6,
                  }}
                >
                  <strong>Quy trình:</strong> Đăng nhập → Chọn lớp (Xem danh
                  sách lớp học) → Thêm buổi dạy (nếu cần) → Thực hiện điểm danh
                  → Lưu kết quả → (Tùy chọn) Gửi thông báo cho học viên.
                </p>
              </div>
              <AttendancePanel />
            </div>
          )}

          {/* ===== PHẦN XEM DANH SÁCH ĐIỂM THI THỬ ===== */}
          {showMockExamScores && (
            <div style={{ marginTop: 40 }}>
              <MockExamPanel />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
