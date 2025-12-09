
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchEmployees as apiFetchEmployees, addEmployee as apiAddEmployee, deactivateEmployee as apiDeactivateEmployee, sendNotification as apiSendNotification, updateEmployee as apiUpdateEmployee, createEmployeeAccount as apiCreateEmployeeAccount } from "../api/employeeApi";
import { notifyDailyAttendance, notifyMonthlyAttendance, getMonthlyAttendance } from "../api/attendanceApi";

const API_BASE = "http://localhost:8080";

export default function ManagerDashboard() {
  // Lấy user hiện tại (nếu có)
  const currentUser = JSON.parse(localStorage.getItem("currentUser") || '{}');
  const navigate = useNavigate();
  const [tab, setTab] = useState("list"); // list | attendance | notify
  const [subTab, setSubTab] = useState("active"); // active | inactive
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ fullName: "", dob: "", gender: "", phone: "", email: "", address: "", role: "STAFF" });
  const [editId, setEditId] = useState(null); // id nhân viên đang sửa
  const [message, setMessage] = useState("");
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");

  // Create account modal state
  const [showCreateAccount, setShowCreateAccount] = useState(false);
  const [accountForm, setAccountForm] = useState({ employeeId: null, username: "", password: "", confirmPassword: "" });
  const [accountMessage, setAccountMessage] = useState("");

  // Attendance tab state
  const [attendanceDate, setAttendanceDate] = useState("");
  const [attendanceItems, setAttendanceItems] = useState([]);
  const [attendanceMessage, setAttendanceMessage] = useState("");
  const [attRoleFilter, setAttRoleFilter] = useState("ALL");
  const [attSearch, setAttSearch] = useState("");
  const [sendTarget, setSendTarget] = useState("all"); // all | present | leave | sick | absent
  const [attMonth, setAttMonth] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`;
  });
  const [attMode, setAttMode] = useState('day'); // day | month
  const [monthlySummary, setMonthlySummary] = useState(null);
  const [monthlyEmployees, setMonthlyEmployees] = useState([]);
  const [monthDailyIndex, setMonthDailyIndex] = useState([]); // [{date, present, leave, sick, absent, total}]
  const [dayDetailDate, setDayDetailDate] = useState("");
  const [dayDetailItems, setDayDetailItems] = useState([]);

  // Notifications tab state
  const [notifyTitle, setNotifyTitle] = useState("");
  const [notifyContent, setNotifyContent] = useState("");
  const [notifySelected, setNotifySelected] = useState([]); // array of employee ids
  const [notifyMessage, setNotifyMessage] = useState("");

  useEffect(() => {
    fetchEmployees();
    // eslint-disable-next-line
  }, [subTab, roleFilter]);

  async function fetchEmployees() {
    setLoading(true);
    setMessage("");
    const activeParam = subTab === "active" ? "true" : "false";
    try {
      const data = await apiFetchEmployees({ active: activeParam, role: roleFilter, search });
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
      // Format dob to yyyy-MM-dd if user enters dd/MM/yyyy
      let dob = form.dob;
      if (/^\d{2}\/\d{2}\/\d{4}$/.test(dob)) {
        const [d, m, y] = dob.split("/");
        dob = `${y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`;
      }
      let data;
      if (editId) {
        data = await apiUpdateEmployee(editId, { ...form, dob });
      } else {
        data = await apiAddEmployee({ ...form, dob });
      }
      if (data.success) {
        setShowAdd(false);
        setEditId(null);
        setForm({ fullName: "", dob: "", gender: "", phone: "", email: "", address: "", role: "STAFF" });
        fetchEmployees();
        setMessage(editId ? "Cập nhật nhân viên thành công!" : "Thêm nhân viên thành công!");
      } else {
        setMessage(data.message || (editId ? "Lỗi khi cập nhật nhân viên" : "Lỗi khi thêm nhân viên"));
      }
    } catch (e) {
      setMessage(editId ? "Lỗi khi cập nhật nhân viên" : "Lỗi khi thêm nhân viên");
    } finally {
      setLoading(false);
    }
  }

  async function deactivateEmployee(id) {
    if (!window.confirm("Cho nhân viên này nghỉ việc? Tài khoản đăng nhập sẽ bị xoá.")) return;
    setLoading(true);
    try {
      const data = await apiDeactivateEmployee(id);
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

  async function handleCreateAccount(e) {
    e.preventDefault();
    setAccountMessage("");
    if (accountForm.password !== accountForm.confirmPassword) {
      setAccountMessage("Mật khẩu không khớp");
      return;
    }
    if (accountForm.password.length < 6) {
      setAccountMessage("Mật khẩu phải có ít nhất 6 ký tự");
      return;
    }
    setLoading(true);
    try {
      const data = await apiCreateEmployeeAccount(accountForm.employeeId, {
        username: accountForm.username,
        password: accountForm.password
      });
      if (data.success) {
        setAccountMessage("Tạo tài khoản thành công!");
        setShowCreateAccount(false);
        setAccountForm({ employeeId: null, username: "", password: "", confirmPassword: "" });
        fetchEmployees();
        setMessage("Tạo tài khoản thành công!");
      } else {
        setAccountMessage(data.message || "Lỗi khi tạo tài khoản");
      }
    } catch (e) {
      setAccountMessage("Lỗi khi tạo tài khoản");
    } finally {
      setLoading(false);
    }
  }

  // Attendance helpers
  function updateAttendanceItem(employeeId, updates) {
    setAttendanceItems(prev => prev.map(item => 
      item.employee_id === employeeId ? { ...item, ...updates } : item
    ));
  }

  async function saveAttendance() {
    setAttendanceMessage("");
    if (!attendanceDate) {
      setAttendanceMessage("Vui lòng chọn ngày chấm công");
      return;
    }
    try {
      const items = attendanceItems.map(it => ({
        employee_id: it.employee_id,
        status: it.status,
        note: it.note || ''
      }));
      const res = await fetch(`${API_BASE}/api/attendance`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date: attendanceDate, items })
      });
      const data = await res.json();
      if (data.success) {
        setAttendanceMessage("Lưu chấm công thành công!");
      } else {
        setAttendanceMessage(data.message || "Lỗi khi lưu chấm công");
      }
    } catch (e) {
      setAttendanceMessage("Lỗi khi lưu chấm công");
    }
  }

  async function loadAttendance() {
    setAttendanceMessage("");
    if (!attendanceDate) {
      setAttendanceMessage("Vui lòng chọn ngày chấm công");
      return;
    }
    try {
      const res = await fetch(`${API_BASE}/api/attendance?date=${attendanceDate}`);
      const data = await res.json();
      if (!data.success) {
        setAttendanceMessage(data.message || "Lỗi tải điểm danh");
        return;
      }
      // Build items: ensure all active employees appear; default status present
      const params = new URLSearchParams({ active: 'true', role: attRoleFilter, search: attSearch });
      const activeRes = await fetch(`${API_BASE}/api/employees?${params.toString()}`);
      const activeData = await activeRes.json();
      const actives = activeData.employees || [];
      const byEmp = new Map();
      (data.records || []).forEach(r => byEmp.set(r.employee_id, r));
      const merged = actives.map(e => ({
        employee_id: e.id,
        full_name: e.full_name,
        status: byEmp.get(e.id)?.status || 'present',
        note: byEmp.get(e.id)?.note || ''
      }));
      setAttendanceItems(merged);
    } catch (e) {
      setAttendanceMessage("Lỗi tải điểm danh");
    }
  }

  // ...existing code...
  async function loadMonthly() {
    setAttendanceMessage("");
    if (!attMonth) {
      setAttendanceMessage('Vui lòng chọn tháng');
      return;
    }
    try {
      const data = await getMonthlyAttendance({ month: attMonth, role: attRoleFilter, search: attSearch, active: 'true' });
      if (data.success) {
        setMonthlySummary(data.summary);
        const emps = data.employees || [];
        setMonthlyEmployees(emps);
        // build daily index from employees.days
        const byDay = new Map();
        for (const e of emps) {
          const days = e.days || {};
          Object.keys(days).forEach(d => {
            const curr = byDay.get(d) || { date: d, present:0, leave:0, sick:0, absent:0, total:0 };
            const st = (days[d]?.status || '').toLowerCase();
            if (curr.hasOwnProperty(st)) curr[st] += 1;
            curr.total += 1;
            byDay.set(d, curr);
          });
        }
        const arr = Array.from(byDay.values()).sort((a,b)=> a.date.localeCompare(b.date));
        setMonthDailyIndex(arr);
        setDayDetailDate("");
        setDayDetailItems([]);
      } else {
        setAttendanceMessage(data.message || 'Lỗi tải tổng hợp tháng');
      }
    } catch (e) {
      setAttendanceMessage('Lỗi tải tổng hợp tháng');
    }
  }

  async function loadDayDetail(dateStr){
    setDayDetailDate(dateStr);
    setAttendanceMessage("");
    try{
      const res = await fetch(`${API_BASE}/api/attendance?date=${dateStr}`);
      const data = await res.json();
      if(!data.success){ setAttendanceMessage(data.message || 'Lỗi tải chi tiết ngày'); return; }
      const params = new URLSearchParams({ active: 'true', role: attRoleFilter, search: attSearch });
      const activeRes = await fetch(`${API_BASE}/api/employees?${params.toString()}`);
      const activeData = await activeRes.json();
      const actives = activeData.employees || [];
      const byEmp = new Map();
      (data.records || []).forEach(r => byEmp.set(r.employee_id, r));
      const merged = actives.map(e => ({
        employee_id: e.id,
        full_name: e.full_name,
        status: byEmp.get(e.id)?.status || '-',
        note: byEmp.get(e.id)?.note || ''
      }));
      setDayDetailItems(merged);
    }catch(err){
      setAttendanceMessage('Lỗi tải chi tiết ngày');
    }
  }

  const handleLogout = () => {
    localStorage.removeItem("currentUser");
    navigate("/login");
  };

  // Format date helper: YYYY-MM-DD -> dd/MM/yyyy
  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    // Check if it's already in ISO format (YYYY-MM-DD)
    if (typeof dateStr === 'string' && dateStr.includes('-')) {
      const parts = dateStr.split('-');
      if (parts.length === 3) {
        const [year, month, day] = parts;
        return `${day}/${month}/${year}`;
      }
    }
    // If it's a Date object or timestamp, convert to dd/MM/yyyy
    try {
      const date = new Date(dateStr);
      if (!isNaN(date.getTime())) {
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
      }
    } catch (e) {
      console.error('Error formatting date:', e);
    }
    return dateStr; // Return original if can't format
  };

  return (
    <div
      style={{
        width: "100%",
        minHeight: "100vh",
        background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
        paddingTop: 0,
      }}
    >
      {/* Header */}
      <div
        style={{
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          color: "white",
          padding: "40px 20px",
          boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
          marginBottom: 30,
        }}
      >
        <div
          style={{
            maxWidth: 1050,
            margin: "0 auto",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div>
            <h1 style={{ margin: 0, fontSize: 32, fontWeight: 700 }}>
              Dashboard Quản lý
            </h1>
            <p style={{ margin: "8px 0 0 0", fontSize: 16, opacity: 0.9 }}>
              Xin chào, <b>{currentUser?.username || 'manager'}</b>
            </p>
          </div>

          <button
            onClick={handleLogout}
            style={{
              padding: "10px 24px",
              background: "rgba(255,255,255,0.2)",
              color: "white",
              border: "2px solid white",
              borderRadius: 6,
              cursor: "pointer",
              fontWeight: 600,
              transition: "all 0.3s",
              fontSize: 14,
            }}
            onMouseOver={(e) => {
              e.target.style.background = "rgba(255,255,255,0.3)";
            }}
            onMouseOut={(e) => {
              e.target.style.background = "rgba(255,255,255,0.2)";
            }}
          >
            Đăng xuất
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          paddingBottom: 40,
        }}
      >
        <div style={{ width: 1050 }}>
          {/* Khối chức năng */}
          <div style={{ marginTop: 24, marginBottom: 24, clear: "both" }}>
            <div
              style={{
                fontWeight: 700,
                marginBottom: 16,
                fontSize: 18,
                color: "#333",
              }}
            >
              📚 Chức năng
            </div>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              {/* Nút Danh sách */}
              <button
                onClick={() => setTab('list')}
                style={{
                  padding: "12px 20px",
                  borderRadius: 8,
                  border: "none",
                  background: tab === 'list'
                    ? "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                    : "#e0e0e0",
                  color: tab === 'list' ? "#fff" : "#333",
                  cursor: "pointer",
                  fontWeight: 600,
                  boxShadow: tab === 'list' ? "0 4px 12px rgba(102, 126, 234, 0.4)" : "none",
                  transition: "all 0.3s",
                  fontSize: 14,
                }}
                onMouseOver={(e) => {
                  if (tab === 'list') {
                    e.target.style.transform = "translateY(-2px)";
                    e.target.style.boxShadow = "0 6px 16px rgba(102, 126, 234, 0.6)";
                  }
                }}
                onMouseOut={(e) => {
                  if (tab === 'list') {
                    e.target.style.transform = "translateY(0)";
                    e.target.style.boxShadow = "0 4px 12px rgba(102, 126, 234, 0.4)";
                  }
                }}
              >
                📋 Danh sách nhân viên
              </button>

              {/* Nút Chấm công */}
              <button
                onClick={() => setTab('attendance')}
                style={{
                  padding: "12px 20px",
                  borderRadius: 8,
                  border: "none",
                  background: tab === 'attendance'
                    ? "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)"
                    : "#e0e0e0",
                  color: tab === 'attendance' ? "#fff" : "#333",
                  cursor: "pointer",
                  fontWeight: 600,
                  boxShadow: tab === 'attendance' ? "0 4px 12px rgba(245, 87, 108, 0.4)" : "none",
                  transition: "all 0.3s",
                  fontSize: 14,
                }}
                onMouseOver={(e) => {
                  if (tab === 'attendance') {
                    e.target.style.transform = "translateY(-2px)";
                    e.target.style.boxShadow = "0 6px 16px rgba(245, 87, 108, 0.6)";
                  }
                }}
                onMouseOut={(e) => {
                  if (tab === 'attendance') {
                    e.target.style.transform = "translateY(0)";
                    e.target.style.boxShadow = "0 4px 12px rgba(245, 87, 108, 0.4)";
                  }
                }}
              >
                ⏰ Chấm công
              </button>

              {/* Nút Thông báo */}
              <button
                onClick={() => setTab('notify')}
                style={{
                  padding: "12px 20px",
                  borderRadius: 8,
                  border: "none",
                  background: tab === 'notify'
                    ? "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)"
                    : "#e0e0e0",
                  color: tab === 'notify' ? "#fff" : "#333",
                  cursor: "pointer",
                  fontWeight: 600,
                  boxShadow: tab === 'notify' ? "0 4px 12px rgba(79, 172, 254, 0.4)" : "none",
                  transition: "all 0.3s",
                  fontSize: 14,
                }}
                onMouseOver={(e) => {
                  if (tab === 'notify') {
                    e.target.style.transform = "translateY(-2px)";
                    e.target.style.boxShadow = "0 6px 16px rgba(79, 172, 254, 0.6)";
                  }
                }}
                onMouseOut={(e) => {
                  if (tab === 'notify') {
                    e.target.style.transform = "translateY(0)";
                    e.target.style.boxShadow = "0 4px 12px rgba(79, 172, 254, 0.4)";
                  }
                }}
              >
                📢 Gửi thông báo
              </button>
            </div>
          </div>

    {/* Quy trình hướng dẫn (giống teacher) */}
    {tab==='list' && (
      <div className="mb-6">
        <div className="bg-indigo-50 border-l-4 border-indigo-400 rounded p-3 text-gray-700 text-sm">
          <b>Quy trình:</b> Đăng nhập → Quản lý nhân viên (thêm/sửa/xoá) → Chấm công → Gửi thông báo (nếu cần)
        </div>
      </div>
    )}

    {/* Nội dung tab */}
    {tab === 'list' && (
      <div>
            {/* Sub tabs: active/inactive */}
            <div className="flex flex-wrap gap-3 mb-4 items-center justify-between">
              <div className="flex gap-2">
                <button className={`btn-soft px-4 py-2 rounded-full font-semibold ${subTab==='active' ? 'bg-indigo-100 text-indigo-700' : ''}`} onClick={()=>setSubTab('active')}>Nhân viên đang làm</button>
                <button className={`btn-soft px-4 py-2 rounded-full font-semibold ${subTab==='inactive' ? 'bg-pink-100 text-pink-700' : ''}`} onClick={()=>setSubTab('inactive')}>Nhân viên đã nghỉ</button>
              </div>
              <button className="btn-gradient-primary px-5 py-2 rounded-full font-semibold" onClick={() => setShowAdd(true)}>+ Thêm nhân viên</button>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-3 mb-6 items-center w-full">
              <select className="btn-soft px-4 py-2 rounded-full" value={roleFilter} onChange={e => setRoleFilter(e.target.value)}>
                <option value="ALL">Tất cả vai trò</option>
                <option value="STAFF">Nhân viên lễ tân</option>
                <option value="ACCOUNTANT">Kế toán</option>
              </select>
              <input className="btn-soft flex-1 min-w-[200px] px-4 py-2 rounded-full" placeholder="Tìm kiếm tên/SĐT/email..." value={search} onChange={e => setSearch(e.target.value)} onBlur={fetchEmployees} />
              <button className="btn-outline px-5 py-2 rounded-full font-semibold" onClick={fetchEmployees}>Lọc</button>
            </div>

            {message && <div className="alert-warn mb-2">{message}</div>}
            {loading ? <div>Đang tải...</div> : (
              <div className="overflow-x-auto">
              <table className="table w-full text-base">
                <thead>
                  <tr>
                    <th>STT</th>
                    <th>Mã NV</th>
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
                      <td><span className="font-semibold text-indigo-600">{e.employee_code || '-'}</span></td>
                      <td>{e.username || '-'}</td>
                      <td>{e.full_name}</td>
                      <td>{e.role || '-'}</td>
                      <td>{e.active ? "Đang làm" : "Đã nghỉ"}</td>
                      {subTab==='active' && (
                        <td className="flex gap-2">
                          {!e.username && (
                            <button className="btn-gradient-primary text-sm" onClick={() => {
                              setShowCreateAccount(true);
                              setAccountForm({ employeeId: e.id, username: "", password: "", confirmPassword: "" });
                              setAccountMessage("");
                            }}>Tạo tài khoản</button>
                          )}
                          <button className="btn-outline" onClick={()=>deactivateEmployee(e.id)}>Cho nghỉ việc</button>
                          <button className="btn-soft" onClick={() => {
                            setShowAdd(true);
                            setEditId(e.id);
                            setForm({
                              fullName: e.full_name || '',
                              dob: e.dob ? (e.dob.length === 10 ? e.dob : '') : '',
                              gender: e.gender || '',
                              phone: e.phone || '',
                              email: e.email || '',
                              address: e.address || '',
                              role: e.role || 'STAFF'
                            });
                          }}>Sửa</button>
                          <button className="btn-outline" style={{color: 'red', borderColor: '#ff4d4f'}} onClick={async()=>{
                            if(window.confirm('Bạn có chắc chắn muốn xoá nhân viên này?')){
                              setLoading(true);
                              try {
                                const res = await fetch(`http://localhost:8080/api/employees/${e.id}`, { method: 'DELETE' });
                                const data = await res.json();
                                if(data.success){
                                  setMessage('Đã xoá nhân viên');
                                  fetchEmployees();
                                } else {
                                  setMessage(data.message || 'Lỗi khi xoá nhân viên');
                                }
                              } catch {
                                setMessage('Lỗi khi xoá nhân viên');
                              }
                              setLoading(false);
                            }
                          }}>Xoá</button>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
              </div>
            )}

            {showAdd && (
              <form className="mt-8 bg-gray-50 p-6 rounded-2xl shadow-card w-full max-w-2xl mx-auto" onSubmit={handleAdd}>
                <h2 className="font-semibold mb-2">{editId ? 'Sửa thông tin nhân viên' : 'Thêm nhân viên mới'}</h2>
                <div className="grid grid-cols-2 gap-2 mb-2">
                  <input required name="fullName" value={form.fullName} onChange={handleInput} placeholder="Họ tên" className="btn-soft" />
                  <input name="dob" value={form.dob} onChange={handleInput} placeholder="Ngày sinh (YYYY-MM-DD hoặc dd/MM/yyyy)" className="btn-soft" />
                  <input name="gender" value={form.gender} onChange={handleInput} placeholder="Giới tính" className="btn-soft" />
                  <input name="phone" value={form.phone} onChange={handleInput} placeholder="SĐT" className="btn-soft" />
                  <input name="email" value={form.email} onChange={handleInput} placeholder="Email" className="btn-soft" />
                  <input name="address" value={form.address} onChange={handleInput} placeholder="Địa chỉ" className="btn-soft" />
                  <select name="role" value={form.role} onChange={handleInput} className="btn-soft">
                    <option value="STAFF">Nhân viên lễ tân</option>
                    <option value="ACCOUNTANT">Kế toán</option>
                  </select>
                </div>
                <div className="flex gap-2">
                  <button className="btn-gradient-primary" type="submit">Lưu</button>
                  <button className="btn-outline" type="button" onClick={() => { setShowAdd(false); setEditId(null); setForm({ fullName: '', dob: '', gender: '', phone: '', email: '', address: '', role: 'STAFF' }); }}>Huỷ</button>
                </div>
              </form>
            )}

            {showCreateAccount && (
              <form className="mt-8 bg-blue-50 p-6 rounded-2xl shadow-card w-full max-w-md mx-auto" onSubmit={handleCreateAccount}>
                <h2 className="font-semibold mb-2">Tạo tài khoản đăng nhập</h2>
                {accountMessage && <div className="alert-warn mb-2">{accountMessage}</div>}
                <div className="grid grid-cols-1 gap-2 mb-2">
                  <input required name="username" value={accountForm.username} onChange={(e) => setAccountForm({...accountForm, username: e.target.value})} placeholder="Tên đăng nhập" className="btn-soft" />
                  <input required type="password" name="password" value={accountForm.password} onChange={(e) => setAccountForm({...accountForm, password: e.target.value})} placeholder="Mật khẩu (tối thiểu 6 ký tự)" className="btn-soft" />
                  <input required type="password" name="confirmPassword" value={accountForm.confirmPassword} onChange={(e) => setAccountForm({...accountForm, confirmPassword: e.target.value})} placeholder="Xác nhận mật khẩu" className="btn-soft" />
                </div>
                <div className="flex gap-2">
                  <button className="btn-gradient-primary" type="submit">Tạo tài khoản</button>
                  <button className="btn-outline" type="button" onClick={() => { setShowCreateAccount(false); setAccountForm({ employeeId: null, username: "", password: "", confirmPassword: "" }); setAccountMessage(""); }}>Huỷ</button>
                </div>
              </form>
            )}
          </div>
        )}

        {tab === 'attendance' && (
          <div className="w-full">
            <h2 className="text-lg font-semibold mb-3">Chấm công nhân viên</h2>
            <div className="flex flex-wrap gap-3 mb-6 items-center w-full">
              <select className="btn-soft" value={attMode} onChange={(e)=>setAttMode(e.target.value)}>
                <option value="day">Chế độ: Ngày</option>
                <option value="month">Chế độ: Tháng</option>
              </select>
              <input type="date" className="btn-soft" value={attendanceDate} onChange={(e)=>setAttendanceDate(e.target.value)} />
              <select className="btn-soft" value={attRoleFilter} onChange={(e)=>setAttRoleFilter(e.target.value)}>
                <option value="ALL">Tất cả vai trò</option>
                <option value="STAFF">Nhân viên lễ tân</option>
                <option value="ACCOUNTANT">Kế toán</option>
              </select>
              <input className="btn-soft" placeholder="Tìm tên/SĐT/email" value={attSearch} onChange={(e)=>setAttSearch(e.target.value)} />
              {attMode==='day' ? (
                <button className="btn-outline" onClick={loadAttendance}>Tải điểm danh</button>
              ) : (
                <>
                  <input type="month" className="btn-soft" value={attMonth} onChange={(e)=>setAttMonth(e.target.value)} />
                  <button className="btn-outline" onClick={loadMonthly}>Xem tháng</button>
                </>
              )}
              <div className="ml-auto flex gap-2 items-center">
                <span className="text-sm text-gray-600">Gửi email:</span>
                <select className="btn-soft" value={sendTarget} onChange={(e)=>setSendTarget(e.target.value)}>
                  <option value="all">Tất cả</option>
                  <option value="present">Đi làm</option>
                  <option value="leave">Nghỉ phép</option>
                  <option value="sick">Nghỉ ốm</option>
                  <option value="absent">Vắng</option>
                </select>
                <button
                  className="btn-soft"
                  onClick={async()=>{
                    setAttendanceMessage("");
                    if(!attendanceDate){ setAttendanceMessage('Vui lòng chọn ngày chấm công'); return; }
                    try{
                      const res = await notifyDailyAttendance({ date: attendanceDate, target: sendTarget, role: attRoleFilter, search: attSearch, active: 'true' });
                      if(res.success) setAttendanceMessage(`Đã gửi email cho ${res.sent} nhân viên`);
                      else setAttendanceMessage(res.message || 'Lỗi khi gửi email');
                    }catch(err){
                      setAttendanceMessage('Lỗi khi gửi email');
                    }
                  }}
                >Gửi email theo ngày</button>
                <button
                  className="btn-soft"
                  onClick={async()=>{
                    setAttendanceMessage("");
                    if(!attMonth){ setAttendanceMessage('Vui lòng chọn tháng'); return; }
                    try{
                      const res = await notifyMonthlyAttendance({ month: attMonth, role: attRoleFilter, search: attSearch, active: 'true' });
                      if(res.success) setAttendanceMessage(`Đã gửi báo cáo tháng cho ${res.sent} nhân viên`);
                      else setAttendanceMessage(res.message || 'Lỗi khi gửi báo cáo tháng');
                    }catch(err){ setAttendanceMessage('Lỗi khi gửi báo cáo tháng'); }
                  }}
                >Gửi báo cáo tháng</button>
              </div>
            </div>
            {attendanceMessage && <div className="alert-warn mb-2">{attendanceMessage}</div>}

            {attMode==='day' && attendanceItems.length > 0 && (
              <div className="overflow-x-auto">
                <table className="table w-full text-base">
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
              </div>
            )}

            {attMode==='day' && attendanceItems.length > 0 && (
            <div className="flex gap-3 mt-4">
              <button className="btn-gradient-primary px-6 py-2 rounded-full font-semibold" onClick={saveAttendance}>Lưu chấm công</button>
            </div>
            )}

            {attMode==='month' && (
              <div className="mt-6">
                {monthlySummary && (
                  <div className="mb-3 text-sm text-gray-700">
                    Tổng tháng: Đi làm {monthlySummary.present} • Nghỉ phép {monthlySummary.leave} • Nghỉ ốm {monthlySummary.sick} • Vắng {monthlySummary.absent}
                  </div>
                )}
                {/* Danh sách ngày đã chấm công */}
                <div className="mb-3">
                  <div className="font-semibold mb-1">Ngày đã chấm công</div>
                  <div className="overflow-x-auto">
                    <table className="table w-full text-base">
                      <thead>
                        <tr>
                          <th>Ngày</th>
                          <th>Đi làm</th>
                          <th>Nghỉ phép</th>
                          <th>Nghỉ ốm</th>
                          <th>Vắng</th>
                          <th>Tổng</th>
                          <th></th>
                        </tr>
                      </thead>
                      <tbody>
                        {monthDailyIndex.map(d => (
                          <tr key={d.date}>
                            <td>{formatDate(d.date)}</td>
                            <td>{d.present}</td>
                            <td>{d.leave}</td>
                            <td>{d.sick}</td>
                            <td>{d.absent}</td>
                            <td>{d.total}</td>
                            <td><button className="btn-soft" onClick={()=>loadDayDetail(d.date)}>Xem chi tiết</button></td>
                          </tr>
                        ))}
                        {monthDailyIndex.length===0 && (
                          <tr><td colSpan={7}>Chưa có ngày nào được chấm công trong tháng này.</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="table w-full text-base">
                    <thead>
                      <tr>
                        <th>Họ tên</th>
                        <th>Đi làm</th>
                        <th>Nghỉ phép</th>
                        <th>Nghỉ ốm</th>
                        <th>Vắng</th>
                      </tr>
                    </thead>
                    <tbody>
                      {monthlyEmployees.map(e => (
                        <tr key={e.id}>
                          <td>{e.full_name}</td>
                          <td>{e.totals?.present || 0}</td>
                          <td>{e.totals?.leave || 0}</td>
                          <td>{e.totals?.sick || 0}</td>
                          <td>{e.totals?.absent || 0}</td>
                        </tr>
                      ))}
                      {monthlyEmployees.length===0 && (
                        <tr><td colSpan={5}>Chưa có dữ liệu tháng này. Bấm "Xem tháng" để tải.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
                {dayDetailDate && (
                  <div className="mt-4">
                    <div className="font-semibold mb-2">Chi tiết ngày {formatDate(dayDetailDate)}</div>
                    <table className="table">
                      <thead>
                        <tr>
                          <th>Họ tên</th>
                          <th>Trạng thái</th>
                          <th>Ghi chú</th>
                        </tr>
                      </thead>
                      <tbody>
                        {dayDetailItems.map(it => (
                          <tr key={it.employee_id}>
                            <td>{it.full_name}</td>
                            <td>{it.status}</td>
                            <td>{it.note}</td>
                          </tr>
                        ))}
                        {dayDetailItems.length===0 && (
                          <tr><td colSpan={3}>Không có dữ liệu cho ngày này.</td></tr>
                        )}
                      </tbody>
                    </table>
                    <div className="flex gap-3 mt-4">
                      <button className="btn-outline px-5 py-2 rounded-full font-semibold" onClick={()=>{ setAttMode('day'); setAttendanceDate(dayDetailDate); loadAttendance(); }}>Chuyển sang chấm/sửa ngày này</button>
                      <button className="btn-soft px-5 py-2 rounded-full font-semibold" onClick={()=>{ setDayDetailDate(""); setDayDetailItems([]); }}>Đóng chi tiết</button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {tab === 'notify' && (
          <div>
            <h2 className="text-lg font-semibold mb-3">Gửi thông báo cho nhân viên</h2>
            <div className="mb-2">Chọn nhân viên nhận thông báo:</div>
            <div className="grid grid-cols-2 gap-2 mb-3">
              {employees.filter(e => e.active).map(e => (
                <label key={e.id} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={notifySelected.includes(e.id)}
                    onChange={ev => {
                      if (ev.target.checked) setNotifySelected(arr => [...arr, e.id]);
                      else setNotifySelected(arr => arr.filter(id => id !== e.id));
                    }}
                  />
                  {e.full_name} ({e.username || "-"})
                </label>
              ))}
            </div>
            <input
              className="btn-soft w-full mb-2"
              placeholder="Tiêu đề thông báo"
              value={notifyTitle}
              onChange={e => setNotifyTitle(e.target.value)}
            />
            <textarea
              className="btn-soft w-full mb-2"
              placeholder="Nội dung thông báo"
              value={notifyContent}
              onChange={e => setNotifyContent(e.target.value)}
              rows={4}
            />
            <div className="flex gap-2">
              <button
                className="btn-gradient-primary"
                onClick={async () => {
                  setNotifyMessage("");
                  if (!notifyTitle || !notifyContent || notifySelected.length === 0) {
                    setNotifyMessage("Vui lòng nhập đủ thông tin và chọn nhân viên");
                    return;
                  }
                  setNotifyMessage("Đang gửi...");
                  const res = await apiSendNotification({ employeeIds: notifySelected, title: notifyTitle, content: notifyContent });
                  if (res.success) {
                    setNotifyMessage("Đã gửi thông báo (mock)");
                    setNotifyTitle(""); setNotifyContent(""); setNotifySelected([]);
                  } else {
                    setNotifyMessage("Lỗi khi gửi thông báo");
                  }
                }}
              >Gửi thông báo</button>
              <button className="btn-outline" onClick={() => { setNotifyTitle(""); setNotifyContent(""); setNotifySelected([]); setNotifyMessage(""); }}>Huỷ</button>
            </div>
            {notifyMessage && <div className="alert-warn mt-2">{notifyMessage}</div>}
          </div>
        )}
        </div>
      </div>
    </div>
  );
}
