import { useNavigate, Link } from "react-router-dom";

function AccountantDashboard() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("currentUser");
    navigate("/login");
  };

  return (
    <div style={{ padding: 32 }}>
      <h1>Hệ thống quản lý của kế toán (ACCOUNTANT)</h1>
      <p>Đây là dashboard dành cho bộ phận kế toán.</p>

      <div style={{ marginTop: 32 }}>
        <h3>Chức năng</h3>
        <ul>
          <li>
            <Link to="/accountant/fee-management">Quản lý thu học phí</Link>
          </li>
          {/* Có thể bổ sung các chức năng khác ở đây */}
        </ul>
      </div>

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

export default AccountantDashboard;
