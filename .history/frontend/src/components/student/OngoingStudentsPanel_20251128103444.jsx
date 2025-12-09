// src/components/student/OngoingStudentsPanel.jsx
import { useEffect, useState } from "react";
import { getStudents } from "../../api/studentApi";

export default function OngoingStudentsPanel() {
  const [phone, setPhone] = useState("");
  const [students, setStudents] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleSearch = async () => {
    if (!phone.trim()) {
      setMessage("Vui lòng nhập số điện thoại để tìm học viên đang học.");
      setStudents([]);
      setSelected(null);
      return;
    }

    setLoading(true);
    setMessage("");
    try {
      // chỉ lấy học viên đang học
      const data = await getStudents({ keyword: phone, status: "ACTIVE" });
      setStudents(data.students || []);
      setSelected(null);

      if (!data.students || data.students.length === 0) {
        setMessage("Không tìm thấy học viên đang học với SĐT này.");
      }
    } catch (err) {
      console.error(err);
      setMessage("Lỗi khi tìm kiếm học viên đang học.");
    } finally {
      setLoading(false);
    }
  };

  // format ngày dd-MM-yyyy cho đoạn "Quá trình học hiện tại"
  const formatVNDate = (dateString) => {
    if (!dateString) return "";
    const d = new Date(dateString);
    if (isNaN(d)) return dateString;
    const dd = String(d.getDate()).padStart(2, "0");
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const yyyy = d.getFullYear();
    return `${dd}-${mm}-${yyyy}`;
  };

  return (
    <div
      style={{
        borderRadius: 20,
        backgroundColor: "#fdfcff",
        border: "1px solid #f0e9ff",
        padding: 20,
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
        <span role="img" aria-label="student">
          🧑‍🎓
        </span>
        Học viên đang học &amp; quá trình học hiện tại
      </h3>
      <p style={{ color: "#555", marginBottom: 16 }}>
        Use case: <b>Học viên đang học</b> – Nhân viên có thể tìm kiếm học viên,
        xem nhanh thông tin cơ bản và xem các buổi học sắp tới mà học viên đang tham gia.
      </p>

      {/* Thanh tìm kiếm */}
      <div
        style={{
          display: "flex",
          gap: 12,
          marginBottom: 16,
        }}
      >
        <input
          type="text"
          placeholder="Nhập SĐT học viên để tìm học viên đang học..."
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          style={{
            flex: 1,
            padding: "10px 14px",
            borderRadius: 999,
            border: "1px solid #ddd",
            outline: "none",
            fontSize: 14,
          }}
        />
        <button
          onClick={handleSearch}
          style={{
            padding: "10px 20px",
            borderRadius: 999,
            border: "none",
            background:
              "linear-gradient(135deg, #22c55e 0%, #16a34a 100%)",
            color: "#fff",
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          Tìm học viên đang học
        </button>
      </div>

      {loading && (
        <p style={{ color: "#555", marginBottom: 8 }}>⏳ Đang tìm kiếm...</p>
      )}
      {message && (
        <p style={{ color: "#d4380d", marginBottom: 8 }}>{message}</p>
      )}

      {/* Bảng danh sách học viên đang học */}
      {students.length > 0 && (
        <>
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              backgroundColor: "#fff",
              borderRadius: 12,
              overflow: "hidden",
              marginTop: 8,
            }}
          >
            <thead>
              <tr style={{ backgroundColor: "#fafafa" }}>
                <th style={{ padding: "8px 12px", textAlign: "left" }}>STT</th>
                <th style={{ padding: "8px 12px", textAlign: "left" }}>Họ tên</th>
                <th style={{ padding: "8px 12px", textAlign: "left" }}>Username</th>
                <th style={{ padding: "8px 12px", textAlign: "left" }}>SĐT</th>
                <th style={{ padding: "8px 12px", textAlign: "left" }}>Level</th>
                <th style={{ padding: "8px 12px", textAlign: "left" }}>Trạng thái</th>
                <th style={{ padding: "8px 12px", textAlign: "left" }}>Xem chi tiết</th>
              </tr>
            </thead>
            <tbody>
              {students.map((st, idx) => (
                <tr key={st.id}>
                  <td style={{ padding: "8px 12px" }}>{idx + 1}</td>
                  <td style={{ padding: "8px 12px" }}>{st.full_name}</td>
                  <td style={{ padding: "8px 12px" }}>{st.username}</td>
                  <td style={{ padding: "8px 12px" }}>{st.phone}</td>
                  <td style={{ padding: "8px 12px" }}>{st.level}</td>
                  <td style={{ padding: "8px 12px" }}>{st.status}</td>
                  <td style={{ padding: "8px 12px" }}>
                    <button
                      onClick={() => setSelected(st)}
                      style={{
                        padding: "6px 12px",
                        borderRadius: 999,
                        border: "none",
                        backgroundColor: "#2563eb",
                        color: "#fff",
                        cursor: "pointer",
                        fontSize: 13,
                        fontWeight: 600,
                      }}
                    >
                      Xem quá trình hiện tại
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Quá trình học hiện tại – demo text, sau này nối lịch học thật */}
          {selected && (
            <div style={{ marginTop: 16 }}>
              <h4 style={{ marginBottom: 8 }}>
                Quá trình học hiện tại của:{" "}
                <b>
                  {selected.full_name} ({selected.username})
                </b>
              </h4>
              <p style={{ color: "#555" }}>
                Hiện tại demo chưa gắn với bảng lịch học thật. Sau này khi có
                bảng <code>student_schedule</code> đầy đủ, phần này sẽ hiển thị
                danh sách buổi học sắp tới của học viên (ngày học, giờ học, lớp, phòng).
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
