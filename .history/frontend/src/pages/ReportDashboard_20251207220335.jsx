import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const API_BASE = 'http://localhost:8080/api';

export default function ReportDashboard() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('currentUser'));

  if (!user) {
    navigate('/login');
    return null;
  }

  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    loadReport();
  }, []);

  const loadReport = async () => {
    setLoading(true);
    setMessage('');
    try {
      let url = `${API_BASE}/fee/report/summary`;
      const params = new URLSearchParams();
      if (fromDate) params.append('from', fromDate);
      if (toDate) params.append('to', toDate);
      if (params.toString()) url += `?${params.toString()}`;

      const res = await fetch(url);
      const data = await res.json();
      if (data.success && data.report) {
        setReport(data.report);
      } else {
        setMessage('❌ Không thể tải báo cáo');
      }
    } catch (e) {
      setMessage('❌ Lỗi: ' + e.message);
    }
    setLoading(false);
  };

  const handleFilter = () => {
    loadReport();
  };

  const handleClearFilter = () => {
    setFromDate('');
    setToDate('');
    setTimeout(() => loadReport(), 100);
  };

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', padding: '40px 20px' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 30 }}>
          <div>
            <h1 style={{ color: '#fff', fontSize: 32, fontWeight: 700, marginBottom: 5 }}>📊 Báo Cáo Thống Kê Học Phí</h1>
            <p style={{ color: '#e0e7ff', fontSize: 14 }}>Tổng hợp doanh thu, khoá học, và học viên đã thanh toán</p>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button 
              onClick={() => navigate('/accountant/report-advanced')} 
              style={{ padding: '10px 20px', background: '#fbbf24', color: '#78350f', border: 'none', borderRadius: 8, fontWeight: 600, cursor: 'pointer', fontSize: 14 }}
            >
              📈 Báo Cáo Chi Tiết
            </button>
            <button 
              onClick={() => navigate(-1)} 
              style={{ padding: '10px 20px', background: '#fff', color: '#667eea', border: 'none', borderRadius: 8, fontWeight: 600, cursor: 'pointer' }}
            >
              ← Quay lại
            </button>
          </div>
        </div>

        {/* Date Filter */}
        <div style={{ background: '#fff', padding: 20, borderRadius: 12, marginBottom: 30, boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
          <h3 style={{ marginTop: 0, marginBottom: 15 }}>🔍 Lọc Theo Khoảng Thời Gian</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto auto', gap: 15, alignItems: 'end' }}>
            <div>
              <label style={{ display: 'block', fontWeight: 600, marginBottom: 5 }}>Từ ngày</label>
              <input 
                type="date" 
                value={fromDate} 
                onChange={(e) => setFromDate(e.target.value)} 
                style={{ width: '100%', padding: '8px 10px', borderRadius: 6, border: '1px solid #d1d5db' }} 
              />
            </div>
            <div>
              <label style={{ display: 'block', fontWeight: 600, marginBottom: 5 }}>Đến ngày</label>
              <input 
                type="date" 
                value={toDate} 
                onChange={(e) => setToDate(e.target.value)} 
                style={{ width: '100%', padding: '8px 10px', borderRadius: 6, border: '1px solid #d1d5db' }} 
              />
            </div>
            <button 
              onClick={handleFilter} 
              style={{ padding: '10px 20px', background: '#667eea', color: '#fff', border: 'none', borderRadius: 6, fontWeight: 600, cursor: 'pointer' }}
            >
              Lọc
            </button>
            <button 
              onClick={handleClearFilter} 
              style={{ padding: '10px 20px', background: '#e5e7eb', color: '#374151', border: 'none', borderRadius: 6, fontWeight: 600, cursor: 'pointer' }}
            >
              Xoá lọc
            </button>
          </div>
        </div>

        {message && <div style={{ background: '#fee2e2', color: '#991b1b', padding: 15, borderRadius: 8, marginBottom: 20 }}>{message}</div>}

        {/* Report Cards */}
        {loading ? (
          <div style={{ textAlign: 'center', color: '#fff', fontSize: 18 }}>Đang tải...</div>
        ) : report ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 20 }}>
            {/* Card 1: Total Money */}
            <div style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', padding: 30, borderRadius: 12, boxShadow: '0 10px 15px rgba(0,0,0,0.2)' }}>
              <div style={{ fontSize: 14, color: '#d1fae5', marginBottom: 10, fontWeight: 600 }}>💰 TỔNG SỐ TIỀN ĐÃ THU</div>
              <div style={{ fontSize: 36, color: '#fff', fontWeight: 700, marginBottom: 5 }}>
                {Number(report.total_collected || 0).toLocaleString('vi-VN')} đ
              </div>
              <div style={{ fontSize: 12, color: '#d1fae5' }}>Từ tất cả hoá đơn đã thanh toán</div>
            </div>

            {/* Card 2: Courses */}
            <div style={{ background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)', padding: 30, borderRadius: 12, boxShadow: '0 10px 15px rgba(0,0,0,0.2)' }}>
              <div style={{ fontSize: 14, color: '#fef3c7', marginBottom: 10, fontWeight: 600 }}>📚 TỔNG SỐ KHOÁ HỌC ĐĂNG KÝ</div>
              <div style={{ fontSize: 36, color: '#fff', fontWeight: 700, marginBottom: 5 }}>
                {report.courses_registered || 0}
              </div>
              <div style={{ fontSize: 12, color: '#fef3c7' }}>Khoá học có học viên đã thanh toán</div>
            </div>

            {/* Card 3: Students */}
            <div style={{ background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)', padding: 30, borderRadius: 12, boxShadow: '0 10px 15px rgba(0,0,0,0.2)' }}>
              <div style={{ fontSize: 14, color: '#dbeafe', marginBottom: 10, fontWeight: 600 }}>👥 TỔNG SỐ HỌC VIÊN ĐĂNG KÝ</div>
              <div style={{ fontSize: 36, color: '#fff', fontWeight: 700, marginBottom: 5 }}>
                {report.students_registered || 0}
              </div>
              <div style={{ fontSize: 12, color: '#dbeafe' }}>Học viên đã thanh toán học phí</div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
