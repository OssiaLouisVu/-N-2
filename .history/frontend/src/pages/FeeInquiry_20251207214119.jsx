import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const API_BASE = 'http://localhost:8080/api';

export default function FeeInquiry() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('currentUser'));

  if (!user) {
    navigate('/login');
    return null;
  }

  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterFromDate, setFilterFromDate] = useState('');
  const [filterToDate, setFilterToDate] = useState('');
  const [filterSemester, setFilterSemester] = useState('');
  const [message, setMessage] = useState('');

  // Load all students on mount
  useEffect(() => {
    loadAllStudents();
  }, []);

  const loadAllStudents = async () => {
    try {
      const res = await fetch(`${API_BASE}/students`);
      const data = await res.json();
      if (data.success && data.students) {
        setStudents(data.students);
      }
    } catch (e) {
      console.error('Error loading students:', e);
    }
  };

  // Search students
  const handleSearchStudent = async () => {
    if (!searchKeyword.trim()) {
      setMessage('⚠️ Nhập tên/SDT/email để tìm kiếm');
      return;
    }
    
    setLoading(true);
    setMessage('');
    try {
      const res = await fetch(`${API_BASE}/students?keyword=${encodeURIComponent(searchKeyword)}`);
      const data = await res.json();
      if (data.success && data.students) {
        setStudents(data.students);
        if (data.students.length === 0) {
          setMessage('⚠️ Không tìm thấy học viên nào');
        }
      }
    } catch (e) {
      setMessage('❌ Lỗi tìm kiếm: ' + e.message);
    }
    setLoading(false);
  };

  // Select student and load their invoices
  const handleSelectStudent = async (student) => {
    setSelectedStudent(student);
    setLoading(true);
    setMessage('');
    try {
      const res = await fetch(`${API_BASE}/fee/invoices/all`);
      const data = await res.json();
      if (data.success && data.invoices) {
        // Filter invoices for this student
        const studentInvoices = data.invoices.filter(inv => inv.student_id === student.id);
        setInvoices(studentInvoices);
        if (studentInvoices.length === 0) {
          setMessage('ℹ️ Học viên này chưa có hoá đơn nào');
        }
      }
    } catch (e) {
      setMessage('❌ Lỗi tải hoá đơn: ' + e.message);
    }
    setLoading(false);
  };

  // Filter invoices based on criteria
  const getFilteredInvoices = () => {
    let filtered = invoices;

    // Filter by status
    if (filterStatus !== 'all') {
      filtered = filtered.filter(inv => inv.status?.toLowerCase() === filterStatus.toLowerCase());
    }

    // Filter by date range
    if (filterFromDate) {
      filtered = filtered.filter(inv => {
        const paidDate = inv.paid_at ? new Date(inv.paid_at).toISOString().split('T')[0] : '';
        return paidDate >= filterFromDate;
      });
    }

    if (filterToDate) {
      filtered = filtered.filter(inv => {
        const paidDate = inv.paid_at ? new Date(inv.paid_at).toISOString().split('T')[0] : '';
        return paidDate <= filterToDate;
      });
    }

    return filtered;
  };

  const filteredInvoices = getFilteredInvoices();

  const getStatusBadge = (status, paidAt) => {
    const statusUpper = status?.toUpperCase();
    if (statusUpper === 'PAID') {
      return { text: '✅ Đã Nộp', color: '#d1fae5', textColor: '#065f46' };
    } else if (statusUpper === 'PENDING') {
      return { text: '⏳ Chưa Nộp', color: '#fef3c7', textColor: '#78350f' };
    }
    return { text: '❓ Không xác định', color: '#f3f4f6', textColor: '#374151' };
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f5f7fa', paddingBottom: 40 }}>
      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg, #667eea, #764ba2)', color: '#fff', padding: '20px', marginBottom: 30 }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h1>🔍 Tra Cứu Trạng Thái Học Phí</h1>
          <button 
            onClick={() => navigate(-1)} 
            style={{ padding: '8px 16px', background: '#fff', color: '#667eea', border: 'none', cursor: 'pointer', borderRadius: 6, fontWeight: 600 }}
          >
            ← Quay lại
          </button>
        </div>
      </div>

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 20px' }}>
        {/* Search Section */}
        <div style={{ background: '#fff', padding: 20, borderRadius: 12, marginBottom: 30, boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
          <h3 style={{ marginTop: 0, marginBottom: 15 }}>👥 Tìm Kiếm Học Viên</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 10, marginBottom: 15 }}>
            <input 
              type="text" 
              value={searchKeyword} 
              onChange={(e) => setSearchKeyword(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearchStudent()}
              placeholder="Nhập tên / SDT / email..." 
              style={{ padding: '10px 15px', borderRadius: 6, border: '1px solid #d1d5db', fontSize: 14 }}
            />
            <button 
              onClick={handleSearchStudent}
              style={{ padding: '10px 20px', background: '#667eea', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 600 }}
            >
              Tìm Kiếm
            </button>
          </div>

          {/* Students List */}
          {students.length > 0 && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: 10 }}>
              {students.map(student => (
                <div
                  key={student.id}
                  onClick={() => handleSelectStudent(student)}
                  style={{
                    padding: 12,
                    border: selectedStudent?.id === student.id ? '2px solid #667eea' : '1px solid #e5e7eb',
                    borderRadius: 8,
                    cursor: 'pointer',
                    background: selectedStudent?.id === student.id ? '#eef2ff' : '#fff',
                    transition: 'all 0.2s'
                  }}
                >
                  <div style={{ fontWeight: 600, color: '#1f2937', marginBottom: 4 }}>{student.full_name}</div>
                  <div style={{ fontSize: 12, color: '#6b7280' }}>{student.phone}</div>
                  {student.email && <div style={{ fontSize: 12, color: '#9ca3af' }}>{student.email}</div>}
                  <div style={{ fontSize: 11, color: '#d1d5db', marginTop: 4 }}>Status: {student.status} | Payment: {student.payment_status}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {message && <div style={{ background: '#fee2e2', color: '#991b1b', padding: 15, borderRadius: 8, marginBottom: 20 }}>{message}</div>}

        {/* Filters Section */}
        {selectedStudent && (
          <div style={{ background: '#fff', padding: 20, borderRadius: 12, marginBottom: 30, boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
            <h3 style={{ marginTop: 0, marginBottom: 15 }}>🎯 Lọc Hoá Đơn</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 15, alignItems: 'end' }}>
              <div>
                <label style={{ display: 'block', fontWeight: 600, marginBottom: 5, fontSize: 13 }}>Trạng Thái</label>
                <select 
                  value={filterStatus} 
                  onChange={(e) => setFilterStatus(e.target.value)}
                  style={{ width: '100%', padding: '8px 10px', borderRadius: 6, border: '1px solid #d1d5db', fontSize: 13 }}
                >
                  <option value="all">Tất Cả</option>
                  <option value="paid">✅ Đã Nộp</option>
                  <option value="pending">⏳ Chưa Nộp</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontWeight: 600, marginBottom: 5, fontSize: 13 }}>Từ Ngày</label>
                <input 
                  type="date" 
                  value={filterFromDate} 
                  onChange={(e) => setFilterFromDate(e.target.value)}
                  style={{ width: '100%', padding: '8px 10px', borderRadius: 6, border: '1px solid #d1d5db', fontSize: 13 }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontWeight: 600, marginBottom: 5, fontSize: 13 }}>Đến Ngày</label>
                <input 
                  type="date" 
                  value={filterToDate} 
                  onChange={(e) => setFilterToDate(e.target.value)}
                  style={{ width: '100%', padding: '8px 10px', borderRadius: 6, border: '1px solid #d1d5db', fontSize: 13 }}
                />
              </div>
              <button 
                onClick={() => {
                  setFilterStatus('all');
                  setFilterFromDate('');
                  setFilterToDate('');
                  setFilterSemester('');
                }}
                style={{ padding: '8px 15px', background: '#e5e7eb', color: '#374151', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 600, fontSize: 13 }}
              >
                Xoá Lọc
              </button>
            </div>
          </div>
        )}

        {/* Invoices Table */}
        {selectedStudent && invoices.length > 0 && (
          <div style={{ background: '#fff', padding: 20, borderRadius: 12, boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
            <h3 style={{ marginTop: 0, marginBottom: 15 }}>
              📋 Hoá Đơn - {selectedStudent.full_name}
              <span style={{ fontSize: 13, color: '#6b7280', marginLeft: 10 }}>
                ({filteredInvoices.length}/{invoices.length} hoá đơn)
              </span>
            </h3>

            {filteredInvoices.length === 0 ? (
              <div style={{ textAlign: 'center', color: '#6b7280', padding: '20px' }}>Không có hoá đơn phù hợp với bộ lọc</div>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                <thead>
                  <tr style={{ background: '#f3f4f6', borderBottom: '2px solid #e5e7eb' }}>
                    <th style={{ padding: '12px', textAlign: 'left', fontWeight: 600 }}>HĐ #</th>
                    <th style={{ padding: '12px', textAlign: 'left', fontWeight: 600 }}>Khoá Học</th>
                    <th style={{ padding: '12px', textAlign: 'right', fontWeight: 600 }}>Số Tiền</th>
                    <th style={{ padding: '12px', textAlign: 'center', fontWeight: 600 }}>Trạng Thái</th>
                    <th style={{ padding: '12px', textAlign: 'center', fontWeight: 600 }}>Ngày Tạo</th>
                    <th style={{ padding: '12px', textAlign: 'center', fontWeight: 600 }}>Ngày Nộp</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredInvoices.map(inv => {
                    const badge = getStatusBadge(inv.status, inv.paid_at);
                    return (
                      <tr key={inv.id} style={{ borderBottom: '1px solid #f3f4f6', background: inv.status?.toUpperCase() === 'PENDING' ? '#fef3c7' : '#fff' }}>
                        <td style={{ padding: '12px', fontWeight: 600 }}>#{inv.id}</td>
                        <td style={{ padding: '12px' }}>{inv.course_name}</td>
                        <td style={{ padding: '12px', textAlign: 'right', color: '#10b981', fontWeight: 600 }}>
                          {Number(inv.amount || 0).toLocaleString('vi-VN')} đ
                        </td>
                        <td style={{ padding: '12px', textAlign: 'center' }}>
                          <span style={{ padding: '4px 8px', borderRadius: 4, background: badge.color, color: badge.textColor, fontSize: 11, fontWeight: 600 }}>
                            {badge.text}
                          </span>
                        </td>
                        <td style={{ padding: '12px', textAlign: 'center', color: '#6b7280' }}>
                          {inv.created_at ? new Date(inv.created_at).toLocaleDateString('vi-VN') : '—'}
                        </td>
                        <td style={{ padding: '12px', textAlign: 'center', color: '#6b7280' }}>
                          {inv.paid_at ? new Date(inv.paid_at).toLocaleDateString('vi-VN') : '—'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}

            {/* Summary */}
            <div style={{ marginTop: 20, paddingTop: 15, borderTop: '1px solid #e5e7eb', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 15 }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 5 }}>Tổng Hoá Đơn</div>
                <div style={{ fontSize: 20, fontWeight: 700, color: '#1f2937' }}>{invoices.length}</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 5 }}>Đã Nộp</div>
                <div style={{ fontSize: 20, fontWeight: 700, color: '#10b981' }}>{invoices.filter(i => i.status?.toUpperCase() === 'PAID').length}</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 5 }}>Chưa Nộp</div>
                <div style={{ fontSize: 20, fontWeight: 700, color: '#f59e0b' }}>{invoices.filter(i => i.status?.toUpperCase() === 'PENDING').length}</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
