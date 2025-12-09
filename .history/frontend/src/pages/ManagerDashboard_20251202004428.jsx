import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const API_BASE = "http://localhost:8080";

export default function ManagerDashboard() {
  const navigate = useNavigate();
  const [tab, setTab] = useState("list"); // list | attendance | notify
  const [subTab, setSubTab] = useState("active"); // active | inactive
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ fullName: "", dob: "", gender: "", phone: "", email: "", address: "" });
  const [message, setMessage] = useState("");
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");

  useEffect(() => {
    fetchEmployees();
    // eslint-disable-next-line
  }, [subTab, roleFilter]);

  async function fetchEmployees() {
    setLoading(true);
    setMessage("");
    const activeParam = subTab === "active" ? "true" : "false";
    const url = `${API_BASE}/api/employees?active=${activeParam}&role=${roleFilter}&search=${encodeURIComponent(search)}`;
    try {
      const res = await fetch(url);
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

  async function deactivateEmployee(id) {
    if (!window.confirm("Cho nhân viên này nghỉ việc? Tài khoản đăng nhập sẽ bị xoá.")) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/employees/${id}/deactivate`, { method: "PUT" });
      const data = await res.json();
      if (data.success) {
        setMessage("Đã cho nghỉ việc và xoá tài khoản");
        fetchEmployees();
      } else {
        setMessage(data.message || "Lỗi khi cho nghỉ việc");
      }
    } catch (e) {
      setMessage("Lỗi khi cho nghỉ việc");
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
      <div className="max-w-5xl mx-auto bg-white rounded-xl shadow-card p-8 relative">
        {/* Logout fixed top-right */}
        <button onClick={handleLogout} className="btn-white-outline px-6 py-2 absolute right-4 top-4">Đăng xuất</button>

        <h1 className="text-2xl font-bold mb-4">Quản lý nhân viên</h1>

        {/* Main tabs */}
        <div className="flex gap-2 mb-6">
          <button className={`btn-soft ${tab==='list' ? 'bg-gray-200' : ''}`} onClick={()=>setTab('list')}>📋 Danh sách</button>
          <button className={`btn-soft ${tab==='attendance' ? 'bg-gray-200' : ''}`} onClick={()=>setTab('attendance')}>⏰ Chấm công</button>
          <button className={`btn-soft ${tab==='notify' ? 'bg-gray-200' : ''}`} onClick={()=>setTab('notify')}>📢 Thông báo</button>
        </div>

        {tab === 'list' && (
          <>
            {/* Sub tabs: active/inactive */}
            <div className="flex gap-2 mb-4">
              <button className={`btn-soft ${subTab==='active' ? 'bg-gray-200' : ''}`} onClick={()=>setSubTab('active')}>Nhân viên đang làm</button>
              <button className={`btn-soft ${subTab==='inactive' ? 'bg-gray-200' : ''}`} onClick={()=>setSubTab('inactive')}>Nhân viên đã nghỉ</button>
              <button className="btn-gradient-primary ml-auto" onClick={() => setShowAdd(true)}>+ Thêm nhân viên</button>
            </div>

            {/* Filters */}
            <div className="flex gap-2 mb-4">
              <select className="btn-soft" value={roleFilter} onChange={e => setRoleFilter(e.target.value)}>
                <option value="ALL">Tất cả vai trò</option>
                <option value="STAFF">Nhân viên lễ tân</option>
                <option value="ACCOUNTANT">Kế toán</option>
              </select>
              <input className="btn-soft flex-1" placeholder="Tìm kiếm tên/SĐT/email..." value={search} onChange={e => setSearch(e.target.value)} onBlur={fetchEmployees} />
              <button className="btn-outline" onClick={fetchEmployees}>Lọc</button>
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
                    {subTab==='active' && <th>Hành động</th>}
                  </tr>
                </thead>
                <tbody>
                  {employees.map((e, i) => (
                    <tr key={e.id}>
                      <td>{i + 1}</td>
                      <td>{e.username || '-'}</td>
                      <td>{e.full_name}</td>
                      <td>{e.role || '-'}</td>
                      <td>{e.active ? "Đang làm" : "Đã nghỉ"}</td>
                      {subTab==='active' && (
                        <td>
                          <button className="btn-outline" onClick={()=>deactivateEmployee(e.id)}>Cho nghỉ việc</button>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {showAdd && (
              <form className="mt-6 bg-gray-50 p-4 rounded-xl shadow-card" onSubmit={handleAdd}>
                <h2 className="font-semibold mb-2">Thêm nhân viên mới</h2>
                <div className="grid grid-cols-2 gap-2 mb-2">
                  <input required name="fullName" value={form.fullName} onChange={handleInput} placeholder="Họ tên" className="btn-soft" />
                  <input name="dob" value={form.dob} onChange={handleInput} placeholder="Ngày sinh (YYYY-MM-DD)" className="btn-soft" />
                  <input name="gender" value={form.gender} onChange={handleInput} placeholder="Giới tính" className="btn-soft" />
                  <input name="phone" value={form.phone} onChange={handleInput} placeholder="SĐT" className="btn-soft" />
                  <input name="email" value={form.email} onChange={handleInput} placeholder="Email" className="btn-soft" />
                  <input name="address" value={form.address} onChange={handleInput} placeholder="Địa chỉ" className="btn-soft" />
                </div>
                <div className="flex gap-2">
                  <button className="btn-gradient-primary" type="submit">Lưu</button>
                  <button className="btn-outline" type="button" onClick={() => setShowAdd(false)}>Huỷ</button>
                </div>
              </form>
            )}
          </>
        )}

        {tab === 'attendance' && (
          <div>
            <h2 className="text-lg font-semibold mb-3">Chấm công nhân viên</h2>
            <div className="flex gap-2 mb-3">
              <input type="date" className="btn-soft" onChange={(e)=>setAttendanceDate(e.target.value)} />
              <button className="btn-outline" onClick={loadAttendance}>Tải điểm danh</button>
            </div>
            {attendanceMessage && <div className="alert-warn mb-2">{attendanceMessage}</div>}
            <table className="table">
              <thead>
                <tr>
                  <th>Họ tên</th>
                  <th>Trạng thái</th>
                  <th>Ghi chú</th>
                </tr>
              </thead>
              <tbody>
                {attendanceItems.map((it)=> (
                  <tr key={it.employee_id}>
                    <td>{it.full_name}</td>
                    <td>
                      <select className="btn-soft" value={it.status} onChange={(e)=>updateAttendanceItem(it.employee_id, { status: e.target.value })}>
                        <option value="present">Đi làm</option>
                        <option value="leave">Nghỉ phép</option>
                        <option value="sick">Nghỉ ốm</option>
                        <option value="absent">Vắng</option>
                      </select>
                    </td>
                    <td>
                      <input className="btn-soft" value={it.note || ''} onChange={(e)=>updateAttendanceItem(it.employee_id, { note: e.target.value })} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="flex gap-2 mt-3">
              <button className="btn-gradient-primary" onClick={saveAttendance}>Lưu chấm công</button>
            </div>
          </div>
        )}

        {tab === 'notify' && (
          <div className="alert-warn">Giao diện gửi thông báo sẽ được bổ sung sau.</div>
        )}
      </div>
    </div>
  );
}
