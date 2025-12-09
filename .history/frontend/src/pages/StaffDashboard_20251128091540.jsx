// src/pages/StaffDashboard.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import AddStudentPanel from "../components/student/AddStudentPanel.jsx";

import OngoingStudentsPanel from "../components/student/OngoingStudentsPanel";

export default function StaffDashboard() {
  return (
    <div>
      {/* ... header, menu ... */}

      <AddStudentPanel />

      {/* Học viên đang học */}
      <OngoingStudentsPanel />
    </div>
  );
}

function StaffDashboard() {
  const navigate = useNavigate();

  // giống teacher: 1 state để bật/tắt khu "Quản lý học viên"
  const [showStudentSection, setShowStudentSection] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("currentUser");
    navigate("/login");
  };

  const handleToggleStudentSection = () => {
    setShowStudentSection((prev) => !prev);
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        padding: "32px 80px",
        background: "linear-gradient(180deg, #f5f7fb 0%, #ffffff 40%)",
        position: "relative",
      }}
    >
      {/* Nút Đăng xuất (giống teacher) */}
      <button
        onClick={handleLogout}
        style={{
          position: "fixed",
          top: 16,
          right: 24,
          padding: "8px 18px",
          borderRadius: 999,
          border: "1px solid #ff4d4f",
          backgroundColor: "#fff",
          color: "#ff4d4f",
          cursor: "pointer",
          fontWeight: 500,
        }}
      >
        Đăng xuất
      </button>

      {/* HEADER */}
      <div style={{ maxWidth: 900 }}>
        <h1
          style={{
            fontSize: 32,
            fontWeight: 700,
            marginBottom: 8,
          }}
        >
          Dashboard nhân viên trung tâm (STAFF)
        </h1>
        <p style={{ color: "#555", marginBottom: 32 }}>
          Đây là màn hình làm việc của nhân viên lễ tân / CSKH.
        </p>
      </div>

      {/* KHU CHỨC NĂNG – GIỐNG TEACHER */}
      <section style={{ marginBottom: 32 }}>
        <h2
          style={{
            fontSize: 18,
            fontWeight: 600,
            marginBottom: 12,
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          <span role="img" aria-label="pin">
            📌
          </span>
          Chức năng
        </h2>

        <div style={{ display: "flex", gap: 16 }}>
          {/* NÚT QUẢN LÝ HỌC VIÊN – CHỈ BẬT/TẮT NỘI DUNG DƯỚI, KHÔNG NAVIGATE */}
          <button
            onClick={handleToggleStudentSection}
            style={{
              padding: "12px 24px",
              borderRadius: 999,
              border: "none",
              cursor: "pointer",
              fontWeight: 600,
              fontSize: 15,
              boxShadow: showStudentSection
                ? "0 10px 20px rgba(88, 101, 242, 0.25)"
                : "0 4px 10px rgba(0,0,0,0.08)",
              background: showStudentSection
                ? "linear-gradient(135deg, #5865f2, #7b5cff)"
                : "#f2f3ff",
              color: showStudentSection ? "#fff" : "#333",
              transition: "all 0.25s",
            }}
          >
            Quản lý học viên
          </button>

          {/* sau này bạn có thể thêm nút khác ở đây */}
        </div>
      </section>

      {/* NỘI DUNG QUẢN LÝ HỌC VIÊN – NẰM NGAY DƯỚI, GIỐNG TEACHER */}
      {showStudentSection && (
        <section id="student-section" style={{ marginTop: 24, maxWidth: 1100 }}>
          <div
            style={{
              borderRadius: 24,
              backgroundColor: "#ffffff",
              boxShadow: "0 18px 40px rgba(15, 23, 42, 0.08)",
              padding: 28,
              border: "1px solid #eef0ff",
            }}
          >
            <h2
              style={{
                fontSize: 22,
                fontWeight: 700,
                marginBottom: 8,
              }}
            >
              Quản lý học viên
            </h2>
            <p style={{ color: "#555", marginBottom: 24 }}>
              Chức năng dành cho nhân viên trung tâm: tiếp nhận học viên đăng ký
              mới, cấp tài khoản đăng nhập, tìm kiếm và cập nhật thông tin học viên.
            </p>

            {/* Use case "Học viên đăng ký mới" + các use case con bên dưới */}
            <AddStudentPanel />
          </div>
        </section>
      )}
    </div>
  );
}

export default StaffDashboard;
