// src/components/student/AddStudentPanel.jsx
import { useState } from "react";
import { createStudent } from "../../api/studentApi";

function AddStudentPanel() {
  // tab con bên trong Use Case "Quản lý học viên"
  const [activeTab, setActiveTab] = useState("newStudent");

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
  const [searchKeyword, setSearchKeyword] = useState("");
  const [searchResult, setSearchResult] = useState([]);
  const [editingId, setEditingId] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.fullName || !form.username || !form.password) {
      alert("Vui lòng nhập Họ tên, Username và Mật khẩu.");
      return;
    }

    try {
      setLoading(true);
      const payload = {
        fullName: form.fullName,
        phone: form.phone,
        email: form.email,
        level: form.level,
        note: form.note,
        username: form.username,
        password: form.password,
      };
      await createStudent(payload);
      alert("Tạo học viên & cấp tài khoản thành công!");

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
      console.error(err);
      alert(err.message || "Có lỗi khi tạo học viên");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        maxWidth: 960,
        margin: "0 auto",
        backgroundColor: "#fff",
        padding: 24,
        borderRadius: 16,
        boxShadow: "0 10px 25px rgba(15, 23, 42, 0.08)",
      }}
    >
      {/* Tiêu đề của Use Case lớn */}
      <h2 style={{ marginBottom: 8 }}>Quản lý học viên</h2>
      <p style={{ color: "#6b7280", marginBottom: 16 }}>
        Chức năng dành cho nhân viên trung tâm: tiếp nhận học viên đăng ký mới,
        cấp tài khoản đăng nhập, tìm kiếm và cập nhật thông tin học viên.
      </p>

      {/* ===== Dãy nút con (Use Case con) ===== */}
      <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
        <button
          onClick={() => setActiveTab("newStudent")}
          style={{
            padding: "8px 16px",
            borderRadius: 999,
            border: "none",
            cursor: "pointer",
            fontSize: 14,
            fontWeight: 500,
            backgroundColor:
              activeTab === "newStudent" ? "#4f46e5" : "#e5e7eb",
            color: activeTab === "newStudent" ? "#fff" : "#111827",
          }}
        >
          Học viên đăng ký mới
        </button>

        <button
          onClick={() => setActiveTab("studying")}
          style={{
            padding: "8px 16px",
            borderRadius: 999,
            border: "none",
            cursor: "pointer",
            fontSize: 14,
            fontWeight: 500,
            backgroundColor:
              activeTab === "studying" ? "#4f46e5" : "#e5e7eb",
            color: activeTab === "studying" ? "#fff" : "#111827",
          }}
        >
          Học viên đang học
        </button>

        <button
          onClick={() => setActiveTab("finished")}
          style={{
            padding: "8px 16px",
            borderRadius: 999,
            border: "none",
            cursor: "pointer",
            fontSize: 14,
            fontWeight: 500,
            backgroundColor:
              activeTab === "finished" ? "#4f46e5" : "#e5e7eb",
            color: activeTab === "finished" ? "#fff" : "#111827",
          }}
        >
          Học viên đã học
        </button>
      </div>

      {/* ===== Nội dung từng chức năng con ===== */}
      {activeTab === "newStudent" && (
        <>
          {/* 2.1 Học viên đăng ký mới & cấp tài khoản */}
          <section>
            <h3 style={{ marginBottom: 8 }}>
              + Học viên đăng ký mới & cấp tài khoản
            </h3>
            <p style={{ color: "#6b7280", marginBottom: 16 }}>
              Nhân viên tiếp nhận thông tin học viên đăng ký mới, lưu vào hệ
              thống và cấp tài khoản đăng nhập (vai trò STUDENT).
            </p>

            <form onSubmit={handleSubmit}>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 16,
                }}
              >
                <div>
                  <label>Họ tên học viên *</label>
                  <input
                    type="text"
                    name="fullName"
                    value={form.fullName}
                    onChange={handleChange}
                    placeholder="VD: Nguyễn Văn A"
                    required
                    style={{ width: "100%", padding: 8, marginTop: 4 }}
                  />
                </div>

                <div>
                  <label>Username đăng nhập *</label>
                  <input
                    type="text"
                    name="username"
                    value={form.username}
                    onChange={handleChange}
                    placeholder="VD: student2"
                    required
                    style={{ width: "100%", padding: 8, marginTop: 4 }}
                  />
                </div>

                <div>
                  <label>Số điện thoại</label>
                  <input
                    type="text"
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    placeholder="VD: 09xx..."
                    style={{ width: "100%", padding: 8, marginTop: 4 }}
                  />
                </div>

                <div>
                  <label>Mật khẩu *</label>
                  <input
                    type="text"
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    placeholder="VD: pass12345"
                    required
                    style={{ width: "100%", padding: 8, marginTop: 4 }}
                  />
                </div>

                <div>
                  <label>Email</label>
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="VD: email@example.com"
                    style={{ width: "100%", padding: 8, marginTop: 4 }}
                  />
                </div>

                <div>
                  <label>Trình độ / Level</label>
                  <input
                    type="text"
                    name="level"
                    value={form.level}
                    onChange={handleChange}
                    placeholder="VD: HSK1, HSK2..."
                    style={{ width: "100%", padding: 8, marginTop: 4 }}
                  />
                </div>
              </div>

              <div style={{ marginTop: 16 }}>
                <label>Ghi chú</label>
                <textarea
                  name="note"
                  value={form.note}
                  onChange={handleChange}
                  placeholder="Ghi chú thêm (nếu có)..."
                  rows={3}
                  style={{ width: "100%", padding: 8, marginTop: 4 }}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                style={{
                  marginTop: 16,
                  padding: "10px 24px",
                  borderRadius: 999,
                  border: "none",
                  background:
                    "linear-gradient(90deg, #6366f1, #a855f7, #ec4899)",
                  color: "#fff",
                  fontWeight: 600,
                  cursor: loading ? "not-allowed" : "pointer",
                }}
              >
                {loading ? "Đang lưu..." : "Lưu & cấp tài khoản"}
              </button>
            </form>
          </section>

          {/* 2.2 + 2.3: khối Tìm kiếm & Cập nhật – mình giữ nguyên như bạn đang có */}
          {/* ... (phần tìm kiếm & cập nhật thông tin học viên đang học/đã học) ... */}
        </>
      )}

      {activeTab === "studying" && (
        <div style={{ marginTop: 32 }}>
          <h3>Học viên đang học (đang phát triển)</h3>
          <p style={{ color: "#6b7280" }}>
            Sau này sẽ hiển thị danh sách học viên đang học, cho phép lọc theo
            lớp, khoá học, ... và xem tiến độ.
          </p>
        </div>
      )}

      {activeTab === "finished" && (
        <div style={{ marginTop: 32 }}>
          <h3>Học viên đã học (đang phát triển)</h3>
          <p style={{ color: "#6b7280" }}>
            Sau này sẽ hiển thị lịch sử học viên đã hoàn thành khoá, phục vụ
            tra cứu và thống kê.
          </p>
        </div>
      )}
    </div>
  );
}

export default AddStudentPanel;
