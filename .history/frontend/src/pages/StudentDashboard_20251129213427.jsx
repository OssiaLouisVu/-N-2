import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
// Đổi '2026-01-09T17:00:00.000Z' -> '2026-01-09'
function formatDateOnly(isoString) {
  if (!isoString) return "";
  const d = new Date(isoString);
  if (isNaN(d.getTime())) return isoString;   // nếu parse lỗi thì trả nguyên string
  return d.toISOString().slice(0, 10);        // lấy phần YYYY-MM-DD
}

const API_BASE = "http://localhost:8080";
function formatVNDateDash(dateInput) {
  const d = new Date(dateInput);
  if (isNaN(d.getTime())) return dateInput; // phòng trường hợp lỗi

  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();

  return `${day}-${month}-${year}`;  // 22-11-2025
}

export default function StudentDashboard() {
  const navigate = useNavigate();

  // Kiểm tra đăng nhập
  const stored = JSON.parse(localStorage.getItem("currentUser"));
  if (!stored) {
    window.location.href = "/login";
    return null;
  }
  const username = stored.username;
  const userRole = stored.role;

  // Debug log
  console.log("StudentDashboard - username:", username, "role:", userRole);

  // Nếu không phải STUDENT, redirect
  if (userRole !== "STUDENT") {
    console.log("Not STUDENT role, redirecting to login");
    window.location.href = "/login";
    return null;
  }

  const [activeFeature, setActiveFeature] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const [schedule, setSchedule] = useState([]);
  const [examShifts, setExamShifts] = useState([]);
  const [registeredExams, setRegisteredExams] = useState([]);
  const [examResults, setExamResults] = useState([]);
  const [selectedResult, setSelectedResult] = useState(null);

  // Load lịch học
  useEffect(() => {
    if (activeFeature === "schedule" && schedule.length === 0) {
      loadSchedule();
    }
  }, [activeFeature]);

  const loadSchedule = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/students/${username}/schedule`);
      const data = await res.json();
      if (data.success) {
        setSchedule(data.schedule || []);
      } else {
        setMessage("Không lấy được lịch học.");
      }
    } catch (err) {
      console.error(err);
      setMessage("Lỗi kết nối khi lấy lịch học.");
    } finally {
      setLoading(false);
    }
  };

const today = new Date();

// Tìm index buổi sắp tới gần nhất
const nextIndex = schedule.findIndex((item) => {
  // item.date là string từ API, ví dụ "2025-11-20" hoặc "2025-11-19T17:00:00.000Z"
  const d = new Date(item.date);
  // So sánh theo ngày, bỏ qua giờ cho đơn giản
  return d >= today;
});
  const loadMockExams = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/students/${username}/mock-exams`);
      const data = await res.json();
      if (data.success) {
        setSelectedResult(null);
        setExamShifts(data.availableShifts || []);
        setRegisteredExams(data.registered || []);
        setExamResults(data.results || []);
      } else {
        setMessage("Không lấy được thông tin thi thử.");
      }
    } catch (err) {
      console.error(err);
      setMessage("Lỗi kết nối khi lấy thông tin thi thử.");
    } finally {
      setLoading(false);
    }
  };

  const handleClickMockExam = () => {
    if (activeFeature === "mockExam") {
      setActiveFeature(null);
      return;
    }
    setActiveFeature("mockExam");
    loadMockExams();
  };

  const handleRegisterShift = async (shiftId) => {
    setLoading(true);
    try {
      const res = await fetch(
        `${API_BASE}/api/students/${username}/mock-exams/register`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ shiftId }),
        }
      );
      const data = await res.json();
      setMessage(data.message || "Đăng ký ca thi");
      await loadMockExams();
    } catch (err) {
      setMessage("Lỗi khi đăng ký ca thi.");
    } finally {
      setLoading(false);
    }
  };

  const handleCancelShift = async (shiftId) => {
    setLoading(true);
    try {
      const res = await fetch(
        `${API_BASE}/api/students/${username}/mock-exams/cancel`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ shiftId }),
        }
      );
      const data = await res.json();
      setMessage(data.message || "Huỷ đăng ký ca thi");
      await loadMockExams();
    } catch (err) {
      setMessage("Lỗi khi huỷ ca thi.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("currentUser");
    window.location.href = "/login";
  };

  // Style
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
              🎓 Dashboard Học Viên
            </h1>
            <p style={{ margin: "8px 0 0 0", fontSize: 16, opacity: 0.9 }}>
              Xin chào, <b>{username}</b>
            </p>
          </div>

          <button
            onClick={handleLogout}
            style={{
              padding: "10px 24px",
              background: "rgba(255,255,255,0.2)",
              color: "white",
              border: "2px solid white",
              borderRadius: 6,
              cursor: "pointer",
              fontWeight: 600,
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

      <div
        style={{
          display: "flex",
          justifyContent: "center",
          paddingBottom: 40,
        }}
      >
        <div style={{ width: 1050 }}>
          {/* Message */}
          {message && (
            <div
              style={{
                marginBottom: 16,
                padding: "12px 16px",
                background: "#fff1f0",
                borderRadius: 8,
                borderLeft: "4px solid #ff4d4f",
                color: "#d4380d",
              }}
            >
              {message}
            </div>
          )}

          {/* Loading */}
          {loading && (
            <div
              style={{
                padding: "12px 16px",
                background: "#e6f4ff",
                borderRadius: 8,
                borderLeft: "4px solid #1677ff",
                color: "#0050b3",
              }}
            >
              ⏳ Đang tải dữ liệu...
            </div>
          )}

          {/* Chức năng */}
          <div style={{ marginTop: 24, marginBottom: 24 }}>
            <div style={{ fontWeight: 700, marginBottom: 16, fontSize: 18, color: "#333" }}>
              📌 Chức năng
            </div>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              <button
                onClick={() => setActiveFeature(activeFeature === "schedule" ? null : "schedule")}
                style={{
                  padding: "12px 20px",
                  borderRadius: 8,
                  background: activeFeature === "schedule"
                    ? "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                    : "#fff",
                  color: activeFeature === "schedule" ? "#fff" : "#333",
                  cursor: "pointer",
                  fontWeight: 600,
                  boxShadow: activeFeature === "schedule"
                    ? "0 4px 12px rgba(102, 126, 234, 0.4)"
                    : "0 2px 4px rgba(0,0,0,0.08)",
                  transition: "all 0.3s",
                  fontSize: 14,
                  border: activeFeature === "schedule" ? "none" : "1px solid #ddd",
                }}
                onMouseOver={(e) => {
                  if (activeFeature !== "schedule") {
                    e.target.style.background = "#f0f4ff";
                  }
                }}
                onMouseOut={(e) => {
                  if (activeFeature !== "schedule") {
                    e.target.style.background = "#fff";
                  }
                }}
              >
                📚 Xem lịch học
              </button>

              <button
                onClick={handleClickMockExam}
                style={{
                  padding: "12px 20px",
                  borderRadius: 8,
                  background: activeFeature === "mockExam"
                    ? "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)"
                    : "#fff",
                  color: activeFeature === "mockExam" ? "#fff" : "#333",
                  cursor: "pointer",
                  fontWeight: 600,
                  boxShadow: activeFeature === "mockExam"
                    ? "0 4px 12px rgba(245, 87, 108, 0.4)"
                    : "0 2px 4px rgba(0,0,0,0.08)",
                  transition: "all 0.3s",
                  fontSize: 14,
                  border: activeFeature === "mockExam" ? "none" : "1px solid #ddd",
                }}
                onMouseOver={(e) => {
                  if (activeFeature !== "mockExam") {
                    e.target.style.background = "#fff1f0";
                  }
                }}
                onMouseOut={(e) => {
                  if (activeFeature !== "mockExam") {
                    e.target.style.background = "#fff";
                  }
                }}
              >
                ✏️ Đăng ký thi thử
              </button>
            </div>
          </div>

          {/* Content */}
          {!activeFeature && (
            <div style={{ textAlign: "center", padding: "60px 20px", color: "#999" }}>
              <p style={{ fontSize: 18 }}>👆 Chọn một chức năng bên trên để bắt đầu</p>
            </div>
          )}

          {/* Lịch học */}
          {activeFeature === "schedule" && (
            <div>
              <h2 style={{ fontSize: 24, fontWeight: 700, color: "#333", marginBottom: 16 }}>
                📅 Lịch học của tôi
              </h2>
              {schedule.length === 0 ? (
                <p style={{ color: "#999" }}>Hiện chưa có lịch học nào.</p>
              ) : (
                <div style={{ background: "#fff", borderRadius: 12, padding: 16, boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }}>
                  <table style={tableStyle}>
                    <thead>
                      <tr>
                        <th style={thStyle}>Ngày</th>
                        <th style={thStyle}>Giờ học</th>
                        <th style={thStyle}>Lớp</th>
                        <th style={thStyle}>Phòng</th>
                      </tr>
                    </thead>
                    
<tbody>
  {schedule.map((item, index) => {
    const dateStr = formatVNDateDash(item.date);  // << dùng hàm mới
    const isNext = nextIndex !== -1 && index === nextIndex;

    return (
      <tr
        key={index}
        style={
          isNext
            ? { backgroundColor: "#FFF9C4", fontWeight: 600 }
            : {}
        }
      >
        <td>{dateStr}</td>
        <td>
          {item.timeStart} - {item.timeEnd}
        </td>
        <td>{item.className}</td>
        <td>{item.room}</td>
      </tr>
    );
  })}
</tbody>

                  </table>
                </div>
              )}
            </div>
          )}

          {/* Thi thử */}
          {activeFeature === "mockExam" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
              {/* Đăng ký */}
              <section>
                <h3 style={{ fontSize: 18, fontWeight: 700, color: "#333", marginBottom: 16 }}>
                  📝 Đăng ký ca thi thử
                </h3>
                {examShifts.length === 0 ? (
                  <p style={{ color: "#999" }}>Hiện chưa có ca thi thử nào.</p>
                ) : (
                  <div style={{ background: "#fff", borderRadius: 12, padding: 16, boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }}>
                    <table style={tableStyle}>
                      <thead>
                        <tr>
                          <th style={thStyle}>Tên ca thi</th>
                          <th style={thStyle}>Ngày</th>
                          <th style={thStyle}>Giờ thi</th>
                          <th style={thStyle}>Phòng</th>
                          <th style={thStyle}>Trạng thái</th>
                        </tr>
                      </thead>
                      <tbody>
                        {examShifts.map((shift) => (
                          <tr key={shift.id}>
                            <td style={tdStyle}>{shift.examName}</td>
                                <td style={tdStyle}>{formatDateOnly(shift.date)}</td>

                            <td style={tdStyle}>{shift.startTime} - {shift.endTime}</td>
                            <td style={tdStyle}>{shift.room}</td>
                            <td style={tdStyle}>
                              {shift.isRegistered ? (
                                <button
                                  onClick={() => handleCancelShift(shift.id)}
                                  style={{
                                    padding: "6px 12px",
                                    borderRadius: 6,
                                    border: "none",
                                    background: "#ff4d4f",
                                    color: "#fff",
                                    cursor: "pointer",
                                    fontWeight: 600,
                                  }}
                                >
                                  Huỷ
                                </button>
                              ) : (
                                <button
                                  onClick={() => handleRegisterShift(shift.id)}
                                  style={{
                                    padding: "6px 12px",
                                    borderRadius: 6,
                                    border: "none",
                                    background: "#52c41a",
                                    color: "#fff",
                                    cursor: "pointer",
                                    fontWeight: 600,
                                  }}
                                >
                                  Đăng ký
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </section>

              {/* Đã đăng ký */}
              <section>
                <h3 style={{ fontSize: 18, fontWeight: 700, color: "#333", marginBottom: 16 }}>
                  ✅ Lịch thi thử đã đăng ký
                </h3>
                {registeredExams.length === 0 ? (
                  <p style={{ color: "#999" }}>Bạn chưa đăng ký ca thi thử nào.</p>
                ) : (
                  <div style={{ background: "#fff", borderRadius: 12, padding: 16, boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }}>
                    <table style={tableStyle}>
                      <thead>
                        <tr>
                          <th style={thStyle}>Ca thi</th>
                          <th style={thStyle}>Ngày</th>
                          <th style={thStyle}>Giờ thi</th>
                          <th style={thStyle}>Phòng</th>
                          <th style={thStyle}>Ngày đăng ký</th>
                        </tr>
                      </thead>
                      <tbody>
                        {registeredExams.map((reg) => (
                          <tr key={reg.id}>
                            <td style={tdStyle}>{reg.shift?.examName}</td>
                              <td style={tdStyle}>{formatDateOnly(reg.shift?.date)}</td>
                            <td style={tdStyle}>{reg.shift?.startTime} - {reg.shift?.endTime}</td>
                            <td style={tdStyle}>{reg.shift?.room}</td>
                             <td style={tdStyle}>{formatDateOnly(reg.dateRegistered)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </section>

              {/* Kết quả */}
              <section>
                <h3 style={{ fontSize: 18, fontWeight: 700, color: "#333", marginBottom: 16 }}>
                  📊 Kết quả thi thử
                </h3>
                {examResults.length === 0 ? (
                  <p style={{ color: "#999" }}>Chưa có kết quả thi thử nào.</p>
                ) : (
                  <>
                    <div style={{ background: "#fff", borderRadius: 12, padding: 16, boxShadow: "0 2px 8px rgba(0,0,0,0.08)", marginBottom: 16 }}>
                      <table style={tableStyle}>
                        <thead>
                          <tr>
                            <th style={thStyle}>Bài thi</th>
                            <th style={thStyle}>Ngày thi</th>
                            <th style={thStyle}>Điểm</th>
                            <th style={thStyle}>Nhận xét</th>
                            <th style={thStyle}>Chi tiết</th>
                          </tr>
                        </thead>
                        <tbody>
                          {examResults.map((r) => (
                            <tr key={r.id}>
                              <td style={tdStyle}>{r.examName}</td>
                                 <td style={tdStyle}>{formatDateOnly(r.date)}</td>

                              <td style={tdStyle}><strong>{r.score}</strong></td>
                              <td style={tdStyle}>{r.feedback}</td>
                              <td style={tdStyle}>
                                <button
                                  onClick={() => setSelectedResult(r)}
                                  style={{
                                    padding: "6px 12px",
                                    borderRadius: 6,
                                    border: "none",
                                    background: "#1677ff",
                                    color: "#fff",
                                    cursor: "pointer",
                                    fontWeight: 600,
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

                    {selectedResult && (
                      <div style={{ background: "#fff", borderRadius: 12, padding: 20, border: "1px solid #e0e0e0", boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }}>
                        <h4 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16, color: "#333" }}>
                          📄 Chi tiết – {selectedResult.examName}
                        </h4>
                       <p style={{ margin: "8px 0", color: "#555" }}>
  <b>Ngày thi:</b> {formatDateOnly(selectedResult.date)}
</p>

                        <p style={{ margin: "8px 0", color: "#555" }}><b>Tổng điểm:</b> {selectedResult.score}</p>
                        <p style={{ margin: "8px 0 16px 0", color: "#555" }}><b>Nhận xét:</b> {selectedResult.feedback}</p>

                        {Array.isArray(selectedResult.sections) && (
                          <>
                            <h5 style={{ marginBottom: 12, color: "#333" }}>Điểm theo từng phần:</h5>
                            <ul style={{ marginLeft: 20, color: "#555" }}>
                              {selectedResult.sections.map((sec, idx) => (
                                <li key={idx}>{sec.name}: {sec.score}/{sec.maxScore}</li>
                              ))}
                            </ul>
                          </>
                        )}

                        <button
                          onClick={() => setSelectedResult(null)}
                          style={{
                            marginTop: 16,
                            padding: "8px 16px",
                            borderRadius: 6,
                            border: "1px solid #ddd",
                            background: "#f5f5f5",
                            cursor: "pointer",
                            fontWeight: 600,
                          }}
                        >
                          Đóng
                        </button>
                      </div>
                    )}
                  </>
                )}
              </section>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
