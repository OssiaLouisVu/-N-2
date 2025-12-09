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
      {/* Use Case lớn: Quản lý học viên */}
      <h1>Quản lý học viên</h1>
      <p>
        Chức năng dành cho nhân viên trung tâm: tiếp nhận học viên đăng ký mới,
        cấp tài khoản đăng nhập, tìm kiếm và cập nhật thông tin học viên.
      </p>

      {/* Use Case con: Học viên đăng ký mới + tìm kiếm & cập nhật */}
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
