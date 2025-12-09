import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { getUnpaidStudents, createPayment } from "../api/feeApi";


export default function AccountantDashboard() {
  const navigate = useNavigate();
  const stored = JSON.parse(localStorage.getItem("currentUser"));
  if (!stored) {
    window.location.href = "/login";
    return null;
  }
  const username = stored.username;

  // State cho danh sách học viên chưa nộp học phí
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null); // học viên được chọn để ghi nhận thanh toán
  const [form, setForm] = useState({ amount: '', method: 'cash', note: '' });
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchStudents();
  }, []);

  async function fetchStudents() {
    setLoading(true);
    try {
      const data = await getUnpaidStudents();
      setStudents(data);
    } catch (e) {
      setMessage('Lỗi tải danh sách học viên');
    }
    setLoading(false);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!selected) return;
    setSubmitting(true);
    setMessage('');
    try {
      await createPayment({
        enrollment_id: selected.enrollment_id,
        amount: form.amount,
        method: form.method,
        note: form.note,
      });
      setMessage('Đã ghi nhận thanh toán!');
      setForm({ amount: '', method: 'cash', note: '' });
      setSelected(null);
      fetchStudents();
    } catch (e) {
      setMessage('Lỗi ghi nhận thanh toán');
    }
    setSubmitting(false);
  }

  return (
    <div style={{
      width: "100%",
      minHeight: "100vh",
      background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
      paddingTop: 0,
    }}>
      {/* Header */}
      <div
        style={{
          background: "linear-gradient(135deg, #ffb347 0%, #ffcc33 100%)",
          color: "#333",
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
              Dashboard Kế toán
            </h1>
            <p style={{ margin: "8px 0 0 0", fontSize: 16, opacity: 0.9 }}>
              Xin chào, <b>{username}</b>
            </p>
          </div>
          <button
            onClick={() => {
              localStorage.removeItem("currentUser");
              navigate("/login");
            }}
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
        <h2 style={{ fontWeight: 600, fontSize: 22, marginBottom: 18 }}>Danh sách học viên chờ thu học phí</h2>
        {message && <div style={{ marginBottom: 16, color: message.includes('lỗi') ? 'red' : 'green' }}>{message}</div>}
        {loading ? (
          <div>Đang tải...</div>
        ) : students.length === 0 ? (
          <div>Không có học viên nào chờ thu học phí.</div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 24 }}>
            <thead>
              <tr style={{ background: '#f7f7f7' }}>
                <th style={{ padding: 8, border: '1px solid #eee' }}>#</th>
                <th style={{ padding: 8, border: '1px solid #eee' }}>Tên học viên</th>
                <th style={{ padding: 8, border: '1px solid #eee' }}>Số điện thoại</th>
                <th style={{ padding: 8, border: '1px solid #eee' }}>Email</th>
                <th style={{ padding: 8, border: '1px solid #eee' }}></th>
              </tr>
            </thead>
            <tbody>
              {students.map((s, idx) => (
                <tr key={s.id} style={{ background: selected && selected.id === s.id ? '#ffe9b3' : '#fff' }}>
                  <td style={{ padding: 8, border: '1px solid #eee' }}>{idx + 1}</td>
                  <td style={{ padding: 8, border: '1px solid #eee' }}>{s.name}</td>
                  <td style={{ padding: 8, border: '1px solid #eee' }}>{s.phone}</td>
                  <td style={{ padding: 8, border: '1px solid #eee' }}>{s.email}</td>
                  <td style={{ padding: 8, border: '1px solid #eee' }}>
                    <button
                      style={{ padding: '6px 16px', borderRadius: 6, background: '#ffcc33', border: 'none', fontWeight: 600, cursor: 'pointer' }}
                      onClick={() => setSelected({ ...s, enrollment_id: s.enrollment_id || s.id })}
                    >
                      Ghi nhận thanh toán
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {/* Form tạo hóa đơn/ghi nhận thanh toán */}
        {selected && (
          <form onSubmit={handleSubmit} style={{ background: '#f9f9f9', border: '1px solid #eee', borderRadius: 8, padding: 24, marginTop: 12 }}>
            <h3 style={{ marginTop: 0 }}>Ghi nhận thanh toán cho: <b>{selected.name}</b></h3>
            <div style={{ marginBottom: 12 }}>
              <label>Số tiền: </label>
              <input type="number" required min={0} value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} style={{ padding: 6, borderRadius: 4, border: '1px solid #ccc', width: 160 }} />
            </div>
            <div style={{ marginBottom: 12 }}>
              <label>Phương thức: </label>
              <select value={form.method} onChange={e => setForm(f => ({ ...f, method: e.target.value }))} style={{ padding: 6, borderRadius: 4, border: '1px solid #ccc', width: 120 }}>
                <option value="cash">Tiền mặt</option>
                <option value="bank">Chuyển khoản</option>
              </select>
            </div>
            <div style={{ marginBottom: 12 }}>
              <label>Ghi chú: </label>
              <input type="text" value={form.note} onChange={e => setForm(f => ({ ...f, note: e.target.value }))} style={{ padding: 6, borderRadius: 4, border: '1px solid #ccc', width: 240 }} />
            </div>
            <button type="submit" disabled={submitting} style={{ padding: '8px 24px', background: '#ffb347', border: 'none', borderRadius: 6, fontWeight: 600, cursor: 'pointer', marginRight: 12 }}>
              {submitting ? 'Đang ghi nhận...' : 'Xác nhận thanh toán'}
            </button>
            <button type="button" onClick={() => setSelected(null)} style={{ padding: '8px 18px', background: '#eee', border: 'none', borderRadius: 6, fontWeight: 500, cursor: 'pointer' }}>Huỷ</button>
          </form>
        )}
      </div>
    </div>
  );
}

