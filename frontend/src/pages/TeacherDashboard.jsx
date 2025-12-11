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

  // State mới cho chức năng xem học viên
  const [selectedClassInfo, setSelectedClassInfo] = useState(null); // thông tin lớp
  const [studentList, setStudentList] = useState([]);
  const [isLoadingStudents, setIsLoadingStudents] = useState(false);
  const [studentError, setStudentError] = useState("");

  // BỔ SUNG CÁC STATE CHO PHẦN TÌM KIẾM LỚP
  const [upcoming, setUpcoming] = useState([]);
  const [ongoing, setOngoing] = useState([]);
  const [finished, setFinished] = useState([]);
  const [searchType, setSearchType] = useState("ALL");
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
    color: "#4b5563",
    fontSize: "14px",
  };
  const tdStyle = {
    padding: "12px 12px",
    borderBottom: "1px solid #f0f0f0",
    verticalAlign: "middle",
    color: "#374151",
    fontSize: "14px",
  };

  // Load lịch giảng dạy
  useEffect(() => {
    const u = stored.username;
    fetch(`http://localhost:8080/api/teacher/${u}/teaching-schedule`)
      .then((res) => res.json())
      .then((data) => setTeachingSchedule(data.schedule || []))
      .catch((err) => console.error(err));
  }, []);

  // BỔ SUNG: Load danh sách lớp 3 nhóm
  useEffect(() => {
    const u = stored.username; 
    
    Promise.all([
      fetch(`http://localhost:8080/api/teacher/classes/upcoming?username=${u}`).then(res => res.json()),
      fetch(`http://localhost:8080/api/teacher/classes/ongoing?username=${u}`).then(res => res.json()),
      fetch(`http://localhost:8080/api/teacher/classes/finished?username=${u}`).then(res => res.json())
    ])
    .then(([upcomingData, ongoingData, finishedData]) => {
      setUpcoming(upcomingData.data || []);
      setOngoing(ongoingData.data || []);
      setFinished(finishedData.data || []);
    })
    .catch((err) => console.error("Lỗi tải danh sách lớp:", err));
  }, []);

  // Hàm load chi tiết buổi học
  const loadDetail = (id) => {
    fetch(`http://localhost:8080/api/teacher/schedule/${id}/detail`)
      .then((res) => res.json())
      .then((data) => setDetail(data.detail))
      .catch((err) => console.error(err));
  };

  const closeDetail = () => setDetail(null);

  // Hàm tải danh sách học viên khi bấm nút "Xem"
  const loadStudentsOfClass = (item) => {
    const realClassId = item.classId || item.class_id;
    
    console.log("Item được chọn:", item);
    console.log("ID lớp tìm thấy:", realClassId);

    if (!realClassId) {
      console.error("Lỗi: Không tìm thấy ID lớp học trong dữ liệu!");
      setStudentError("Không tìm thấy ID lớp.");
      return;
    }

    setSelectedClassInfo({
      classId: realClassId,
      className: item.className || item.class_name || "Lớp học", 
      date: item.date,
      time: item.timeStart && item.timeEnd
        ? `${item.timeStart} - ${item.timeEnd}`
        : item.time
        ? item.time
        : "",
      room: item.room,
    });

    setIsLoadingStudents(true);
    setStudentError("");
    setStudentList([]);

    fetch(`http://localhost:8080/api/classes/${realClassId}/students`)
      .then((res) => res.json())
      .then((data) => {
        const list = data.students || data || [];
        setStudentList(Array.isArray(list) ? list : []);
        console.log("Danh sách học viên tải được:", list);
      })
      .catch((err) => {
        console.error("Lỗi fetch học viên:", err);
        setStudentError("Lỗi kết nối khi tải danh sách học viên");
        setStudentList([]);
      })
      .finally(() => {
        setIsLoadingStudents(false);
      });
  };

  const closeStudentPanel = () => {
    setSelectedClassInfo(null);
    setStudentList([]);
    setStudentError("");
  };

  // Logic tìm kiếm và lọc
  const getRealStatus = (start, end) => {
    const now = new Date();
    const startDate = new Date(start);
    const endDate = new Date(end);

    // Nếu có ngày bắt đầu và ngày bắt đầu > hiện tại => Sắp dạy
    if (start && startDate > now) return 'UPCOMING';
    
    // Nếu có ngày kết thúc và ngày kết thúc < hiện tại => Đã dạy
    // (Kiểm tra > 1970 để tránh lỗi ngày mặc định)
    if (end && endDate < now && endDate.getFullYear() > 1970) return 'FINISHED';
    
    return 'ONGOING';
  };

  const filteredClasses = (() => {
    const allClasses = [...upcoming, ...ongoing, ...finished];

    return allClasses.filter((c) => {
      const nameToCheck = c.name || c.className || ""; 
      const matchName = nameToCheck.toLowerCase().includes(searchKeyword.toLowerCase());
      
      const realStart = c.startDate || c.start_date || c.ngayBatDau || c.date; 
      const realEnd = c.endDate || c.end_date || c.ngayKetThuc; 
      
      const currentStatus = getRealStatus(realStart, realEnd);
      const matchStatus = (searchType === "ALL") || (searchType === currentStatus);
      
      return matchName && matchStatus;
    });
  })();

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
              >
                {showClasses
                  ? "📍 Đóng danh sách lớp"
                  : "📚 Xem danh sách lớp học"}
              </button>

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
              >
                {showAttendance ? "✖️ Ẩn điểm danh" : "✏️ Điểm danh lớp học"}
              </button>

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
                  fontSize: 28,
                  fontWeight: 700,
                  color: "#1f2937",
                  marginBottom: 20,
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                }}
              >
                <span role="img" aria-label="calendar">📅</span>
                Lịch giảng dạy 
              </h2>

              {/* Logic hiển thị lịch dạy */}
              {(() => {
                const today = new Date();
                const yyyy = today.getFullYear();
                const mm = String(today.getMonth() + 1).padStart(2, '0');
                const dd = String(today.getDate()).padStart(2, '0');
                const todayStr = `${yyyy}-${mm}-${dd}`;

                const validSchedule = teachingSchedule.filter(item => item.date >= todayStr);

                const groupedSchedule = validSchedule.reduce((groups, item) => {
                  const name = item.className || "Lớp khác";
                  if (!groups[name]) groups[name] = [];
                  groups[name].push(item);
                  return groups;
                }, {});

                const classNames = Object.keys(groupedSchedule);

                if (classNames.length === 0) {
                  return (
                    <div
                      style={{
                        background: "#f8fafc",
                        borderRadius: 12,
                        padding: "30px",
                        textAlign: "center",
                        color: "#6b7280",
                        fontStyle: "italic",
                        border: "1px dashed #cbd5e1",
                        marginBottom: 32
                      }}
                    >
                      Không có lịch giảng dạy sắp tới.
                    </div>
                  );
                }

                return classNames.map((className) => {
                  const classItems = groupedSchedule[className];
                  const hasSessionToday = classItems.some(item => item.date === todayStr);

                  const statusConfig = hasSessionToday
                    ? {
                        text: "Đang giảng dạy (Hôm nay)",
                        icon: "🔥",
                        color: "#b91c1c",
                        bgColor: "#fef2f2",
                        borderColor: "#fca5a5"
                      }
                    : {
                        text: "Sắp tới",
                        icon: "📅",
                        color: "#4338ca",
                        bgColor: "#e0e7ff",
                        borderColor: "#c7d2fe"
                      };

                  return (
                    <div key={className} style={{ marginBottom: 40 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: 16 }}>
                        <h3 style={{ fontSize: 18, fontWeight: 700, color: "#1f2937", margin: 0 }}>
                          Lớp: {className}
                        </h3>
                        <span
                          style={{
                            fontSize: "13px",
                            fontWeight: "600",
                            color: statusConfig.color,
                            backgroundColor: statusConfig.bgColor,
                            border: `1px solid ${statusConfig.borderColor}`,
                            padding: "4px 12px",
                            borderRadius: "20px",
                            display: "flex",
                            alignItems: "center",
                            gap: "6px"
                          }}
                        >
                          <span>{statusConfig.icon}</span>
                          {statusConfig.text}
                        </span>
                      </div>

                      <div
                        style={{
                          background: "#ffffff",
                          borderRadius: 12,
                          padding: "0",
                          boxShadow: hasSessionToday 
                            ? "0 4px 12px rgba(239, 68, 68, 0.15)"
                            : "0 4px 12px rgba(0,0,0,0.05)",
                          border: hasSessionToday
                            ? "1px solid #fca5a5"
                            : "1px solid #e2e8f0",
                          overflow: "hidden"
                        }}
                      >
                        <table style={{ width: "100%", borderCollapse: "collapse" }}>
                          <thead>
                            <tr style={{ backgroundColor: "#f8fafc", borderBottom: "2px solid #e2e8f0" }}>
                              {["Ngày", "Thời gian", "Phòng", "Chi tiết"].map((header) => (
                                <th
                                  key={header}
                                  style={{
                                    textAlign: "left",
                                    padding: "16px 20px",
                                    fontWeight: 700,
                                    fontSize: 14,
                                    color: "#475569",
                                    textTransform: "uppercase",
                                  }}
                                >
                                  {header}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {classItems.map((item, idx) => {
                              const isItemToday = item.date === todayStr;
                              return (
                                <tr
                                  key={item.id || idx}
                                  style={{ 
                                    borderBottom: "1px solid #f1f5f9",
                                    backgroundColor: isItemToday ? "#fff1f2" : "transparent"
                                  }}
                                >
                                  <td style={{ padding: "16px 20px", color: isItemToday ? "#b91c1c" : "#334155", fontWeight: isItemToday ? 700 : 500 }}>
                                    {item.date} {isItemToday && "(Hôm nay)"}
                                  </td>
                                  <td style={{ padding: "16px 20px", color: "#334155" }}>
                                    {item.timeStart && item.timeEnd
                                      ? `${item.timeStart} - ${item.timeEnd}`
                                      : item.time || "-"}
                                  </td>
                                  <td style={{ padding: "16px 20px", color: "#334155" }}>
                                    <span style={{ 
                                      background: isItemToday ? "#ffe4e6" : "#f1f5f9", 
                                      padding: "4px 8px", 
                                      borderRadius: "4px", 
                                      fontSize: "13px", 
                                      fontWeight: 600,
                                      color: isItemToday ? "#b91c1c" : "#334155"
                                    }}>
                                      {item.room}
                                    </span>
                                  </td>
                                  <td style={{ padding: "16px 20px" }}>
                                    <button
                                      onClick={() => loadStudentsOfClass(item)}
                                      style={{
                                        backgroundColor: isItemToday ? "#e11d48" : "#3b82f6",
                                        color: "#fff",
                                        border: "none",
                                        borderRadius: "6px",
                                        padding: "8px 16px",
                                        fontWeight: 600,
                                        cursor: "pointer",
                                        fontSize: "13px",
                                        boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                                      }}
                                    >
                                      Xem
                                    </button>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  );
                });
              })()}

              {/* Chi tiết buổi giảng */}
              {detail && (
                <div
                  style={{
                    marginTop: 24,
                    background: "#f8fafc",
                    borderRadius: 12,
                    padding: "20px 24px",
                    boxShadow: "0 4px 12px rgba(15,23,42,0.08)",
                    border: "1px solid #e2e8f0",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                    <div>
                      <h3 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: "#111827" }}>
                        Chi tiết buổi giảng
                      </h3>
                      <p style={{ margin: "6px 0 0 0", fontSize: 14, color: "#6b7280" }}>
                        {detail.date}{" "}
                        {detail.timeStart && detail.timeEnd ? `· ${detail.timeStart} - ${detail.timeEnd}` : ""}{" "}
                        {detail.room ? `· Phòng ${detail.room}` : ""}
                      </p>
                    </div>
                    <button
                      onClick={closeDetail}
                      style={{
                        padding: "6px 14px",
                        backgroundColor: "#6b7280",
                        color: "#fff",
                        borderRadius: 8,
                        border: "none",
                        cursor: "pointer",
                        fontWeight: 600,
                        fontSize: 13,
                      }}
                    >
                      Đóng
                    </button>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 20, marginTop: 8 }}>
                    <div>
                      <div style={{ marginBottom: 10 }}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: "#4b5563", textTransform: "uppercase", marginBottom: 4 }}>
                          Lớp học
                        </div>
                        <div style={{ fontSize: 15, color: "#111827" }}>{detail.className}</div>
                      </div>
                      <div style={{ marginBottom: 10 }}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: "#4b5563", textTransform: "uppercase", marginBottom: 4 }}>
                          Chủ đề
                        </div>
                        <div style={{ fontSize: 15, color: "#111827" }}>{detail.topic || "Chưa cập nhật"}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 600, color: "#4b5563", textTransform: "uppercase", marginBottom: 4 }}>
                          Ghi chú
                        </div>
                        <div style={{ fontSize: 15, color: "#111827", whiteSpace: "pre-line" }}>{detail.notes || "Không có ghi chú thêm."}</div>
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: "#4b5563", textTransform: "uppercase", marginBottom: 4 }}>
                        Tài liệu
                      </div>
                      {detail.materials && detail.materials.length > 0 ? (
                        <ul style={{ margin: 0, paddingLeft: 18, fontSize: 14, color: "#1f2937" }}>
                          {detail.materials.map((m, idx) => (
                            <li key={idx}>{m}</li>
                          ))}
                        </ul>
                      ) : (
                        <p style={{ margin: 0, fontSize: 14, color: "#6b7280" }}>Chưa có tài liệu đính kèm.</p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Học viên trong lớp */}
              {selectedClassInfo && (
                <div
                  style={{
                    marginTop: 24,
                    background: "#f8fafc",
                    borderRadius: 12,
                    padding: "20px 24px",
                    boxShadow: "0 4px 12px rgba(15,23,42,0.08)",
                    border: "1px solid #e2e8f0",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                    <div>
                      <h3
                        style={{
                          margin: 0,
                          fontSize: 20,
                          fontWeight: 700,
                          color: "#111827",
                          display: "flex",
                          alignItems: "center",
                          gap: "12px",
                        }}
                      >
                        Học viên trong lớp – {selectedClassInfo.className}
                        {!isLoadingStudents && (
                          <span
                            style={{
                              fontSize: "14px",
                              fontWeight: "600",
                              color: "#ffffff",
                              backgroundColor: "#2563eb",
                              padding: "4px 12px",
                              borderRadius: "99px",
                              boxShadow: "0 2px 4px rgba(37, 99, 235, 0.2)",
                            }}
                          >
                            {studentList.length} học viên
                          </span>
                        )}
                      </h3>
                      <p style={{ margin: "6px 0 0 0", fontSize: 14, color: "#6b7280" }}>
                        Ngày: {selectedClassInfo.date}{" "}
                        {selectedClassInfo.time ? `· Giờ: ${selectedClassInfo.time}` : ""}{" "}
                        {selectedClassInfo.room ? `· Phòng ${selectedClassInfo.room}` : ""}
                      </p>
                    </div>

                    <button
                      onClick={closeStudentPanel}
                      style={{
                        padding: "6px 14px",
                        backgroundColor: "#6b7280",
                        color: "#fff",
                        borderRadius: 8,
                        border: "none",
                        cursor: "pointer",
                        fontWeight: 600,
                        fontSize: 13,
                      }}
                    >
                      Đóng
                    </button>
                  </div>

                  <div style={{ marginTop: 12, background: "#fff", borderRadius: 10, border: "1px solid #e5e7eb", overflow: "hidden" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse" }}>
                      <thead>
                        <tr style={{ backgroundColor: "#f9fafb" }}>
                          <th style={{ padding: "10px 12px", textAlign: "left" }}>ID</th>
                          <th style={{ padding: "10px 12px", textAlign: "left" }}>Tên</th>
                          <th style={{ padding: "10px 12px", textAlign: "left" }}>SĐT</th>
                          <th style={{ padding: "10px 12px", textAlign: "left" }}>Trạng thái</th>
                        </tr>
                      </thead>
                      <tbody>
                        {isLoadingStudents ? (
                          <tr><td colSpan="4" style={{ padding: 12, textAlign: "center" }}>Đang tải danh sách học viên...</td></tr>
                        ) : studentError ? (
                          <tr><td colSpan="4" style={{ padding: 12, textAlign: "center", color: "red" }}>{studentError}</td></tr>
                        ) : studentList.length === 0 ? (
                          <tr><td colSpan="4" style={{ padding: 12, textAlign: "center" }}>Không có học viên trong lớp.</td></tr>
                        ) : (
                          studentList.map((s, idx) => (
                            <tr key={s.id || idx} style={{ borderTop: "1px solid #f3f4f6" }}>
                              <td style={{ padding: "10px 12px" }}>{s.id}</td>
                              <td style={{ padding: "10px 12px" }}>{s.full_name}</td>
                              <td style={{ padding: "10px 12px" }}>{s.phone}</td>
                              <td style={{ padding: "10px 12px" }}>{s.status || s.class_status || "UNKNOWN"}</td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Tìm kiếm lớp học */}
              <h2 style={{ marginTop: 40, fontSize: 24, fontWeight: 700, color: "#333", marginBottom: 16 }}>
                🔍 Tìm kiếm lớp học
              </h2>
              
              <div style={{ display: "flex", gap: 12, marginBottom: 25, flexWrap: "wrap" }}>
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

              {/* BẢNG KẾT QUẢ DUY NHẤT */}
              {/* BẢNG KẾT QUẢ DUY NHẤT */}
<div
  style={{
    background: "#fff",
    borderRadius: 12,
    padding: 16,
    boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
    marginBottom: 24,
  }}
>
  <p style={{ marginTop: 0, color: "#666", fontSize: 14 }}>
    Tìm thấy <b>{filteredClasses.length}</b> lớp học phù hợp:
  </p>

  <table style={tableStyle}>
    <thead>
      <tr>
        <th style={thStyle}>Tên lớp</th>
        <th style={{ ...thStyle, width: "35%" }}>Thời gian (Bắt đầu → Kết thúc)</th>
        <th style={thStyle}>Trạng thái</th>
        {/* --- Cột Lớp --- */}
        <th style={thStyle}>Lớp</th>
      </tr>
    </thead>
    <tbody>
      {filteredClasses.length > 0 ? (
        filteredClasses.map((c, index) => {
          const realStart = c.startDate || c.start_date || c.ngayBatDau || c.date; 
          const realEnd = c.endDate || c.end_date || c.ngayKetThuc; 
          const status = getRealStatus(realStart, realEnd);
          
          // Xử lý hiển thị ngày kết thúc
          const endDateDisplay = realEnd && new Date(realEnd).getFullYear() > 1970 
              ? new Date(realEnd).toLocaleDateString('vi-VN')
              : <span style={{color: '#9ca3af', fontStyle: 'italic', fontSize: '13px'}}>Chưa cập nhật</span>;

          return (
            <tr key={c.id || index}>
              <td style={tdStyle}>
                <strong>{c.name || c.className || c.tenLop}</strong>
              </td>
              <td style={tdStyle}>
                {realStart ? new Date(realStart).toLocaleDateString('vi-VN') : "..."} 
                &nbsp; ➝ &nbsp; 
                {endDateDisplay}
              </td>
              <td style={tdStyle}>
                {status === 'UPCOMING' && <span style={{color: '#2563eb', fontWeight: 'bold'}}>Sắp dạy</span>}
                {status === 'ONGOING' && <span style={{color: '#16a34a', fontWeight: 'bold'}}>Đang dạy</span>}
                {status === 'FINISHED' && <span style={{color: '#6b7280', fontWeight: 'bold'}}>Đã dạy</span>}
              </td>
              
              {/* --- ĐOẠN CẦN SỬA Ở ĐÂY --- */}
              <td style={tdStyle}>
                  <div style={{display: 'flex', flexDirection: 'column', gap: '4px'}}>
                    <div style={{fontWeight: 500, color: '#374151'}}>
                      Phòng: <span style={{fontWeight: 600}}>{c.room || "Chưa xếp"}</span>
                    </div>
                    <div style={{fontSize: '13px', color: '#6b7280'}}>
                      {/* Logic: Nếu là mảng thì đếm .length, nếu là số thì hiện số, không thì hiện 0 */}
                      Sĩ số: <b>{Array.isArray(c.students) ? c.students.length : (c.students || 0)}</b> Học viên
                    </div>
                  </div>
              </td>
            </tr>
          );
        })
      ) : (
        <tr>
          <td colSpan="4" style={{ padding: "20px", textAlign: "center", color: "#888" }}>
            Không tìm thấy lớp học nào.
          </td>
        </tr>
      )}
    </tbody>
  </table>
</div>

            </div>
          )} 

          {/* ===== PHẦN ĐIỂM DANH ===== */}
          {showAttendance && (
            <div style={{ marginTop: 40 }}>
              <h2 style={{ fontSize: 24, fontWeight: 700, color: "#333", marginBottom: 16 }}>
                📋 Điểm danh lớp học
              </h2>
              <div style={{ background: "#f0f4ff", borderLeft: "4px solid #667eea", padding: 16, borderRadius: 8, marginBottom: 24 }}>
                <p style={{ marginBottom: 0, color: "#555", fontSize: 14, lineHeight: 1.6 }}>
                  <strong>Quy trình:</strong> Đăng nhập → Chọn lớp (Xem danh sách lớp học) → Thêm buổi dạy (nếu cần) → Thực hiện điểm danh → Lưu kết quả → (Tùy chọn) Gửi thông báo cho học viên.
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