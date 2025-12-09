import { useNavigate } from "react-router-dom";
import AddStudentPanel from "../components/student/AddStudentPanel.jsx";

function StaffDashboard() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("currentUser");
    navigate("/login");
  };

  return (
    <div style={{ padding: 32 }}>
      <h1>Hệ thống quản lý nhân viên (STAFF)</h1>
      <p>Đây là dashboard dành cho nhân viên lễ tân / CSKH.</p>
         <AddStudentPanel />
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
