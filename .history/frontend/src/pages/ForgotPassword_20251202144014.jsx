import { useState } from "react";
import { useNavigate } from "react-router-dom";

const API_BASE = "http://localhost:8080";

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [role, setRole] = useState("STAFF"); // Vai trò mặc định
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setSuccess(false);

    try {
      const res = await fetch(`${API_BASE}/api/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, role }),
      });

      const data = await res.json();
      
      if (data.success) {
        setSuccess(true);
        setMessage(data.message);
      } else {
        setMessage(data.message || "Có lỗi xảy ra, vui lòng thử lại");
      }
    } catch (e) {
      setMessage("Không thể kết nối đến server");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-md">
        <div className="text-center mb-6">
          <div className="text-5xl mb-3">🔐</div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            Quên mật khẩu?
          </h1>
          <p className="text-gray-600 mt-2">
            Chọn vai trò và nhập email để nhận link đặt lại mật khẩu
          </p>
        </div>

        {message && (
          <div className={`mb-4 p-4 rounded-lg ${success ? 'bg-green-50 border border-green-200 text-green-700' : 'bg-yellow-50 border border-yellow-200 text-yellow-700'}`}>
            <div className="flex items-start gap-2">
              <span className="text-xl">{success ? '✅' : '⚠️'}</span>
              <div className="flex-1">
                <p className="font-medium mb-1">
                  {success ? 'Thành công!' : 'Thông báo'}
                </p>
                <p className="text-sm">{message}</p>
              </div>
            </div>
          </div>
        )}

        {!success && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                👤 Bạn là
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                disabled={loading}
              >
                <option value="STUDENT">Học viên</option>
                <option value="TEACHER">Giáo viên</option>
                <option value="STAFF">Nhân viên lễ tân</option>
                <option value="ACCOUNTANT">Kế toán</option>
                <option value="MANAGER">Quản lý</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                📧 Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your.email@example.com"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                disabled={loading}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 rounded-lg font-semibold hover:from-indigo-700 hover:to-purple-700 transition transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Đang gửi..." : "📨 Gửi link đặt lại mật khẩu"}
            </button>
          </form>
        )}

        <div className="mt-6 text-center">
          <button
            onClick={() => navigate("/login")}
            className="text-indigo-600 hover:text-indigo-800 font-medium"
          >
            ← Quay lại đăng nhập
          </button>
        </div>
      </div>
    </div>
  );
}
