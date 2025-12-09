// frontend/src/components/student/AddStudentPanel.jsx
import { useState } from "react";
import { createStudent } from "../../api/studentApi";

export default function AddStudentPanel() {
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [level, setLevel] = useState("");
  const [note, setNote] = useState("");
  const [status, setStatus] = useState("NEW"); // NEW: mới đăng ký
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    if (!fullName.trim()) {
      setMessage("Vui lòng nhập họ tên học viên");
      return;
    }

    try {
      setLoading(true);

      await createStudent({
        fullName,
        phone,
        email,
        level,
        note,
        status, // NEW / ACTIVE / COMPLETED ...
      });

      setMessage("✅ Đã lưu thông tin học viên (mới đăng ký).");
      setFullName("");
      setPhone("");
      setEmail("");
      setLevel("");
      setNote("");
      setStatus("NEW");
    } catch (err) {
      console.error(err);
      setMessage(err.message || "❌ Lỗi khi lưu học viên.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        borderRadius: 24,
        backgroundColor: "#ffffff",
        boxShadow: "0 18px 40px rgba(15, 23, 42, 0.08)",
        padding: 24,
        border: "1px solid #eef0ff",
        marginBottom: 24,
      }}
    >
      <h3
        style={{
          fontSize: 18,
          fontWeight: 700,
          marginBottom: 8,
        }}
      >
        🧾 Học viên đăng ký mới &amp; lưu thông tin
      </h3>
      <p style={{ color: "#555", marginBottom: 16 }}>
        Use case: <b>Học viên đăng ký mới</b> – nhân viên nhập thông tin cơ bản
        của học viên. Sau này khi xếp lớp, trạng thái sẽ được chuyển sang{" "}
        <b>Đang học (ACTIVE)</b>, và khi hoàn thành khoá sẽ chuyển sang{" "}
        <b>Đã học (COMPLETED)</b>.
      </p>

      {message && (
        <div
          style={{
            marginBottom: 12,
            padding: "10px 14px",
            borderRadius: 10,
            backgroundColor: message.startsWith("✅")
              ? "#f6ffed"
              : "#fff1f0",
            border: `1px solid ${
              message.startsWith("✅") ? "#b7eb8f" : "#ffa39e"
            }`,
            color: message.startsWith("✅") ? "#389e0d" : "#cf1322",
          }}
        >
          {message}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}
      >
        <div style={{ gridColumn: "1 / span 2" }}>
          <label style={{ fontWeight: 600, display: "block", marginBottom: 4 }}>
            Họ tên học viên *
          </label>
          <input
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Ví dụ: Vũ Đức Thịnh"
            style={{
              width: "100%",
              padding: "10px 12px",
              borderRadius: 12,
              border: "1px solid #d9d9d9",
              fontSize: 14,
            }}
          />
        </div>

        <div>
          <label style={{ fontWeight: 600, display: "block", marginBottom: 4 }}>
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
              borderRadius: 12,
              border: "1px solid #d9d9d9",
              fontSize: 14,
            }}
          />
        </div>

        <div>
          <label style={{ fontWeight: 600, display: "block", marginBottom: 4 }}>
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
              borderRadius: 12,
              border: "1px solid #d9d9d9",
              fontSize: 14,
            }}
          />
        </div>

        <div>
          <label style={{ fontWeight: 600, display: "block", marginBottom: 4 }}>
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
              borderRadius: 12,
              border: "1px solid #d9d9d9",
              fontSize: 14,
            }}
          />
        </div>

        <div>
          <label style={{ fontWeight: 600, display: "block", marginBottom: 4 }}>
            Trạng thái
          </label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            style={{
              width: "100%",
              padding: "10px 12px",
              borderRadius: 12,
              border: "1px solid #d9d9d9",
              fontSize: 14,
              backgroundColor: "#fff",
            }}
          >
            <option value="NEW">NEW – Mới đăng ký</option>
            <option value="ACTIVE">ACTIVE – Đang học</option>
            <option value="COMPLETED">COMPLETED – Đã học xong</option>
            <option value="INACTIVE">INACTIVE – Nghỉ / dừng học</option>
          </select>
        </div>

        <div style={{ gridColumn: "1 / span 2" }}>
          <label style={{ fontWeight: 600, display: "block", marginBottom: 4 }}>
            Ghi chú
          </label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={3}
            placeholder="Ví dụ: nguồn Facebook, bạn giới thiệu, nhu cầu học..."
            style={{
              width: "100%",
              padding: "10px 12px",
              borderRadius: 12,
              border: "1px solid #d9d9d9",
              fontSize: 14,
              resize: "vertical",
            }}
          />
        </div>

        <div style={{ gridColumn: "1 / span 2", textAlign: "right" }}>
          <button
            type="submit"
            disabled={loading}
            style={{
              padding: "10px 24px",
              borderRadius: 999,
              border: "none",
              background:
                "linear-gradient(135deg, #ff7aa2 0%, #ff4b8a 100%)",
              color: "#fff",
              fontWeight: 600,
              cursor: loading ? "not-allowed" : "pointer",
              boxShadow: "0 8px 20px rgba(255, 111, 179, 0.4)",
            }}
          >
            {loading ? "Đang lưu..." : "Lưu thông tin học viên"}
          </button>
        </div>
      </form>
    </div>
  );
}
