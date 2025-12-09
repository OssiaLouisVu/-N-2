import { useNavigate } from "react-router-dom";
import { useState } from "react";
// Đã xoá quản lý thu học phí


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

      {/* Đã xoá toàn bộ khối chức năng và các nút chức năng */}
    </div>
  );
}

