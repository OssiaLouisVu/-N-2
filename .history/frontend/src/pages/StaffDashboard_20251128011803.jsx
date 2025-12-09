// src/pages/StaffDashboard.jsx
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import AddStudentPanel from "../components/student/AddStudentPanel.jsx";

function StaffDashboard() {
  const navigate = useNavigate();

  // Bật/tắt khối QUẢN LÝ HỌC VIÊN (feature lớn của STAFF)
  const [showStudentManagement, setShowStudentManagement] = useState(true);

  const handleLogout = () => {
    localStorage.removeItem("currentUser");
    navigate("/login");
  };

  return (
    <div style={{ padding: 32 }}>
      {/* HEADER DASHBOARD */}
      <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 4 }}>
        Dashboard nhân viên trung tâm (STAFF)
      </h1>
      <p style={{ marginBottom: 24 }}>
        Đây là màn hình làm việc của nhân viên lễ tân / CSKH.
      </p>

      {/* THANH CHỨC NĂNG GIỐNG DASHBOARD GIÁO VIÊN */}
      <section style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 12 }}>
          📌 Chức năng
        </h2>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          {/* Nút đóng/mở QUẢN LÝ HỌC VIÊN */}
          <button
            type="button"
            onClick={() => setShowStudentManagement((prev) => !prev)}
            style={{
              padding: "10px 20px",
              borderRadius: 999,
              border: "none",
              cursor: "pointer",
              fontWeight: 600,
              fontSize: 14,
              color: "#ffffff",
              background: showStudentManagement
                ? "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)"
                : "#6b7280",
              boxShadow: showStudentManagement
                ? "0 4px 12px rgba(129,140,248,0.4)"
                : "none",
            }}
          >
            {showStudentManagement
              ? "Ẩn quản lý học viên"
              : "Quản lý học viên"}
          </button>

          {/* Sau này có thể thêm các nút chức năng STAFF khác ở đây */}
        </div>
      </section>

      {/* KHỐI QUẢN LÝ HỌC VIÊN – chỉ hiện khi showStudentManagement = true */}
      {showStudentManagement && (
        <section>
          <h2
            style={{
              fontSize: 22,
              fontWeight: 700,
              marginBottom: 8,
            }}
          >
            Quản lý học viên
          </h2>
          <p style={{ marginBottom: 16, color: "#4b5563" }}>
            Chức năng này dành cho nhân viên trung tâm: tiếp nhận học viên đăng
            ký mới, cấp tài khoản đăng nhập, tìm kiếm và cập nhật thông tin học
            viên.
          </p>

          {/* Use case con: Học viên đăng ký mới + Cấp tài khoản + Tìm kiếm & cập nhật */}
          <AddStudentPanel />
        </section>
      )}

      {/* Nút Đăng xuất luôn cố định góc trên bên phải */}
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
