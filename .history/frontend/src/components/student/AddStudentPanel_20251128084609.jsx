// frontend/src/components/student/AddStudentPanel.jsx
import { useEffect, useState } from "react";
import {
  createStudentWithAccount,
  searchStudents,
  updateStudent,
} from "../../api/studentApi";

export default function AddStudentPanel() {
  // Form thêm mới + cấp tài khoản
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("student2");
  const [password, setPassword] = useState("pass12345");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [level, setLevel] = useState("");
  const [note, setNote] = useState("");

  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  // --- Phần tìm kiếm + danh sách + cập nhật ---
  const [searchKeyword, setSearchKeyword] = useState("");
  const [students, setStudents] = useState([]);
  const [loadingList, setLoadingList] = useState(false);
  const [editId, setEditId] = useState(null);
  const [editForm, setEditForm] = useState({
    full_name: "",
    phone: "",
    email: "",
    level: "",
    note: "",
  });
  const [listError, setListError] = useState("");

  // ----------------- THÊM HỌC VIÊN MỚI + CẤP TK -----------------
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setSaving(true);
    try {
      await createStudentWithAccount({
        full_name: fullName,
        username,
        password,
        phone,
        email,
        level,
        note,
      });

      setMessage("Đã thêm học viên mới và cấp tài khoản thành công.");

      // Reset form
      setFullName("");
      setUsername("student2");
      setPassword("pass12345");
      setPhone("");
      setEmail("");
      setLevel("");
      setNote("");

      // Refresh danh sách (để thấy học viên mới luôn)
      await handleSearch();
    } catch (err) {
      console.error(err);
      setMessage(err.message || "Có lỗi khi lưu học viên.");
    } finally {
      setSaving(false);
    }
  };

  // ----------------- TÌM KIẾM HỌC VIÊN -----------------
  const handleSearch = async () => {
    setLoadingList(true);
    setListError("");
    try {
      const data = await searchStudents(searchKeyword);
      setStudents(data || []);
    } catch (err) {
      console.error(err);
      setListError(err.message || "Không tải được danh sách học viên.");
    } finally {
      setLoadingList(false);
    }
  };

  // load danh sách lần đầu (không filter)
  useEffect(() => {
    handleSearch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ----------------- BẮT ĐẦU SỬA 1 HỌC VIÊN -----------------
  const startEdit = (student) => {
    setEditId(student.id);
    setEditForm({
      full_name: student.full_name || "",
      phone: student.phone || "",
      email: student.email || "",
      level: student.level || "",
      note: student.note || "",
    });
  };

  const cancelEdit = () => {
    setEditId(null);
  };

  const handleEditChange = (field, value) => {
    setEditForm((prev) => ({ ...prev, [field]: value }));
  };

  const saveEdit = async () => {
    if (!editId) return;
    try {
      await updateStudent(editId, editForm);
      // Cập nhật lại trong danh sách hiện tại
      setStudents((prev) =>
        prev.map((s) =>
          s.id === editId ? { ...s, ...editForm } : s
        )
      );
      setEditId(null);
    } catch (err) {
      alert(err.message || "Lỗi khi cập nhật học viên");
    }
  };

  // ----------------- UI -----------------
  const cardStyle = {
    padding: 24,
    borderRadius: 16,
    background: "#fff",
    boxShadow: "0 8px 24px rgba(15, 23, 42, 0.08)",
    maxWidth: 900,
    margin: "0 auto",
  };

  const inputStyle = {
    width: "100%",
    padding: "10px 12px",
    borderRadius: 10,
    border: "1px solid #e5e7eb",
    fontSize: 14,
  };

  const labelStyle = { fontSize: 13, fontWeight: 600, marginBottom: 6 };

  const tableStyle = {
    width: "100%",
    borderCollapse: "collapse",
    background: "#fff",
    borderRadius: 12,
    overflow: "hidden",
    border: "1px solid #e5e7eb",
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

  return (
    <div style={{ marginTop: 24 }}>
      {/* KHỐI THÊM HỌC VIÊN MỚI + CẤP TK */}
      <div style={cardStyle}>
        <h2
          style={{
            fontSize: 22,
            fontWeight: 700,
            marginBottom: 4,
          }}
        >
          + Thêm học viên mới &amp; cấp tài khoản
        </h2>
        <p style={{ fontSize: 14, color: "#6b7280", marginBottom: 16 }}>
          Nhân viên lễ tân nhập thông tin học viên mới và cấp tài khoản đăng
          nhập ngay tại đây.
        </p>

        <form onSubmit={handleSubmit}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 16,
              marginBottom: 16,
            }}
          >
            <div>
              <div style={labelStyle}>Họ tên học viên *</div>
              <input
                style={inputStyle}
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="VD: Nguyễn Văn A"
                required
              />
            </div>

            <div>
              <div style={labelStyle}>Username đăng nhập *</div>
              <input
                style={inputStyle}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="VD: student2"
                required
              />
            </div>

            <div>
              <div style={labelStyle}>Số điện thoại</div>
              <input
                style={inputStyle}
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="VD: 0987 654 321"
              />
            </div>

            <div>
              <div style={labelStyle}>Mật khẩu *</div>
              <input
                style={inputStyle}
                type="text"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="VD: pass12345"
                required
              />
            </div>

            <div>
              <div style={labelStyle}>Email</div>
              <input
                style={inputStyle}
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="VD: abc@gmail.com"
              />
            </div>

            <div>
              <div style={labelStyle}>Trình độ / Level</div>
              <input
                style={inputStyle}
                value={level}
                onChange={(e) => setLevel(e.target.value)}
                placeholder="VD: HSK1, HSK2..."
              />
            </div>

            <div style={{ gridColumn: "1 / span 2" }}>
              <div style={labelStyle}>Ghi chú</div>
              <textarea
                style={{ ...inputStyle, minHeight: 60 }}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Ghi chú thêm (nếu có)..."
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={saving}
            style={{
              padding: "10px 20px",
              borderRadius: 999,
              border: "none",
              background:
                "linear-gradient(135deg, #6366f1 0%, #a855f7 50%, #ec4899 100%)",
              color: "#fff",
              fontSize: 14,
              fontWeight: 600,
              cursor: "pointer",
              boxShadow: "0 10px 25px rgba(129, 140, 248, 0.4)",
            }}
          >
            {saving ? "Đang lưu..." : "Lưu & cấp tài khoản"}
          </button>

          {message && (
            <p style={{ marginTop: 8, fontSize: 13, color: "#111827" }}>
              {message}
            </p>
          )}
        </form>
      </div>

      {/* KHỐI TÌM KIẾM + DANH SÁCH HỌC VIÊN */}
      <div style={{ ...cardStyle, marginTop: 32 }}>
        <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>
          🔍 Tìm kiếm & cập nhật thông tin học viên
        </h3>
        <p style={{ fontSize: 14, color: "#6b7280", marginBottom: 16 }}>
          Nhập từ khóa (họ tên, số điện thoại, email hoặc username) để tìm nhanh
          học viên và chỉnh sửa thông tin.
        </p>

        <div
          style={{
            display: "flex",
            gap: 12,
            marginBottom: 16,
            alignItems: "center",
          }}
        >
          <input
            style={{ ...inputStyle, maxWidth: 260 }}
            placeholder="VD: Nguyễn, 0987..., student1..."
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
          />
          <button
            type="button"
            onClick={handleSearch}
            disabled={loadingList}
            style={{
              padding: "9px 18px",
              borderRadius: 999,
              border: "none",
              background:
                "linear-gradient(135deg, #0ea5e9 0%, #2563eb 100%)",
              color: "#fff",
              fontSize: 14,
              fontWeight: 600,
              cursor: "pointer",
              boxShadow: "0 8px 20px rgba(56, 189, 248, 0.45)",
            }}
          >
            {loadingList ? "Đang tải..." : "Tìm kiếm"}
          </button>
        </div>

        {listError && (
          <p style={{ color: "red", fontSize: 13, marginBottom: 8 }}>
            {listError}
          </p>
        )}

        <table style={tableStyle}>
          <thead>
            <tr>
              <th style={thStyle}>STT</th>
              <th style={thStyle}>Họ tên</th>
              <th style={thStyle}>Username</th>
              <th style={thStyle}>SĐT</th>
              <th style={thStyle}>Email</th>
              <th style={thStyle}>Level</th>
              <th style={thStyle}>Ghi chú</th>
              <th style={thStyle}></th>
            </tr>
          </thead>
          <tbody>
            {students.map((s, idx) => {
              const isEditing = editId === s.id;
              return (
                <tr key={s.id}>
                  <td style={tdStyle}>{idx + 1}</td>
                  <td style={tdStyle}>
                    {isEditing ? (
                      <input
                        style={{ ...inputStyle, padding: 6 }}
                        value={editForm.full_name}
                        onChange={(e) =>
                          handleEditChange("full_name", e.target.value)
                        }
                      />
                    ) : (
                      s.full_name
                    )}
                  </td>
                  <td style={tdStyle}>{s.username || ""}</td>
                  <td style={tdStyle}>
                    {isEditing ? (
                      <input
                        style={{ ...inputStyle, padding: 6 }}
                        value={editForm.phone}
                        onChange={(e) =>
                          handleEditChange("phone", e.target.value)
                        }
                      />
                    ) : (
                      s.phone
                    )}
                  </td>
                  <td style={tdStyle}>
                    {isEditing ? (
                      <input
                        style={{ ...inputStyle, padding: 6 }}
                        value={editForm.email}
                        onChange={(e) =>
                          handleEditChange("email", e.target.value)
                        }
                      />
                    ) : (
                      s.email
                    )}
                  </td>
                  <td style={tdStyle}>
                    {isEditing ? (
                      <input
                        style={{ ...inputStyle, padding: 6 }}
                        value={editForm.level}
                        onChange={(e) =>
                          handleEditChange("level", e.target.value)
                        }
                      />
                    ) : (
                      s.level
                    )}
                  </td>
                  <td style={tdStyle}>
                    {isEditing ? (
                      <input
                        style={{ ...inputStyle, padding: 6 }}
                        value={editForm.note}
                        onChange={(e) =>
                          handleEditChange("note", e.target.value)
                        }
                      />
                    ) : (
                      s.note
                    )}
                  </td>
                  <td style={tdStyle}>
                    {isEditing ? (
                      <>
                        <button
                          type="button"
                          onClick={saveEdit}
                          style={{
                            padding: "4px 10px",
                            borderRadius: 999,
                            border: "none",
                            background: "#22c55e",
                            color: "#fff",
                            fontSize: 12,
                            fontWeight: 600,
                            marginRight: 6,
                          }}
                        >
                          Lưu
                        </button>
                        <button
                          type="button"
                          onClick={cancelEdit}
                          style={{
                            padding: "4px 10px",
                            borderRadius: 999,
                            border: "none",
                            background: "#9ca3af",
                            color: "#fff",
                            fontSize: 12,
                            fontWeight: 600,
                          }}
                        >
                          Hủy
                        </button>
                      </>
                    ) : (
                      <button
                        type="button"
                        onClick={() => startEdit(s)}
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
                        Sửa
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
            {students.length === 0 && !loadingList && (
              <tr>
                <td style={tdStyle} colSpan={8}>
                  Không có học viên nào phù hợp.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
