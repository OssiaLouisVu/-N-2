
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const API_BASE = "http://localhost:8080";

export default function ManagerDashboard() {
  const navigate = useNavigate();
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ username: "", password: "", role: "STAFF", fullName: "" });
  const [message, setMessage] = useState("");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("ALL");

  useEffect(() => {
    fetchEmployees();
    // eslint-disable-next-line
  }, []);

  async function fetchEmployees() {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/employees?role=${filter}&search=${search}`);
      const data = await res.json();
      setEmployees(data.employees || []);
    } catch (e) {
      setMessage("Lỗi khi tải danh sách nhân viên");
    } finally {
      setLoading(false);
    }
  }

  function handleInput(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleAdd(e) {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    try {
      const res = await fetch(`${API_BASE}/api/employees`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.success) {
        setShowAdd(false);
        setForm({ username: "", password: "", role: "STAFF", fullName: "" });
        fetchEmployees();
        setMessage("Thêm nhân viên thành công!");
      } else {
        setMessage(data.message || "Lỗi khi thêm nhân viên");
      }
    } catch (e) {
      setMessage("Lỗi khi thêm nhân viên");
    } finally {
      setLoading(false);
    }
  }

  const handleLogout = () => {
    localStorage.removeItem("currentUser");
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-card p-8">
        <h1 className="text-2xl font-bold mb-4">Quản lý nhân viên</h1>
        <div className="flex gap-2 mb-4">
          <button className="btn-gradient-primary" onClick={() => setShowAdd(true)}>+ Thêm nhân viên</button>
          <select className="btn-soft" value={filter} onChange={e => { setFilter(e.target.value); fetchEmployees(); }}>
            <option value="ALL">Tất cả</option>
            <option value="STAFF">Nhân viên lễ tân</option>
            <option value="ACCOUNTANT">Kế toán</option>
          </select>
          <input className="btn-soft" placeholder="Tìm kiếm..." value={search} onChange={e => setSearch(e.target.value)} onBlur={fetchEmployees} />
        </div>
        {message && <div className="alert-warn mb-2">{message}</div>}
        {loading ? <div>Đang tải...</div> : (
          <table className="table">
            <thead>
              <tr>
                <th>STT</th>
                <th>Username</th>
                <th>Họ tên</th>
                <th>Vai trò</th>
                <th>Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {employees.map((e, i) => (
                <tr key={e.id}>
                  <td>{i + 1}</td>
                  <td>{e.username}</td>
                  <td>{e.fullName}</td>
                  <td>{e.role === "STAFF" ? "Nhân viên" : e.role === "ACCOUNTANT" ? "Kế toán" : e.role}</td>
                  <td>{e.active ? "Đang làm" : "Đã nghỉ"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {showAdd && (
          <form className="mt-6 bg-gray-50 p-4 rounded-xl shadow-card" onSubmit={handleAdd}>
            <h2 className="font-semibold mb-2">Thêm nhân viên mới</h2>
            <div className="flex gap-2 mb-2">
              <input required name="username" value={form.username} onChange={handleInput} placeholder="Tên đăng nhập" className="btn-soft flex-1" />
              <input required name="password" value={form.password} onChange={handleInput} placeholder="Mật khẩu" className="btn-soft flex-1" type="password" />
            </div>
            <div className="flex gap-2 mb-2">
              <input required name="fullName" value={form.fullName} onChange={handleInput} placeholder="Họ tên" className="btn-soft flex-1" />
              <select name="role" value={form.role} onChange={handleInput} className="btn-soft">
                <option value="STAFF">Nhân viên lễ tân</option>
                <option value="ACCOUNTANT">Kế toán</option>
              </select>
            </div>
            <div className="flex gap-2">
              <button className="btn-gradient-primary" type="submit">Tạo tài khoản</button>
              <button className="btn-outline" type="button" onClick={() => setShowAdd(false)}>Huỷ</button>
            </div>
          </form>
        )}
        <button onClick={handleLogout} className="btn-white-outline px-6 py-2 mt-8 float-right">Đăng xuất</button>
      </div>
    </div>
  );
}
