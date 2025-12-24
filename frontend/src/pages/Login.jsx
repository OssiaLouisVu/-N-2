// frontend/src/pages/Login.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

function Login() {
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  // UI state for focus/hover to provide nicer input/button effects
  const [focusUsername, setFocusUsername] = useState(false);
  const [focusPassword, setFocusPassword] = useState(false);
  const [hoverLogin, setHoverLogin] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Kiểm tra phiên đăng nhập lúc mở trang
  useEffect(() => {
    const stored = localStorage.getItem("currentUser");
    if (stored) {
      try {
        const user = JSON.parse(stored);
        const rolePathMap = {
          STUDENT: "/student/dashboard",
          TEACHER: "/teacher/dashboard",
          STAFF: "/staff/dashboard",
          ACCOUNTANT: "/accountant/dashboard",
          MANAGER: "/manager/dashboard",
        };
        const path = rolePathMap[user.role];
        if (path) {
          navigate(path); // Redirect tới dashboard nếu đã đăng nhập
        }
      } catch (e) {
        // Xóa localStorage nếu lỗi parse
        localStorage.removeItem("currentUser");
      }
    }
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const res = await fetch("http://localhost:8080/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        setError(errData.message || "Sai tên đăng nhập hoặc mật khẩu");
        return;
      }

      const data = await res.json(); // { username, role }
      // Lưu lại thông tin user để StudentDashboard đọc
      localStorage.setItem("currentUser", JSON.stringify(data));

      const rolePathMap = {
        STUDENT: "/student/dashboard",
        TEACHER: "/teacher/dashboard",
        STAFF: "/staff/dashboard",
        ACCOUNTANT: "/accountant/dashboard",
        MANAGER: "/manager/dashboard",
      };

      const path = rolePathMap[data.role];

      if (!path) {
        setError("Vai trò không hợp lệ");
        return;
      }

      navigate(path);
    } catch (err) {
      console.error(err);
      setError("Không kết nối được tới server. Hãy kiểm tra backend.");
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "linear-gradient(180deg,#f8fafc 0%, #eef2ff 100%)",
        padding: 24,
      }}
    >
      <div
        style={{
          width: 460,
          maxWidth: "95%",
          backgroundColor: "#fff",
          borderRadius: 18,
          padding: "48px 40px 36px",
          boxShadow: "0 18px 45px rgba(15, 23, 42, 0.12)",
          position: "relative",
        }}
      >
        {/* decorative accent circle with lock icon */}
        <div
          style={{
            position: "absolute",
            left: "50%",
            transform: "translateX(-50%)",
            top: -36,
            width: 72,
            height: 72,
            borderRadius: "50%",
            background: "linear-gradient(135deg,#7c3aed,#4f46e5)",
            boxShadow: "0 12px 30px rgba(79,70,229,0.18)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <svg width="34" height="34" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 15a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" fill="#fff" opacity="0.95" />
            <path d="M17 8h-1V6a4 4 0 00-8 0v2H7a2 2 0 00-2 2v7a2 2 0 002 2h10a2 2 0 002-2v-7a2 2 0 00-2-2zM9 6a3 3 0 016 0v2H9V6z" fill="#fff" opacity="0.95" />
          </svg>
        </div>

        <h2
          style={{
            textAlign: "center",
            marginTop: 8,
            marginBottom: 6,
            fontSize: 22,
            fontWeight: 800,
            color: "#0f172a",
          }}
        >
          Đăng nhập hệ thống
        </h2>
        <p
          style={{
            textAlign: "center",
            marginBottom: 20,
            color: "#6b7280",
            fontSize: 14,
          }}
        >
          Trung tâm quản lý tiếng Trung
        </p>

        {error && (
          <p
            style={{
              color: "#ef4444",
              marginBottom: 12,
              fontSize: 14,
            }}
          >
            {error}
          </p>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 16 }}>
            <label
              style={{ display: "block", marginBottom: 8, fontWeight: 600 }}
            >
              Tên đăng nhập
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              onFocus={() => setFocusUsername(true)}
              onBlur={() => setFocusUsername(false)}
              placeholder="vd: student1, teacher1, manager1..."
              style={{
                width: "100%",
                padding: "12px 14px",
                borderRadius: 10,
                border: `1px solid ${focusUsername ? "#6366f1" : "#e6e7eb"}`,
                outline: "none",
                boxShadow: focusUsername
                  ? "0 6px 18px rgba(99,102,241,0.12)"
                  : "none",
                transition: "all 160ms ease",
              }}
            />
          </div>

          <div style={{ marginBottom: 18 }}>
            <label
              style={{ display: "block", marginBottom: 8, fontWeight: 600 }}
            >
              Mật khẩu
            </label>
            <div style={{ position: "relative" }}>
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onFocus={() => setFocusPassword(true)}
                onBlur={() => setFocusPassword(false)}
                placeholder="vd: pass1234 / pass12345"
                style={{
                  width: "100%",
                  padding: "12px 42px 12px 14px",
                  borderRadius: 10,
                  border: `1px solid ${focusPassword ? "#6366f1" : "#e6e7eb"}`,
                  outline: "none",
                  boxShadow: focusPassword
                    ? "0 6px 18px rgba(99,102,241,0.12)"
                    : "none",
                  transition: "all 160ms ease",
                }}
              />

              <button
                type="button"
                onClick={() => setShowPassword((s) => !s)}
                style={{
                  position: "absolute",
                  right: 8,
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "transparent",
                  border: "none",
                  padding: 6,
                  cursor: "pointer",
                  color: "#374151",
                  fontSize: 13,
                }}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? "Ẩn" : "Hiện"}
              </button>
            </div>
            <div style={{ textAlign: "right", marginTop: 8 }}>
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  navigate("/forgot-password");
                }}
                style={{ color: "#4f46e5", textDecoration: "none", fontSize: 13 }}
              >
                Quên mật khẩu?
              </a>
            </div>
          </div>

          <button
            type="submit"
            onMouseEnter={() => setHoverLogin(true)}
            onMouseLeave={() => setHoverLogin(false)}
            style={{
              width: "100%",
              padding: "12px 0",
              borderRadius: 999,
              border: "none",
              background: hoverLogin
                ? "linear-gradient(90deg,#4f46e5,#06b6d4)"
                : "linear-gradient(90deg,#6366f1,#3b82f6)",
              color: "#fff",
              fontWeight: 700,
              cursor: "pointer",
              marginBottom: 18,
              boxShadow: hoverLogin
                ? "0 10px 30px rgba(59,130,246,0.18)"
                : "0 8px 20px rgba(79,70,229,0.12)",
              transition: "all 180ms ease",
            }}
          >
            Đăng nhập
          </button>
        </form>

        
      </div>
    </div>
  );
}

export default Login;
