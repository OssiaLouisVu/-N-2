// src/components/student/AddStudentPanel.jsx
import { useState } from "react";
import {
  createStudent,
  searchStudents,
  updateStudent,
} from "../../api/studentApi";

function AddStudentPanel() {
  // Form chính (đăng ký mới / cập nhật)
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [level, setLevel] = useState("");
  const [note, setNote] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  // Trạng thái tạo mới vs cập nhật
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingStudentId, setEditingStudentId] = useState(null);

  // Tìm kiếm & kết quả
  const [keyword, setKeyword] = useState("");
  const [searchResults, setSearchResults] = useState([]);

  // Loading + message
  const [loadingCreate, setLoadingCreate] = useState(false);
  const [loadingSearch, setLoadingSearch] = useState(false);
  const [message, setMessage] = useState("");

  // Reset form về trạng thái tạo mới
  const resetForm = () => {
    setFullName("");
    setPhone("");
    setEmail("");
    setLevel("");
    setNote("");
    setUsername("");
    setPassword("");
    setIsEditMode(false);
    setEditingStudentId(null);
  };

  // ====== 1) Thêm học viên mới + Cấp tài khoản học viên ======
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    try {
      if (!fullName.trim()) {
        setMessage("Vui lòng nhập họ tên học viên.");
        return;
      }

      if (!isEditMode) {
        // --- CHẾ ĐỘ TẠO MỚI (Học viên đăng ký mới + Cấp tài khoản) ---
        if (!username.trim() || !password.trim()) {
          setMessage("Vui lòng nhập username và mật khẩu cho học viên.");
          return;
        }

        setLoadingCreate(true);
        const payload = {
          fullName: fullName.trim(),
          phone: phone.trim() || null,
          email: email.trim() || null,
          level: level.trim() || null,
          note: note.trim() || null,
          username: username.trim(),
          password: password.trim(),
        };

        await createStudent(payload);
        setMessage("Tạo học viên mới & cấp tài khoản thành công.");
        resetForm();

        // Nếu đang có kết quả tìm kiếm => refresh
        if (keyword.trim()) {
          await handleSearch();
        }
      } else {
        // --- CHẾ ĐỘ CẬP NHẬT THÔNG TIN HỌC VIÊN ---
        if (!editingStudentId) {
          setMessage("Không xác định được học viên cần cập nhật.");
          return;
        }

        setLoadingCreate(true);
        const payload = {
          fullName: fullName.trim(),
          phone: phone.trim() || null,
          email: email.trim() || null,
          level: level.trim() || null,
          note: note.trim() || null,
        };

        await updateStudent(editingStudentId, payload);
        setMessage("Cập nhật thông tin học viên thành công.");

        // Cập nhật lại danh sách tìm kiếm
        if (keyword.trim()) {
          await handleSearch();
        }

        // Sau khi cập nhật xong, quay lại chế độ tạo mới
        resetForm();
      }
    } catch (err) {
      setMessage(err.message || "Có lỗi xảy ra.");
    } finally {
      setLoadingCreate(false);
    }
  };

  // ====== 2) Tìm kiếm thông tin học viên ======
  const handleSearch = async (e) => {
    if (e) e.preventDefault();
    setMessage("");

    try {
      setLoadingSearch(true);
      const data = await searchStudents(keyword);
      setSearchResults(data.data || []);
      if ((data.data || []).length === 0) {
        setMessage("Không tìm thấy học viên nào phù hợp.");
      }
    } catch (err) {
      setMessage(err.message || "Lỗi khi tìm kiếm học viên.");
    } finally {
      setLoadingSearch(false);
    }
  };

  // Khi chọn 1 học viên ở dưới để cập nhật
  const handleSelectStudent = (student) => {
    setIsEditMode(true);
    setEditingStudentId(student.id);

    setFullName(student.full_name || "");
    setPhone(student.phone || "");
    setEmail(student.email || "");
    setLevel(student.level || "");
    setNote(student.note || "");

    // Username là thông tin đã cấp trước đó -> hiển thị cho biết, nhưng không sửa ở đây
    setUsername(student.username || "");
    setPassword(""); // không cho chỉnh password ở màn này

    setMessage(
      `Đang ở chế độ cập nhật thông tin cho học viên ID = ${student.id}.`
    );
  };

  return (
    <div style={{ maxWidth: 900, margin: "24px auto" }}>
      {/* --- Khu vực 1: Học viên đăng ký mới / Cập nhật --- */}
      <div
        style={{
          background: "#fff",
          borderRadius: 16,
          padding: 24,
          boxShadow: "0 4px 12px rgba(15, 23, 42, 0.08)",
          marginBottom: 24,
        }}
      >
        <h2 style={{ marginBottom: 4 }}>
          {isEditMode
            ? "Cập nhật thông tin học viên"
            : "+ Thêm học viên mới & cấp tài khoản"}
        </h2>
        <p style={{ fontSize: 14, color: "#6b7280" }}>
          {isEditMode
            ? "Chỉnh sửa thông tin học viên đã có trong hệ thống. Username và mật khẩu không thay đổi ở màn hình này."
            : "Nhân viên tiếp nhận thông tin học viên đăng ký mới, lưu vào hệ thống và cấp tài khoản đăng nhập (vai trò STUDENT)."}
        </p>

        <form onSubmit={handleSubmit} style={{ marginTop: 16 }}>
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
                  width: "100%",
                  padding: "10px 12px",
                  borderRadius: 10,
                  border: "1px solid #e5e7eb",
                  fontSize: 14,
                }}
              />
            </div>

            {/* Username */}
            <div>
              <label style={{ fontSize: 13, fontWeight: 600 }}>
                Username đăng nhập *
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="VD: student2"
                disabled={isEditMode} // cập nhật không đổi username
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  borderRadius: 10,
                  border: "1px solid #e5e7eb",
                  fontSize: 14,
                  backgroundColor: isEditMode ? "#f9fafb" : "#fff",
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
                placeholder="VD: 09xx..."
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  borderRadius: 10,
                  border: "1px solid #e5e7eb",
                  fontSize: 14,
                }}
              />
            </div>

            {/* Mật khẩu */}
            <div>
              <label style={{ fontSize: 13, fontWeight: 600 }}>
                Mật khẩu {isEditMode ? "(không chỉnh sửa ở đây)" : "*"}
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="VD: pass12345"
                disabled={isEditMode}
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  borderRadius: 10,
                  border: "1px solid #e5e7eb",
                  fontSize: 14,
                  backgroundColor: isEditMode ? "#f9fafb" : "#fff",
                }}
              />
            </div>

            {/* Email */}
            <div>
              <label style={{ fontSize: 13, fontWeight: 600 }}>Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="VD: email@example.com"
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  borderRadius: 10,
                  border: "1px solid #e5e7eb",
                  fontSize: 14,
                }}
              />
            </div>

            {/* Level */}
            <div>
              <label style={{ fontSize: 13, fontWeight: 600 }}>
                Trình độ / Level
              </label>
              <input
                type="text"
                value={level}
                onChange={(e) => setLevel(e.target.value)}
                placeholder="VD: HSK1, HSK2..."
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  borderRadius: 10,
                  border: "1px solid #e5e7eb",
                  fontSize: 14,
                }}
              />
            </div>
          </div>

          {/* Ghi chú */}
          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 13, fontWeight: 600 }}>Ghi chú</label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Ghi chú thêm (nếu có)..."
              rows={3}
              style={{
                width: "100%",
                padding: "10px 12px",
                borderRadius: 10,
                border: "1px solid #e5e7eb",
                fontSize: 14,
                resize: "vertical",
              }}
            />
          </div>

          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <button
              type="submit"
              disabled={loadingCreate}
              style={{
                padding: "10px 20px",
                borderRadius: 999,
                border: "none",
                background:
                  "linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #ec4899 100%)",
                color: "#fff",
                fontWeight: 600,
                cursor: "pointer",
                boxShadow: "0 8px 20px rgba(129, 140, 248, 0.6)",
              }}
            >
              {loadingCreate
                ? "Đang xử lý..."
                : isEditMode
                ? "Lưu cập nhật thông tin"
                : "Lưu & cấp tài khoản"}
            </button>

            {isEditMode && (
              <button
                type="button"
                onClick={resetForm}
                style={{
                  padding: "8px 16px",
                  borderRadius: 999,
                  border: "1px solid #e5e7eb",
                  backgroundColor: "#fff",
                  color: "#374151",
                  fontSize: 13,
                  cursor: "pointer",
                }}
              >
                Hủy chế độ cập nhật
              </button>
            )}
          </div>

          {message && (
            <p style={{ marginTop: 12, fontSize: 14, color: "#4b5563" }}>
              {message}
            </p>
          )}
        </form>
      </div>

      {/* --- Khu vực 2: Tìm kiếm & Cập nhật thông tin học viên --- */}
      <div
        style={{
          background: "#fff",
          borderRadius: 16,
          padding: 24,
          boxShadow: "0 4px 12px rgba(15, 23, 42, 0.08)",
        }}
      >
        <h2 style={{ marginBottom: 4 }}>
          🔍 Tìm kiếm & cập nhật thông tin học viên
        </h2>
        <p style={{ fontSize: 14, color: "#6b7280" }}>
          Hỗ trợ nhân viên tra cứu học viên theo tên, số điện thoại, email hoặc
          level. Chọn một dòng trong bảng để nạp lại thông tin lên form phía
          trên và thực hiện cập nhật.
        </p>

        <form
          onSubmit={handleSearch}
          style={{ display: "flex", gap: 12, marginTop: 16, marginBottom: 16 }}
        >
          <input
            type="text"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="Nhập tên / SĐT / email / level..."
            style={{
              flex: 1,
              padding: "10px 12px",
              borderRadius: 999,
              border: "1px solid #e5e7eb",
              fontSize: 14,
            }}
          />
          <button
            type="submit"
            disabled={loadingSearch}
            style={{
              padding: "10px 24px",
              borderRadius: 999,
              border: "none",
              background:
                "linear-gradient(135deg, #0ea5e9 0%, #6366f1 80%, #22c55e 100%)",
              color: "#fff",
              fontWeight: 600,
              cursor: "pointer",
              boxShadow: "0 6px 16px rgba(56, 189, 248, 0.5)",
            }}
          >
            {loadingSearch ? "Đang tìm..." : "Tìm kiếm"}
          </button>
        </form>

        <div style={{ overflowX: "auto" }}>
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              fontSize: 14,
            }}
          >
            <thead>
              <tr
                style={{
                  backgroundColor: "#f9fafb",
                  borderBottom: "1px solid #e5e7eb",
                }}
              >
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
              {searchResults.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ padding: 10, color: "#6b7280" }}>
                    Chưa có dữ liệu tìm kiếm.
                  </td>
                </tr>
              ) : (
                searchResults.map((s) => (
                  <tr
                    key={s.id}
                    style={{
                      borderBottom: "1px solid #f3f4f6",
                    }}
                  >
                    <td style={{ padding: 8 }}>{s.id}</td>
                    <td style={{ padding: 8 }}>{s.full_name}</td>
                    <td style={{ padding: 8 }}>{s.phone || ""}</td>
                    <td style={{ padding: 8 }}>{s.email || ""}</td>
                    <td style={{ padding: 8 }}>{s.level || ""}</td>
                    <td style={{ padding: 8 }}>{s.note || ""}</td>
                    <td style={{ padding: 8, textAlign: "right" }}>
                      <button
                        type="button"
                        onClick={() => handleSelectStudent(s)}
                        style={{
                          padding: "6px 12px",
                          borderRadius: 999,
                          border: "none",
                          background:
                            "linear-gradient(135deg, #22c55e 0%, #16a34a 100%)",
                          color: "#fff",
                          fontSize: 12,
                          fontWeight: 600,
                          cursor: "pointer",
                        }}
                      >
                        Chọn để cập nhật
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default AddStudentPanel;
