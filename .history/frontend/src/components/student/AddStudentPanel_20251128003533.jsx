// src/components/student/AddStudentPanel.jsx
import { useState } from "react";
import {
  createStudent,
  searchStudents,
  updateStudent,
} from "../../api/studentApi";

export default function AddStudentPanel() {
  // --- Form thêm mới + cấp tài khoản ---
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [level, setLevel] = useState("");
  const [note, setNote] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const [loadingAdd, setLoadingAdd] = useState(false);
  const [messageAdd, setMessageAdd] = useState("");

  // --- Tìm kiếm & cập nhật ---
  const [searchKeyword, setSearchKeyword] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [loadingSearch, setLoadingSearch] = useState(false);
  const [messageSearch, setMessageSearch] = useState("");

  const [editStudent, setEditStudent] = useState(null); // {id, full_name, ...}
  const [loadingUpdate, setLoadingUpdate] = useState(false);
  const [messageUpdate, setMessageUpdate] = useState("");

  // =========================
  // 1) Submit thêm học viên
  // =========================
  const handleCreateStudent = async (e) => {
    e.preventDefault();
    setMessageAdd("");

    if (!fullName || !username || !password) {
      setMessageAdd("Vui lòng nhập đủ Họ tên, Username, Mật khẩu.");
      return;
    }

    try {
      setLoadingAdd(true);
      const payload = {
        fullName,
        phone,
        email,
        level,
        note,
        username,
        password,
      };

      await createStudent(payload);
      setMessageAdd("Tạo học viên & cấp tài khoản thành công.");

      // reset form
      setFullName("");
      setPhone("");
      setEmail("");
      setLevel("");
      setNote("");
      setUsername("");
      setPassword("");
    } catch (err) {
      console.error(err);
      setMessageAdd(err.message || "Có lỗi xảy ra khi tạo học viên.");
    } finally {
      setLoadingAdd(false);
    }
  };

  // =========================
  // 2) Tìm kiếm học viên
  // =========================
  const handleSearch = async () => {
    setMessageSearch("");
    setMessageUpdate("");
    setEditStudent(null);

    try {
      setLoadingSearch(true);
      const data = await searchStudents({ keyword: searchKeyword });
      setSearchResults(data.data || []);
      if (!data.data || data.data.length === 0) {
        setMessageSearch("Không tìm thấy học viên phù hợp.");
      }
    } catch (err) {
      console.error(err);
      setMessageSearch(err.message || "Lỗi khi tìm kiếm học viên.");
      setSearchResults([]);
    } finally {
      setLoadingSearch(false);
    }
  };

  // =========================
  // 3) Chọn 1 học viên để cập nhật
  // =========================
  const handleSelectEdit = (student) => {
    setEditStudent({
      id: student.id,
      fullName: student.full_name,
      phone: student.phone || "",
      email: student.email || "",
      level: student.level || "",
      note: student.note || "",
    });
    setMessageUpdate("");
  };

  // =========================
  // 4) Submit cập nhật học viên
  // =========================
  const handleUpdateStudent = async (e) => {
    e.preventDefault();
    if (!editStudent) return;

    if (!editStudent.fullName) {
      setMessageUpdate("Họ tên học viên là bắt buộc.");
      return;
    }

    try {
      setLoadingUpdate(true);
      const payload = {
        fullName: editStudent.fullName,
        phone: editStudent.phone,
        email: editStudent.email,
        level: editStudent.level,
        note: editStudent.note,
      };

      await updateStudent(editStudent.id, payload);
      setMessageUpdate("Cập nhật thông tin học viên thành công.");

      // Cập nhật lại trong bảng kết quả tìm kiếm
      setSearchResults((prev) =>
        prev.map((s) =>
          s.id === editStudent.id
            ? {
                ...s,
                full_name: editStudent.fullName,
                phone: editStudent.phone,
                email: editStudent.email,
                level: editStudent.level,
                note: editStudent.note,
              }
            : s
        )
      );
    } catch (err) {
      console.error(err);
      setMessageUpdate(err.message || "Lỗi khi cập nhật học viên.");
    } finally {
      setLoadingUpdate(false);
    }
  };

  // =========================
  // Render
  // =========================
  const cardStyle = {
    background: "#fff",
    borderRadius: 16,
    padding: 24,
    boxShadow: "0 8px 24px rgba(15,23,42,0.08)",
    maxWidth: 900,
    margin: "0 auto",
  };

  const inputStyle = {
    width: "100%",
    padding: "10px 12px",
    borderRadius: 12,
    border: "1px solid #e5e7eb",
    fontSize: 14,
    outline: "none",
  };

  const labelStyle = {
    fontSize: 13,
    fontWeight: 600,
    marginBottom: 6,
    display: "block",
  };

  const sectionTitleStyle = {
    fontSize: 18,
    fontWeight: 700,
    marginBottom: 8,
    color: "#111827",
  };

  return (
    <div style={{ marginTop: 32 }}>
      {/* KHỐI: THÊM HỌC VIÊN + CẤP TÀI KHOẢN */}
      <div style={cardStyle}>
        <h2 style={sectionTitleStyle}>+ Thêm học viên mới & cấp tài khoản</h2>
        <p style={{ fontSize: 13, color: "#6b7280", marginBottom: 16 }}>
          Nhân viên tiếp nhận thông tin học viên đăng ký mới, lưu vào hệ thống
          và cấp tài khoản đăng nhập (vai trò STUDENT).
        </p>

        <form onSubmit={handleCreateStudent}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 16,
              marginBottom: 12,
            }}
          >
            <div>
              <label style={labelStyle}>Họ tên học viên *</label>
              <input
                style={inputStyle}
                placeholder="VD: Nguyễn Văn A"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
            </div>

            <div>
              <label style={labelStyle}>Username đăng nhập *</label>
              <input
                style={inputStyle}
                placeholder="VD: student2"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>

            <div>
              <label style={labelStyle}>Số điện thoại</label>
              <input
                style={inputStyle}
                placeholder="VD: 09xx..."
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>

            <div>
              <label style={labelStyle}>Mật khẩu *</label>
              <input
                style={inputStyle}
                type="password"
                placeholder="VD: pass12345"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <div>
              <label style={labelStyle}>Email</label>
              <input
                style={inputStyle}
                placeholder="VD: email@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div>
              <label style={labelStyle}>Trình độ / Level</label>
              <input
                style={inputStyle}
                placeholder="VD: HSK1, HSK2..."
                value={level}
                onChange={(e) => setLevel(e.target.value)}
              />
            </div>
          </div>

          <div style={{ marginBottom: 12 }}>
            <label style={labelStyle}>Ghi chú</label>
            <textarea
              style={{ ...inputStyle, minHeight: 72, resize: "vertical" }}
              placeholder="Ghi chú thêm (nếu có)..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </div>

          {messageAdd && (
            <p
              style={{
                fontSize: 13,
                color: messageAdd.includes("thành công") ? "#16a34a" : "#dc2626",
                marginBottom: 8,
              }}
            >
              {messageAdd}
            </p>
          )}

          <button
            type="submit"
            disabled={loadingAdd}
            style={{
              marginTop: 4,
              padding: "10px 20px",
              borderRadius: 999,
              border: "none",
              background:
                "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
              color: "#fff",
              fontWeight: 600,
              fontSize: 14,
              cursor: "pointer",
              boxShadow: "0 6px 18px rgba(129,140,248,0.6)",
            }}
          >
            {loadingAdd ? "Đang xử lý..." : "Lưu & cấp tài khoản"}
          </button>
        </form>
      </div>

      {/* KHỐI: TÌM KIẾM & CẬP NHẬT HỌC VIÊN */}
      <div style={{ ...cardStyle, marginTop: 24 }}>
        <h2 style={sectionTitleStyle}>
          🔍 Tìm kiếm & cập nhật thông tin học viên
        </h2>
        <p style={{ fontSize: 13, color: "#6b7280", marginBottom: 16 }}>
          Hỗ trợ nhân viên tra cứu học viên theo tên, số điện thoại, email hoặc
          level; sau đó cập nhật lại thông tin khi cần.
        </p>

        {/* Bộ lọc tìm kiếm */}
        <div
          style={{
            display: "flex",
            gap: 12,
            alignItems: "center",
            marginBottom: 12,
          }}
        >
          <input
            style={{ ...inputStyle, maxWidth: 320 }}
            placeholder="Nhập tên / SĐT / email / level..."
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
          />
          <button
            onClick={handleSearch}
            disabled={loadingSearch}
            style={{
              padding: "8px 16px",
              borderRadius: 999,
              border: "none",
              background:
                "linear-gradient(135deg, #0ea5e9 0%, #2563eb 100%)",
              color: "#fff",
              fontWeight: 600,
              fontSize: 13,
              cursor: "pointer",
            }}
          >
            {loadingSearch ? "Đang tìm..." : "Tìm kiếm"}
          </button>
        </div>

        {messageSearch && (
          <p
            style={{
              fontSize: 13,
              color: messageSearch.includes("Không tìm thấy")
                ? "#6b7280"
                : "#dc2626",
              marginBottom: 8,
            }}
          >
            {messageSearch}
          </p>
        )}

        {/* Bảng kết quả */}
        <div style={{ marginTop: 8, overflowX: "auto" }}>
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              fontSize: 13,
            }}
          >
            <thead>
              <tr style={{ background: "#f3f4f6" }}>
                <th style={{ padding: 8, textAlign: "left" }}>Mã HV</th>
                <th style={{ padding: 8, textAlign: "left" }}>Họ tên</th>
                <th style={{ padding: 8, textAlign: "left" }}>SĐT</th>
                <th style={{ padding: 8, textAlign: "left" }}>Email</th>
                <th style={{ padding: 8, textAlign: "left" }}>Level</th>
                <th style={{ padding: 8, textAlign: "left" }}>Ghi chú</th>
                <th style={{ padding: 8 }}></th>
              </tr>
            </thead>
            <tbody>
              {searchResults.map((s) => (
                <tr key={s.id} style={{ borderTop: "1px solid #e5e7eb" }}>
                  <td style={{ padding: 8 }}>{s.id}</td>
                  <td style={{ padding: 8 }}>{s.full_name}</td>
                  <td style={{ padding: 8 }}>{s.phone}</td>
                  <td style={{ padding: 8 }}>{s.email}</td>
                  <td style={{ padding: 8 }}>{s.level}</td>
                  <td style={{ padding: 8 }}>{s.note}</td>
                  <td style={{ padding: 8, textAlign: "right" }}>
                    <button
                      onClick={() => handleSelectEdit(s)}
                      style={{
                        padding: "6px 12px",
                        borderRadius: 999,
                        border: "none",
                        background:
                          "linear-gradient(135deg, #22c55e 0%, #16a34a 100%)",
                        color: "#fff",
                        fontWeight: 600,
                        fontSize: 12,
                        cursor: "pointer",
                      }}
                    >
                      Sửa
                    </button>
                  </td>
                </tr>
              ))}
              {searchResults.length === 0 && !loadingSearch && (
                <tr>
                  <td style={{ padding: 8 }} colSpan={7}>
                    Chưa có dữ liệu tìm kiếm.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Form cập nhật học viên được chọn */}
        {editStudent && (
          <div
            style={{
              marginTop: 20,
              paddingTop: 16,
              borderTop: "1px solid #e5e7eb",
            }}
          >
            <h3
              style={{
                fontSize: 15,
                fontWeight: 700,
                marginBottom: 8,
                color: "#111827",
              }}
            >
              ✏️ Cập nhật thông tin học viên (ID: {editStudent.id})
            </h3>

            <form onSubmit={handleUpdateStudent}>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 16,
                  marginBottom: 12,
                }}
              >
                <div>
                  <label style={labelStyle}>Họ tên *</label>
                  <input
                    style={inputStyle}
                    value={editStudent.fullName}
                    onChange={(e) =>
                      setEditStudent((prev) => ({
                        ...prev,
                        fullName: e.target.value,
                      }))
                    }
                  />
                </div>

                <div>
                  <label style={labelStyle}>Số điện thoại</label>
                  <input
                    style={inputStyle}
                    value={editStudent.phone}
                    onChange={(e) =>
                      setEditStudent((prev) => ({
                        ...prev,
                        phone: e.target.value,
                      }))
                    }
                  />
                </div>

                <div>
                  <label style={labelStyle}>Email</label>
                  <input
                    style={inputStyle}
                    value={editStudent.email}
                    onChange={(e) =>
                      setEditStudent((prev) => ({
                        ...prev,
                        email: e.target.value,
                      }))
                    }
                  />
                </div>

                <div>
                  <label style={labelStyle}>Trình độ / Level</label>
                  <input
                    style={inputStyle}
                    value={editStudent.level}
                    onChange={(e) =>
                      setEditStudent((prev) => ({
                        ...prev,
                        level: e.target.value,
                      }))
                    }
                  />
                </div>
              </div>

              <div style={{ marginBottom: 12 }}>
                <label style={labelStyle}>Ghi chú</label>
                <textarea
                  style={{ ...inputStyle, minHeight: 72 }}
                  value={editStudent.note}
                  onChange={(e) =>
                    setEditStudent((prev) => ({
                      ...prev,
                      note: e.target.value,
                    }))
                  }
                />
              </div>

              {messageUpdate && (
                <p
                  style={{
                    fontSize: 13,
                    color: messageUpdate.includes("thành công")
                      ? "#16a34a"
                      : "#dc2626",
                    marginBottom: 8,
                  }}
                >
                  {messageUpdate}
                </p>
              )}

              <button
                type="submit"
                disabled={loadingUpdate}
                style={{
                  padding: "8px 18px",
                  borderRadius: 999,
                  border: "none",
                  background:
                    "linear-gradient(135deg, #22c55e 0%, #16a34a 100%)",
                  color: "#fff",
                  fontWeight: 600,
                  fontSize: 13,
                  cursor: "pointer",
                  marginRight: 8,
                }}
              >
                {loadingUpdate ? "Đang lưu..." : "Lưu cập nhật"}
              </button>

              <button
                type="button"
                onClick={() => {
                  setEditStudent(null);
                  setMessageUpdate("");
                }}
                style={{
                  padding: "8px 18px",
                  borderRadius: 999,
                  border: "1px solid #d1d5db",
                  background: "#f9fafb",
                  color: "#374151",
                  fontWeight: 500,
                  fontSize: 13,
                  cursor: "pointer",
                }}
              >
                Huỷ
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
