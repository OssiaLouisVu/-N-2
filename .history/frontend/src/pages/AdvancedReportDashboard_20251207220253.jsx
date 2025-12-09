import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const API_BASE = 'http://localhost:8080/api';

export default function AdvancedReportDashboard() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('currentUser'));

  if (!user) {
    navigate('/login');
    return null;
  }

  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  
  // Statistics
  const [stats, setStats] = useState({
    totalAmount: 0,
    totalCourses: 0,
    totalStudents: 0,
    totalInvoices: 0,
    paidInvoices: 0,
    pendingInvoices: 0,
    averagePerInvoice: 0,
  });

  useEffect(() => {
    loadReportData();
  }, []);

  const loadReportData = async () => {
    setLoading(true);
    setMessage('');
    try {
      const params = new URLSearchParams();
      if (fromDate) params.append('from', fromDate);
      if (toDate) params.append('to', toDate);

      const res = await fetch(`${API_BASE}/fee/invoices/all?${params.toString()}`);
      const data = await res.json();
      
      if (data.success && data.invoices) {
        let filtered = data.invoices;

        // Filter by status
        if (filterStatus === 'paid') {
          filtered = filtered.filter(inv => inv.status?.toUpperCase() === 'PAID');
        } else if (filterStatus === 'pending') {
          filtered = filtered.filter(inv => inv.status?.toUpperCase() === 'PENDING');
        }

        setInvoices(filtered);
        calculateStats(filtered);
      }
    } catch (e) {
      setMessage('❌ Lỗi tải dữ liệu: ' + e.message);
    }
    setLoading(false);
  };

  const calculateStats = (data) => {
    const totalAmount = data.reduce((sum, inv) => sum + (Number(inv.amount) || 0), 0);
    const courses = new Set(data.map(inv => inv.course_id)).size;
    const students = new Set(data.map(inv => inv.student_id)).size;
    const paid = data.filter(inv => inv.status?.toUpperCase() === 'PAID').length;
    const pending = data.filter(inv => inv.status?.toUpperCase() === 'PENDING').length;
    
    setStats({
      totalAmount,
      totalCourses: courses,
      totalStudents: students,
      totalInvoices: data.length,
      paidInvoices: paid,
      pendingInvoices: pending,
      averagePerInvoice: data.length > 0 ? Math.round(totalAmount / data.length) : 0,
    });
  };

  const handleApplyFilter = () => {
    loadReportData();
  };

  const handleClearFilter = () => {
    setFromDate('');
    setToDate('');
    setFilterStatus('all');
  };

  const handleExportCSV = () => {
    if (invoices.length === 0) {
      setMessage('⚠️ Không có dữ liệu để export');
      return;
    }

    const headers = ['HĐ #', 'Học Viên', 'Khoá Học', 'Số Tiền', 'Trạng Thái', 'Ngày Tạo', 'Ngày Nộp'];
    const rows = invoices.map(inv => [
      inv.id,
      inv.student_name,
      inv.course_name,
      inv.amount,
      inv.status,
      inv.created_at ? new Date(inv.created_at).toLocaleDateString('vi-VN') : '',
      inv.paid_at ? new Date(inv.paid_at).toLocaleDateString('vi-VN') : ''
    ]);

    let csv = headers.join(',') + '\n';
    rows.forEach(row => {
      csv += row.map(cell => `"${cell}"`).join(',') + '\n';
    });

    const element = document.createElement('a');
    element.setAttribute('href', 'data:text/csv;charset=utf-8,' + encodeURIComponent(csv));
    element.setAttribute('download', `bao-cao-hoc-phi-${new Date().getTime()}.csv`);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);

    setMessage('✅ Export CSV thành công');
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f5f7fa', paddingBottom: 40 }}>
      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg, #667eea, #764ba2)', color: '#fff', padding: '20px', marginBottom: 30 }}>
        <div style={{ maxWidth: 1400, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h1>📊 Báo Cáo Thống Kê Học Phí Chi Tiết</h1>
          <button 
            onClick={() => navigate(-1)} 
            style={{ padding: '8px 16px', background: '#fff', color: '#667eea', border: 'none', cursor: 'pointer', borderRadius: 6, fontWeight: 600 }}
          >
            ← Quay lại
          </button>
        </div>
      </div>

      <div style={{ maxWidth: 1400, margin: '0 auto', padding: '0 20px' }}>
        {message && (
          <div style={{
            background: message.includes('✅') ? '#d1fae5' : '#fee2e2',
            color: message.includes('✅') ? '#065f46' : '#991b1b',
            padding: 15,
            borderRadius: 8,
            marginBottom: 20
          }}>
            {message}
          </div>
        )}

        {/* Filter Section */}
        <div style={{ background: '#fff', padding: 20, borderRadius: 12, marginBottom: 30, boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
          <h3 style={{ marginTop: 0, marginBottom: 15 }}>🎯 Bộ Lọc</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 15, alignItems: 'end' }}>
            <div>
              <label style={{ display: 'block', fontWeight: 600, marginBottom: 8, fontSize: 13 }}>Từ Ngày</label>
              <input 
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                style={{ width: '100%', padding: '10px', borderRadius: 6, border: '1px solid #d1d5db', fontSize: 13 }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontWeight: 600, marginBottom: 8, fontSize: 13 }}>Đến Ngày</label>
              <input 
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                style={{ width: '100%', padding: '10px', borderRadius: 6, border: '1px solid #d1d5db', fontSize: 13 }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontWeight: 600, marginBottom: 8, fontSize: 13 }}>Trạng Thái</label>
              <select 
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                style={{ width: '100%', padding: '10px', borderRadius: 6, border: '1px solid #d1d5db', fontSize: 13 }}
              >
                <option value="all">Tất Cả</option>
                <option value="paid">✅ Đã Nộp</option>
                <option value="pending">⏳ Chưa Nộp</option>
              </select>
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button 
                onClick={handleApplyFilter}
                disabled={loading}
                style={{ 
                  flex: 1,
                  padding: '10px', 
                  background: '#667eea', 
                  color: '#fff', 
                  border: 'none', 
                  borderRadius: 6, 
                  cursor: 'pointer', 
                  fontWeight: 600,
                  fontSize: 13 
                }}
              >
                {loading ? '⏳ Đang lọc...' : '🔍 Lọc'}
              </button>
              <button 
                onClick={handleClearFilter}
                style={{ 
                  flex: 1,
                  padding: '10px', 
                  background: '#e5e7eb', 
                  color: '#374151', 
                  border: 'none', 
                  borderRadius: 6, 
                  cursor: 'pointer', 
                  fontWeight: 600,
                  fontSize: 13 
                }}
              >
                Xoá Lọc
              </button>
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 20, marginBottom: 30 }}>
          {/* Card 1: Total Amount */}
          <div style={{ background: 'linear-gradient(135deg, #10b981, #059669)', color: '#fff', padding: 20, borderRadius: 12, boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
            <div style={{ fontSize: 12, opacity: 0.9, marginBottom: 8 }}>💰 TỔNG SỐ TIỀN ĐÃ THU</div>
            <div style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>
              {Number(stats.totalAmount).toLocaleString('vi-VN')} đ
            </div>
            <div style={{ fontSize: 12, opacity: 0.8 }}>{stats.totalInvoices} hoá đơn | {stats.paidInvoices} đã thanh toán</div>
          </div>

          {/* Card 2: Total Courses */}
          <div style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)', color: '#fff', padding: 20, borderRadius: 12, boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
            <div style={{ fontSize: 12, opacity: 0.9, marginBottom: 8 }}>📚 TỔNG SỐ KHOÁ HỌC</div>
            <div style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>{stats.totalCourses}</div>
            <div style={{ fontSize: 12, opacity: 0.8 }}>Khoá học đã đăng ký</div>
          </div>

          {/* Card 3: Total Students */}
          <div style={{ background: 'linear-gradient(135deg, #3b82f6, #2563eb)', color: '#fff', padding: 20, borderRadius: 12, boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
            <div style={{ fontSize: 12, opacity: 0.9, marginBottom: 8 }}>👥 TỔNG SỐ HỌC VIÊN</div>
            <div style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>{stats.totalStudents}</div>
            <div style={{ fontSize: 12, opacity: 0.8 }}>Học viên đã đăng ký</div>
          </div>

          {/* Card 4: Average */}
          <div style={{ background: 'linear-gradient(135deg, #ec4899, #db2777)', color: '#fff', padding: 20, borderRadius: 12, boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
            <div style={{ fontSize: 12, opacity: 0.9, marginBottom: 8 }}>📊 TRUNG BÌNH MỗI HĐ</div>
            <div style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>
              {Number(stats.averagePerInvoice).toLocaleString('vi-VN')} đ
            </div>
            <div style={{ fontSize: 12, opacity: 0.8 }}>Giá trị hoá đơn trung bình</div>
          </div>
        </div>

        {/* Status Summary */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 15, marginBottom: 30 }}>
          <div style={{ background: '#fff', padding: 15, borderRadius: 8, textAlign: 'center', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: '#1f2937', marginBottom: 5 }}>Tổng HĐ</div>
            <div style={{ fontSize: 24, fontWeight: 700, color: '#667eea' }}>{stats.totalInvoices}</div>
          </div>
          <div style={{ background: '#fff', padding: 15, borderRadius: 8, textAlign: 'center', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: '#1f2937', marginBottom: 5 }}>✅ Đã Nộp</div>
            <div style={{ fontSize: 24, fontWeight: 700, color: '#10b981' }}>{stats.paidInvoices}</div>
          </div>
          <div style={{ background: '#fff', padding: 15, borderRadius: 8, textAlign: 'center', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: '#1f2937', marginBottom: 5 }}>⏳ Chưa Nộp</div>
            <div style={{ fontSize: 24, fontWeight: 700, color: '#f59e0b' }}>{stats.pendingInvoices}</div>
          </div>
        </div>

        {/* Invoices Table */}
        <div style={{ background: '#fff', padding: 20, borderRadius: 12, boxShadow: '0 4px 6px rgba(0,0,0,0.1)', marginBottom: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 }}>
            <h3 style={{ marginTop: 0 }}>📋 Chi Tiết Các Hoá Đơn ({invoices.length})</h3>
            <button 
              onClick={handleExportCSV}
              style={{ 
                padding: '8px 15px', 
                background: '#10b981', 
                color: '#fff', 
                border: 'none', 
                borderRadius: 6, 
                cursor: 'pointer', 
                fontWeight: 600,
                fontSize: 13
              }}
            >
              📥 Export CSV
            </button>
          </div>

          {invoices.length === 0 ? (
            <div style={{ textAlign: 'center', color: '#6b7280', padding: '40px' }}>
              Không có dữ liệu
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                <thead>
                  <tr style={{ background: '#f3f4f6', borderBottom: '2px solid #e5e7eb' }}>
                    <th style={{ padding: '12px', textAlign: 'left', fontWeight: 600 }}>HĐ #</th>
                    <th style={{ padding: '12px', textAlign: 'left', fontWeight: 600 }}>Học Viên</th>
                    <th style={{ padding: '12px', textAlign: 'left', fontWeight: 600 }}>Khoá Học</th>
                    <th style={{ padding: '12px', textAlign: 'right', fontWeight: 600 }}>Số Tiền</th>
                    <th style={{ padding: '12px', textAlign: 'center', fontWeight: 600 }}>Trạng Thái</th>
                    <th style={{ padding: '12px', textAlign: 'center', fontWeight: 600 }}>Ngày Tạo</th>
                    <th style={{ padding: '12px', textAlign: 'center', fontWeight: 600 }}>Ngày Nộp</th>
                  </tr>
                </thead>
                <tbody>
                  {invoices.map((inv, idx) => (
                    <tr key={inv.id} style={{ borderBottom: '1px solid #f3f4f6', background: idx % 2 === 0 ? '#fff' : '#f9fafb' }}>
                      <td style={{ padding: '12px', fontWeight: 600 }}>#{inv.id}</td>
                      <td style={{ padding: '12px' }}>{inv.student_name}</td>
                      <td style={{ padding: '12px' }}>{inv.course_name}</td>
                      <td style={{ padding: '12px', textAlign: 'right', color: '#10b981', fontWeight: 600 }}>
                        {Number(inv.amount || 0).toLocaleString('vi-VN')} đ
                      </td>
                      <td style={{ padding: '12px', textAlign: 'center' }}>
                        <span style={{
                          padding: '4px 8px',
                          borderRadius: 4,
                          background: inv.status?.toUpperCase() === 'PAID' ? '#d1fae5' : '#fef3c7',
                          color: inv.status?.toUpperCase() === 'PAID' ? '#065f46' : '#78350f',
                          fontSize: 11,
                          fontWeight: 600
                        }}>
                          {inv.status?.toUpperCase() === 'PAID' ? '✅ Đã Nộp' : '⏳ Chưa Nộp'}
                        </span>
                      </td>
                      <td style={{ padding: '12px', textAlign: 'center', color: '#6b7280', fontSize: 12 }}>
                        {inv.created_at ? new Date(inv.created_at).toLocaleDateString('vi-VN') : '—'}
                      </td>
                      <td style={{ padding: '12px', textAlign: 'center', color: '#6b7280', fontSize: 12 }}>
                        {inv.paid_at ? new Date(inv.paid_at).toLocaleDateString('vi-VN') : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
