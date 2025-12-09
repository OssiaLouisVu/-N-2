// src/components/mockExam/MockExamPanel.jsx
import { useEffect, useMemo, useState } from "react";
import { fetchTeacherMockExamResults } from "../../api/mockExamApi";

function formatDate(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return dateStr; // fallback nếu chuỗi lạ
  return d.toLocaleDateString("vi-VN"); // ra dạng 1/6/2025
}

function computeStatusFromDate(dateStr) {
  if (!dateStr) return "UNKNOWN";
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return "UNKNOWN";

  const today = new Date();
  // so sánh theo ngày, bỏ phần giờ
  const key = (x) =>
    `${x.getFullYear()}-${x.getMonth()}-${x.getDate()}`;

  const kItem = key(d);
  const kToday = key(today);

  if (kItem < kToday) return "FINISHED";
  if (kItem === kToday) return "ONGOING";
  return "UPCOMING";
}

export default function MockExamPanel() {
  const [examName, setExamName] = useState("");
  const [date, setDate] = useState(""); // yyyy-mm-dd từ input date
  const [statusFilter, setStatusFilter] = useState("ALL"); // ALL | FINISHED | ONGOING | UPCOMING
  const [keywordStudent, setKeywordStudent] = useState("");

  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // ====== STATE CHI TIẾT ĐIỂM THI ======
  const [selectedResult, setSelectedResult] = useState(null);
  const [showDetail, setShowDetail] = useState(false);

  const handleViewDetail = (item) => {
    setSelectedResult(item);
    setShowDetail(true);
  };

  const closeDetail = () => {
    setSelectedResult(null);
    setShowDetail(false);
  };

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

  // Gọi API lấy toàn bộ kết quả thi thử của giảng viên
  const loadData = async () => {
    try {
      setLoading(true);
      setError("");

      // Backend chỉ cần trả 1 mảng results; lọc làm ở FE
      const data = await fetchTeacherMockExamResults();

      // Bổ sung status nếu backend không trả
      const processed = (data || []).map((item) => ({
        ...item,
        status: item.status || computeStatusFromDate(item.date),
      }));

      setResults(processed);
      setSelectedResult(null);
      setShowDetail(false);
    } catch (err) {
      console.error(err);
      setError(err.message || "Không tải được danh sách điểm thi thử");
    } finally {
      setLoading(false);
    }
  };

  // Load lần đầu
  useEffect(() => {
    loadData();
  }, []);

  // Lọc theo TẤT CẢ tiêu chí: kỳ thi, ngày thi, trạng thái, username
  const filteredResults = useMemo(() => {
    const examKw = examName.trim().toLowerCase();
    const studentKw = keywordStudent.trim().toLowerCase();

    return (results || []).filter((r) => {
      // lọc theo tên kỳ thi
      if (examKw && !r.examName?.toLowerCase().includes(examKw)) {
        return false;
      }

      // lọc theo ngày thi (so sánh yyyy-mm-dd)
      if (date) {
        const d = new Date(r.date);
        if (!Number.isNaN(d.getTime())) {
          const itemKey = d.toISOString().slice(0, 10); // yyyy-mm-dd
          if (itemKey !== date) return false;
        }
      }

      // lọc theo trạng thái
      if (statusFilter !== "ALL" && r.status !== statusFilter) {
        return false;
      }

      // lọc theo username học viên
      if (studentKw && !r.username?.toLowerCase().includes(studentKw)) {
        return false;
      }

      return true;
    });
  }, [results, examName, date, statusFilter, keywordStudent]);

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
          marginBottom: 12,
          color: "#333",
        }}
      >
        🎯 Xem danh sách điểm thi thử
      </h2>

      <p style={{ fontSize: 14, color: "#555", marginBottom: 16 }}>
        Giảng viên có thể xem danh sách điểm thi thử của học viên theo kỳ thi,
        ngày thi và trạng thái (đã thi / đang thi / sắp thi).
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
            placeholder="VD: Thi thử HSK3 tháng 12"
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

        <button
          onClick={loadData}
          style={{
            padding: "10px 18px",
            borderRadius: 8,
            border: "none",
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            color: "#fff",
            fontWeight: 600,
            cursor: "pointer",
            boxShadow: "0 4px 12px rgba(102,126,234,0.4)",
            minWidth: 120,
          }}
          disabled={loading}
        >
          {loading ? "Đang tải..." : "Lọc"}
        </button>
      </div>

      {error && (
        <p style={{ color: "red", marginBottom: 12, fontSize: 14 }}>{error}</p>
      )}

      {/* Bảng kết quả */}
      <div style={{ marginTop: 8 }}>
        <table style={tableStyle}>
          <thead>
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
          </thead>
          <tbody>
            {filteredResults.map((r, idx) => (
              <tr key={r.id}>
                <td style={tdStyle}>{idx + 1}</td>
                <td style={tdStyle}>{r.username}</td>
                <td style={tdStyle}>{r.examName}</td>
                <td style={tdStyle}>{formatDate(r.date)}</td>
                <td style={tdStyle}>
  {r.status === "FINISHED" ? r.score : ""}
</td>

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
                    onClick={() => handleViewDetail(r)}
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
            {filteredResults.length === 0 && !loading && (
              <tr>
                <td style={tdStyle} colSpan={8}>
                  Không có kết quả phù hợp.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Khung chi tiết điểm thi thử */}
      {showDetail && selectedResult && (
        <div
          style={{
            marginTop: 24,
            padding: 20,
            borderRadius: 12,
            background: "#ffffff",
            boxShadow: "0 8px 24px rgba(15,23,42,0.15)",
          }}
        >
          <h3 style={{ marginTop: 0, marginBottom: 12 }}>
            Chi tiết điểm thi thử
          </h3>

          <p>
            <b>Học viên:</b> {selectedResult.username}
          </p>
          <p>
            <b>Kỳ thi:</b> {selectedResult.examName}
          </p>
          <p>
            <b>Ngày thi:</b> {formatDate(selectedResult.date)}
          </p>
          <p>
            <b>Điểm tổng:</b> {selectedResult.score}
          </p>
          <p>
            <b>Trạng thái:</b> {getStatusLabel(selectedResult.status)}
          </p>
          <p>
            <b>Ghi chú:</b> {selectedResult.feedback || "Không có ghi chú"}
          </p>

          {Array.isArray(selectedResult.sections) &&
            selectedResult.sections.length > 0 && (
              <>
                <h4 style={{ marginTop: 16 }}>Điểm theo kỹ năng</h4>
                <ul style={{ paddingLeft: 20 }}>
                  {selectedResult.sections.map((sec) => (
                    <li key={sec.name} style={{ marginBottom: 4 }}>
                      <b>{sec.name}:</b> {sec.score}/{sec.max_score}
                    </li>
                  ))}
                </ul>
              </>
            )}

          <button
            onClick={closeDetail}
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
