// frontend/src/components/student/AddStudentPanel.jsx
import { useState } from "react";

const API_BASE = "http://localhost:8080";

const EMPTY_FORM = {
  full_name: "",
  phone: "",
  email: "",
  level: "",
  status: "NEW",
  note: "",
};

export default function AddStudentPanel() {
  // Form tạo / sửa
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState(null); // null = tạo mới, khác null = đang sửa

  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  // Tìm kiếm học viên mới
  const [searchKeyword, setSearchKeyword] = useState("");
  const [searching, setSearching] = useState(false);
  const [studentsNew, setStudentsNew] = useState([]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const resetForm = () => {
    setForm(EMPTY_FORM);
    setEditingId(null);
    setMessage("");
  };

  // Lưu: tạo mới hoặc cập nhật
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage("");

    try {
      const payload = {
        full_name: form.full_name.trim(),
        phone: form.phone.trim(),
        email: form.email.trim(),
        level: form.level.trim(),
        status: form.status,
        note: form.note.trim(),
      };

      let url = `${API_BASE}/api/students`;
      let method = "POST";

      if (editingId) {
        url = `${API_BASE}/api/students/${editingId}`;
        method = "PUT";
      }

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (data.success) {
        setMessage(
          editingId
            ? "✅ Đã cập nhật thông tin học viên."
            : "✅ Đã lưu thông tin học viên (mới đăng ký)."
        );
        // Sau khi lưu, làm mới form, và load lại danh sách học viên NEW để cập nhật bảng
        setEditingId(null);
        setForm(EMPTY_FORM);
        await searchNewStudents();
      } else {
        setMessage(data.message || "❌ Lưu thông tin học viên thất bại.");
      }
    } catch (err) {
      console.error(err);
      setMessage("❌ Lỗi kết nối tới server khi lưu thông tin học viên.");
    } finally {
      setSaving(false);
    }
  };

  // Tìm kiếm học viên NEW
  const searchNewStudents = async () => {
    setSearching(true);
    setMessage("");

    try {
      const params = new URLSearchParams();
      params.append("status", "NEW");
      if (searchKeyword.trim()) {
        params.append("keyword", searchKeyword.trim());
      }

      const res = await fetch(
        `${API_BASE}/api/students?${params.toString()}`
      );
      const data = await res.json();

      if (data.success) {
        setStudentsNew(data.students || []);
        if ((data.students || []).length === 0) {
          setMessage("Không tìm thấy học viên mới (status = NEW) phù hợp.");
        }
      } else {
        setMessage(data.message || "Không lấy được danh sách học viên mới.");
      }
    } catch (err) {
      console.error(err);
      setMessage("❌ Lỗi kết nối khi tìm kiếm học viên mới.");
    } finally {
      setSearching(false);
    }
  };

  // Chọn 1 học viên NEW để chỉnh sửa
  const handlePickStudent = (s) => {
    setEditingId(s.id);
    setForm({
      full_name: s.full_name || "",
      phone: s.phone || "",
      email: s.email || "",
      level: s.level || "",
      status: s.status || "NEW",
      note: s.note || "",
    });
    setMessage(`Đang chỉnh sửa học viên: ${s.full_name} (${s.phone})`);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div
      style={{
        borderRadius: 24,
        backgroundColor: "#ffffff",
        boxShadow: "0 18px 40px rgba(15, 23, 42, 0.08)",
        padding: 28,
        border: "1px solid #eef0ff",
        marginBottom: 32,
      }}
    >
      {/* Tiêu đề + mô tả */}
      <h3
        style={{
          fontSize: 18,
          fontWeight: 700,
          marginBottom: 4,
          display: "flex",
          alignItems: "center",
          gap: 8,
        }}
      >
        <span role="img" aria-label="form">
          📝
        </span>
        Học viên đăng ký mới & lưu thông tin
      </h3>
      <p style={{ color: "#555", marginBottom: 16, lineHeight: 1.5 }}>
        Use case: <b>Học viên đăng ký mới</b> – nhân viên nhập thông tin cơ bản
        của học viên. Ban đầu trạng thái thường là{" "}
        <code>NEW – Mới đăng ký</code>. Sau này khi xếp lớp, bạn có thể sửa lại
        trạng thái sang <code>ACTIVE – Đang học</code>, và khi hoàn thành khoá
        học chuyển sang <code>COMPLETED – Đã học</code>.
      </p>

      {/* Thông báo */}
      {message && (
        <div
          style={{
            marginBottom: 12,
            padding: "10px 14px",
            borderRadius: 10,
            backgroundColor: "#ecfdf5",
            border: "1px solid #bbf7d0",
            color: "#166534",
            fontSize: 13,
          }}
        >
          {message}
        </div>
      )}

      {/* Form tạo / sửa */}
      <form onSubmit={handleSubmit}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1.5fr 1.5fr",
            gap: 16,
            marginBottom: 16,
          }}
        >
          {/* Họ tên */}
          <div style={{ gridColumn: "1 / span 2" }}>
            <label
              style={{
                display: "block",
                marginBottom: 6,
                fontSize: 14,
                fontWeight: 600,
              }}
            >
              Họ tên học viên *
            </label>
            <input
              type="text"
              name="full_name"
              required
              value={form.full_name}
              onChange={handleChange}
              placeholder="VD: Vũ Đức Thịnh"
              style={{
                width: "100%",
                padding: "10px 14px",
                borderRadius: 999,
                border: "1px solid #d0d7ff",
                fontSize: 14,
              }}
            />
          </div>

          {/* SĐT */}
          <div>
            <label
              style={{
                display: "block",
                marginBottom: 6,
                fontSize: 14,
                fontWeight: 600,
              }}
            >
              Số điện thoại
            </label>
            <input
              type="text"
              name="phone"
              value={form.phone}
              onChange={handleChange}
              placeholder="VD: 0912345678"
              style={{
                width: "100%",
                padding: "10px 14px",
                borderRadius: 999,
                border: "1px solid #d0d7ff",
                fontSize: 14,
              }}
            />
          </div>

          {/* Email */}
          <div>
            <label
              style={{
                display: "block",
                marginBottom: 6,
                fontSize: 14,
                fontWeight: 600,
              }}
            >
              Email
            </label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="vd: student@example.com"
              style={{
                width: "100%",
                padding: "10px 14px",
                borderRadius: 999,
                border: "1px solid #d0d7ff",
                fontSize: 14,
              }}
            />
          </div>

          {/* Level */}
          <div>
            <label
              style={{
                display: "block",
                marginBottom: 6,
                fontSize: 14,
                fontWeight: 600,
              }}
            >
              Level hiện tại
            </label>
            <input
              type="text"
              name="level"
              value={form.level}
              onChange={handleChange}
              placeholder="VD: HSK1, HSK2..."
              style={{
                width: "100%",
                padding: "10px 14px",
                borderRadius: 999,
                border: "1px solid #d0d7ff",
                fontSize: 14,
              }}
            />
          </div>

          {/* Trạng thái */}
          <div>
            <label
              style={{
                display: "block",
                marginBottom: 6,
                fontSize: 14,
                fontWeight: 600,
              }}
            >
              Trạng thái
            </label>
            <select
              name="status"
              value={form.status}
              onChange={handleChange}
              style={{
                width: "100%",
                padding: "10px 14px",
                borderRadius: 999,
                border: "1px solid #d0d7ff",
                fontSize: 14,
                backgroundColor: "#fff",
              }}
            >
              <option value="NEW">NEW – Mới đăng ký</option>
              <option value="ACTIVE">ACTIVE – Đang học</option>
              <option value="PAUSED">PAUSED – Tạm dừng</option>
              <option value="COMPLETED">COMPLETED – Đã học xong</option>
            </select>
          </div>
        </div>

        {/* Ghi chú */}
        <div style={{ marginBottom: 16 }}>
          <label
            style={{
              display: "block",
              marginBottom: 6,
              fontSize: 14,
              fontWeight: 600,
            }}
          >
            Ghi chú
          </label>
          <textarea
            name="note"
            value={form.note}
            onChange={handleChange}
            rows={3}
            placeholder="Ví dụ: nguồn Facebook, bạn giới thiệu, nhu cầu học..."
            style={{
              width: "100%",
              padding: "10px 14px",
              borderRadius: 16,
              border: "1px solid #d0d7ff",
              fontSize: 14,
              resize: "vertical",
            }}
          />
        </div>

        {/* Nút lưu + reset */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 12,
          }}
        >
          <button
            type="button"
            onClick={resetForm}
            style={{
              padding: "10px 18px",
              borderRadius: 999,
              border: "1px solid #e5e7eb",
              backgroundColor: "#f9fafb",
              fontSize: 14,
              cursor: "pointer",
            }}
          >
            Làm mới form
          </button>

          <button
            type="submit"
            disabled={saving}
            style={{
              padding: "10px 24px",
              borderRadius: 999,
              border: "none",
              background:
                "linear-gradient(135deg, #ff6cab 0%, #ff9770 50%, #ff758c 100%)",
              color: "#fff",
              fontWeight: 600,
              fontSize: 14,
              cursor: "pointer",
              boxShadow: "0 10px 20px rgba(249, 115, 129, 0.35)",
              opacity: saving ? 0.7 : 1,
            }}
          >
            {editingId ? "Cập nhật thông tin học viên" : "Lưu thông tin học viên"}
          </button>
        </div>
      </form>

      {/* --- KHU TÌM KIẾM HỌC VIÊN MỚI (NEW) --- */}
      <div style={{ marginTop: 28, borderTop: "1px dashed #e5e7eb", paddingTop: 20 }}>
        <h4
          style={{
            fontSize: 15,
            fontWeight: 700,
            marginBottom: 8,
          }}
        >
          🔍 Tìm kiếm & chỉnh sửa học viên mới (status = NEW)
        </h4>
        <p style={{ fontSize: 13, color: "#6b7280", marginBottom: 12 }}>
          Nhập họ tên, số điện thoại hoặc email để tìm các học viên mới đăng ký.
          Chọn nút <b>Sửa</b> để đổ dữ liệu lên form phía trên.
        </p>

        <div
          style={{
            display: "flex",
            gap: 12,
            marginBottom: 14,
            maxWidth: 520,
          }}
        >
          <input
            type="text"
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            placeholder="VD: Nguyễn, 0987..., @gmail.com..."
            style={{
              flex: 1,
              padding: "8px 12px",
              borderRadius: 999,
              border: "1px solid #d1d5db",
              fontSize: 13,
            }}
          />
          <button
            type="button"
            onClick={searchNewStudents}
            disabled={searching}
            style={{
              padding: "8px 18px",
              borderRadius: 999,
              border: "none",
              backgroundColor: "#2563eb",
              color: "#fff",
              fontSize: 13,
              fontWeight: 600,
              cursor: "pointer",
              opacity: searching ? 0.8 : 1,
            }}
          >
            Tìm học viên mới
          </button>
        </div>

        {studentsNew.length > 0 && (
          <div
            style={{
              borderRadius: 16,
              border: "1px solid #e5e7eb",
              overflow: "hidden",
            }}
          >
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                fontSize: 13,
              }}
            >
              <thead>
                <tr style={{ backgroundColor: "#f9fafb" }}>
                  <th style={{ padding: "8px 10px", textAlign: "left" }}>STT</th>
                  <th style={{ padding: "8px 10px", textAlign: "left" }}>Họ tên</th>
                  <th style={{ padding: "8px 10px", textAlign: "left" }}>SĐT</th>
                  <th style={{ padding: "8px 10px", textAlign: "left" }}>Email</th>
                  <th style={{ padding: "8px 10px", textAlign: "left" }}>Level</th>
                  <th style={{ padding: "8px 10px", textAlign: "left" }}>Sửa</th>
                </tr>
              </thead>
              <tbody>
                {studentsNew.map((s, idx) => (
                  <tr key={s.id}>
                    <td style={{ padding: "8px 10px", borderTop: "1px solid #f3f4f6" }}>
                      {idx + 1}
                    </td>
                    <td style={{ padding: "8px 10px", borderTop: "1px solid #f3f4f6" }}>
                      {s.full_name}
                    </td>
                    <td style={{ padding: "8px 10px", borderTop: "1px solid #f3f4f6" }}>
                      {s.phone}
                    </td>
                    <td style={{ padding: "8px 10px", borderTop: "1px solid #f3f4f6" }}>
                      {s.email}
                    </td>
                    <td style={{ padding: "8px 10px", borderTop: "1px solid #f3f4f6" }}>
                      {s.level}
                    </td>
                    <td style={{ padding: "8px 10px", borderTop: "1px solid #f3f4f6" }}>
                      <button
                        type="button"
                        onClick={() => handlePickStudent(s)}
                        style={{
                          padding: "4px 12px",
                          borderRadius: 999,
                          border: "none",
                          backgroundColor: "#f97316",
                          color: "#fff",
                          fontWeight: 600,
                          cursor: "pointer",
                        }}
                      >
                        Sửa
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
