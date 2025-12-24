// src/components/attendance/AttendancePanel.jsx
import { useEffect, useState } from "react";

const API_URL = "http://localhost:8080";

export default function AttendancePanel() {
  // --- STATE ---
  const [classOptions, setClassOptions] = useState([]);
  const [selectedClassId, setSelectedClassId] = useState("");
  const [students, setStudents] = useState([]);
  const [sessions, setSessions] = useState([]);
  
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [mode, setMode] = useState("EDIT"); // 'EDIT' hoặc 'VIEW'

  const [newDate, setNewDate] = useState(() => new Date().toISOString().substring(0, 10));
  const [newNote, setNewNote] = useState("");

  const [selectedSession, setSelectedSession] = useState(null);
  const [attendanceRecords, setAttendanceRecords] = useState({});
  const [sendNotification, setSendNotification] = useState(true);

  // --- 1. LOAD DANH SÁCH LỚP ---
  useEffect(() => {
    const loadClasses = async () => {
      try {
        const user = JSON.parse(localStorage.getItem("currentUser"));
        if (!user) return;
        const res = await fetch(`${API_URL}/api/teacher/${user.username}/classes`);
        const data = await res.json();
        if (data.success && data.classes) {
          setClassOptions(data.classes);
          // Tự động chọn lớp đầu tiên nếu có
          if (data.classes.length > 0) {
            setSelectedClassId(data.classes[0].id);
          }
        }
      } catch (err) {
        console.error(err);
      }
    };
    loadClasses();
  }, []);

  // --- 2. LOAD HỌC VIÊN & BUỔI DẠY (LOGIC THÔNG MINH) ---
  useEffect(() => {
    if (!selectedClassId) return;

    const loadData = async () => {
      setLoading(true);
      setMessage("");
      try {
        // Gọi song song 2 API
        const [stuRes, sesRes] = await Promise.all([
          fetch(`${API_URL}/api/classes/${selectedClassId}/students`).then(r => r.json()),
          fetch(`${API_URL}/api/attendance/sessions?classId=${selectedClassId}`).then(r => r.json())
        ]);

        // === PHẦN SỬA QUAN TRỌNG: XỬ LÝ DỮ LIỆU ĐA DẠNG ===
        let listStu = [];
        if (Array.isArray(stuRes)) {
            // Trường hợp 1: Backend trả về [ ... ]
            listStu = stuRes;
        } else if (stuRes && Array.isArray(stuRes.students)) {
            // Trường hợp 2: Backend trả về { students: [ ... ] }
            listStu = stuRes.students;
        } else if (stuRes && Array.isArray(stuRes.data)) {
            // Trường hợp 3: Backend trả về { data: [ ... ] }
            listStu = stuRes.data;
        }
        
        setStudents(listStu);
        
        // Xử lý danh sách buổi dạy
        const listSes = Array.isArray(sesRes) ? sesRes : (sesRes.sessions || []);
        setSessions(listSes);
        
        setSelectedSession(null);

        // Cảnh báo nếu không có học viên
        if (listStu.length === 0) {
            setMessage(`⚠️ Lớp này (ID: ${selectedClassId}) chưa có học viên nào.`);
        }

      } catch (err) {
        console.error("Lỗi loadData:", err);
        setMessage("Lỗi kết nối hoặc tải dữ liệu.");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [selectedClassId]);

  // --- 3. TẠO BUỔI DẠY ---
  const handleCreateSession = async () => {
    if (!newDate) return setMessage("Vui lòng chọn ngày!");
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/attendance/sessions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ classId: selectedClassId, date: newDate, note: newNote }),
      });
      const data = await res.json();
      
      if (res.ok) {
          setSessions(prev => [...prev, data]);
          setMessage("Đã tạo buổi dạy mới.");
          setNewNote("");
      } else {
          setMessage("Không tạo được buổi dạy.");
      }
    } catch (err) {
      setMessage("Lỗi kết nối khi tạo buổi.");
    } finally {
      setLoading(false);
    }
  };

  // --- 4. BẮT ĐẦU ĐIỂM DANH (CHẾ ĐỘ EDIT) ---
  const handleStartAttendance = (session) => {
    setSelectedSession(session);
    setMode("EDIT");
    setMessage("");
    
    // Mặc định tất cả Có mặt
    const initial = {};
    students.forEach(s => {
      initial[s.id] = { status: "PRESENT", reason: "" };
    });
    setAttendanceRecords(initial);
  };

  // --- 5. XEM LỊCH SỬ (CHẾ ĐỘ VIEW) ---
  const handleViewHistory = async (session) => {
    setSelectedSession(session);
    setMode("VIEW");
    setLoading(true);
    setMessage("");

    try {
      const res = await fetch(`${API_URL}/api/attendance/sessions/${session.id}/records`);
      const data = await res.json();
      
      // Xử lý dữ liệu trả về linh hoạt
      const records = Array.isArray(data) ? data : (data.records || []);

      if (records.length > 0) {
        const historyMap = {};
        // Khởi tạo mặc định trước
        students.forEach(s => { historyMap[s.id] = { status: "PRESENT", reason: "" }; });
        // Ghi đè dữ liệu lịch sử
        records.forEach(rec => {
          historyMap[rec.studentId] = { status: rec.status, reason: rec.reason };
        });
        setAttendanceRecords(historyMap);
        setMessage("Đang xem kết quả đã lưu.");
      } else {
        // Chưa có dữ liệu
        const initial = {};
        students.forEach(s => { initial[s.id] = { status: "PRESENT", reason: "" }; });
        setAttendanceRecords(initial);
        setMessage("Buổi này chưa có dữ liệu điểm danh. Đang hiển thị mặc định.");
      }
    } catch (err) {
      console.error(err);
      setMessage("Lỗi tải lịch sử.");
    } finally {
      setLoading(false);
    }
  };

  // --- 6. LƯU KẾT QUẢ ---
  const handleSave = async () => {
    if (!selectedSession) return;
    setLoading(true);
    
    const recordsArr = students.map(s => ({
      studentId: s.id,
      status: attendanceRecords[s.id]?.status || "PRESENT",
      reason: attendanceRecords[s.id]?.reason || ""
    }));

    try {
      const res = await fetch(`${API_URL}/api/attendance/sessions/${selectedSession.id}/records`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ records: recordsArr, sendNotification }),
      });
      
      if (res.ok) {
        setMessage(sendNotification ? "Đã lưu và gửi email thông báo!" : "Đã lưu kết quả thành công.");
        setMode("VIEW"); // Chuyển sang chế độ xem sau khi lưu
      } else {
        setMessage("Lỗi khi lưu dữ liệu.");
      }
    } catch (err) {
      setMessage("Lỗi kết nối server.");
    } finally {
      setLoading(false);
    }
  };

  // --- RENDER GIAO DIỆN ---
  return (
    <div style={{ padding: 20, background: "#fff", borderRadius: 12, boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}>
      
      {/* 1. CHỌN LỚP */}
      <div style={{ marginBottom: 20 }}>
        <label style={{ fontWeight: 600, display: "block", marginBottom: 5 }}>Chọn lớp để điểm danh:</label>
        <select 
          value={selectedClassId} 
          onChange={e => setSelectedClassId(e.target.value)}
          style={{ padding: "8px", width: "100%", maxWidth: 350, border: "1px solid #ddd", borderRadius: 6, fontSize: 14 }}
        >
          {classOptions.length === 0 && <option>Đang tải danh sách lớp...</option>}
          {classOptions.map(c => (
            <option key={c.id} value={c.id}>
              {c.name} (ID: {c.id})  {/* Hiển thị ID để tránh nhầm lẫn */}
            </option>
          ))}
        </select>
      </div>

      {/* 2. TẠO BUỔI DẠY MỚI */}
      <div style={{ padding: 15, background: "#f9fafb", borderRadius: 8, marginBottom: 20, border: "1px dashed #ddd" }}>
        <div style={{ fontWeight: 600, marginBottom: 10 }}>Thêm buổi dạy:</div>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: 'center' }}>
          <input 
            type="date" 
            value={newDate} 
            onChange={e => setNewDate(e.target.value)} 
            style={{ padding: "8px", borderRadius: 4, border: "1px solid #ccc" }} 
          />
          <input 
            type="text" 
            placeholder="Ghi chú (Ví dụ: Bài 1...)" 
            value={newNote} 
            onChange={e => setNewNote(e.target.value)} 
            style={{ padding: "8px", flex: 1, borderRadius: 4, border: "1px solid #ccc" }} 
          />
          <button 
            onClick={handleCreateSession} 
            style={{ padding: "8px 16px", background: "#10b981", color: "#fff", border: "none", borderRadius: 4, cursor: "pointer", fontWeight: 600 }}
          >
            + Thêm buổi
          </button>
        </div>
      </div>

      {/* 3. DANH SÁCH BUỔI DẠY */}
      <div style={{ marginBottom: 20 }}>
        <h4 style={{ margin: "0 0 10px 0", borderBottom: '2px solid #f3f4f6', paddingBottom: 8 }}>Danh sách buổi dạy</h4>
        {sessions.length === 0 ? (
          <p style={{ color: "#999", fontStyle: 'italic' }}>Chưa có buổi dạy nào cho lớp này.</p>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#f0f0f0", textAlign: "left" }}>
                <th style={{ padding: 10 }}>Ngày</th>
                <th style={{ padding: 10 }}>Ghi chú</th>
                <th style={{ padding: 10 }}>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {sessions.map(s => (
                <tr key={s.id} style={{ borderBottom: "1px solid #eee" }}>
                  <td style={{ padding: 10 }}>{s.date}</td>
                  <td style={{ padding: 10 }}>{s.note}</td>
                  <td style={{ padding: 10, display: "flex", gap: 8 }}>
                    <button 
                      onClick={() => handleStartAttendance(s)}
                      style={{ padding: "6px 12px", background: "#2563eb", color: "#fff", border: "none", borderRadius: 4, cursor: "pointer", fontSize: 13, fontWeight: 500 }}
                    >
                      ✏️ Điểm danh
                    </button>
                    <button 
                      onClick={() => handleViewHistory(s)}
                      style={{ padding: "6px 12px", background: "#f59e0b", color: "#fff", border: "none", borderRadius: 4, cursor: "pointer", fontSize: 13, fontWeight: 500 }}
                    >
                      👁️ Xem lịch sử
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* 4. BẢNG ĐIỂM DANH (HIỆN KHI CHỌN BUỔI) */}
      {selectedSession && (
        <div style={{ marginTop: 25, borderTop: "3px solid #e5e7eb", paddingTop: 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 15 }}>
            <h3 style={{ margin: 0, color: mode === "EDIT" ? "#2563eb" : "#d97706", display: 'flex', alignItems: 'center', gap: 8 }}>
              {mode === "EDIT" ? "✍️ Đang thực hiện điểm danh" : "📜 Xem lịch sử điểm danh"} 
              <span style={{ fontSize: 14, color: "#6b7280", fontWeight: 400, background: '#f3f4f6', padding: '2px 8px', borderRadius: 4 }}>
                Ngày: {selectedSession.date}
              </span>
            </h3>
            <button 
              onClick={() => setSelectedSession(null)} 
              style={{ padding: "6px 12px", background: "#9ca3af", color: 'white', border: "none", borderRadius: 4, cursor: "pointer" }}
            >
              Đóng
            </button>
          </div>

          <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: 20, border: '1px solid #e5e7eb' }}>
            <thead>
              <tr style={{ background: "#f9fafb", borderBottom: "2px solid #e5e7eb" }}>
                <th style={{ padding: "12px", textAlign: "left", color: '#4b5563' }}>Tên học viên</th>
                <th style={{ padding: "12px", textAlign: "left", color: '#4b5563' }}>Trạng thái</th>
                <th style={{ padding: "12px", textAlign: "left", color: '#4b5563' }}>Ghi chú</th>
              </tr>
            </thead>
            <tbody>
              {students.length === 0 ? (
                <tr>
                  <td colSpan="3" style={{ padding: 30, textAlign: "center", color: "#dc2626", background: '#fef2f2' }}>
                    ⚠️ Lớp chưa có học viên. Vui lòng kiểm tra lại bên Quản lý lớp.
                  </td>
                </tr>
              ) : (
                students.map(std => {
                  const rec = attendanceRecords[std.id] || { status: "PRESENT", reason: "" };
                  const isPresent = rec.status === "PRESENT";
                  const isAbsent = rec.status === "ABSENT";
                  
                  return (
                    <tr key={std.id} style={{ borderBottom: "1px solid #eee" }}>
                      <td style={{ padding: "12px", fontWeight: 500 }}>
                        {std.full_name} 
                        {/* Hiển thị thêm trạng thái lớp nếu có */}
                        {std.class_status && <span style={{fontSize: 11, color: '#999', marginLeft: 6}}>({std.class_status})</span>}
                      </td>
                      <td style={{ padding: "12px" }}>
                        <select
                          value={rec.status}
                          disabled={mode === "VIEW"} // Khoá khi xem lịch sử
                          onChange={e => setAttendanceRecords(prev => ({
                            ...prev,
                            [std.id]: { ...prev[std.id], status: e.target.value }
                          }))}
                          style={{
                            padding: "6px 10px", 
                            borderRadius: 6, 
                            border: "1px solid #ccc",
                            fontWeight: 600,
                            color: isPresent ? "#15803d" : isAbsent ? "#b91c1c" : "#a16207",
                            background: isPresent ? "#dcfce7" : isAbsent ? "#fee2e2" : "#fef9c3",
                            cursor: mode === "VIEW" ? "not-allowed" : "pointer"
                          }}
                        >
                          <option value="PRESENT">Có mặt</option>
                          <option value="ABSENT">Vắng</option>
                          <option value="LATE">Muộn</option>
                        </select>
                      </td>
                      <td style={{ padding: "12px" }}>
                        {mode === "VIEW" ? (
                          <span style={{ color: "#4b5563", fontStyle: rec.reason ? 'normal' : 'italic' }}>
                            {rec.reason || "Không có ghi chú"}
                          </span>
                        ) : (
                          <input 
                            type="text" 
                            value={rec.reason}
                            placeholder="Lý do (nếu vắng/muộn)..."
                            onChange={e => setAttendanceRecords(prev => ({
                              ...prev,
                              [std.id]: { ...prev[std.id], reason: e.target.value }
                            }))}
                            style={{ width: "100%", padding: "8px", border: "1px solid #d1d5db", borderRadius: 6 }}
                          />
                        )}
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>

          {mode === "EDIT" && (
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 20, alignItems: "center" }}>
              <label style={{ display: "flex", gap: 8, cursor: "pointer", userSelect: "none", alignItems: 'center' }}>
                <input 
                  type="checkbox" 
                  checked={sendNotification} 
                  onChange={e => setSendNotification(e.target.checked)} 
                  style={{width: 16, height: 16}}
                /> 
                <span>Gửi email thông báo cho học viên</span>
              </label>
              <button 
                onClick={handleSave}
                style={{ 
                  padding: "10px 24px", 
                  background: "linear-gradient(135deg, #2563eb, #1d4ed8)", 
                  color: "#fff", 
                  border: "none", 
                  borderRadius: 6, 
                  fontWeight: 700, 
                  cursor: "pointer", 
                  boxShadow: "0 4px 6px rgba(37, 99, 235, 0.2)" 
                }}
              >
                💾 Lưu kết quả
              </button>
            </div>
          )}
        </div>
      )}

      {/* THÔNG BÁO HỆ THỐNG */}
      {(loading || message) && (
        <div style={{ 
          marginTop: 20, 
          padding: "12px 16px", 
          borderRadius: 8, 
          background: message.includes("Lỗi") || message.includes("⚠️") ? "#fef2f2" : "#f0fdf4", 
          color: message.includes("Lỗi") || message.includes("⚠️") ? "#dc2626" : "#15803d", 
          border: `1px solid ${message.includes("Lỗi") || message.includes("⚠️") ? "#fca5a5" : "#86efac"}` 
        }}>
          {loading ? "⏳ Đang xử lý..." : message}
        </div>
      )}
    </div>
  );
}