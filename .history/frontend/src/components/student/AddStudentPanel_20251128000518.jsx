// src/components/student/AddStudentPanel.jsx
import { useState } from "react";
import { createStudent } from "../../api/studentApi";

export default function AddStudentPanel() {
  const [form, setForm] = useState({
    fullName: "",
    phone: "",
    email: "",
    level: "",
    note: "",
    username: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    try {
      setLoading(true);
      const res = await createStudent(form);
      setMessage(
        `✅ ${res.message}. Mã học viên: ${res.data.studentId}, userId: ${res.data.userId}`
      );
      setForm({
        fullName: "",
        phone: "",
        email: "",
        level: "",
        note: "",
        username: "",
        password: "",
      });
    } catch (err) {
      setMessage(`❌ ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ marginTop: 32 }}>
      <h2
        style={{
          fontSize: 20,
          fontWeight: 700,
          marginBottom: 12,
          color: "#111827",
        }}
      >
        ➕ Thêm học viên mới & cấp tài khoản
      </h2>

      <form
        onSubmit={onSubmit}
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
          gap: 16,
          background: "#ffffff",
          padding: 20,
          borderRadius: 12,
          boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
        }}
      >
        {/* Cột trái: thông tin học viên */}
        <div>
          <label style={{ fontSize: 13, fontWeight: 600 }}>
            Họ tên học viên *
          </label>
          <input
            name="fullName"
            value={form.fullName}
            onChange={onChange}
            required
            style={{
              width: "100%",
              padding: "8px 10px",
              borderRadius: 8,
              border: "1px solid #ddd",
              marginTop: 4,
            }}
          />

          <label
            style={{ marginTop: 10, display: "block", fontSize: 13, fontWeight: 600 }}
          >
            Số điện thoại
          </label>
          <input
            name="phone"
            value={form.phone}
            onChange={onChange}
            style={{
              width: "100%",
              padding: "8px 10px",
              borderRadius: 8,
              border: "1px solid #ddd",
              marginTop: 4,
            }}
          />

          <label
            style={{ marginTop: 10, display: "block", fontSize: 13, fontWeight: 600 }}
          >
            Email
          </label>
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={onChange}
            style={{
              width: "100%",
              padding: "8px 10px",
              borderRadius: 8,
              border: "1px solid #ddd",
              marginTop: 4,
            }}
          />

          <label
            style={{ marginTop: 10, display: "block", fontSize: 13, fontWeight: 600 }}
          >
            Trình độ / Level
          </label>
          <input
            name="level"
            value={form.level}
            onChange={onChange}
            placeholder="VD: HSK1, HSK2..."
            style={{
              width: "100%",
              padding: "8px 10px",
              borderRadius: 8,
              border: "1px solid #ddd",
              marginTop: 4,
            }}
          />
        </div>

        {/* Cột phải: tài khoản đăng nhập */}
        <div>
          <label style={{ fontSize: 13, fontWeight: 600 }}>
            Username đăng nhập *
          </label>
          <input
            name="username"
            value={form.username}
            onChange={onChange}
            required
            placeholder="VD: student2"
            style={{
              width: "100%",
              padding: "8px 10px",
              borderRadius: 8,
              border: "1px solid #ddd",
              marginTop: 4,
            }}
          />

          <label
            style={{ marginTop: 10, display: "block", fontSize: 13, fontWeight: 600 }}
          >
            Mật khẩu *
          </label>
          <input
            type="text"
            name="password"
            value={form.password}
            onChange={onChange}
            required
            placeholder="VD: pass12345"
            style={{
              width: "100%",
              padding: "8px 10px",
              borderRadius: 8,
              border: "1px solid #ddd",
              marginTop: 4,
            }}
          />

          <label
            style={{ marginTop: 10, display: "block", fontSize: 13, fontWeight: 600 }}
          >
            Ghi chú
          </label>
          <textarea
            name="note"
            value={form.note}
            onChange={onChange}
            rows={3}
            style={{
              width: "100%",
              padding: "8px 10px",
              borderRadius: 8,
              border: "1px solid #ddd",
              marginTop: 4,
            }}
          />
        </div>

        <div
          style={{
            gridColumn: "1 / -1",
            display: "flex",
            justifyContent: "flex-end",
            marginTop: 4,
          }}
        >
          <button
            type="submit"
            disabled={loading}
            style={{
              padding: "10px 20px",
              borderRadius: 999,
              border: "none",
              background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
              color: "#fff",
              fontWeight: 600,
              cursor: "pointer",
              minWidth: 180,
            }}
          >
            {loading ? "Đang lưu..." : "Lưu & cấp tài khoản"}
          </button>
        </div>
      </form>

      {message && (
        <p style={{ marginTop: 10, fontSize: 14, color: "#374151" }}>{message}</p>
      )}
    </div>
  );
}
