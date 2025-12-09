import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const API_BASE = 'http://localhost:8080/api';

export default function FeeManagement() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('currentUser'));

  if (!user) {
    navigate('/login');
    return null;
  }

  const [tab, setTab] = useState('create');
  const [students, setStudents] = useState([]);
  const [courses, setCourses] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [amount, setAmount] = useState('');
  const [courseId, setCourseId] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [paymentNote, setPaymentNote] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchText, setSearchText] = useState('');
  const [bankInfo, setBankInfo] = useState(null);

  useEffect(() => {
    loadTabData();
  }, [tab]);

  const loadTabData = async () => {
    setLoading(true);
    setMessage('');
    try {
      if (tab === 'create') {
        const s = await fetch(`${API_BASE}/fee/students/new`).then(r => r.json());
        const c = await fetch(`${API_BASE}/fee/courses/active`).then(r => r.json());
        setStudents(s.students || []);
        setCourses(c.courses || []);
      } else if (tab === 'payment') {
        const inv = await fetch(`${API_BASE}/fee/invoices/pending`).then(r => r.json());
        const bank = await fetch(`${API_BASE}/fee/bank-info`).then(r => r.json());
        setInvoices(inv.invoices || []);
        if (bank.success && bank.bank) {
          setBankInfo(bank.bank);
        }
      } else if (tab === 'list') {
        const inv = await fetch(`${API_BASE}/fee/invoices/all`).then(r => r.json());
        setInvoices(inv.invoices || []);
      }
    } catch (e) {
      setMessage('❌ Lỗi: ' + e.message);
    }
    setLoading(false);
  };

  const createInvoice = async (e) => {
    e.preventDefault();
    if (!selectedStudent || !courseId || !amount) {
      setMessage('⚠️ Vui lòng chọn đầy đủ');
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch(`${API_BASE}/fee/invoices`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          student_id: selectedStudent.id,
          course_id: parseInt(courseId),
          amount: parseFloat(amount),
        }),
      }).then(r => r.json());
      if (res.success) {
        setMessage('✅ Tạo hoá đơn thành công');
        setAmount('');
        setCourseId('');
        setSelectedStudent(null);
        setTimeout(() => loadTabData(), 1000);
      } else {
        setMessage('❌ ' + (res.message || 'Lỗi'));
      }
    } catch (e) {
      setMessage('❌ ' + e.message);
    }
    setSubmitting(false);
  };

  const processPayment = async (e) => {
    e.preventDefault();
    if (!selectedInvoice) {
      setMessage('⚠️ Chọn hoá đơn');
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch(`${API_BASE}/fee/invoices/${selectedInvoice.id}/payment`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          method: paymentMethod,
          note: paymentNote,
        }),
      }).then(r => r.json());
      if (res.success) {
        setMessage('✅ Thanh toán thành công');
        setPaymentMethod('cash');
        setPaymentNote('');
        setSelectedInvoice(null);
        setTimeout(() => loadTabData(), 1000);
      } else {
        setMessage('❌ ' + (res.message || 'Lỗi'));
      }
    } catch (e) {
      setMessage('❌ ' + e.message);
    }
    setSubmitting(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('currentUser');
    navigate('/login');
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f5f7fa', paddingBottom: 40 }}>
      <div style={{ background: 'linear-gradient(135deg, #667eea, #764ba2)', color: '#fff', padding: '20px', marginBottom: 30 }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', justifyContent: 'space-between' }}>
          <h1>💳 Quản Lý Thu Học Phí</h1>
          <button onClick={handleLogout} style={{ padding: '8px 16px', background: '#ff6b6b', border: 'none', color: '#fff', cursor: 'pointer', borderRadius: 6 }}>Đăng xuất</button>
        </div>
      </div>

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 20px' }}>
        <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
          <button onClick={() => setTab('create')} style={{ padding: '10px 20px', background: tab === 'create' ? '#667eea' : '#fff', color: tab === 'create' ? '#fff' : '#333', border: 'none', cursor: 'pointer', borderRadius: 6 }}>📝 Tạo Hoá Đơn</button>
          <button onClick={() => setTab('payment')} style={{ padding: '10px 20px', background: tab === 'payment' ? '#667eea' : '#fff', color: tab === 'payment' ? '#fff' : '#333', border: 'none', cursor: 'pointer', borderRadius: 6 }}>💰 Thanh Toán</button>
          <button onClick={() => setTab('list')} style={{ padding: '10px 20px', background: tab === 'list' ? '#667eea' : '#fff', color: tab === 'list' ? '#fff' : '#333', border: 'none', cursor: 'pointer', borderRadius: 6 }}>📋 Danh Sách</button>
        </div>

        {message && <div style={{ padding: 15, borderRadius: 8, marginBottom: 20, background: message.includes('✅') ? '#d1fae5' : '#fee2e2', color: message.includes('✅') ? '#065f46' : '#991b1b' }}>{message}</div>}

        {tab === 'create' && (
          <div style={{ background: '#fff', padding: 30, borderRadius: 12 }}>
            <h2>📝 Tạo Hoá Đơn Học Phí</h2>
            {loading ? <p>Loading...</p> : students.length === 0 ? <p>Không có học viên NEW</p> : (
              <div>
                <div style={{ marginBottom: 20 }}>
                  <label style={{ fontWeight: 600, display: 'block', marginBottom: 10 }}>Chọn Học Viên</label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 10 }}>
                    {students.map(s => (
                      <div key={s.id} onClick={() => setSelectedStudent(s)} style={{ padding: 10, border: selectedStudent?.id === s.id ? '2px solid #667eea' : '1px solid #e0e0e0', borderRadius: 6, cursor: 'pointer', background: selectedStudent?.id === s.id ? '#f0f4ff' : '#fff' }}>
                        <div style={{ fontWeight: 600 }}>{s.name}</div>
                        <div style={{ fontSize: 12, color: '#666' }}>{s.phone}</div>
                      </div>
                    ))}
                  </div>
                </div>
                {selectedStudent && (
                  <form onSubmit={createInvoice} style={{ background: '#f9fafb', padding: 20, borderRadius: 8 }}>
                    <div style={{ marginBottom: 15 }}>
                      <label style={{ fontWeight: 600, display: 'block', marginBottom: 5 }}>Khoá Học *</label>
                      <select value={courseId} onChange={(e) => setCourseId(e.target.value)} style={{ width: '100%', padding: '8px 10px', borderRadius: 6, border: '1px solid #d1d5db' }}>
                        <option value="">-- Chọn --</option>
                        {courses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                      </select>
                    </div>
                    <div style={{ marginBottom: 15 }}>
                      <label style={{ fontWeight: 600, display: 'block', marginBottom: 5 }}>Số Tiền (VNĐ) *</label>
                      <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="5000000" style={{ width: '100%', padding: '8px 10px', borderRadius: 6, border: '1px solid #d1d5db' }} />
                    </div>
                    <button type="submit" disabled={submitting} style={{ padding: '10px 20px', background: submitting ? '#9ca3af' : '#10b981', color: '#fff', border: 'none', cursor: 'pointer', borderRadius: 6, fontWeight: 600 }}>
                      {submitting ? 'Đang lưu...' : 'Tạo Hoá Đơn'}
                    </button>
                  </form>
                )}
              </div>
            )}
          </div>
        )}

        {tab === 'payment' && (
          <div style={{ background: '#fff', padding: 30, borderRadius: 12 }}>
            <h2>💰 Thanh Toán Hoá Đơn</h2>
            {loading ? <p>Loading...</p> : invoices.length === 0 ? <p>Không có hoá đơn PENDING</p> : (
              <div>
                <div style={{ marginBottom: 20 }}>
                  <label style={{ fontWeight: 600, display: 'block', marginBottom: 10 }}>Chọn Hoá Đơn</label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: 10 }}>
                    {invoices.map(inv => (
                      <div key={inv.id} onClick={() => setSelectedInvoice(inv)} style={{ padding: 10, border: selectedInvoice?.id === inv.id ? '2px solid #667eea' : '1px solid #e0e0e0', borderRadius: 6, cursor: 'pointer', background: selectedInvoice?.id === inv.id ? '#f0f4ff' : '#fff' }}>
                        <div style={{ fontWeight: 600 }}>HĐ #{inv.id}</div>
                        <div style={{ fontSize: 12, color: '#666' }}>👤 {inv.student_name}</div>
                        <div style={{ fontSize: 13, fontWeight: 600, color: '#10b981', marginTop: 5 }}>💰 {Number(inv.amount || 0).toLocaleString('vi-VN')} đ</div>
                      </div>
                    ))}
                  </div>
                </div>
                {selectedInvoice && (
                  <form onSubmit={processPayment} style={{ background: '#f9fafb', padding: 20, borderRadius: 8 }}>
                    <div style={{ marginBottom: 15 }}>
                      <label style={{ fontWeight: 600 }}>Hoá Đơn: HĐ #{selectedInvoice.id} - {selectedInvoice.student_name}</label>
                    </div>
                    <div style={{ marginBottom: 15 }}>
                      <label style={{ fontWeight: 600, display: 'block', marginBottom: 5 }}>Phương Thức *</label>
                      <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)} style={{ width: '100%', padding: '8px 10px', borderRadius: 6, border: '1px solid #d1d5db' }}>
                        <option value="cash">💵 Tiền Mặt</option>
                        <option value="bank">🏦 Chuyển Khoán</option>
                        <option value="card">💳 Thẻ</option>
                        <option value="other">📱 Khác</option>
                      </select>
                    </div>
                    
                    {paymentMethod === 'bank' && bankInfo && (
                      <div style={{ marginBottom: 15, background: '#ecfdf5', padding: 15, borderRadius: 8, border: '2px solid #10b981' }}>
                        <h3 style={{ color: '#059669', marginTop: 0 }}>📋 Thông Tin Chuyển Khoán</h3>
                        <div style={{ lineHeight: 1.8 }}>
                          <p><strong>Ngân Hàng:</strong> {bankInfo.bank_name}</p>
                          <p><strong>Số Tài Khoản:</strong> <span style={{ fontFamily: 'monospace', background: '#fff', padding: '4px 8px', borderRadius: 4 }}>{bankInfo.account_number}</span></p>
                          <p><strong>Chủ Tài Khoản:</strong> {bankInfo.account_holder}</p>
                          <p style={{ fontSize: 12, color: '#666', marginTop: 10 }}>💡 Vui lòng chuyển khoản theo thông tin trên và ghi đúng số hoá đơn trong nội dung chuyển khoản</p>
                        </div>
                      </div>
                    )}
                    
                    <div style={{ marginBottom: 15 }}>
                      <label style={{ fontWeight: 600, display: 'block', marginBottom: 5 }}>Ghi Chú</label>
                      <input type="text" value={paymentNote} onChange={(e) => setPaymentNote(e.target.value)} placeholder="Ghi chú" style={{ width: '100%', padding: '8px 10px', borderRadius: 6, border: '1px solid #d1d5db' }} />
                    </div>
                    <button type="submit" disabled={submitting} style={{ padding: '10px 20px', background: submitting ? '#9ca3af' : '#10b981', color: '#fff', border: 'none', cursor: 'pointer', borderRadius: 6, fontWeight: 600 }}>
                      {submitting ? 'Đang xử lý...' : 'Xác Nhận Thanh Toán'}
                    </button>
                  </form>
                )}
              </div>
            )}
          </div>
        )}

        {tab === 'list' && (
          <div style={{ background: '#fff', padding: 30, borderRadius: 12 }}>
            <h2>📋 Danh Sách Tất Cả Hoá Đơn</h2>
            {loading ? <p>Loading...</p> : invoices.length === 0 ? <p>Chưa có hoá đơn</p> : (
              <div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 150px', gap: 15, marginBottom: 20 }}>
                  <div>
                    <label style={{ fontWeight: 600, display: 'block', marginBottom: 5 }}>🔍 Tìm Kiếm</label>
                    <input type="text" value={searchText} onChange={(e) => setSearchText(e.target.value.toLowerCase())} placeholder="Tên / Khoá" style={{ width: '100%', padding: '8px 10px', borderRadius: 6, border: '1px solid #d1d5db' }} />
                  </div>
                  <div>
                    <label style={{ fontWeight: 600, display: 'block', marginBottom: 5 }}>🏷️ Lọc</label>
                    <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} style={{ width: '100%', padding: '8px 10px', borderRadius: 6, border: '1px solid #d1d5db' }}>
                      <option value="all">Tất Cả</option>
                      <option value="pending">⏳ PENDING</option>
                      <option value="paid">✅ PAID</option>
                    </select>
                  </div>
                </div>
                {(() => {
                  const filtered = invoices.filter(inv => {
                    const match1 = filterStatus === 'all' || inv.status?.toLowerCase() === filterStatus;
                    const match2 = searchText === '' || (inv.student_name || '').toLowerCase().includes(searchText) || (inv.course_name || '').toLowerCase().includes(searchText);
                    return match1 && match2;
                  });
                  if (filtered.length === 0) return <p>Không tìm thấy</p>;
                  return (
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                      <thead>
                        <tr style={{ background: '#f3f4f6', borderBottom: '2px solid #e5e7eb' }}>
                          <th style={{ padding: '10px', textAlign: 'left' }}>HĐ #</th>
                          <th style={{ padding: '10px', textAlign: 'left' }}>Học Viên</th>
                          <th style={{ padding: '10px', textAlign: 'left' }}>Khoá</th>
                          <th style={{ padding: '10px', textAlign: 'right' }}>Số Tiền</th>
                          <th style={{ padding: '10px', textAlign: 'center' }}>Trạng Thái</th>
                          <th style={{ padding: '10px', textAlign: 'center' }}>Ngày Nộp</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filtered.map(inv => (
                          <tr key={inv.id} style={{ borderBottom: '1px solid #f3f4f6', background: inv.status?.toUpperCase() === 'PENDING' ? '#fef3c7' : '#fff' }}>
                            <td style={{ padding: '10px', fontWeight: 600 }}>#{inv.id}</td>
                            <td style={{ padding: '10px' }}>{inv.student_name}</td>
                            <td style={{ padding: '10px' }}>{inv.course_name}</td>
                            <td style={{ padding: '10px', textAlign: 'right', fontWeight: 600, color: '#10b981' }}>{Number(inv.amount || 0).toLocaleString('vi-VN')} đ</td>
                            <td style={{ padding: '10px', textAlign: 'center' }}>
                              <span style={{ padding: '4px 8px', borderRadius: 4, background: inv.status?.toUpperCase() === 'PENDING' ? '#fcd34d' : '#d1fae5', color: inv.status?.toUpperCase() === 'PENDING' ? '#78350f' : '#065f46', fontSize: 11, fontWeight: 500 }}>
                                {inv.status?.toUpperCase() === 'PENDING' ? '⏳' : '✓'}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  );
                })()}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
