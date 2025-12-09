// src/components/student/AddStudentPanel.jsx
import { useState } from "react";
import {
  createStudent,
  searchStudents,
  updateStudent,
} from "../../api/studentApi";

function AddStudentPanel() {
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

  // Cho phần tìm kiếm & cập nhật
  const [searchKeyword, setSearchKeyword] = useState("");
  const [searchResult, setSearchResult] = useState([]);
  const [editingId, setEditingId] = useState(null); // null = đang tạo mới

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // Submit form: nếu editingId != null thì là "Cập nhật thông tin học viên"
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

      if (editingId) {
        // === 2.3 Cập nhật thông tin học viên ===
        await updateStudent(editingId, payload);
        alert("Cập nhật thông tin học viên thành công!");
      } else {
        // === 2.1 Học viên đăng ký mới & cấp tài khoản ===
        await createStudent(payload);
        alert("Tạo học viên & cấp tài khoản thành công!");
      }

      setForm({
        fullName: "",
        phone: "",
        email: "",
        level: "",
        note: "",
        username: "",
        password: "",
      });
      setEditingId(null);
    } catch (err) {
      console.error(err);
      alert(err.message || "Có lỗi khi lưu thông tin học viên");
    } finally {
      setLoading(false);
    }
  };

  // === 2.2 Tìm kiếm thông tin học viên ===
  const handleSearch = async () => {
    try {
      const data = await searchStudents(searchKeyword);
      setSearchResult(data.data || []);
    } catch (err) {
      console.error(err);
      alert(err.message || "Có lỗi khi tìm kiếm học viên");
    }
  };

  const handleEditClick = (student) => {
    setEditingId(student.id);
    setForm({
      fullName: student.full_name,
      phone: student.phone || "",
      email: student.email || "",
      level: student.level || "",
      note: student.note || "",
      username: student.username || "",
      password: "", // có thể để trống, nếu backend cho phép giữ nguyên password
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setForm({
      fullName: "",
      phone: "",
      email: "",
      level: "",
      note: "",
      username: "",
      password: "",
    });
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
      {/* Use case lớn: Quản lý học viên */}
      <h2 style={{ marginBottom: 8 }}>Quản lý học viên</h2>
      <p style={{ color: "#6b7280", marginBottom: 16 }}>
        Chức năng dành cho nhân viên trung tâm: tiếp nhận học viên đăng ký mới,
        cấp tài khoản đăng nhập, tìm kiếm và cập nhật thông tin học viên.
      </p>

      {/* Tabs con: Học viên đăng ký mới / đang học / đã học */}
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

      {/* ===== Nội dung tab HỌC VIÊN ĐĂNG KÝ MỚI ===== */}
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
                    required={!editingId}
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

              <div style={{ marginTop: 16, display: "flex", gap: 8 }}>
                <button
                  type="submit"
                  disabled={loading}
                  style={{
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
                  {loading
                    ? "Đang lưu..."
                    : editingId
                    ? "Cập nhật thông tin học viên"
                    : "Lưu & cấp tài khoản"}
                </button>

                {editingId && (
                  <button
                    type="button"
                    onClick={handleCancelEdit}
                    style={{
                      padding: "10px 16px",
                      borderRadius: 999,
                      border: "1px solid #e5e7eb",
                      backgroundColor: "#fff",
                      cursor: "pointer",
                    }}
                  >
                    Hủy chỉnh sửa
                  </button>
                )}
              </div>
            </form>
          </section>

          {/* 2.2 + 2.3: Tìm kiếm & cập nhật thông tin học viên */}
          <section style={{ marginTop: 32 }}>
            <h3>🔍 Tìm kiếm & cập nhật thông tin học viên</h3>
            <p style={{ color: "#6b7280", marginBottom: 12 }}>
              Hỗ trợ nhân viên tra cứu học viên theo tên, số điện thoại, email
              hoặc level; chọn một dòng trong bảng để nạp lại thông tin lên
              form phía trên và tiến hành cập nhật.
            </p>

            <div
              style={{
                display: "flex",
                gap: 8,
                marginBottom: 16,
                maxWidth: 560,
              }}
            >
              <input
                type="text"
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                placeholder="Nhập tên / SDT / email / level..."
                style={{
                  flex: 1,
                  padding: 8,
                  borderRadius: 999,
                  border: "1px solid #d1d5db",
                }}
              />
              <button
                type="button"
                onClick={handleSearch}
                style={{
                  padding: "8px 18px",
                  borderRadius: 999,
                  border: "none",
                  backgroundColor: "#2563eb",
                  color: "#fff",
                  fontWeight: 500,
                  cursor: "pointer",
                }}
              >
                Tìm kiếm
              </button>
            </div>

            <div
              style={{
                marginTop: 8,
                borderRadius: 12,
                border: "1px solid #e5e7eb",
                overflow: "hidden",
              }}
            >
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead
                  style={{ backgroundColor: "#f9fafb", fontWeight: 600 }}
                >
                  <tr>
                    <th style={{ padding: 8, borderBottom: "1px solid #e5e7eb" }}>
                      Mã HV
                    </th>
                    <th style={{ padding: 8, borderBottom: "1px solid #e5e7eb" }}>
                      Họ tên
                    </th>
                    <th style={{ padding: 8, borderBottom: "1px solid #e5e7eb" }}>
                      SDT
                    </th>
                    <th style={{ padding: 8, borderBottom: "1px solid #e5e7eb" }}>
                      Email
                    </th>
                    <th style={{ padding: 8, borderBottom: "1px solid #e5e7eb" }}>
                      Level
                    </th>
                    <th style={{ padding: 8, borderBottom: "1px solid #e5e7eb" }}>
                      Ghi chú
                    </th>
                    <th style={{ padding: 8, borderBottom: "1px solid #e5e7eb" }}>
                      Sửa
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {searchResult.length === 0 ? (
                    <tr>
                      <td
                        colSpan={7}
                        style={{
                          padding: 12,
                          textAlign: "center",
                          color: "#9ca3af",
                        }}
                      >
                        Chưa có dữ liệu tìm kiếm.
                      </td>
                    </tr>
                  ) : (
                    searchResult.map((st) => (
                      <tr key={st.id}>
                        <td
                          style={{
                            padding: 8,
                            borderTop: "1px solid #f3f4f6",
                            textAlign: "center",
                          }}
                        >
                          {st.id}
                        </td>
                        <td
                          style={{
                            padding: 8,
                            borderTop: "1px solid #f3f4f6",
                          }}
                        >
                          {st.full_name}
                        </td>
                        <td
                          style={{
                            padding: 8,
                            borderTop: "1px solid #f3f4f6",
                          }}
                        >
                          {st.phone || "-"}
                        </td>
                        <td
                          style={{
                            padding: 8,
                            borderTop: "1px solid #f3f4f6",
                          }}
                        >
                          {st.email || "-"}
                        </td>
                        <td
                          style={{
                            padding: 8,
                            borderTop: "1px solid #f3f4f6",
                          }}
                        >
                          {st.level || "-"}
                        </td>
                        <td
                          style={{
                            padding: 8,
                            borderTop: "1px solid #f3f4f6",
                          }}
                        >
                          {st.note || "-"}
                        </td>
                        <td
                          style={{
                            padding: 8,
                            borderTop: "1px solid #f3f4f6",
                            textAlign: "center",
                          }}
                        >
                          <button
                            type="button"
                            onClick={() => handleEditClick(st)}
                            style={{
                              padding: "6px 12px",
                              borderRadius: 999,
                              border: "none",
                              backgroundColor: "#22c55e",
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
        </>
      )}

      {/* Hai tab còn lại để mô tả, sau này phát triển */}
      {activeTab === "studying" && (
        <div style={{ marginTop: 32 }}>
          <h3>Học viên đang học (đang phát triển)</h3>
          <p style={{ color: "#6b7280" }}>
            Sau này sẽ hiển thị danh sách học viên đang học, lọc theo lớp, khoá
            học, v.v.
          </p>
        </div>
      )}

      {activeTab === "finished" && (
        <div style={{ marginTop: 32 }}>
          <h3>Học viên đã học (đang phát triển)</h3>
          <p style={{ color: "#6b7280" }}>
            Sau này sẽ hiển thị lịch sử học viên đã hoàn thành khoá, phục vụ tra
            cứu và thống kê.
          </p>
        </div>
      )}
    </div>
  );
}

export default AddStudentPanel;
