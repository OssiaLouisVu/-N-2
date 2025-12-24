import { useState, useEffect } from "react";
import axios from "axios";

// Đổi URL này nếu server bạn chạy port khác
const API_URL = "http://localhost:8080/api"; 

export default function OngoingStudentsPanel({ onGlobalMessage, onRefreshAll, refreshToken }) {
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]); // Danh sách lớp để chọn
  const [loading, setLoading] = useState(false);

  // State cho Modal Xếp lớp
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [selectedClassId, setSelectedClassId] = useState("");

  // 1. Lấy danh sách học viên (NEW và ACTIVE) khi refresh
  useEffect(() => {
    fetchStudents();
  }, [refreshToken]);

  // 2. Lấy danh sách Lớp (để hiển thị trong dropdown Modal)
  useEffect(() => {
    fetchClasses();
  }, []);

  // --- API: LẤY DANH SÁCH HỌC VIÊN ---
  const fetchStudents = async () => {
    try {
      setLoading(true);
      // Gọi API lấy tất cả, sau đó lọc ở client
      const res = await axios.get(`${API_URL}/students`);
      if (res.data.success) {
        // Chỉ lấy học viên NEW (chờ xếp lớp) hoặc ACTIVE (đang học)
        const filtered = res.data.students.filter(
          (s) => s.status === "NEW" || s.status === "ACTIVE"
        );
        setStudents(filtered);
      }
    } catch (error) {
      console.error("Lỗi lấy DS học viên:", error);
    } finally {
      setLoading(false);
    }
  };

  // --- API: LẤY DANH SÁCH LỚP HỌC ---
  const fetchClasses = async () => {
    try {
      const res = await axios.get(`${API_URL}/classes`);
      if (res.data.success) {
        setClasses(res.data.classes);
      }
    } catch (error) {
      console.error("Lỗi lấy DS lớp:", error);
    }
  };

  // --- HÀM MỞ MODAL XẾP LỚP ---
  const openAssignModal = (student) => {
    if (student.status === "ACTIVE") {
      alert("Học viên này đang đi học rồi!");
      return;
    }
    
    // Logic check UI: Cảnh báo nếu chưa đóng tiền
    // (Backend sẽ chặn triệt để, nhưng FE cảnh báo trước cho thân thiện)
    if (student.payment_status !== "PAID" && !student.is_paid) {
      const confirm = window.confirm(
        "CẢNH BÁO: Học viên này CHƯA ĐÓNG TIỀN (Status != PAID).\n\nBạn có chắc chắn muốn xếp lớp không?\n(Nếu Backend đang bật chế độ Strict Mode, hành động này sẽ bị từ chối)."
      );
      if (!confirm) return;
    }

    setSelectedStudent(student);
    setSelectedClassId(""); // Reset lựa chọn lớp
    setIsModalOpen(true);
  };

  // --- [QUAN TRỌNG] HÀM GỌI API XẾP LỚP ---
  const handleAssignClass = async () => {
    if (!selectedClassId || !selectedStudent) {
      alert("Vui lòng chọn lớp!");
      return;
    }

    // 1. Tìm object class dựa trên ID để lấy course_id
    // (Cần course_id để Backend kiểm tra xem học viên đóng tiền cho khoá nào)
    const selectedClassObj = classes.find(c => c.id === parseInt(selectedClassId));
    
    if (!selectedClassObj) {
      alert("Dữ liệu lớp học không hợp lệ.");
      return;
    }

    if (!selectedClassObj.course_id) {
        console.warn("Lớp này chưa gắn với course_id trong database. API có thể bị lỗi nếu thiếu courseId.");
    }

    try {
      // 2. Gọi API: POST /api/classes/:id/assign
      const res = await axios.post(`${API_URL}/classes/${selectedClassId}/assign`, {
        studentId: selectedStudent.id,
        courseId: selectedClassObj.course_id // <--- GỬI KÈM COURSE ID
      });

      if (res.data.success) {
        // Thông báo thành công
        if (onGlobalMessage) onGlobalMessage(`✅ ${res.data.message}`);
        else alert(res.data.message);

        setIsModalOpen(false);
        onRefreshAll(); // Refresh lại danh sách để thấy status đổi sang ACTIVE
      }
    } catch (error) {
      console.error("Lỗi xếp lớp:", error);
      // Hiển thị lỗi từ Backend trả về (Ví dụ: Chưa đóng tiền)
      alert(error.response?.data?.message || "Có lỗi xảy ra khi xếp lớp.");
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
      <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8, display: "flex", alignItems: "center", gap: 8 }}>
        <span role="img" aria-label="student">🧑‍🎓</span>
        Danh sách chờ & Đang học
      </h3>
      
      
      {loading ? (
        <p>Đang tải dữ liệu...</p>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 700 }}>
            <thead>
              <tr style={{ backgroundColor: "#fafafa", borderBottom: "2px solid #eee" }}>
                <th style={thStyle}>ID</th>
                <th style={thStyle}>Họ tên & Email</th>
                <th style={thStyle}>SĐT</th>
                <th style={thStyle}>Trạng thái</th> 
                <th style={thStyle}>Thanh toán</th>
                <th style={thStyle}>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {students.map((s) => (
                <tr key={s.id} style={{ borderBottom: "1px solid #f5f5f5" }}>
                  <td style={tdStyle}>#{s.id}</td>
                  <td style={tdStyle}>
                    <strong>{s.full_name || s.name}</strong>
                    <div style={{ fontSize: 12, color: "#888" }}>{s.email}</div>
                  </td>
                  <td style={tdStyle}>{s.phone}</td>
                  
                  {/* --- CỘT TRẠNG THÁI --- */}
                  <td style={tdStyle}>
                    {s.status === "ACTIVE" ? (
                      <span style={{...badgeStyle, backgroundColor: "#dcfce7", color: "#166534"}}>
                        Active (Đang học)
                      </span>
                    ) : (
                      <span style={{...badgeStyle, backgroundColor: "#f3f4f6", color: "#374151"}}>
                        New (Chờ lớp)
                      </span>
                    )}
                  </td>

                  {/* --- CỘT THANH TOÁN (MỚI) --- */}
                  <td style={tdStyle}>
                     {/* Kiểm tra logic: payment_status = PAID hoặc is_paid = 1 */}
                     {(s.payment_status === 'PAID' || s.is_paid) ? (
                         <span style={{...badgeStyle, backgroundColor: "#dbeafe", color: "#1e40af", border: "1px solid #bfdbfe"}}>
                           ✅ Đã đóng tiền
                         </span>
                     ) : (
                         <span style={{...badgeStyle, backgroundColor: "#fee2e2", color: "#991b1b"}}>
                           Chưa đóng
                         </span>
                     )}
                  </td>

                  {/* --- CỘT HÀNH ĐỘNG --- */}
                  <td style={tdStyle}>
                    {s.status === "NEW" ? (
                      <button
                        onClick={() => openAssignModal(s)}
                        style={btnAssignStyle}
                        title="Gán học viên vào lớp học"
                      >
                        Xếp lớp ➝
                      </button>
                    ) : (
                       <span style={{fontSize: 12, color: '#166534', fontStyle: 'italic'}}>
                         Đã có lớp
                       </span>
                    )}
                  </td>
                </tr>
              ))}
              
              {students.length === 0 && (
                 <tr><td colSpan="6" style={{textAlign:'center', padding: 30, color: '#888'}}>Không tìm thấy học viên nào.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* --- MODAL XẾP LỚP (POPUP) --- */}
      {isModalOpen && (
        <div style={overlayStyle}>
          <div style={modalStyle}>
            <h3 style={{marginTop: 0}}>Xếp lớp cho: {selectedStudent?.full_name}</h3>
            <p style={{marginBottom: 15, fontSize: 13, color: '#666'}}>
              Hệ thống sẽ kiểm tra xem học viên đã đóng tiền cho khoá học tương ứng với lớp này chưa.
            </p>

            <div style={{ marginBottom: 20 }}>
              <label style={{ display: "block", marginBottom: 8, fontWeight: 600, fontSize: 14 }}>Chọn Lớp học:</label>
              <select
                style={{ width: "100%", padding: 10, borderRadius: 6, border: "1px solid #ccc", fontSize: 14 }}
                value={selectedClassId}
                onChange={(e) => setSelectedClassId(e.target.value)}
              >
                <option value="">-- Chọn lớp muốn gán --</option>
                {classes.map((c) => (
                  <option key={c.id} value={c.id}>
                    Lớp {c.name} - {c.level} (Sĩ số: {c.student_count || 0}/{c.capacity})
                  </option>
                ))}
              </select>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
              <button 
                onClick={() => setIsModalOpen(false)}
                style={btnCancelStyle}
              >
                Hủy
              </button>
              <button
                onClick={handleAssignClass}
                style={btnSaveStyle}
              >
                Lưu (Xếp lớp)
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

// --- CSS STYLES ---
const thStyle = { padding: "12px 10px", textAlign: "left", fontSize: 13, color: "#555", fontWeight: 600 };
const tdStyle = { padding: "12px 10px", fontSize: 14, color: "#333", verticalAlign: 'middle' };
const badgeStyle = { padding: "4px 8px", borderRadius: 6, fontSize: 11, fontWeight: 600, display: 'inline-block' };

const btnAssignStyle = {
  padding: "6px 12px",
  backgroundColor: "#4f46e5",
  color: "#fff",
  border: "none",
  borderRadius: 6,
  cursor: "pointer",
  fontSize: 13,
  fontWeight: 500,
  transition: "0.2s"
};

const btnCancelStyle = {
  padding: "8px 16px", borderRadius: 6, border: "1px solid #ddd", background: "#fff", cursor: "pointer", fontSize: 14
};

const btnSaveStyle = {
  padding: "8px 16px", borderRadius: 6, border: "none", background: "#1677ff", color: "#fff", cursor: "pointer", fontWeight: 600, fontSize: 14
};

const overlayStyle = {
  position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
  backgroundColor: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000
};

const modalStyle = {
  backgroundColor: "#fff", padding: 24, borderRadius: 12, width: 450,
  boxShadow: "0 4px 12px rgba(0,0,0,0.15)", border: "1px solid #f0f0f0"
};