// src/pages/StaffDashboard.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import AddStudentPanel from "../components/student/AddStudentPanel.jsx";

function StaffDashboard() {
  const navigate = useNavigate();

  // state bật/tắt khu vực "Quản lý học viên"
  const [showStudentManagement, setShowStudentManagement] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("currentUser");
    navigate("/login");
  };

  const handleToggleStudentManagement = () => {
    // Bấm lần 1: false -> true (hiện lên)
    // Bấm lần 2: true -> false (thu lại)
    setShowStudentManagement((prev) => !prev);
  };

  return (
    <div style={{ padding: 32 }}>
      {/* HEADER */}
      <header style={{ marginBottom: 32 }}>
        <h1
          style={{
            fontSize: 28,
            fontWeight: 700,
            marginBottom: 8,
          }}
        >
          Dashboard nhân viên trung tâm (STAFF)
        </h1>
        <p style={{ color: "#555" }}>
          Đây là màn hình làm việc của nhân viên lễ tân / CSKH.
        </p>

        {/* Nút Đăng xuất góc phải */}
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
      </header>

      {/* KHU VỰC CHỨC NĂNG */}
      <section style={{ marginBottom: 24 }}>
        <h3
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
        </h3>

        {/* Nút QUẢN LÝ HỌC VIÊN – CHỈ TOGGLE, KHÔNG navigate */}
        <button
          onClick={handleToggleStudentManagement}
          style={{
            padding: "10px 20px",
            borderRadius: 999,
            border: "none",
            cursor: "pointer",
            fontWeight: 600,
            fontSize: 14,
            background:
              showStudentManagement
                ? "linear-gradient(90deg,#4c6fff,#9b5cff)"
                : "#f1f2f6",
            color: showStudentManagement ? "#fff" : "#333",
            boxShadow: showStudentManagement
              ? "0 8px 18px rgba(76,111,255,0.35)"
              : "none",
            transition: "all 0.25s",
          }}
        >
          Quản lý học viên
        </button>
      </section>

      {/* KHỐI QUẢN LÝ HỌC VIÊN – ĐÓNG/MỞ THEO STATE */}
      {showStudentManagement && (
        <section
          style={{
            marginTop: 8,
            padding: 24,
            borderRadius: 16,
            backgroundColor: "#fff",
            boxShadow: "0 8px 24px rgba(15, 23, 42, 0.08)",
            maxWidth: 1100,
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
          <p style={{ color: "#555", marginBottom: 16 }}>
            Chức năng dành cho nhân viên trung tâm: tiếp nhận học viên đăng ký mới,
            cấp tài khoản đăng nhập, tìm kiếm và cập nhật thông tin học viên.
          </p>

          {/* Use case Học viên đăng ký mới + cấp tài khoản + tìm kiếm & cập nhật */}
          <AddStudentPanel />
        </section>
      )}
    </div>
  );
}

export default StaffDashboard;
