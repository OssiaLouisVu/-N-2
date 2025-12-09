
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const API_BASE = "http://localhost:8080";

// Hiển thị bảng thống kê số buổi đi làm/nghỉ
function AttendanceSummary({ employeeId }) {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!employeeId) return;
    setLoading(true);
    fetch(`${API_BASE}/api/employees/${employeeId}/attendance-summary`)
      .then(res => res.json())
      .then(data => setSummary(data))
      .catch(() => setSummary(null))
      .finally(() => setLoading(false));
  }, [employeeId]);

  if (!employeeId) return null;
  if (loading) return <div>Đang tải thống kê...</div>;
  if (!summary) return <div>Không có dữ liệu thống kê.</div>;
  return (
    <div className="mt-4">
      <h3 className="font-semibold mb-2">Thống kê chấm công</h3>
      <table className="table">
        <thead>
          <tr>
            <th>Đi làm</th>
            <th>Nghỉ phép</th>
            <th>Nghỉ ốm</th>
            <th>Nghỉ không phép</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>{summary.present || 0}</td>
            <td>{summary.leave || 0}</td>
            <td>{summary.sick || 0}</td>
            <td>{summary.absent || 0}</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

export default function ManagerDashboard() {
  const navigate = useNavigate();
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ fullName: "", dob: "", gender: "", phone: "", email: "", address: "" });
  const [message, setMessage] = useState("");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("ALL");
  const [selected, setSelected] = useState(null); // Nhân viên đang chọn để cập nhật

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
        setForm({ fullName: "", dob: "", gender: "", phone: "", email: "", address: "" });
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

  // Chọn nhân viên để cập nhật
  function handleSelect(emp) {
    setSelected(emp);
    setForm({
      fullName: emp.fullName || "",
      dob: emp.dob || "",
      gender: emp.gender || "",
      phone: emp.phone || "",
      email: emp.email || "",
      address: emp.address || "",
    });
  }

  async function handleUpdate(e) {
    e.preventDefault();
    if (!selected) return;
    setLoading(true);
    setMessage("");
    try {
      const res = await fetch(`${API_BASE}/api/employees/${selected.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.success) {
        setSelected(null);
        fetchEmployees();
        setMessage("Cập nhật thông tin thành công!");
      } else {
        setMessage(data.message || "Lỗi khi cập nhật");
      }
    } catch (e) {
      setMessage("Lỗi khi cập nhật");
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
      <div className="max-w-5xl mx-auto bg-white rounded-xl shadow-card p-8">
        <h1 className="text-2xl font-bold mb-4">Quản lý nhân viên</h1>
        <div className="flex gap-2 mb-4">
          <button className="btn-gradient-primary" onClick={() => { setShowAdd(true); setSelected(null); }}>+ Thêm nhân viên</button>
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
                <th>ID</th>
                <th>Họ tên</th>
                <th>Ngày sinh</th>
                <th>Giới tính</th>
                <th>SĐT</th>
                <th>Email</th>
                <th>Địa chỉ</th>
                <th>Trạng thái</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {employees.map((e) => (
                <tr key={e.id}>
                  <td>{e.id}</td>
                  <td>{e.fullName}</td>
                  <td>{e.dob}</td>
                  <td>{e.gender}</td>
                  <td>{e.phone}</td>
                  <td>{e.email}</td>
                  <td>{e.address}</td>
                  <td>{e.active ? "Đang làm" : "Đã nghỉ"}</td>
                  <td>
                    <button className="btn-outline" onClick={() => handleSelect(e)}>Cập nhật</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {showAdd && (
          <form className="mt-6 bg-gray-50 p-4 rounded-xl shadow-card" onSubmit={handleAdd}>
            <h2 className="font-semibold mb-2">Thêm nhân viên mới</h2>
            <div className="flex gap-2 mb-2">
              <input required name="fullName" value={form.fullName} onChange={handleInput} placeholder="Họ tên" className="btn-soft flex-1" />
              <input name="dob" value={form.dob} onChange={handleInput} placeholder="Ngày sinh" className="btn-soft flex-1" type="date" />
              <select name="gender" value={form.gender} onChange={handleInput} className="btn-soft">
                <option value="">Giới tính</option>
                <option value="Nam">Nam</option>
                <option value="Nữ">Nữ</option>
                <option value="Khác">Khác</option>
              </select>
            </div>
            <div className="flex gap-2 mb-2">
              <input name="phone" value={form.phone} onChange={handleInput} placeholder="Số điện thoại" className="btn-soft flex-1" />
              <input name="email" value={form.email} onChange={handleInput} placeholder="Email" className="btn-soft flex-1" />
              <input name="address" value={form.address} onChange={handleInput} placeholder="Địa chỉ" className="btn-soft flex-1" />
            </div>
            <div className="flex gap-2">
              <button className="btn-gradient-primary" type="submit">Lưu</button>
              <button className="btn-outline" type="button" onClick={() => setShowAdd(false)}>Huỷ</button>
            </div>
          </form>
        )}
        {selected && (
          <form className="mt-6 bg-gray-50 p-4 rounded-xl shadow-card" onSubmit={handleUpdate}>
            <h2 className="font-semibold mb-2">Cập nhật thông tin nhân viên</h2>
            <div className="flex gap-2 mb-2">
              <input required name="fullName" value={form.fullName} onChange={handleInput} placeholder="Họ tên" className="btn-soft flex-1" />
              <input name="dob" value={form.dob} onChange={handleInput} placeholder="Ngày sinh" className="btn-soft flex-1" type="date" />
              <select name="gender" value={form.gender} onChange={handleInput} className="btn-soft">
                <option value="">Giới tính</option>
                <option value="Nam">Nam</option>
                <option value="Nữ">Nữ</option>
                <option value="Khác">Khác</option>
              </select>
            </div>
            <div className="flex gap-2 mb-2">
              <input name="phone" value={form.phone} onChange={handleInput} placeholder="Số điện thoại" className="btn-soft flex-1" />
              <input name="email" value={form.email} onChange={handleInput} placeholder="Email" className="btn-soft flex-1" />
              <input name="address" value={form.address} onChange={handleInput} placeholder="Địa chỉ" className="btn-soft flex-1" />
            </div>
            <div className="flex gap-2">
              <button className="btn-gradient-primary" type="submit">Cập nhật</button>
              <button className="btn-outline" type="button" onClick={() => setSelected(null)}>Huỷ</button>
            </div>
            {/* Bảng thống kê số buổi đi làm/nghỉ */}
            <AttendanceSummary employeeId={selected.id} />
          </form>
        )}
        <button onClick={handleLogout} className="btn-white-outline px-6 py-2 mt-8 float-right">Đăng xuất</button>
      </div>
    </div>
  );
}
