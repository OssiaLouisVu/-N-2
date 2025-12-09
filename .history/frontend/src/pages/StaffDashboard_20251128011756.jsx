// src/pages/StaffDashboard.jsx
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import AddStudentPanel from "../components/student/AddStudentPanel.jsx";

function StaffDashboard() {
  const navigate = useNavigate();

  // Feature cấp 1 của dashboard STAFF
  // Hiện tại mới có 1 feature: Quản lý học viên
  const [activeFeature, setActiveFeature] = useState("STUDENT_MANAGEMENT");
  // Use case con trong Quản lý học viên
  const [activeStudentSubFeature, setActiveStudentSubFeature] =
    useState("NEW_STUDENT"); // NEW_STUDENT | CURRENT_STUDENT | ALUMNI

  const handleLogout = () => {
    localStorage.removeItem("currentUser");
    navigate("/login");
  };

  return (
    <div style={{ padding: 32 }}>
      {/* TIÊU ĐỀ CHÍNH CỦA DASHBOARD STAFF */}
      <h1 style={{ marginBottom: 8 }}>Hệ thống quản lý nhân viên (STAFF)</h1>
      <p style={{ marginBottom: 24, color: "#4b5563", maxWidth: 800 }}>
        Đây là dashboard dành cho nhân viên lễ tân / CSKH: hỗ trợ tiếp nhận học
        viên mới, quản lý học viên, ca thi, thanh toán, v.v. (trong phạm vi demo
        hiện tại chỉ triển khai module Quản lý học viên).
      </p>

      {/* HÀNG NÚT CHỌN CHỨC NĂNG LỚN TRONG DASHBOARD STAFF */}
      <div
        style={{
          display: "flex",
          gap: 12,
          marginBottom: 24,
          flexWrap: "wrap",
        }}
      >
        {/* Feature: Quản lý học viên */}
        <button
          type="button"
          onClick={() => setActiveFeature("STUDENT_MANAGEMENT")}
          style={{
            padding: "10px 20px",
            borderRadius: 999,
            border:
              activeFeature === "STUDENT_MANAGEMENT"
                ? "none"
                : "1px solid #e5e7eb",
            background:
              activeFeature === "STUDENT_MANAGEMENT"
                ? "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)"
                : "#ffffff",
            color:
              activeFeature === "STUDENT_MANAGEMENT" ? "#ffffff" : "#111827",
            fontWeight: 600,
            fontSize: 14,
            cursor: "pointer",
            boxShadow:
              activeFeature === "STUDENT_MANAGEMENT"
                ? "0 4px 12px rgba(129,140,248,0.4)"
                : "none",
          }}
        >
          Quản lý học viên
        </button>

        {/* Các feature khác (để placeholder, sau này bạn code thêm) */}
        <button
          type="button"
          disabled
          style={{
            padding: "10px 20px",
            borderRadius: 999,
            border: "1px solid #e5e7eb",
            background: "#ffffff",
            color: "#9ca3af",
            fontWeight: 500,
            fontSize: 14,
            cursor: "not-allowed",
            opacity: 0.7,
          }}
        >
          Quản lý ca thi (đang phát triển)
        </button>

        <button
          type="button"
          disabled
          style={{
            padding: "10px 20px",
            borderRadius: 999,
            border: "1px solid #e5e7eb",
            background: "#ffffff",
            color: "#9ca3af",
            fontWeight: 500,
            fontSize: 14,
            cursor: "not-allowed",
            opacity: 0.7,
          }}
        >
          Quản lý tài chính (đang phát triển)
        </button>
      </div>

      {/* MODULE: QUẢN LÝ HỌC VIÊN (Use Case cha) */}
      {activeFeature === "STUDENT_MANAGEMENT" && (
        <div>
          {/* Tiêu đề của Use Case cha */}
          <h2 style={{ fontSize: 22, marginBottom: 4 }}>Quản lý học viên</h2>
          <p style={{ marginBottom: 16, color: "#6b7280", maxWidth: 750 }}>
            Chức năng cho nhân viên trung tâm: tiếp nhận học viên đăng ký mới,
            cấp tài khoản đăng nhập, tìm kiếm và cập nhật thông tin học viên,
            theo đúng sơ đồ Use Case &quot;Quản lý học viên&quot;.
          </p>

          {/* HÀNG NÚT USE CASE CON (Học viên đăng ký mới, đang học, đã học) */}
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
              onClick={() => setActiveStudentSubFeature("NEW_STUDENT")}
              style={{
                padding: "8px 16px",
                borderRadius: 999,
                border:
                  activeStudentSubFeature === "NEW_STUDENT"
                    ? "none"
                    : "1px solid #e5e7eb",
                background:
                  activeStudentSubFeature === "NEW_STUDENT"
                    ? "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)"
                    : "#ffffff",
                color:
                  activeStudentSubFeature === "NEW_STUDENT"
                    ? "#ffffff"
                    : "#111827",
                fontWeight: 600,
                fontSize: 14,
                cursor: "pointer",
                boxShadow:
                  activeStudentSubFeature === "NEW_STUDENT"
                    ? "0 4px 12px rgba(129,140,248,0.4)"
                    : "none",
              }}
            >
              Học viên đăng ký mới
            </button>

            <button
              type="button"
              disabled
              onClick={() => setActiveStudentSubFeature("CURRENT_STUDENT")}
              style={{
                padding: "8px 16px",
                borderRadius: 999,
                border: "1px solid #e5e7eb",
                background: "#ffffff",
                color: "#9ca3af",
                fontWeight: 500,
                fontSize: 14,
                cursor: "not-allowed",
                opacity: 0.7,
              }}
            >
              Học viên đang học (đang phát triển)
            </button>

            <button
              type="button"
              disabled
              onClick={() => setActiveStudentSubFeature("ALUMNI")}
              style={{
                padding: "8px 16px",
                borderRadius: 999,
                border: "1px solid #e5e7eb",
                background: "#ffffff",
                color: "#9ca3af",
                fontWeight: 500,
                fontSize: 14,
                cursor: "not-allowed",
                opacity: 0.7,
              }}
            >
              Học viên đã học (đang phát triển)
            </button>
          </div>

          {/* USE CASE CON: Học viên đăng ký mới */}
          {activeStudentSubFeature === "NEW_STUDENT" && <AddStudentPanel />}

          {/* Sau này bạn thêm component cho 2 case còn lại:
              {activeStudentSubFeature === "CURRENT_STUDENT" && <CurrentStudentPanel />}
              {activeStudentSubFeature === "ALUMNI" && <AlumniStudentPanel />}
          */}
        </div>
      )}

      {/* Nút đăng xuất cố định góc trên bên phải */}
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
