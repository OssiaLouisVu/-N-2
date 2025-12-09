import { useState, useEffect } from "react";
import { createStudent, searchStudents, updateStudent } from "../../api/studentApi";
import { assignStudentToClass } from '../../api/classApi';

export default function AddStudentPanel({ onGlobalMessage, onRefreshAll, refreshToken }) {
  // Edit / Save form (top)
  const [editingId, setEditingId] = useState(null);
  const [fullName, setFullName] = useState("");
  const [providedId, setProvidedId] = useState('');
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [autoClassId, setAutoClassId] = useState('');
  const [level, setLevel] = useState("");
  const [note, setNote] = useState("");
  const [status, setStatus] = useState("NEW");

  // NEW students list / search
  const [searchKeyword, setSearchKeyword] = useState("");
  const [newStudents, setNewStudents] = useState([]);
  const [localMessage, setLocalMessage] = useState("");

  // Add-new form (bottom)
  // (Removed duplicate bottom "Thêm học viên mới" form — use the main form above)

  useEffect(() => {
    loadNewStudents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshToken]);

  const showMessage = (msg) => {
    setLocalMessage(msg);
    if (onGlobalMessage) onGlobalMessage(msg);
  };

  const resetForm = () => {
    setEditingId(null);
    setFullName("");
    setPhone("");
    setEmail("");
    setLevel("");
    setNote("");
    setStatus("NEW");
  };

  const handleSubmit = async () => {
    setLocalMessage("");
    if (!fullName.trim() || !phone.trim()) {
      showMessage("Họ tên và SĐT là bắt buộc.");
      return;
    }

    const payload = {
      full_name: fullName.trim(),
      phone: phone.trim(),
      email: email.trim() || null,
      level: level.trim() || null,
      note: note.trim() || null,
      status,
    };

    try {
      let data;
      if (editingId) {
        data = await updateStudent(editingId, payload);
      } else {
        data = await createStudent(payload);
      }

      if (!data || !data.success) {
        showMessage((data && data.message) || "Lỗi server khi lưu học viên.");
        return;
      }

      // if backend returns credentials, show to staff
      if (data.username && data.tempPassword) {
        const emailSent = data.emailResult && data.emailResult.sent;
        const emailMsg = data.emailResult ? (emailSent ? 'Email gửi thành công' : `Email lỗi: ${data.emailResult.message || 'Không gửi được'}`) : 'Không gửi email';
        showMessage(`Đã lưu học viên. ID: ${data.id || ''} — Tài khoản: ${data.username} / Mật khẩu tạm: ${data.tempPassword}. ${emailMsg}`);
      } else {
        showMessage(editingId ? "Đã cập nhật thông tin học viên." : "Đã lưu thông tin học viên (mới đăng ký).");
      }

      resetForm();
      await loadNewStudents();
      if (onRefreshAll) onRefreshAll();
    } catch (err) {
      console.error(err);
      showMessage("Lỗi kết nối khi lưu thông tin học viên.");
    }
  };

  const loadNewStudents = async (statusToUse = "NEW") => {
    try {
      const data = await searchStudents({ status: statusToUse, keyword: searchKeyword.trim() });
      if (!data || !data.success) {
        setLocalMessage((data && data.message) || "Lỗi server khi tải học viên mới.");
        return;
      }
      setNewStudents(data.students || []);
    } catch (err) {
      console.error(err);
      setLocalMessage("Lỗi kết nối khi tải học viên mới.");
    }
  };

  const handleSearchNew = async () => {
    await loadNewStudents("NEW");
  };

  const handleEditFromList = (st) => {
    setEditingId(st.id);
    setFullName(st.full_name || "");
    setPhone(st.phone || "");
    setEmail(st.email || "");
    setLevel(st.level || "");
    setNote(st.note || "");
    setStatus(st.status || "NEW");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };


  return (
    <>
      {/* --- KHỐI 1: Học viên đăng ký mới & lưu thông tin --- */}
      <section style={{ borderRadius: 20, border: "1px solid #f3f3f3", padding: 20, marginBottom: 32, background: "#fff" }}>
        <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8, display: "flex", alignItems: "center", gap: 8 }}>
          <span role="img" aria-label="memo">📝</span>
          Học viên đăng ký mới & lưu thông tin
        </h3>
        <p style={{ fontSize: 13, color: "#555", marginBottom: 16 }}>
          Use case: <b>Học viên đăng ký mới</b> – nhân viên nhập thông tin cơ bản của học viên. Ban đầu trạng thái thường là <b>NEW – Mới đăng ký</b>. Sau này khi xếp lớp, bạn có thể sửa lại trạng thái sang <b>ACTIVE – Đang học</b>, và khi hoàn thành khoá học chuyển sang <b>COMPLETED – Đã học</b>.
        </p>

        {localMessage && (
          <div style={{ marginBottom: 16, padding: "10px 14px", borderRadius: 10, backgroundColor: "#f0fff2", borderLeft: "4px solid #52c41a", color: "#237804", fontSize: 13 }}>
            {localMessage}
          </div>
        )}

        {/* Form 2 cột */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 12 }}>
          <div>
            <label style={{ fontSize: 13, fontWeight: 600 }}>ID (nếu muốn tự đặt)</label>
            <input value={providedId} onChange={(e) => setProvidedId(e.target.value)} placeholder="VD: 123 (nếu muốn)" style={{ marginTop: 6, width: "100%", padding: "10px 12px", borderRadius: 10, border: "1px solid #e0e0e0", outline: "none" }} />
          </div>
          <div>
            <label style={{ fontSize: 13, fontWeight: 600 }}>Họ tên học viên *</label>
            <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="VD: Nguyễn Văn A" style={{ marginTop: 6, width: "100%", padding: "10px 12px", borderRadius: 10, border: "1px solid #e0e0e0", outline: "none" }} />
          </div>

          <div>
            <label style={{ fontSize: 13, fontWeight: 600 }}>Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="vd: student@example.com" style={{ marginTop: 6, width: "100%", padding: "10px 12px", borderRadius: 10, border: "1px solid #e0e0e0", outline: "none" }} />
          </div>

          <div>
            <label style={{ fontSize: 13, fontWeight: 600 }}>Số điện thoại</label>
            <input type="text" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="VD: 0987..." style={{ marginTop: 6, width: "100%", padding: "10px 12px", borderRadius: 10, border: "1px solid #e0e0e0", outline: "none" }} />
          </div>

          <div>
            <label style={{ fontSize: 13, fontWeight: 600 }}>Trạng thái</label>
            <select value={status} onChange={(e) => setStatus(e.target.value)} style={{ marginTop: 6, width: "100%", padding: "10px 12px", borderRadius: 10, border: "1px solid #e0e0e0", outline: "none" }}>
              <option value="NEW">NEW – Mới đăng ký</option>
              <option value="ACTIVE">ACTIVE – Đang học</option>
              <option value="COMPLETED">COMPLETED – Đã học</option>
            </select>
          </div>

          <div>
            <label style={{ fontSize: 13, fontWeight: 600 }}>Level hiện tại</label>
            <input type="text" value={level} onChange={(e) => setLevel(e.target.value)} placeholder="VD: HSK1, HSK2..." style={{ marginTop: 6, width: "100%", padding: "10px 12px", borderRadius: 10, border: "1px solid #e0e0e0", outline: "none" }} />
          </div>
          <div>
            <label style={{ fontSize: 13, fontWeight: 600 }}>Gán tự động vào lớp (Class ID, tuỳ chọn)</label>
            <input value={autoClassId} onChange={(e) => setAutoClassId(e.target.value)} placeholder="VD: 5 (nếu muốn gán ngay)" style={{ marginTop: 6, width: "100%", padding: "10px 12px", borderRadius: 10, border: "1px solid #e0e0e0", outline: "none" }} />
          </div>
        </div>

        <div style={{ marginBottom: 12 }}>
          <label style={{ fontSize: 13, fontWeight: 600 }}>Ghi chú</label>
          <textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="VD: nguồn Facebook, bạn giới thiệu, nhu cầu học..." rows={3} style={{ marginTop: 6, width: "100%", padding: "10px 12px", borderRadius: 12, border: "1px solid #e0e0e0", outline: "none", resize: "vertical" }} />
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 8 }}>
          <button type="button" onClick={resetForm} style={{ padding: "8px 16px", borderRadius: 999, border: "1px solid #ddd", backgroundColor: "#fff", cursor: "pointer", fontSize: 13 }}>
            Làm mới form
          </button>

          <button type="button" onClick={handleSubmit} style={{ padding: "10px 24px", borderRadius: 999, border: "none", background: "linear-gradient(135deg, #ff7a7a 0%, #ff4d88 100%)", color: "#fff", cursor: "pointer", fontWeight: 600 }}>
            {editingId ? "Cập nhật thông tin học viên" : "Lưu thông tin học viên"}
          </button>
        </div>
      </section>

      {/* --- KHỐI 2: Tìm kiếm & chỉnh sửa học viên mới --- */}
      <section style={{ borderRadius: 20, border: "1px solid #f3f3f3", padding: 20, marginBottom: 32, background: "#fff" }}>
        <h4 style={{ fontSize: 16, fontWeight: 600, marginBottom: 8, display: "flex", alignItems: "center", gap: 8 }}>
          <span role="img" aria-label="search">🔍</span>
          Tìm kiếm & chỉnh sửa học viên mới (status = NEW)
        </h4>
        <p style={{ fontSize: 13, color: "#555", marginBottom: 12 }}>Nhập họ tên, số điện thoại hoặc email để tìm các học viên mới đăng ký. Chọn nút <b>Sửa</b> để đổ dữ liệu lên form phía trên.</p>

        <div style={{ display: "flex", gap: 12, marginBottom: 12 }}>
          <input type="text" value={searchKeyword} onChange={(e) => setSearchKeyword(e.target.value)} placeholder="VD: Nguyễn, 0987..., @gmail.com..." style={{ flex: 1, padding: "10px 12px", borderRadius: 999, border: "1px solid #e0e0e0", outline: "none" }} />
          <button type="button" onClick={handleSearchNew} style={{ padding: "10px 20px", borderRadius: 999, border: "none", background: "linear-gradient(135deg, #1890ff 0%, #40a9ff 100%)", color: "#fff", cursor: "pointer", fontWeight: 600, whiteSpace: "nowrap" }}>Tìm học viên mới</button>
        </div>

        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", background: "#fff" }}>
            <thead>
              <tr>
                <th style={thStyle}>STT</th>
                <th style={thStyle}>Họ tên</th>
                <th style={thStyle}>SĐT</th>
                <th style={thStyle}>Email</th>
                <th style={thStyle}>Level</th>
                <th style={thStyle}>Sửa</th>
              </tr>
            </thead>
            <tbody>
              {newStudents.length === 0 ? (
                <tr>
                  <td style={tdStyle} colSpan={6}>Không có học viên nào (NEW) phù hợp.</td>
                </tr>
              ) : (
                newStudents.map((st, idx) => (
                  <tr key={st.id}>
                    <td style={tdStyle}>{idx + 1}</td>
                    <td style={tdStyle}>{st.full_name}</td>
                    <td style={tdStyle}>{st.phone}</td>
                    <td style={tdStyle}>{st.email}</td>
                    <td style={tdStyle}>{st.level}</td>
                    <td style={tdStyle}>
                      <button type="button" onClick={() => handleEditFromList(st)} style={{ padding: "6px 12px", borderRadius: 999, border: "none", background: "#fa8c16", color: "#fff", cursor: "pointer", fontSize: 13 }}>Sửa</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Bottom duplicate form removed — use the main form above to create/update students */}
    </>
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
