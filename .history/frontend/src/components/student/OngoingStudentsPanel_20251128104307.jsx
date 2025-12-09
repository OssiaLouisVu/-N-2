// frontend/src/components/student/OngoingStudentsPanel.jsx
import { useState } from "react";
import { searchStudents } from "../../api/studentApi";

export default function OngoingStudentsPanel() {
  const [keyword, setKeyword] = useState("");
  const [students, setStudents] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleSearch = async (e) => {
    e.preventDefault();
    setMessage("");
    setSelected(null);

    try {
      setLoading(true);
      const list = await searchStudents({
        keyword,
        status: "ACTIVE", // chỉ lấy học viên đang học
      });
      setStudents(list);
      if (list.length === 0) {
        setMessage("Không tìm thấy học viên đang học phù hợp.");
      }
    } catch (err) {
      console.error(err);
      setMessage("Lỗi khi tìm kiếm học viên đang học.");
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
      }}
    >
      <h3
        style={{
          fontSize: 18,
          fontWeight: 700,
          marginBottom: 8,
        }}
      >
        👨‍🎓 Học viên đang học &amp; quá trình học hiện tại
      </h3>
      <p style={{ color: "#555", marginBottom: 16 }}>
        Use case: <b>Học viên đang học</b> – nhân viên có thể tìm kiếm học viên
        đã được xếp lớp (status = ACTIVE), xem thông tin cơ bản và theo dõi các
        buổi học sắp tới. Hiện tại phần lịch học chi tiết đang để tạm, sau này
        sẽ nối với bảng lớp &amp; thời khóa biểu thật.
      </p>

      <form
        onSubmit={handleSearch}
        style={{ display: "flex", gap: 8, marginBottom: 16 }}
      >
        <input
          type="text"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          placeholder="Nhập SĐT / tên / email học viên đang học..."
          style={{
            flex: 1,
            padding: "10px 12px",
            borderRadius: 999,
            border: "1px solid #d9d9d9",
            fontSize: 14,
          }}
        />
        <button
          type="submit"
          style={{
            padding: "10px 22px",
            borderRadius: 999,
            border: "none",
            background:
              "linear-gradient(135deg, #42a5f5 0%, #1e88e5 100%)",
            color: "#fff",
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          Tìm học viên đang học
        </button>
      </form>

      {loading && (
        <div
          style={{
            marginBottom: 12,
            padding: "8px 12px",
            borderRadius: 8,
            background: "#e6f4ff",
            borderLeft: "4px solid #1677ff",
            color: "#0050b3",
          }}
        >
          ⏳ Đang tìm kiếm...
        </div>
      )}

      {message && (
        <div
          style={{
            marginBottom: 12,
            padding: "8px 12px",
            borderRadius: 8,
            background: "#fff7e6",
            borderLeft: "4px solid #faad14",
            color: "#ad6800",
          }}
        >
          {message}
        </div>
      )}

      {/* Bảng danh sách học viên đang học */}
      {students.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              background: "#fff",
              borderRadius: 12,
              overflow: "hidden",
              border: "1px solid #f0f0f0",
            }}
          >
            <thead>
              <tr>
                <th style={thStyle}>STT</th>
                <th style={thStyle}>Họ tên</th>
                <th style={thStyle}>SĐT</th>
                <th style={thStyle}>Email</th>
                <th style={thStyle}>Level</th>
                <th style={thStyle}>Trạng thái</th>
                <th style={thStyle}>Xem</th>
              </tr>
            </thead>
            <tbody>
              {students.map((st, idx) => (
                <tr key={st.id}>
                  <td style={tdStyle}>{idx + 1}</td>
                  <td style={tdStyle}>{st.full_name}</td>
                  <td style={tdStyle}>{st.phone}</td>
                  <td style={tdStyle}>{st.email}</td>
                  <td style={tdStyle}>{st.level}</td>
                  <td style={tdStyle}>{st.status}</td>
                  <td style={tdStyle}>
                    <button
                      type="button"
                      onClick={() => setSelected(st)}
                      style={{
                        padding: "6px 12px",
                        borderRadius: 999,
                        border: "none",
                        background: "#1677ff",
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
        </div>
      )}

      {/* Quá trình học hiện tại – tạm thời mô phỏng */}
      {selected && (
        <div
          style={{
            marginTop: 12,
            padding: 16,
            borderRadius: 16,
            border: "1px dashed #d9d9d9",
            background: "#fafafa",
          }}
        >
          <h4 style={{ margin: "0 0 8px 0" }}>
            Quá trình học hiện tại của:{" "}
            <b>
              {selected.full_name} ({selected.phone})
            </b>
          </h4>
          <p style={{ margin: "4px 0 8px 0", color: "#555" }}>
            Hiện tại phần lịch buổi học đang để placeholder. Sau này khi bạn
            thiết kế CSDL lớp học, thời khóa biểu, ta sẽ:
          </p>
          <ul style={{ marginLeft: 20, color: "#555" }}>
            <li>Xem lớp học mà học viên đang tham gia.</li>
            <li>Danh sách các buổi học sắp tới.</li>
            <li>Tổng số buổi đã tham gia / vắng mặt (dựa trên bảng điểm danh).</li>
          </ul>
          <p style={{ marginTop: 8, fontStyle: "italic", color: "#888" }}>
            Hiện tại: chỉ mới tạo được khung use case đúng với “Học viên đang
            học &amp; xem quá trình học hiện tại”.
          </p>
        </div>
      )}
    </div>
  );
}

const thStyle = {
  padding: "8px 10px",
  background: "#fafafa",
  borderBottom: "1px solid #f0f0f0",
  textAlign: "left",
  fontWeight: 600,
  fontSize: 13,
};

const tdStyle = {
  padding: "8px 10px",
  borderBottom: "1px solid #f5f5f5",
  fontSize: 13,
};
