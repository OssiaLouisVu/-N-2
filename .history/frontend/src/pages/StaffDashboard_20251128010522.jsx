// src/pages/StaffDashboard.jsx
import { useNavigate } from "react-router-dom";
import AddStudentPanel from "../components/student/AddStudentPanel.jsx";
import { useState } from "react";

function StaffDashboard() {
  const navigate = useNavigate();
  const [activeSubFeature, setActiveSubFeature] = useState("NEW_STUDENT"); 
  // NEW_STUDENT | CURRENT_STUDENT | ALUMNI (để dành)

  const handleLogout = () => {
    localStorage.removeItem("currentUser");
    navigate("/login");
  };

  return (
    <div style={{ padding: 32 }}>
      {/* Tiêu đề use case cha: Quản lý học viên */}
      <h1 style={{ marginBottom: 4 }}>Quản lý học viên</h1>
      <p style={{ marginBottom: 24, color: "#4b5563" }}>
        Chức năng dành cho nhân viên trung tâm: tiếp nhận học viên đăng ký mới,
        cấp tài khoản đăng nhập, tìm kiếm và cập nhật thông tin học viên.
      </p>

      {/* Nhóm nút thể hiện các use case con */}
      <div
        style={{
          display: "flex",
          gap: 12,
          marginBottom: 24,
          flexWrap: "wrap",
        }}
      >
        <button
          type="button"
          onClick={() => setActiveSubFeature("NEW_STUDENT")}
          style={{
            padding: "8px 16px",
            borderRadius: 999,
            border:
              activeSubFeature === "NEW_STUDENT"
                ? "none"
                : "1px solid #e5e7eb",
            background:
              activeSubFeature === "NEW_STUDENT"
                ? "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)"
                : "#ffffff",
            color: activeSubFeature === "NEW_STUDENT" ? "#ffffff" : "#111827",
            fontWeight: 600,
            fontSize: 14,
            cursor: "pointer",
            boxShadow:
              activeSubFeature === "NEW_STUDENT"
                ? "0 4px 12px rgba(129,140,248,0.4)"
                : "none",
          }}
        >
          Học viên đăng ký mới
        </button>

        <button
          type="button"
          onClick={() => setActiveSubFeature("CURRENT_STUDENT")}
          style={{
            padding: "8px 16px",
            borderRadius: 999,
            border: "1px solid #e5e7eb",
            background: "#ffffff",
            color: "#6b7280",
            fontWeight: 500,
            fontSize: 14,
            cursor: "not-allowed", // để sau code tiếp
            opacity: 0.7,
          }}
          disabled
        >
          Học viên đang học (đang phát triển)
        </button>

        <button
          type="button"
          onClick={() => setActiveSubFeature("ALUMNI")}
          style={{
            padding: "8px 16px",
            borderRadius: 999,
            border: "1px solid #e5e7eb",
            background: "#ffffff",
            color: "#6b7280",
            fontWeight: 500,
            fontSize: 14,
            cursor: "not-allowed",
            opacity: 0.7,
          }}
          disabled
        >
          Học viên đã học (đang phát triển)
        </button>
      </div>

      {/* Use case con: Học viên đăng ký mới */}
      {activeSubFeature === "NEW_STUDENT" && <AddStudentPanel />}

      {/* Các sub-feature khác bạn sẽ thêm component sau này
      {activeSubFeature === "CURRENT_STUDENT" && <CurrentStudentPanel />}
      {activeSubFeature === "ALUMNI" && <AlumniStudentPanel />}
      */}

      {/* Nút đăng xuất góc trên bên phải màn hình */}
      <button
        onClick={handleLogout}
        style={{
          position: "fixed",
          top: 16,
          right: 24,
          padding: "8px 16px",
          borderRadius: 8,
          border: "none",
          backgroundColor: "#ff4d4f",
          color: "#fff",
          cursor: "pointer",
          fontWeight: 500,
          zIndex: 1000,
        }}
      >
        Đăng xuất
      </button>
    </div>
  );
}

export default StaffDashboard;
