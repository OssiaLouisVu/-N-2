// frontend/src/components/student/AddStudentPanel.jsx
import { useEffect, useState } from "react";

const API_BASE = "http://localhost:8080";

export default function AddStudentPanel() {
  // form
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [level, setLevel] = useState("");
  const [note, setNote] = useState("");
  const [status, setStatus] = useState("NEW");

  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("info"); // success | error | info
  const [loading, setLoading] = useState(false);

  // danh sách học viên NEW
  const [searchKeyword, setSearchKeyword] = useState("");
  const [newStudents, setNewStudents] = useState([]);

  // đang sửa học viên nào
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    loadNewStudents();
  }, []);

  const resetForm = () => {
    setFullName("");
    setPhone("");
    setEmail("");
    setLevel("");
    setNote("");
    setStatus("NEW");
    setEditingId(null);
  };

  const showMessage = (text, type = "info") => {
    setMessage(text);
    setMessageType(type);
    if (text) {
      setTimeout(() => {
        setMessage("");
      }, 4000);
    }
  };

  // lấy danh sách học viên NEW
  const loadNewStudents = async (keyword = "") => {
    try {
      const params = new URLSearchParams();
      params.append("status", "NEW");
      if (keyword) params.append("keyword", keyword);

      const res = await fetch(
        `${API_BASE}/api/students?${params.toString()}`
      );
      const data = await res.json();
      if (data.success) {
        setNewStudents(data.students || []);
      } else {
        showMessage("Không lấy được danh sách học viên mới.", "error");
      }
    } catch (err) {
      console.error(err);
      showMessage("Lỗi kết nối khi lấy học viên mới.", "error");
    }
  };

  const handleSearchNewStudents = (e) => {
    e.preventDefault();
    loadNewStudents(searchKeyword.trim());
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!fullName.trim()) {
      showMessage("Họ tên học viên là bắt buộc.", "error");
      return;
    }

    setLoading(true);
    try {
      const body = {
        fullName: fullName.trim(),
        phone: phone.trim() || null,
        email: email.trim() || null,
        level: level.trim() || null,
        note: note.trim() || null,
        status,
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
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!data.success) {
        showMessage(data.message || "Lỗi server khi lưu học viên.", "error");
        return;
      }

      if (!editingId) {
        showMessage("Đã lưu thông tin học viên (mới đăng ký).", "success");
      } else {
        showMessage("Đã cập nhật thông tin học viên.", "success");
      }

      resetForm();
      // reload bảng học viên NEW (nếu bạn đổi status sang ACTIVE/COMPLETED thì hàng đó sẽ biến mất)
      loadNewStudents(searchKeyword.trim());
    } catch (err) {
      console.error(err);
      showMessage("Lỗi server khi cập nhật học viên.", "error");
    } finally {
      setLoading(false);
    }
  };

  // khi bấm nút "Sửa" ở bảng NEW
  const handleEditClick = (student) => {
    setEditingId(student.id);
    setFullName(student.full_name || "");
    setPhone(student.phone || "");
    setEmail(student.email || "");
    setLevel(student.level || "");
    setNote(student.note || "");
    setStatus(student.status || "NEW");
    window.scrollTo({ top: 200, behavior: "smooth" });
  };

  return (
    <section
      style={{
        marginTop: 24,
        marginBottom: 32,
        padding: 24,
        borderRadius: 24,
        backgroundColor: "#ffffff",
        boxShadow: "0 18px 40px rgba(15,23,42,0.06)",
        border: "1px solid #f1f2ff",
      }}
    >
      <h2
        style={{
          fontSize: 22,
          fontWeight: 700,
          marginBottom: 8,
        }}
      >
        📝 Học viên đăng ký mới & lưu thông tin
      </h2>
      <p style={{ color: "#555", marginBottom: 16 }}>
        Use case: <b>Học viên đăng ký mới</b> – nhân viên nhập thông tin cơ bản
        của học viên. Ban đầu trạng thái thường là <b>NEW – Mới đăng ký</b>. Sau
        này khi xếp lớp, bạn có thể sửa lại trạng thái sang{" "}
        <b>ACTIVE – Đang học</b>, và khi hoàn thành khoá học chuyển sang{" "}
        <b>COMPLETED – Đã học</b>.
      </p>

      {/* thông báo */}
      {message && (
        <div
          style={{
            marginBottom: 16,
            padding: "10px 14px",
            borderRadius: 8,
            backgroundColor:
              messageType === "success"
                ? "#f6ffed"
                : messageType === "error"
                ? "#fff1f0"
                : "#e6f4ff",
            borderLeft:
              messageType === "success"
                ? "4px solid #52c41a"
                : messageType === "error"
                ? "4px solid #ff4d4f"
                : "4px solid #1677ff",
            color:
              messageType === "success"
                ? "#389e0d"
                : messageType === "error"
                ? "#cf1322"
                : "#0958d9",
          }}
        >
          {message}
        </div>
      )}

      {/* form tạo / cập nhật */}
      <form onSubmit={handleSubmit}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1.3fr 1.2fr",
            gap: 16,
            marginBottom: 16,
          }}
        >
          <div>
            <label
              style={{
                display: "block",
                fontSize: 14,
                fontWeight: 600,
                marginBottom: 6,
              }}
            >
              Họ tên học viên *
            </label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="VD: Vũ Đức Thịnh"
              style={{
                width: "100%",
                padding: "10px 12px",
                borderRadius: 10,
                border: "1px solid #dde1f3",
                outline: "none",
                fontSize: 14,
              }}
            />
          </div>

          <div>
            <label
              style={{
                display: "block",
                fontSize: 14,
                fontWeight: 600,
                marginBottom: 6,
              }}
            >
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="vd: student@example.com"
              style={{
                width: "100%",
                padding: "10px 12px",
                borderRadius: 10,
                border: "1px solid #dde1f3",
                outline: "none",
                fontSize: 14,
              }}
            />
          </div>

          <div>
            <label
              style={{
                display: "block",
                fontSize: 14,
                fontWeight: 600,
                marginBottom: 6,
              }}
            >
              Số điện thoại
            </label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="VD: 0912345678"
              style={{
                width: "100%",
                padding: "10px 12px",
                borderRadius: 10,
                border: "1px solid #dde1f3",
                outline: "none",
                fontSize: 14,
              }}
            />
          </div>

          <div>
            <label
              style={{
                display: "block",
                fontSize: 14,
                fontWeight: 600,
                marginBottom: 6,
              }}
            >
              Level hiện tại
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
                border: "1px solid #dde1f3",
                outline: "none",
                fontSize: 14,
              }}
            />
          </div>

          <div>
            <label
              style={{
                display: "block",
                fontSize: 14,
                fontWeight: 600,
                marginBottom: 6,
              }}
            >
              Trạng thái
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              style={{
                width: "100%",
                padding: "10px 12px",
                borderRadius: 10,
                border: "1px solid #dde1f3",
                outline: "none",
                fontSize: 14,
                backgroundColor: "#fff",
              }}
            >
              <option value="NEW">NEW – Mới đăng ký</option>
              <option value="ACTIVE">ACTIVE – Đang học</option>
              <option value="COMPLETED">COMPLETED – Đã học</option>
            </select>
          </div>
        </div>

        <div style={{ marginBottom: 16 }}>
          <label
            style={{
              display: "block",
              fontSize: 14,
              fontWeight: 600,
              marginBottom: 6,
            }}
          >
            Ghi chú
          </label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="VD: nguồn Facebook, bạn giới thiệu, nhu cầu học..."
            rows={3}
            style={{
              width: "100%",
              padding: "10px 12px",
              borderRadius: 12,
              border: "1px solid #dde1f3",
              outline: "none",
              fontSize: 14,
              resize: "vertical",
            }}
          />
        </div>

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
              padding: "10px 20px",
              borderRadius: 999,
              border: "1px solid #dde1f3",
              backgroundColor: "#fff",
              cursor: "pointer",
              fontWeight: 500,
            }}
          >
            Làm mới form
          </button>
          <button
            type="submit"
            disabled={loading}
            style={{
              padding: "10px 26px",
              borderRadius: 999,
              border: "none",
              background:
                "linear-gradient(135deg, #ff6cab 0%, #ff8f6c 100%)",
              color: "#fff",
              cursor: "pointer",
              fontWeight: 600,
              boxShadow: "0 12px 24px rgba(255,108,171,0.45)",
              opacity: loading ? 0.7 : 1,
            }}
          >
            {editingId ? "Cập nhật thông tin học viên" : "Lưu thông tin học viên"}
          </button>
        </div>
      </form>

      {/* Bảng tìm kiếm & chỉnh sửa học viên NEW */}
      <div style={{ marginTop: 32 }}>
        <h3
          style={{
            fontSize: 16,
            fontWeight: 700,
            marginBottom: 8,
          }}
        >
          🔍 Tìm kiếm & chỉnh sửa học viên mới (status = NEW)
        </h3>
        <p style={{ color: "#666", marginBottom: 12, fontSize: 14 }}>
          Nhập họ tên, số điện thoại hoặc email để tìm các học viên mới đăng
          ký. Chọn nút <b>Sửa</b> để đổ dữ liệu lên form phía trên.
        </p>

        <form
          onSubmit={handleSearchNewStudents}
          style={{ display: "flex", gap: 12, marginBottom: 12 }}
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
              border: "1px solid #dde1f3",
              outline: "none",
              fontSize: 14,
            }}
          />
          <button
            type="submit"
            style={{
              padding: "10px 20px",
              borderRadius: 999,
              border: "none",
              background: "#1677ff",
              color: "#fff",
              cursor: "pointer",
              fontWeight: 600,
            }}
          >
            Tìm học viên mới
          </button>
        </form>

        <div
          style={{
            borderRadius: 16,
            border: "1px solid #edf1ff",
            overflow: "hidden",
            backgroundColor: "#fff",
          }}
        >
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
                  backgroundColor: "#fafbff",
                  borderBottom: "1px solid #edf1ff",
                }}
              >
                <th style={{ padding: "8px 12px", textAlign: "left" }}>STT</th>
                <th style={{ padding: "8px 12px", textAlign: "left" }}>Họ tên</th>
                <th style={{ padding: "8px 12px", textAlign: "left" }}>SĐT</th>
                <th style={{ padding: "8px 12px", textAlign: "left" }}>Email</th>
                <th style={{ padding: "8px 12px", textAlign: "left" }}>Level</th>
                <th style={{ padding: "8px 12px", textAlign: "center" }}>Sửa</th>
              </tr>
            </thead>
            <tbody>
              {newStudents.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    style={{ padding: "10px 12px", textAlign: "center", color: "#999" }}
                  >
                    Chưa có học viên mới nào (status = NEW).
                  </td>
                </tr>
              ) : (
                newStudents.map((st, idx) => (
                  <tr key={st.id}>
                    <td style={{ padding: "8px 12px" }}>{idx + 1}</td>
                    <td style={{ padding: "8px 12px" }}>{st.full_name}</td>
                    <td style={{ padding: "8px 12px" }}>{st.phone}</td>
                    <td style={{ padding: "8px 12px" }}>{st.email}</td>
                    <td style={{ padding: "8px 12px" }}>{st.level}</td>
                    <td
                      style={{
                        padding: "8px 12px",
                        textAlign: "center",
                      }}
                    >
                      <button
                        type="button"
                        onClick={() => handleEditClick(st)}
                        style={{
                          padding: "6px 14px",
                          borderRadius: 999,
                          border: "none",
                          backgroundColor: "#ff7a45",
                          color: "#fff",
                          cursor: "pointer",
                          fontWeight: 600,
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
      </div>
    </section>
  );
}
