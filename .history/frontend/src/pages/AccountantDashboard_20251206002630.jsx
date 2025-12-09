import { useNavigate } from "react-router-dom";
import { useState } from "react";
import FeeManagementPanel from '../components/fee/FeeManagementPanel';


export default function AccountantDashboard() {
  const navigate = useNavigate();
  const stored = JSON.parse(localStorage.getItem("currentUser"));
  if (!stored) {
    window.location.href = "/login";
    return null;
  }
  const username = stored.username;

  const [showFee, setShowFee] = useState(true);
  const [showReport, setShowReport] = useState(false);
  const [showGuide, setShowGuide] = useState(false);

  return (
    <div style={{
      width: "100%",
      minHeight: "100vh",
      background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
      paddingTop: 0,
    }}>
      {/* Header */}
      <div
        style={{
          background: "linear-gradient(135deg, #ffb347 0%, #ffcc33 100%)",
          color: "#333",
          padding: "40px 20px",
          boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
          marginBottom: 30,
        }}
      >
        <div
          style={{
            maxWidth: 1050,
            margin: "0 auto",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div>
            <h1 style={{ margin: 0, fontSize: 32, fontWeight: 700 }}>
              Dashboard Kế toán
            </h1>
            <p style={{ margin: "8px 0 0 0", fontSize: 16, opacity: 0.9 }}>
              Xin chào, <b>{username}</b>
            </p>
          </div>
          <button
            onClick={() => {
              localStorage.removeItem("currentUser");
              navigate("/login");
            }}
            style={{
              padding: "10px 24px",
              background: "rgba(255,255,255,0.2)",
              color: "#333",
              border: "2px solid #fff",
              borderRadius: 6,
              cursor: "pointer",
              fontWeight: 600,
              transition: "all 0.3s",
              fontSize: 14,
            }}
            onMouseOver={e => e.target.style.background = "rgba(255,255,255,0.3)"}
            onMouseOut={e => e.target.style.background = "rgba(255,255,255,0.2)"}
          >
            Đăng xuất
          </button>
        </div>
      </div>

      {/* Khối chức năng */}
      <div style={{ display: "flex", justifyContent: "center", paddingBottom: 40 }}>
        <div style={{ width: 1050 }}>
          <div style={{ marginTop: 24, marginBottom: 24, clear: "both" }}>
            <div style={{ fontWeight: 700, marginBottom: 16, fontSize: 18, color: "#333" }}>
              💼 Chức năng
            </div>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              <button
                onClick={() => { setShowFee(true); setShowReport(false); setShowGuide(false); }}
                style={{
                  padding: "12px 20px",
                  borderRadius: 8,
                  border: "none",
                  background: "linear-gradient(135deg, #ffb347 0%, #ffcc33 100%)",
                  color: "#333",
                  cursor: "pointer",
                  fontWeight: 600,
                  boxShadow: "0 4px 12px rgba(255, 204, 51, 0.2)",
                  transition: "all 0.3s",
                  fontSize: 14,
                }}
              >
                Quản lý thu học phí
              </button>
              <button
                onClick={() => { setShowFee(false); setShowReport(true); setShowGuide(false); }}
                style={{
                  padding: "12px 20px",
                  borderRadius: 8,
                  border: "none",
                  background: "linear-gradient(135deg, #34d399 0%, #059669 100%)",
                  color: "#fff",
                  cursor: "pointer",
                  fontWeight: 600,
                  boxShadow: "0 4px 12px rgba(16, 185, 129, 0.2)",
                  transition: "all 0.3s",
                  fontSize: 14,
                }}
              >
                Báo cáo tổng hợp
              </button>
              <button
                onClick={() => { setShowFee(false); setShowReport(false); setShowGuide(true); }}
                style={{
                  padding: "12px 20px",
                  borderRadius: 8,
                  border: "none",
                  background: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
                  color: "#fff",
                  cursor: "pointer",
                  fontWeight: 600,
                  boxShadow: "0 4px 12px rgba(245, 87, 108, 0.2)",
                  transition: "all 0.3s",
                  fontSize: 14,
                }}
              >
                Hướng dẫn quy trình
              </button>
            </div>
          </div>

          {/* Panel chức năng */}
          {showFee && (
            <div style={{ marginTop: 30 }}>
              <FeeManagementPanel />
            </div>
          )}
          {showReport && (
            <div style={{ marginTop: 30 }}>
              <h2 style={{ fontSize: 24, fontWeight: 700, color: "#333", marginBottom: 16 }}>📊 Báo cáo tổng hợp thu học phí</h2>
              <p>Chức năng này sẽ hiển thị báo cáo tổng hợp thu học phí, số lượng học viên, số khoá học, tổng số tiền đã thu, ... (Có thể mở rộng xuất file Excel, lọc theo thời gian, ...)</p>
              {/* Có thể import component báo cáo ở đây */}
            </div>
          )}
          {showGuide && (
            <div style={{ marginTop: 30 }}>
              <h2 style={{ fontSize: 24, fontWeight: 700, color: "#333", marginBottom: 16 }}>📝 Hướng dẫn quy trình thu học phí</h2>
              <ol style={{ fontSize: 16, color: "#444", lineHeight: 1.7 }}>
                <li>Chọn chức năng <b>Quản lý thu học phí</b>.</li>
                <li>Chọn khoá học, xem danh sách học viên.</li>
                <li>Đăng ký học viên mới vào khoá học (nếu cần).</li>
                <li>Ghi nhận thanh toán học phí cho từng học viên.</li>
                <li>Xem lịch sử thanh toán, báo cáo tổng hợp.</li>
                <li>Có thể gửi thông báo cho học viên khi cần.</li>
              </ol>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

