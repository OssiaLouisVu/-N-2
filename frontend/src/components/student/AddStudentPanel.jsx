// src/components/student/AddStudentPanel.jsx
import { useState, useEffect } from "react";
import { createStudent, searchStudents, updateStudent, assignSchedule } from "../../api/studentApi";
import StudentSearchBar from "./StudentSearchBar";

export default function AddStudentPanel({
  onGlobalMessage,
  onRefreshAll,
  refreshToken,
}) {
  // Form state
  const [editingId, setEditingId] = useState(null);
  const [providedId, setProvidedId] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [level, setLevel] = useState("");
  const [note, setNote] = useState("");
  const [status, setStatus] = useState("NEW");

  // List NEW students
  const [searchKeyword, setSearchKeyword] = useState("");
  const [newStudents, setNewStudents] = useState([]);
  const [localMessage, setLocalMessage] = useState("");

  // Reload list khi refreshToken thay đổi
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
    setProvidedId("");
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

    if (!email.trim()) {
      showMessage("Email là bắt buộc (để gửi thông báo cho học viên).");
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      showMessage("Email không hợp lệ. Vui lòng nhập email đúng định dạng.");
      return;
    }

    // Require staff to provide ID on the app
    if (!editingId && (!providedId || !String(providedId).trim())) {
      showMessage('Vui lòng nhập MÃ học viên (ID) trước khi lưu.');
      return;
    }

    const payload = {
      // include id if provided
      ...(providedId ? { id: Number(providedId) } : {}),
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

      // If backend returned username/tempPassword show it to staff
      if (data.username && data.tempPassword) {
        showMessage(`Đã lưu học viên. Tài khoản: ${data.username} / Mật khẩu tạm: ${data.tempPassword}`);
      } else {
        showMessage(
          editingId ? "Đã cập nhật thông tin học viên." : "Đã lưu thông tin học viên (mới đăng ký)."
        );
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
    setProvidedId(st.id);
    setFullName(st.full_name || "");
    setPhone(st.phone || "");
    setEmail(st.email || "");
    setLevel(st.level || "");
    setNote(st.note || "");
    setStatus(st.status || "NEW");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
const handleDelete = async (id) => {
  if (!window.confirm("Bạn có chắc muốn xóa học viên này không?")) return;

  try {
    const res = await fetch(`http://localhost:8080/api/students/delete/${id}`, {
      method: "DELETE",
    });
    const data = await res.json();

    if (data.success) {
      showMessage("Đã xóa học viên thành công.");
      await loadNewStudents();
      if (onRefreshAll) onRefreshAll();
    } else {
      showMessage(data.message || "Không thể xóa học viên.");
    }
  } catch (err) {
    console.error(err);
    showMessage("Lỗi kết nối khi xóa học viên.");
  }
};

  const handleAssign = async (st) => {
    if (!window.confirm(`Gán lớp cho "${st.full_name}" và chuyển sang ACTIVE?`)) return;

    try {
      const data = await assignSchedule({ studentId: st.id });
      if (!data || !data.success) {
        showMessage((data && data.message) || "Lỗi server khi gán lớp.");
        return;
      }

      showMessage(`Đã gán lớp và chuyển "${st.full_name}" sang ACTIVE.`);
      await loadNewStudents();
      if (onRefreshAll) onRefreshAll();
    } catch (err) {
      console.error(err);
      showMessage("Lỗi kết nối khi gán lớp cho học viên.");
    }
  };

  const handleNewForm = () => {
    resetForm();
    setLocalMessage("");
  };

  const [form, setForm] = useState({
    full_name: "",
    phone: "",
    email: "",
    level: "",
    note: "",
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmitNew = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await createStudent(form);
      onGlobalMessage("Thêm học viên mới thành công!");
      setForm({
        full_name: "",
        phone: "",
        email: "",
        level: "",
        note: "",
      });
      onRefreshAll();
      await loadNewStudents();
    } catch (err) {
      onGlobalMessage(
        "Lỗi: " + (err.response?.data?.error || "Không thể thêm học viên")
      );
    }
    setLoading(false);
  };

  return (
    <>
      {/* --- KHỐI 1: Học viên đăng ký mới & lưu thông tin --- */}
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
          <span role="img" aria-label="memo">
            📝
          </span>
          Học viên đăng ký mới & lưu thông tin
        </h3>
        

        {localMessage && (
          <div
            style={{
              marginBottom: 16,
              padding: "10px 14px",
              borderRadius: 10,
              backgroundColor: "#f0fff2",
              borderLeft: "4px solid #52c41a",
              color: "#237804",
              fontSize: 13,
            }}
          >
            {localMessage}
          </div>
        )}

        {/* Form 2 cột */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 16,
            marginBottom: 12,
          }}
        >
          {/* Họ tên */}
          <div>
            <label style={{ fontSize: 13, fontWeight: 600 }}>
              Họ tên học viên *
            </label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="VD: Nguyễn Văn A"
              style={{
                marginTop: 6,
                width: "100%",
                padding: "10px 12px",
                borderRadius: 10,
                border: "1px solid #e0e0e0",
                outline: "none",
              }}
            />
          </div>

          {/* Email */}
          {/* ID (Mã học viên) */}
          <div>
            <label style={{ fontSize: 13, fontWeight: 600 }}>Mã học viên (ID)</label>
            <input
              type="text"
              value={providedId}
              onChange={(e) => setProvidedId(e.target.value)}
              placeholder="Nhập ID (ví dụ 555)"
              style={{
                marginTop: 6,
                width: "100%",
                padding: "10px 12px",
                borderRadius: 10,
                border: "1px solid #e0e0e0",
                outline: "none",
              }}
              disabled={!!editingId}
            />
          </div>

          <div>
            <label style={{ fontSize: 13, fontWeight: 600 }}>
              Email 
              <span style={{ color: '#ef4444', marginLeft: 4 }}>*</span>
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="vd: student@example.com"
              required
              style={{
                marginTop: 6,
                width: "100%",
                padding: "10px 12px",
                borderRadius: 10,
                border: email.trim() ? "1px solid #10b981" : "2px solid #ef4444",
                outline: "none",
                background: email.trim() ? "#f0fdf4" : "#fef2f2"
              }}
            />
          </div>

          {/* SĐT */}
          <div>
            <label style={{ fontSize: 13, fontWeight: 600 }}>Số điện thoại</label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="VD: 0987..."
              style={{
                marginTop: 6,
                width: "100%",
                padding: "10px 12px",
                borderRadius: 10,
                border: "1px solid #e0e0e0",
                outline: "none",
              }}
            />
          </div>

          {/* Status */}
          <div>
            <label style={{ fontSize: 13, fontWeight: 600 }}>Trạng thái</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              style={{
                marginTop: 6,
                width: "100%",
                padding: "10px 12px",
                borderRadius: 10,
                border: "1px solid #e0e0e0",
                outline: "none",
              }}
            >
              <option value="NEW">NEW – Mới đăng ký</option>
              <option value="ACTIVE">ACTIVE – Đang học</option>
              <option value="COMPLETED">COMPLETED – Đã học</option>
            </select>
          </div>

          {/* Level */}
          <div>
            <label style={{ fontSize: 13, fontWeight: 600 }}>Level hiện tại</label>
            <input
              type="text"
              value={level}
              onChange={(e) => setLevel(e.target.value)}
              placeholder="VD: HSK1, HSK2..."
              style={{
                marginTop: 6,
                width: "100%",
                padding: "10px 12px",
                borderRadius: 10,
                border: "1px solid #e0e0e0",
                outline: "none",
              }}
            />
          </div>
        </div>

        {/* Ghi chú */}
        <div style={{ marginBottom: 12 }}>
          <label style={{ fontSize: 13, fontWeight: 600 }}>Ghi chú</label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="VD: nguồn Facebook, bạn giới thiệu, nhu cầu học..."
            rows={3}
            style={{
              marginTop: 6,
              width: "100%",
              padding: "10px 12px",
              borderRadius: 12,
              border: "1px solid #e0e0e0",
              outline: "none",
              resize: "vertical",
            }}
          />
        </div>

        {/* Buttons */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginTop: 8,
          }}
        >
          <button
            type="button"
            onClick={handleNewForm}
            style={{
              padding: "8px 16px",
              borderRadius: 999,
              border: "1px solid #ddd",
              backgroundColor: "#fff",
              cursor: "pointer",
              fontSize: 13,
            }}
          >
            Làm mới form
          </button>

          <button
            type="button"
            onClick={handleSubmit}
            style={{
              padding: "10px 24px",
              borderRadius: 999,
              border: "none",
              background:
                "linear-gradient(135deg, #ff7a7a 0%, #ff4d88 100%)",
              color: "#fff",
              cursor: "pointer",
              fontWeight: 600,
            }}
          >
            {editingId ? "Cập nhật thông tin học viên" : "Lưu thông tin học viên"}
          </button>
        </div>
      </section>

      {/* --- KHỐI 2: Tìm kiếm & chỉnh sửa học viên mới --- */}
      <section
        style={{
          borderRadius: 20,
          border: "1px solid #f3f3f3",
          padding: 20,
          marginBottom: 32,
          background: "#fff",
        }}
      >
        <h4
          style={{
            fontSize: 16,
            fontWeight: 600,
            marginBottom: 8,
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          <span role="img" aria-label="search">
            🔍
          </span>
          Tìm kiếm & chỉnh sửa học viên mới (status = NEW)
        </h4>
        

        <div
          style={{
            display: "flex",
            gap: 12,
            marginBottom: 12,
          }}
        >
          <input
            type="text"
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            placeholder="VD: Nguyễn, 0987..., @gmail.com..."
            style={{
              flex: 1,
              padding: "10px 12px",
              borderRadius: 999,
              border: "1px solid #e0e0e0",
              outline: "none",
            }}
          />
          <button
            type="button"
            onClick={handleSearchNew}
            style={{
              padding: "10px 20px",
              borderRadius: 999,
              border: "none",
              background:
                "linear-gradient(135deg, #1890ff 0%, #40a9ff 100%)",
              color: "#fff",
              cursor: "pointer",
              fontWeight: 600,
              whiteSpace: "nowrap",
            }}
          >
            Tìm học viên mới
          </button>
        </div>

        {/* Bảng kết quả */}
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
                  <th style={thStyle}>Xóa</th>
                  <th style={thStyle}>Sửa</th>
                </tr>
            </thead>
            <tbody>
              {newStudents.length === 0 ? (
                <tr>
                  
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
  <button
    type="button"
    onClick={() => handleDelete(st.id)}
    style={{
      padding: "6px 12px",
      borderRadius: 999,
      border: "none",
      background: "#ef4444",
      color: "#fff",
      cursor: "pointer",
      fontSize: 13,
    }}
  >
    Xóa
  </button>
</td>

                    <td style={tdStyle}>
                      <button
                        type="button"
                        onClick={() => handleEditFromList(st)}
                        style={{
                          padding: "6px 12px",
                          borderRadius: 999,
                          border: "none",
                          background: "#fa8c16",
                          color: "#fff",
                          cursor: "pointer",
                          fontSize: 13,
                        }}
                      >
                        Sửa
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Duplicate lower student form removed: top form above already provides the same functionality */}
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
