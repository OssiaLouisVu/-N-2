// src/components/mockExam/MockExamPanel.jsx
import { useEffect, useMemo, useState } from "react";
import {
  fetchTeacherMockExamResults,
  fetchTeacherMockExamShifts,
} from "../../api/mockExamApi";

// format dd/mm/yyyy
function formatDate(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString("vi-VN");
}

// Tính trạng thái từ ngày thi
function computeStatusFromDate(dateStr) {
  if (!dateStr) return "UNKNOWN";
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return "UNKNOWN";

  const today = new Date();
  const key = (x) => `${x.getFullYear()}-${x.getMonth()}-${x.getDate()}`;
  const kItem = key(d);
  const kToday = key(today);

  if (kItem < kToday) return "FINISHED";
  if (kItem === kToday) return "ONGOING";
  return "UPCOMING";
}

function getStatusLabel(status) {
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
}

function getStatusColor(status) {
  switch (status) {
    case "FINISHED":
      return "#16a34a";
    case "ONGOING":
      return "#f97316";
    case "UPCOMING":
      return "#2563eb";
    default:
      return "#6b7280";
  }
}
function normalizeDateKey(value) {
  if (!value) return "";

  // Nếu backend trả dạng "2025-06-01" hoặc "2025-06-01T00:00:00.000Z"
  if (typeof value === "string") {
    // Nếu là "YYYY-MM-DD" hoặc bắt đầu bằng "YYYY-MM-DD..."
    const match = value.match(/^(\d{4}-\d{2}-\d{2})/);
    if (match) {
      return match[1]; // "YYYY-MM-DD"
    }
    // Trường hợp khác: cố gắng parse Date
    const d = new Date(value);
    if (!Number.isNaN(d.getTime())) {
      return d.toISOString().slice(0, 10);
    }
    return "";
  }

  // Nếu lỡ là Date object
  if (value instanceof Date) {
    if (!Number.isNaN(value.getTime())) {
      return value.toISOString().slice(0, 10);
    }
  }

  return "";
}
// Chuẩn hoá chuỗi ngày về dạng YYYY-MM-DD để so sánh
function normalizeDateStr(input) {
  if (!input) return "";

  const trimmed = String(input).trim();

  // Nếu đã là dạng yyyy-mm-dd (từ <input type="date">)
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    return trimmed;
  }

  // Dạng d/m/yyyy hoặc dd/mm/yyyy (ví dụ "1/6/2025", "01/06/2025")
  const m = trimmed.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (m) {
    const d = m[1].padStart(2, "0");
    const mo = m[2].padStart(2, "0");
    const y = m[3];
    return `${y}-${mo}-${d}`; // 2025-06-01
  }

  return trimmed;
}

export default function MockExamPanel() {
  // Bộ lọc
  const [examName, setExamName] = useState("");
  const [date, setDate] = useState(""); // yyyy-mm-dd
  const [statusFilter, setStatusFilter] = useState("ALL"); // ALL | FINISHED | ONGOING | UPCOMING
  const [keywordStudent, setKeywordStudent] = useState("");

  // Dữ liệu
  const [shifts, setShifts] = useState([]); // ca thi (lịch thi)
  const [results, setResults] = useState([]); // điểm đã thi
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Chi tiết (xem thêm)
  const [detailItem, setDetailItem] = useState(null);
  const [detailType, setDetailType] = useState(null); // "SHIFT" | "SCORE"

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
    fontSize: 13,
  };
  const tdStyle = {
    padding: "10px 12px",
    borderBottom: "1px solid #f0f0f0",
    fontSize: 14,
  };

  // Gọi API
  const loadData = async (override = {}) => {
    const examFilter = override.examName ?? examName;
    const dateFilter = override.date ?? date;

    try {
      setLoading(true);
      setError("");

      const [shiftData, resultData] = await Promise.all([
        fetchTeacherMockExamShifts({ examName: examFilter, date: dateFilter }),
        fetchTeacherMockExamResults({ examName: examFilter, date: dateFilter }),
      ]);

      const processedShifts = (shiftData || []).map((s) => ({
        ...s,
        status: s.status || computeStatusFromDate(s.date),
      }));

      const processedResults = (resultData || []).map((r) => ({
        ...r,
        status: r.status || computeStatusFromDate(r.date),
      }));

      setShifts(processedShifts);
      setResults(processedResults);
      setDetailItem(null);
      setDetailType(null);
    } catch (err) {
      console.error(err);
      setError(err.message || "Không tải được dữ liệu thi thử");
    } finally {
      setLoading(false);
    }
  };

  // Load lần đầu: không filter gì
  useEffect(() => {
    loadData({ examName: "", date: "" });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Lọc ca thi (lịch thi)
// Lọc ca thi (lịch thi)
const filteredShifts = useMemo(() => {
  const examKw = examName.trim().toLowerCase();
  const filterDateKey = normalizeDateStr(date); // "YYYY-MM-DD" hoặc ""

  return (shifts || []).filter((s) => {
    // Lọc theo trạng thái
    if (statusFilter !== "ALL" && s.status !== statusFilter) {
      return false;
    }

    // Lọc theo tên kỳ thi
    if (examKw && !s.examName?.toLowerCase().includes(examKw)) {
      return false;
    }

    // Lọc theo ngày thi
    if (filterDateKey) {
      const itemKey = normalizeDateStr(s.date); // xử lý được cả "1/6/2025" lẫn "2025-06-01"
      if (!itemKey || itemKey !== filterDateKey) {
        return false;
      }
    }

    return true;
  });
}, [shifts, statusFilter, examName, date]);


  // Lọc điểm học viên (chỉ cho ĐÃ THI)
  const filteredResults = useMemo(() => {
    const examKw = examName.trim().toLowerCase();
    const studentKw = keywordStudent.trim().toLowerCase();

    return (results || []).filter((r) => {
      // Trạng thái: chỉ hiển thị khi ALL hoặc FINISHED
      if (statusFilter === "ONGOING" || statusFilter === "UPCOMING") {
        return false;
      }
      if (statusFilter === "FINISHED" && r.status !== "FINISHED") {
        return false;
      }

      if (examKw && !r.examName?.toLowerCase().includes(examKw)) {
        return false;
      }

      // lọc theo ngày thi (so sánh yyyy-mm-dd)
if (date) {
  const itemKey = normalizeDateKey(r.date); // chuẩn hóa về "YYYY-MM-DD"
  if (!itemKey || itemKey !== date) {
    return false;
  }
}

      if (studentKw && !r.username?.toLowerCase().includes(studentKw)) {
        return false;
      }

      return true;
    });
  }, [results, examName, date, statusFilter, keywordStudent]);

  const showScoresTable =
    statusFilter === "ALL" || statusFilter === "FINISHED";
  const showShiftsTable =
    statusFilter === "ALL" ||
    statusFilter === "ONGOING" ||
    statusFilter === "UPCOMING";

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
          color: "#111827",
        }}
      >
        🍀 Xem danh sách kỳ thi thử / điểm thi thử
      </h2>
      <p style={{ fontSize: 14, color: "#4b5563", marginBottom: 16 }}>
        Giảng viên có thể xem danh sách các kỳ thi thử đã / đang / sắp diễn ra
        và điểm thi thử của học viên. Bộ lọc theo tên kỳ thi, ngày thi, trạng
        thái kỳ thi và username học viên.
      </p>

      {/* Bộ lọc */}
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

        <div style={{ minWidth: 220 }}>
          <label style={{ fontSize: 13, fontWeight: 600 }}>
            Tìm theo học viên (username)
          </label>
          <input
            type="text"
            value={keywordStudent}
            onChange={(e) => setKeywordStudent(e.target.value)}
            placeholder="Chỉ áp dụng với kỳ đã thi"
            style={{
              width: "100%",
              padding: "8px 10px",
              borderRadius: 8,
              border: "1px solid #ddd",
              fontSize: 14,
            }}
          />
        </div>

        <button
          onClick={() => loadData()}
          style={{
            padding: "10px 18px",
            borderRadius: 8,
            border: "none",
            background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
            color: "#fff",
            fontWeight: 600,
            cursor: "pointer",
            boxShadow: "0 4px 12px rgba(129,140,248,0.5)",
            minWidth: 120,
          }}
          disabled={loading}
        >
          {loading ? "Đang tải..." : "Lọc / Làm mới"}
        </button>
      </div>

      {error && (
        <p style={{ color: "red", marginBottom: 12, fontSize: 14 }}>{error}</p>
      )}

      {/* BẢNG LỊCH CA THI */}
      {showShiftsTable && (
        <div style={{ marginTop: 16 }}>
          <h3
            style={{
              fontSize: 16,
              fontWeight: 700,
              color: "#111827",
              marginBottom: 8,
            }}
          >
            📅 Danh sách ca thi / lịch thi
          </h3>
          <table style={tableStyle}>
            <thead>
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
            </thead>
            <tbody>
              {filteredShifts.map((s, idx) => (
                <tr key={s.id}>
                  <td style={tdStyle}>{idx + 1}</td>
                  <td style={tdStyle}>{s.examName}</td>
                  <td style={tdStyle}>{formatDate(s.date)}</td>
                  <td style={tdStyle}>
                    {s.startTime} - {s.endTime}
                  </td>
                  <td style={tdStyle}>{s.room}</td>
                  <td style={tdStyle}>{s.registeredCount}</td>
                  <td style={tdStyle}>
                    <span
                      style={{
                        padding: "2px 8px",
                        borderRadius: 999,
                        background: getStatusColor(s.status) + "22",
                        color: getStatusColor(s.status),
                        fontWeight: 600,
                        fontSize: 12,
                      }}
                    >
                      {getStatusLabel(s.status)}
                    </span>
                  </td>
                  <td style={tdStyle}>
                    <button
                      onClick={() => {
                        setDetailType("SHIFT");
                        setDetailItem(s);
                      }}
                      style={{
                        padding: "6px 12px",
                        borderRadius: 999,
                        border: "none",
                        background:
                          "linear-gradient(135deg, #0ea5e9 0%, #2563eb 100%)",
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
              {filteredShifts.length === 0 && !loading && (
                <tr>
                  <td style={tdStyle} colSpan={8}>
                    Không có ca thi phù hợp.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* BẢNG ĐIỂM HỌC VIÊN */}
      {showScoresTable && (
        <div style={{ marginTop: 32 }}>
          <h3
            style={{
              fontSize: 16,
              fontWeight: 700,
              color: "#111827",
              marginBottom: 8,
            }}
          >
            📊 Danh sách điểm thi thử (chỉ các kỳ đã thi)
          </h3>
          <table style={tableStyle}>
            <thead>
              <tr>
                <th style={thStyle}>STT</th>
                <th style={thStyle}>Học viên (username)</th>
                <th style={thStyle}>Kỳ thi</th>
                <th style={thStyle}>Ngày thi</th>
                <th style={thStyle}>Giờ thi</th>
                <th style={thStyle}>Phòng</th>
                <th style={thStyle}>Điểm</th>
                <th style={thStyle}>Ghi chú</th>
                <th style={thStyle}></th>
              </tr>
            </thead>
            <tbody>
              {filteredResults.map((r, idx) => (
                <tr key={r.id}>
                  <td style={tdStyle}>{idx + 1}</td>
                  <td style={tdStyle}>{r.username}</td>
                  <td style={tdStyle}>{r.examName}</td>
                  <td style={tdStyle}>{formatDate(r.date)}</td>
                  <td style={tdStyle}>
                    {r.startTime && r.endTime
                      ? `${r.startTime} - ${r.endTime}`
                      : ""}
                  </td>
                  <td style={tdStyle}>{r.room || ""}</td>
                  <td style={tdStyle}>{r.score}</td>
                  <td style={tdStyle}>{r.feedback || ""}</td>
                  <td style={tdStyle}>
                    <button
                      onClick={() => {
                        setDetailType("SCORE");
                        setDetailItem(r);
                      }}
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
                      Xem điểm
                    </button>
                  </td>
                </tr>
              ))}
              {filteredResults.length === 0 && !loading && (
                <tr>
                  <td style={tdStyle} colSpan={9}>
                    Không có điểm thi phù hợp.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* KHUNG CHI TIẾT */}
      {detailItem && (
        <div
          style={{
            marginTop: 24,
            padding: 20,
            borderRadius: 12,
            background: "#f9fafb",
            border: "1px solid #e5e7eb",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 8,
            }}
          >
            <h3
              style={{
                margin: 0,
                fontSize: 16,
                fontWeight: 700,
                color: "#111827",
              }}
            >
              {detailType === "SHIFT"
                ? "Chi tiết ca thi / lịch thi"
                : "Chi tiết điểm thi thử"}
            </h3>
            <button
              onClick={() => {
                setDetailItem(null);
                setDetailType(null);
              }}
              style={{
                padding: "6px 12px",
                borderRadius: 999,
                border: "none",
                background: "#6b7280",
                color: "#fff",
                fontSize: 12,
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Đóng
            </button>
          </div>

          {detailType === "SHIFT" && (
            <>
              <p>
                <strong>Kỳ thi:</strong> {detailItem.examName}
              </p>
              <p>
                <strong>Ngày thi:</strong> {formatDate(detailItem.date)}
              </p>
              <p>
                <strong>Giờ thi:</strong> {detailItem.startTime} -{" "}
                {detailItem.endTime}
              </p>
              <p>
                <strong>Phòng:</strong> {detailItem.room}
              </p>
              <p>
                <strong>Số học viên đã đăng ký:</strong>{" "}
                {detailItem.registeredCount}
              </p>
              <p>
                <strong>Trạng thái:</strong>{" "}
                <span
                  style={{
                    padding: "2px 8px",
                    borderRadius: 999,
                    background: getStatusColor(detailItem.status) + "22",
                    color: getStatusColor(detailItem.status),
                    fontWeight: 600,
                    fontSize: 12,
                  }}
                >
                  {getStatusLabel(detailItem.status)}
                </span>
              </p>
            </>
          )}

          {detailType === "SCORE" && (
            <>
              <p>
                <strong>Học viên:</strong> {detailItem.username}
              </p>
              <p>
                <strong>Kỳ thi:</strong> {detailItem.examName}
              </p>
              <p>
                <strong>Ngày thi:</strong> {formatDate(detailItem.date)}
              </p>
              <p>
                <strong>Giờ thi:</strong>{" "}
                {detailItem.startTime && detailItem.endTime
                  ? `${detailItem.startTime} - ${detailItem.endTime}`
                  : ""}
              </p>
              <p>
                <strong>Phòng:</strong> {detailItem.room || ""}
              </p>
              <p>
                <strong>Điểm:</strong> {detailItem.score}
              </p>
              <p>
                <strong>Ghi chú:</strong> {detailItem.feedback || ""}
              </p>
            </>
          )}
        </div>
      )}
    </div>
  );
}
