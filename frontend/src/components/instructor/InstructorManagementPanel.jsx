import { useState, useEffect } from "react";
import axios from "axios";

// Đổi URL server nếu cần
const API_URL = "http://localhost:8080/api";

export default function InstructorManagementPanel() {
  const [instructors, setInstructors] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // State quản lý Modal
  const [showModal, setShowModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  
  // State Form nhập liệu (Thêm trường type)
  const [formData, setFormData] = useState({
    id: null, full_name: "", type: "VIETNAMESE", phone: "", email: "", 
    specialization: "HSK 1-3", hourly_rate: 0, 
    bank_account: "", bank_name: "", status: "ACTIVE", bio: ""
  });

  // State Lịch sử dạy
  const [teachingHistory, setTeachingHistory] = useState([]);
  const [selectedInstructorName, setSelectedInstructorName] = useState("");

  useEffect(() => {
    fetchInstructors();
  }, []);

  // --- 1. LẤY DANH SÁCH GIẢNG VIÊN ---
  const fetchInstructors = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_URL}/instructors`);
      if (res.data.success) {
        setInstructors(res.data.instructors);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // --- 2. LƯU (THÊM MỚI / CẬP NHẬT) ---
  const handleSave = async () => {
    try {
      if (!formData.full_name || !formData.phone) {
        alert("Vui lòng nhập Tên và SĐT!");
        return;
      }

      if (formData.id) {
        // Cập nhật
        await axios.put(`${API_URL}/instructors/${formData.id}`, formData);
        alert("✅ Cập nhật thông tin thành công!");
      } else {
        // Thêm mới
        const res = await axios.post(`${API_URL}/instructors`, formData);
        alert("✅ " + res.data.message); // Thông báo tạo user thành công
      }
      setShowModal(false);
      fetchInstructors();
    } catch (err) {
      alert("❌ Lỗi: " + (err.response?.data?.message || err.message));
    }
  };

  // --- 3. MỞ MODAL THÊM MỚI ---
  const openCreateModal = () => {
    setFormData({
        id: null, full_name: "", type: "VIETNAMESE", phone: "", email: "", 
        specialization: "HSK 1-3", hourly_rate: 150000, 
        bank_account: "", bank_name: "", status: "ACTIVE", bio: ""
    });
    setShowModal(true);
  };

  // --- 4. MỞ MODAL SỬA ---
  const openEditModal = (gv) => {
    setFormData(gv);
    setShowModal(true);
  };

  // --- 5. MỞ MODAL XEM LỊCH SỬ ---
  const openHistoryModal = async (gv) => {
    try {
        setSelectedInstructorName(gv.full_name);
        const res = await axios.get(`${API_URL}/instructors/${gv.id}/classes`);
        if(res.data.success) {
            setTeachingHistory(res.data.classes);
            setShowHistoryModal(true);
        }
    } catch (err) {
        alert("Lỗi tải danh sách lớp dạy");
    }
  };

  return (
    <div style={{ background: "#fff", padding: 24, borderRadius: 12, border: "1px solid #eef0ff", boxShadow: "0 4px 6px rgba(0,0,0,0.02)" }}>
      
      {/* HEADER */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div>
           <h3 style={{ margin: 0, fontSize: 18 }}>Danh sách Giảng viên </h3>
           <p style={{ margin: "4px 0 0", fontSize: 13, color: "#666" }}></p>
        </div>
        <button onClick={openCreateModal} style={btnPrimary}>
          + Thêm Giảng viên
        </button>
      </div>

      {/* TABLE DANH SÁCH */}
      {loading ? <p>Đang tải dữ liệu...</p> : (
        <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
            <thead>
                <tr style={{ background: "#f9fafb", borderBottom: "2px solid #e5e7eb", textAlign: "left" }}>
                <th style={thStyle}>ID</th>
                <th style={thStyle}>Họ tên & Phân loại</th>
                <th style={thStyle}>Chuyên môn</th>
                <th style={thStyle}>Lương/Giờ</th>
                <th style={thStyle}>Trạng thái</th>
                <th style={thStyle}>Thao tác</th>
                </tr>
            </thead>
            <tbody>
                {instructors.map((gv) => (
                <tr key={gv.id} style={{ borderBottom: "1px solid #f3f4f6" }}>
                    <td style={tdStyle}>#{gv.id}</td>
                    <td style={tdStyle}>
                        <div style={{ fontWeight: 600, color: "#111827" }}>{gv.full_name}</div>
                        {/* Hiển thị Badge Phân loại GV */}
                        <div style={{marginTop: 4, display: 'flex', alignItems: 'center', gap: 6}}>
                            {gv.type === 'NATIVE' ? (
                                <span style={{fontSize: 11, background: '#fef3c7', color: '#d97706', padding: '2px 6px', borderRadius: 4, fontWeight: 600}}>
                                    🇨🇳 GV Bản ngữ
                                </span>
                            ) : (
                                <span style={{fontSize: 11, background: '#f3f4f6', color: '#4b5563', padding: '2px 6px', borderRadius: 4, fontWeight: 600}}>
                                    🇻🇳 GV Việt Nam
                                </span>
                            )}
                            <span style={{ fontSize: 12, color: "#6b7280" }}>| {gv.phone}</span>
                        </div>
                    </td>
                    <td style={tdStyle}>
                        <span style={{background: '#eff6ff', color: '#1d4ed8', padding: '3px 8px', borderRadius: 99, fontSize: 12, fontWeight: 500}}>
                            {gv.specialization || 'N/A'}
                        </span>
                    </td>
                    <td style={tdStyle}>
                        {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(gv.hourly_rate)}
                    </td>
                    
                    {/* Hiển thị Badge Trạng thái */}
                    <td style={tdStyle}>
                        {gv.status === 'ACTIVE' && (
                            <span style={{background:'#dcfce7', color:'#166534', padding:'4px 8px', borderRadius:20, fontSize:12, fontWeight:600}}>
                                🟢 Đang dạy
                            </span>
                        )}
                        {gv.status === 'INACTIVE' && (
                            <span style={{background:'#fee2e2', color:'#991b1b', padding:'4px 8px', borderRadius:20, fontSize:12, fontWeight:600}}>
                                🔴 Đã nghỉ
                            </span>
                        )}
                        {gv.status === 'ON_LEAVE' && (
                            <span style={{background:'#fef9c3', color:'#854d0e', padding:'4px 8px', borderRadius:20, fontSize:12, fontWeight:600}}>
                                🟡 Tạm nghỉ
                            </span>
                        )}
                    </td>

                    <td style={tdStyle}>
                        <button onClick={() => openHistoryModal(gv)} style={btnAction}>📅 Lớp dạy</button>
                        <span style={{margin: '0 4px', color: '#ddd'}}>|</span>
                        <button onClick={() => openEditModal(gv)} style={{...btnAction, color: '#2563eb'}}>✏️ Sửa</button>
                    </td>
                </tr>
                ))}
            </tbody>
            </table>
        </div>
      )}

      {/* --- MODAL 1: FORM THÊM / SỬA --- */}
      {showModal && (
        <div style={overlayStyle}>
          <div style={modalStyle}>
            <h3 style={{marginTop: 0, marginBottom: 15}}>{formData.id ? "Cập nhật thông tin" : "Thêm Giảng viên mới"}</h3>
            
            <div style={grid2Cols}>
                <div>
                    <label style={labelStyle}>Họ và tên *</label>
                    <input style={inputStyle} value={formData.full_name} onChange={e=>setFormData({...formData, full_name: e.target.value})} placeholder="VD: Trương Vô Kỵ" />
                </div>
                <div>
                    <label style={labelStyle}>Phân loại GV</label>
                    <select style={inputStyle} value={formData.type} onChange={e=>setFormData({...formData, type: e.target.value})}>
                        <option value="VIETNAMESE">🇻🇳 Giáo viên Việt Nam</option>
                        <option value="NATIVE">🇨🇳 Giáo viên Bản ngữ (Trung)</option>
                    </select>
                </div>
            </div>

            <div style={grid2Cols}>
                <div>
                    <label style={labelStyle}>Số điện thoại *</label>
                    <input style={inputStyle} value={formData.phone} onChange={e=>setFormData({...formData, phone: e.target.value})} placeholder="098..." />
                </div>
                <div>
                    <label style={labelStyle}>Email</label>
                    <input style={inputStyle} value={formData.email} onChange={e=>setFormData({...formData, email: e.target.value})} placeholder="email@example.com" />
                </div>
            </div>

            <div style={grid2Cols}>
                <div>
                    <label style={labelStyle}>Chuyên môn</label>
                    <select style={inputStyle} value={formData.specialization} onChange={e=>setFormData({...formData, specialization: e.target.value})}>
                        <option value="HSK 1-3">HSK 1-3 (Sơ cấp)</option>
                        <option value="HSK 4-5">HSK 4-5 (Trung cấp)</option>
                        <option value="HSK 6">HSK 6 (Cao cấp)</option>
                        <option value="TOCFL">TOCFL (Phồn thể)</option>
                        <option value="Giao Tiếp">Giao tiếp / Thương mại</option>
                    </select>
                </div>
                <div>
                    <label style={labelStyle}>Lương theo giờ (VNĐ)</label>
                    <input type="number" style={inputStyle} value={formData.hourly_rate} onChange={e=>setFormData({...formData, hourly_rate: e.target.value})} />
                </div>
            </div>

            <div style={grid2Cols}>
                {/* LOGIC MỚI: Chỉ hiện Dropdown Trạng thái khi đang SỬA */}
                {formData.id ? (
                    <div>
                        <label style={labelStyle}>Trạng thái hoạt động</label>
                        <select style={inputStyle} value={formData.status} onChange={e=>setFormData({...formData, status: e.target.value})}>
                            <option value="ACTIVE">🟢 Đang dạy (Active)</option>
                            <option value="ON_LEAVE">🟡 Tạm nghỉ (On Leave)</option>
                            <option value="INACTIVE">🔴 Ngưng hợp tác (Inactive)</option>
                        </select>
                    </div>
                ) : (
                    <div>
                        <label style={labelStyle}>Trạng thái</label>
                        <div style={{padding: '8px 12px', background: '#f0fdf4', color: '#15803d', borderRadius: 6, fontSize: 13, fontWeight: 600, border: '1px solid #bbf7d0'}}>
                            ✨ Mặc định: Đang hoạt động (Active)
                        </div>
                    </div>
                )}
                
                 <div>
                    <label style={labelStyle}>Ngân hàng (Trả lương)</label>
                    <input style={inputStyle} placeholder="Tên NH + STK" value={formData.bank_name} onChange={e=>setFormData({...formData, bank_name: e.target.value})} />
                </div>
            </div>

            <div style={{marginTop: 10}}>
                <label style={labelStyle}>Giới thiệu ngắn (Bio)</label>
                <textarea style={{...inputStyle, height: 60}} placeholder="Kinh nghiệm, bằng cấp..." value={formData.bio} onChange={e=>setFormData({...formData, bio: e.target.value})} />
            </div>

            <div style={{ marginTop: 20, textAlign: "right", display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                <button onClick={() => setShowModal(false)} style={btnCancel}>Hủy bỏ</button>
                <button onClick={handleSave} style={btnPrimary}>Lưu thông tin</button>
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL 2: XEM LỊCH SỬ DẠY --- */}
      {showHistoryModal && (
          <div style={overlayStyle}>
              <div style={modalStyle}>
                  <h3 style={{marginTop: 0}}>Lớp học phụ trách: {selectedInstructorName}</h3>
                  <p style={{fontSize: 13, color: '#666', marginBottom: 15}}>Danh sách các lớp giảng viên này đang dạy hoặc đã dạy.</p>
                  
                  <div style={{maxHeight: 300, overflowY: 'auto', border: '1px solid #eee', borderRadius: 8}}>
                    <table style={{width: '100%', borderCollapse: 'collapse'}}>
                        <thead>
                            <tr style={{background: '#f9fafb', fontSize: 13}}>
                                <th style={{padding: 8, textAlign:'left'}}>Tên lớp</th>
                                <th style={{padding: 8, textAlign:'left'}}>Level</th>
                                <th style={{padding: 8, textAlign:'left'}}>Thời gian</th>
                                <th style={{padding: 8, textAlign:'left'}}>Ngày gán</th>
                            </tr>
                        </thead>
                        <tbody>
                            {teachingHistory.length === 0 ? <tr><td colSpan="4" style={{padding: 15, textAlign:'center', color: '#888'}}>Chưa có lớp nào.</td></tr> : 
                            teachingHistory.map((c, idx) => (
                                <tr key={idx} style={{borderBottom: '1px solid #f0f0f0'}}>
                                    <td style={{padding: 8, fontSize: 14, fontWeight: 500}}>{c.name}</td>
                                    <td style={{padding: 8, fontSize: 13}}>{c.level}</td>
                                    <td style={{padding: 8, fontSize: 13}}>
                                        {new Date(c.start_date).toLocaleDateString('vi-VN')} - {new Date(c.end_date).toLocaleDateString('vi-VN')}
                                    </td>
                                    <td style={{padding: 8, fontSize: 13, color: '#666'}}>{new Date(c.assigned_at).toLocaleDateString('vi-VN')}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                  </div>

                  <div style={{marginTop: 20, textAlign: 'right'}}>
                      <button onClick={()=>setShowHistoryModal(false)} style={btnCancel}>Đóng</button>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
}

// --- CSS STYLES ---
const thStyle = { padding: "12px 16px", color: "#4b5563", fontWeight: 600, fontSize: 13 };
const tdStyle = { padding: "12px 16px", borderBottom: "1px solid #f3f4f6" };
const btnPrimary = { background: "#4f46e5", color: "#fff", border: "none", padding: "8px 16px", borderRadius: 6, cursor: "pointer", fontWeight: 500 };
const btnCancel = { background: "#fff", border: "1px solid #d1d5db", color: "#374151", padding: "8px 16px", borderRadius: 6, cursor: "pointer", fontWeight: 500 };
const btnAction = { background: "none", border: "none", cursor: "pointer", fontSize: 13, fontWeight: 500, color: "#4b5563" };
const overlayStyle = { position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.5)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1000 };
const modalStyle = { background: "#fff", padding: 24, borderRadius: 12, width: 600, maxWidth: "95%", boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1)" };
const grid2Cols = { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 12 };
const labelStyle = { display: "block", marginBottom: 6, fontSize: 13, fontWeight: 500, color: "#374151" };
const inputStyle = { width: "100%", padding: "8px 12px", borderRadius: 6, border: "1px solid #d1d5db", fontSize: 14, boxSizing: "border-box" };