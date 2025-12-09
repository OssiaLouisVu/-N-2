// src/pages/StaffDashboard.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import AddStudentPanel from "../components/student/AddStudentPanel.jsx";

function StaffDashboard() {
  const navigate = useNavigate();
  const [activeFeature, setActiveFeature] = useState("studentManagement"); 
  // mặc định mở luôn Quản lý học viên, vẫn đóng/mở được

  const handleLogout = () => {
    localStorage.removeItem("currentUser");
    navigate("/login");
  };

  return (
    <div style={{ padding: 32 }}>
      <h1>Dashboard nhân viên trung tâm (STAFF)</h1>
      <p>Đây là màn hình làm việc của nhân viên lễ tân / CSKH.</p>

      {/* ===== Chức năng lớn trên dashboard (Use Case Quản lý học viên) ===== */}
      <div style={{ marginTop: 24 }}>
        <h3>📌 Chức năng</h3>
        <button
          onClick={() =>
            setActiveFeature((prev) =>
              prev === "studentManagement" ? null : "studentManagement"
            )
          }
          style={{
            marginTop: 8,
            padding: "10px 18px",
            borderRadius: 999,
            border: "none",
            backgroundColor:
              activeFeature === "studentManagement" ? "#4f46e5" : "#e5e7eb",
            color: activeFeature === "studentManagement" ? "#fff" : "#111827",
            cursor: "pointer",
            fontWeight: 500,
          }}
        >
          Quản lý học viên
        </button>
      </div>

      {/* ===== Khối Quản lý học viên (chứa nút con Học viên đăng ký mới) ===== */}
      {activeFeature === "studentManagement" && (
        <div style={{ marginTop: 32 }}>
          <AddStudentPanel />
        </div>
      )}

      {/* Nút đăng xuất góc trên bên phải */}
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
