import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { getUnpaidStudents, getCourses, createPayment } from "../api/feeApi";

function AccountantDashboard() {
  const navigate = useNavigate();
  const stored = JSON.parse(localStorage.getItem("currentUser"));
  
  if (!stored) {
    window.location.href = "/login";
    return null;
  }
  
  const username = stored.username;

  // State
  const [students, setStudents] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState({ course_id: '', amount: '', method: 'cash', note: '' });
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    setLoading(true);
    try {
      const [studentsData, coursesData] = await Promise.all([
        getUnpaidStudents(),
        getCourses()
      ]);
      setStudents(studentsData);
      setCourses(coursesData);
    } catch (e) {
      setMessage('Lỗi tải dữ liệu');
      console.error(e);
    }
    setLoading(false);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!selected || !form.course_id || !form.amount) {
      setMessage('Vui lòng chọn khóa học và nhập số tiền');
      return;
    }
    
    setSubmitting(true);
    setMessage('');
    try {
      await createPayment({
        student_id: selected.id,
        course_id: form.course_id,
        amount: form.amount,
        method: form.method,
        note: form.note,
      });
      setMessage('✅ Đã ghi nhận thanh toán học phí!');
      setForm({ course_id: '', amount: '', method: 'cash', note: '' });
      setSelected(null);
      fetchData();
    } catch (e) {
      setMessage('❌ Lỗi ghi nhận thanh toán: ' + (e.response?.data?.message || e.message));
      console.error(e);
    }
    setSubmitting(false);
  }

  const handleLogout = () => {
    localStorage.removeItem("currentUser");
    navigate("/login");
  };

  return (
    <div style={{
      width: "100%",
      minHeight: "100vh",
      background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
      paddingTop: 0,
    }}>
      {/* Header */}
      <div style={{
        background: "linear-gradient(135deg, #ffb347 0%, #ffcc33 100%)",
        color: "#333",
        padding: "40px 20px",
        boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
        marginBottom: 30,
      }}>
        <div style={{
          maxWidth: 1050,
          margin: "0 auto",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}>
          <div>
            <h1 style={{ margin: 0, fontSize: 32, fontWeight: 700 }}>
              Dashboard Kế toán
            </h1>
            <p style={{ margin: "8px 0 0 0", fontSize: 16, opacity: 0.9 }}>
              Xin chào, <b>{username}</b>
            </p>
          </div>
          <button
            onClick={handleLogout}
            style={{
              padding: "10px 24px",
              background: "rgba(255,255,255,0.2)",
              color: "#333",
              border: "2px solid #fff",
              borderRadius: 6,
              cursor: "pointer",
              fontWeight: 600,
              transition: "all 0.3s",
              fontSize: 14,
            }}
            onMouseOver={e => e.target.style.background = "rgba(255,255,255,0.3)"}
            onMouseOut={e => e.target.style.background = "rgba(255,255,255,0.2)"}
          >
            Đăng xuất
          </button>
        </div>
      </div>

      <div style={{ maxWidth: 1050, margin: '0 auto', background: '#fff', borderRadius: 12, boxShadow: '0 2px 12px #0001', padding: 32 }}>
        <h2 style={{ fontWeight: 600, fontSize: 22, marginBottom: 18 }}>📋 Danh sách học viên chờ thu học phí</h2>
        
        {message && (
          <div style={{ 
            marginBottom: 16, 
            padding: 12, 
            borderRadius: 6,
            background: message.includes('❌') ? '#ffebee' : '#e8f5e9',
            color: message.includes('❌') ? '#c62828' : '#2e7d32',
            fontWeight: 500
          }}>
            {message}
          </div>
        )}

        {loading ? (
          <div>Đang tải...</div>
        ) : students.length === 0 ? (
          <div style={{ padding: 20, textAlign: 'center', color: '#888' }}>
            ✅ Không có học viên nào chờ thu học phí
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 24 }}>
            <thead>
              <tr style={{ background: '#f7f7f7' }}>
                <th style={{ padding: 12, border: '1px solid #eee', textAlign: 'left' }}>#</th>
                <th style={{ padding: 12, border: '1px solid #eee', textAlign: 'left' }}>Tên học viên</th>
                <th style={{ padding: 12, border: '1px solid #eee', textAlign: 'left' }}>Số điện thoại</th>
                <th style={{ padding: 12, border: '1px solid #eee', textAlign: 'left' }}>Email</th>
                <th style={{ padding: 12, border: '1px solid #eee', textAlign: 'center' }}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {students.map((s, idx) => (
                <tr key={s.id} style={{ background: selected && selected.id === s.id ? '#fff3cd' : '#fff' }}>
                  <td style={{ padding: 12, border: '1px solid #eee' }}>{idx + 1}</td>
                  <td style={{ padding: 12, border: '1px solid #eee', fontWeight: 500 }}>{s.name}</td>
                  <td style={{ padding: 12, border: '1px solid #eee' }}>{s.phone || '-'}</td>
                  <td style={{ padding: 12, border: '1px solid #eee' }}>{s.email || '-'}</td>
                  <td style={{ padding: 12, border: '1px solid #eee', textAlign: 'center' }}>
                    <button
                      style={{ 
                        padding: '8px 16px', 
                        borderRadius: 6, 
                        background: selected?.id === s.id ? '#28a745' : '#ffcc33',
                        color: selected?.id === s.id ? '#fff' : '#333',
                        border: 'none', 
                        fontWeight: 600, 
                        cursor: 'pointer' 
                      }}
                      onClick={() => setSelected(s)}
                    >
                      {selected?.id === s.id ? '✓ Đã chọn' : 'Thu học phí'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {/* Form ghi nhận thanh toán */}
        {selected && (
          <form onSubmit={handleSubmit} style={{ 
            background: 'linear-gradient(135deg, #fff9e6 0%, #ffe9b3 100%)', 
            border: '2px solid #ffcc33', 
            borderRadius: 12, 
            padding: 24, 
            marginTop: 20 
          }}>
            <h3 style={{ marginTop: 0, marginBottom: 20, color: '#d97706' }}>
              💰 Ghi nhận thanh toán cho: <b>{selected.name}</b>
            </h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div>
                <label style={{ display: 'block', marginBottom: 6, fontWeight: 500 }}>Khóa học: <span style={{ color: 'red' }}>*</span></label>
                <select 
                  required 
                  value={form.course_id} 
                  onChange={e => {
                    const courseId = e.target.value;
                    const course = courses.find(c => c.id === parseInt(courseId));
                    setForm(f => ({ ...f, course_id: courseId, amount: course?.tuition_fee || '' }));
                  }}
                  style={{ 
                    padding: 10, 
                    borderRadius: 6, 
                    border: '1px solid #ddd', 
                    width: '100%',
                    fontSize: 14
                  }}
                >
                  <option value="">-- Chọn khóa học --</option>
                  {courses.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.tuition_fee?.toLocaleString()} VNĐ)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: 6, fontWeight: 500 }}>Số tiền: <span style={{ color: 'red' }}>*</span></label>
                <input 
                  type="number" 
                  required 
                  min={0}
                  value={form.amount} 
                  onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} 
                  style={{ 
                    padding: 10, 
                    borderRadius: 6, 
                    border: '1px solid #ddd', 
                    width: '100%',
                    fontSize: 14
                  }} 
                  placeholder="Nhập số tiền"
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: 6, fontWeight: 500 }}>Phương thức:</label>
                <select 
                  value={form.method} 
                  onChange={e => setForm(f => ({ ...f, method: e.target.value }))} 
                  style={{ 
                    padding: 10, 
                    borderRadius: 6, 
                    border: '1px solid #ddd', 
                    width: '100%',
                    fontSize: 14
                  }}
                >
                  <option value="cash">💵 Tiền mặt</option>
                  <option value="bank_transfer">🏦 Chuyển khoản</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: 6, fontWeight: 500 }}>Ghi chú:</label>
                <input 
                  type="text" 
                  value={form.note} 
                  onChange={e => setForm(f => ({ ...f, note: e.target.value }))} 
                  style={{ 
                    padding: 10, 
                    borderRadius: 6, 
                    border: '1px solid #ddd', 
                    width: '100%',
                    fontSize: 14
                  }} 
                  placeholder="Ghi chú (tùy chọn)"
                />
              </div>
            </div>

            <div style={{ marginTop: 20, display: 'flex', gap: 12 }}>
              <button 
                type="submit" 
                disabled={submitting}
                style={{ 
                  padding: '12px 28px', 
                  background: '#28a745',
                  color: '#fff',
                  border: 'none', 
                  borderRadius: 6, 
                  fontWeight: 600, 
                  cursor: submitting ? 'not-allowed' : 'pointer',
                  fontSize: 15,
                  opacity: submitting ? 0.6 : 1
                }}
              >
                {submitting ? '⏳ Đang xử lý...' : '✅ Xác nhận thanh toán'}
              </button>
              <button 
                type="button" 
                onClick={() => {
                  setSelected(null);
                  setForm({ course_id: '', amount: '', method: 'cash', note: '' });
                }}
                style={{ 
                  padding: '12px 24px', 
                  background: '#6c757d',
                  color: '#fff',
                  border: 'none', 
                  borderRadius: 6, 
                  fontWeight: 500, 
                  cursor: 'pointer',
                  fontSize: 15
                }}
              >
                ❌ Hủy
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

export default AccountantDashboard;

