// src/components/mockExam/MockExamPanel.jsx
import { useEffect, useMemo, useState } from "react";
import { fetchTeacherMockExamResults } from "../../api/mockExamApi";

// Format ngày dd/mm/yyyy
function formatDate(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString("vi-VN");
}

export default function MockExamPanel() {
  // Bộ lọc chung
  const [examName, setExamName] = useState("");
  const [date, setDate] = useState(""); // yyyy-mm-dd
  const [statusFilter, setStatusFilter] = useState("ALL"); // ALL | FINISHED | ONGOING | UPCOMING
  const [keywordStudent, setKeywordStudent] = useState("");

  // Mode hiển thị: lịch / điểm
  const [viewMode, setViewMode] = useState("SCHEDULE"); // SCHEDULE | RESULT

  const [rows, setRows] = useState([]);  // dữ liệu thô từ API
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Chi tiết khi bấm xem
  const [selectedItem, setSelectedItem] = useState(null);

  // Style bảng
  const tableStyle = {
    width: "100%",
    borderCollapse: "collapse",
    background: "#fff",
    border: "1px solid #e0e0e0",
    borderRadius: 8,
    overflow: "hidden",
  };
  const thStyle = {
    padding: "10px 12px",
    background: "#fafafa",
    borderBottom: "1px solid #e0e0e0",
    textAlign: "left",
    fontWeight: 600,
  };
  const tdStyle = {
    padding: "10px 12px",
    borderBottom: "1px solid #f0f0f0",
    fontSize: 14,
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case "FINISHED":
        return "Đã thi";
      case "ONGOING":
        return "Đang thi";
      case "UPCOMING":
        return "Sắp thi";
      default:
        return status || "";
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "FINISHED":
        return "#52c41a";
      case "ONGOING":
        return "#faad14";
      case "UPCOMING":
        return "#1890ff";
      default:
        return "#999";
    }
  };

  // Gọi API
  const loadData = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await fetchTeacherMockExamResults({
        examName: examName.trim() || undefined,
        date: date || undefined,
      });

      setRows(data || []);
      setSelectedItem(null);
    } catch (err) {
      console.error(err);
      setError(err.message || "Không tải được danh sách thi thử");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ===== 1) VIEW LỊCH – gom theo ca thi =====
  const scheduleRows = useMemo(() => {
    const examKw = examName.trim().toLowerCase();
    const map = new Map();

    (rows || []).forEach((r) => {
      // Lọc theo trạng thái kỳ thi
      if (statusFilter !== "ALL" && r.status !== statusFilter) return;

      // Lọc theo tên kỳ thi
      if (
        examKw &&
        !r.examName?.toLowerCase().includes(examKw)
      ) {
        return;
      }

      // Lọc theo ngày (nếu có) – đã lọc ở BE, nhưng để chắc chắn
      if (date && r.date) {
        const keyDate = new Date(r.date).toISOString().slice(0, 10);
        if (keyDate !== date) return;
      }

      const key =
        `${r.shiftId}|${r.examName}|${r.date}|${r.startTime}|${r.endTime}|${r.room}`;

      if (!map.has(key)) {
        map.set(key, {
          shiftId: r.shiftId,
          examName: r.examName,
          date: r.date,
          startTime: r.startTime,
          endTime: r.endTime,
          room: r.room,
          status: r.status,
          registeredCount: 0,
          finishedCount: 0,
          students: [],
        });
      }

      const item = map.get(key);

      if (r.username) {
        item.registeredCount += 1;
        item.students.push({
          username: r.username,
          score: r.score,
          feedback: r.feedback,
        });
        if (r.score != null) {
          item.finishedCount += 1;
        }
      }
    });

    return Array.from(map.values());
  }, [rows, examName, date, statusFilter]);

  // ===== 2) VIEW ĐIỂM – từng dòng = 1 học viên =====
  const resultRows = useMemo(() => {
    const examKw = examName.trim().toLowerCase();
    const studentKw = keywordStudent.trim().toLowerCase();

    return (rows || []).filter((r) => {
      // chỉ lấy các bản ghi có điểm
      if (r.score == null) return false;

      if (statusFilter !== "ALL" && r.status !== statusFilter) return false;

      if (examKw && !r.examName?.toLowerCase().includes(examKw)) return false;

      if (date && r.date) {
        const keyDate = new Date(r.date).toISOString().slice(0, 10);
        if (keyDate !== date) return false;
      }

      if (
        studentKw &&
        !r.username?.toLowerCase().includes(studentKw)
      ) {
        return false;
      }

      return true;
    });
  }, [rows, examName, date, statusFilter, keywordStudent]);

  return (
    <div
      style={{
        marginTop: 24,
        padding: 20,
        borderRadius: 12,
        background: "#ffffff",
        boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
      }}
    >
      <h2
        style={{
          fontSize: 22,
          fontWeight: 700,
          marginBottom: 8,
          color: "#333",
        }}
      >
        🎯 Xem danh sách thi thử / điểm thi thử
      </h2>

      <p style={{ fontSize: 14, color: "#555", marginBottom: 16 }}>
        Giảng viên có thể xem danh sách kỳ thi thử (lịch thi, ca thi) và tra cứu
        điểm thi thử theo học viên.
      </p>

      {/* Chọn nhánh: Lịch / Điểm */}
      <div
        style={{
          display: "inline-flex",
          borderRadius: 999,
          background: "#f3f4f6",
          padding: 4,
          marginBottom: 16,
        }}
      >
        <button
          onClick={() => setViewMode("SCHEDULE")}
          style={{
            padding: "8px 18px",
            borderRadius: 999,
            border: "none",
            cursor: "pointer",
            fontSize: 14,
            fontWeight: 600,
            background:
              viewMode === "SCHEDULE" ? "#ffffff" : "transparent",
            boxShadow:
              viewMode === "SCHEDULE"
                ? "0 2px 8px rgba(0,0,0,0.08)"
                : "none",
          }}
        >
          📆 Lịch thi / ca thi
        </button>
        <button
          onClick={() => setViewMode("RESULT")}
          style={{
            padding: "8px 18px",
            borderRadius: 999,
            border: "none",
            cursor: "pointer",
            fontSize: 14,
            fontWeight: 600,
            background:
              viewMode === "RESULT" ? "#ffffff" : "transparent",
            boxShadow:
              viewMode === "RESULT"
                ? "0 2px 8px rgba(0,0,0,0.08)"
                : "none",
          }}
        >
          🧾 Điểm thi theo học viên
        </button>
      </div>

      {/* Bộ lọc chung */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 12,
          marginBottom: 16,
          alignItems: "flex-end",
        }}
      >
        <div style={{ minWidth: 220 }}>
          <label style={{ fontSize: 13, fontWeight: 600 }}>Tên kỳ thi</label>
          <input
            type="text"
            value={examName}
            onChange={(e) => setExamName(e.target.value)}
            placeholder="VD: HSK2 Mock Test 01"
            style={{
              width: "100%",
              padding: "8px 10px",
              borderRadius: 8,
              border: "1px solid #ddd",
              fontSize: 14,
            }}
          />
        </div>

        <div>
          <label style={{ fontSize: 13, fontWeight: 600 }}>Ngày thi</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            style={{
              padding: "8px 10px",
              borderRadius: 8,
              border: "1px solid #ddd",
              fontSize: 14,
            }}
          />
        </div>

        <div>
          <label style={{ fontSize: 13, fontWeight: 600 }}>
            Trạng thái kỳ thi
          </label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{
              padding: "8px 10px",
              borderRadius: 8,
              border: "1px solid #ddd",
              fontSize: 14,
              minWidth: 180,
            }}
          >
            <option value="ALL">Tất cả</option>
            <option value="FINISHED">Đã thi</option>
            <option value="ONGOING">Đang thi (hôm nay)</option>
            <option value="UPCOMING">Sắp thi</option>
          </select>
        </div>

        {viewMode === "RESULT" && (
          <div style={{ minWidth: 220 }}>
            <label style={{ fontSize: 13, fontWeight: 600 }}>
              Tìm theo học viên (username)
            </label>
            <input
              type="text"
              value={keywordStudent}
              onChange={(e) => setKeywordStudent(e.target.value)}
              placeholder="Nhập username học viên..."
              style={{
                width: "100%",
                padding: "8px 10px",
                borderRadius: 8,
                border: "1px solid #ddd",
                fontSize: 14,
              }}
            />
          </div>
        )}

        <button
          onClick={loadData}
          style={{
            padding: "10px 18px",
            borderRadius: 8,
            border: "none",
            background:
              "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            color: "#fff",
            fontWeight: 600,
            cursor: "pointer",
            boxShadow: "0 4px 12px rgba(102,126,234,0.4)",
            minWidth: 120,
          }}
          disabled={loading}
        >
          {loading ? "Đang tải..." : "Lọc / Làm mới"}
        </button>
      </div>

      {error && (
        <p style={{ color: "red", marginBottom: 12, fontSize: 14 }}>
          {error}
        </p>
      )}

      {/* Bảng chính */}
      <div style={{ marginTop: 8 }}>
        <table style={tableStyle}>
          <thead>
            {viewMode === "SCHEDULE" ? (
              <tr>
                <th style={thStyle}>STT</th>
                <th style={thStyle}>Kỳ thi</th>
                <th style={thStyle}>Ngày thi</th>
                <th style={thStyle}>Giờ thi</th>
                <th style={thStyle}>Phòng</th>
                <th style={thStyle}>Số HV đã đăng ký</th>
                <th style={thStyle}>Trạng thái</th>
                <th style={thStyle}></th>
              </tr>
            ) : (
              <tr>
                <th style={thStyle}>STT</th>
                <th style={thStyle}>Học viên (username)</th>
                <th style={thStyle}>Kỳ thi</th>
                <th style={thStyle}>Ngày thi</th>
                <th style={thStyle}>Điểm</th>
                <th style={thStyle}>Trạng thái</th>
                <th style={thStyle}>Ghi chú</th>
                <th style={thStyle}></th>
              </tr>
            )}
          </thead>
          <tbody>
            {viewMode === "SCHEDULE"
              ? scheduleRows.map((item, idx) => (
                  <tr key={item.shiftId}>
                    <td style={tdStyle}>{idx + 1}</td>
                    <td style={tdStyle}>{item.examName}</td>
                    <td style={tdStyle}>{formatDate(item.date)}</td>
                    <td style={tdStyle}>
                      {item.startTime && item.endTime
                        ? `${item.startTime} - ${item.endTime}`
                        : ""}
                    </td>
                    <td style={tdStyle}>{item.room || ""}</td>
                    <td style={tdStyle}>{item.registeredCount}</td>
                    <td style={tdStyle}>
                      <span
                        style={{
                          padding: "2px 8px",
                          borderRadius: 999,
                          background: getStatusColor(item.status) + "22",
                          color: getStatusColor(item.status),
                          fontWeight: 600,
                          fontSize: 12,
                        }}
                      >
                        {getStatusLabel(item.status)}
                      </span>
                    </td>
                    <td style={tdStyle}>
                      <button
                        onClick={() => setSelectedItem(item)}
                        style={{
                          padding: "6px 12px",
                          borderRadius: 999,
                          border: "none",
                          background:
                            "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                          color: "#fff",
                          fontSize: 12,
                          fontWeight: 600,
                          cursor: "pointer",
                        }}
                      >
                        {item.status === "FINISHED"
                          ? "Xem danh sách điểm"
                          : "Xem lịch thi"}
                      </button>
                    </td>
                  </tr>
                ))
              : resultRows.map((r, idx) => (
                  <tr key={r.id}>
                    <td style={tdStyle}>{idx + 1}</td>
                    <td style={tdStyle}>{r.username}</td>
                    <td style={tdStyle}>{r.examName}</td>
                    <td style={tdStyle}>{formatDate(r.date)}</td>
                    <td style={tdStyle}>{r.score}</td>
                    <td style={tdStyle}>
                      <span
                        style={{
                          padding: "2px 8px",
                          borderRadius: 999,
                          background: getStatusColor(r.status) + "22",
                          color: getStatusColor(r.status),
                          fontWeight: 600,
                          fontSize: 12,
                        }}
                      >
                        {getStatusLabel(r.status)}
                      </span>
                    </td>
                    <td style={tdStyle}>{r.feedback || ""}</td>
                    <td style={tdStyle}>
                      <button
                        onClick={() => setSelectedItem(r)}
                        style={{
                          padding: "6px 12px",
                          borderRadius: 999,
                          border: "none",
                          background:
                            "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                          color: "#fff",
                          fontSize: 12,
                          fontWeight: 600,
                          cursor: "pointer",
                        }}
                      >
                        Xem chi tiết
                      </button>
                    </td>
                  </tr>
                ))}

            {((viewMode === "SCHEDULE" && scheduleRows.length === 0) ||
              (viewMode === "RESULT" && resultRows.length === 0)) &&
              !loading && (
                <tr>
                  <td style={tdStyle} colSpan={8}>
                    Không có kết quả phù hợp.
                  </td>
                </tr>
              )}
          </tbody>
        </table>
      </div>

      {/* KHUNG CHI TIẾT */}
      {selectedItem && (
        <div
          style={{
            marginTop: 24,
            padding: 20,
            borderRadius: 12,
            background: "#ffffff",
            boxShadow: "0 8px 24px rgba(15,23,42,0.15)",
          }}
        >
          {viewMode === "SCHEDULE" ? (
            <>
              <h3 style={{ marginTop: 0, marginBottom: 12 }}>
                Chi tiết ca thi thử
              </h3>
              <p>
                <b>Kỳ thi:</b> {selectedItem.examName}
              </p>
              <p>
                <b>Ngày thi:</b> {formatDate(selectedItem.date)}
              </p>
              <p>
                <b>Giờ thi:</b>{" "}
                {selectedItem.startTime && selectedItem.endTime
                  ? `${selectedItem.startTime} - ${selectedItem.endTime}`
                  : "Chưa có thông tin"}
              </p>
              <p>
                <b>Phòng thi:</b>{" "}
                {selectedItem.room || "Chưa có thông tin"}
              </p>
              <p>
                <b>Trạng thái:</b> {getStatusLabel(selectedItem.status)}
              </p>
              <p>
                <b>Số HV đã đăng ký:</b> {selectedItem.registeredCount}
              </p>

              {selectedItem.students.length > 0 ? (
                <>
                  <h4 style={{ marginTop: 16 }}>Danh sách học viên</h4>
                  <ul style={{ paddingLeft: 20 }}>
                    {selectedItem.students.map((st) => (
                      <li key={st.username}>
                        <b>{st.username}</b>
                        {st.score != null && ` - Điểm: ${st.score}`}
                      </li>
                    ))}
                  </ul>
                </>
              ) : (
                <p>
                  <i>Hiện chưa có học viên nào đăng ký ca thi này.</i>
                </p>
              )}
            </>
          ) : (
            <>
              <h3 style={{ marginTop: 0, marginBottom: 12 }}>
                Chi tiết điểm thi thử
              </h3>
              <p>
                <b>Học viên:</b> {selectedItem.username}
              </p>
              <p>
                <b>Kỳ thi:</b> {selectedItem.examName}
              </p>
              <p>
                <b>Ngày thi:</b> {formatDate(selectedItem.date)}
              </p>
              <p>
                <b>Điểm tổng:</b> {selectedItem.score}
              </p>
              <p>
                <b>Trạng thái:</b> {getStatusLabel(selectedItem.status)}
              </p>
              <p>
                <b>Ghi chú:</b>{" "}
                {selectedItem.feedback || "Không có ghi chú"}
              </p>
            </>
          )}

          <button
            onClick={() => setSelectedItem(null)}
            style={{
              marginTop: 16,
              padding: "8px 18px",
              borderRadius: 8,
              border: "none",
              background: "#e5e7eb",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Đóng
          </button>
        </div>
      )}
    </div>
  );
}
