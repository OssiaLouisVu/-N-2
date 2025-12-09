import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const API_BASE = 'http://localhost:5173/api'; // Sẽ call backend API

export default function FeeManagement() {
  const navigate = useNavigate();
  const stored = JSON.parse(localStorage.getItem('currentUser'));

  if (!stored) {
    window.location.href = '/login';
    return null;
  }

  const [tab, setTab] = useState('create'); // create | payment | list
  const [students, setStudents] = useState([]);
  const [paidStudents, setPaidStudents] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form tạo hoá đơn
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [formData, setFormData] = useState({
    course_id: '',
    amount: '',
    method: 'cash',
    note: ''
  });
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchData();
  }, [tab]);

  async function fetchData() {
    setLoading(true);
    setMessage('');
    try {
      if (tab === 'create') {
        const [studentsRes, coursesRes] = await Promise.all([
          getUnpaidStudents(),
          getCourses()
        ]);
        setStudents(studentsRes || []);
        setCourses(coursesRes || []);
      } else {
        const paidRes = await getPaidStudents();
        setPaidStudents(paidRes || []);
      }
    } catch (err) {
      setMessage('❌ Lỗi tải dữ liệu');
      console.error(err);
    }
    setLoading(false);
  }

  async function handleCreateInvoice(e) {
    e.preventDefault();
    
    if (!selectedStudent || !formData.course_id || !formData.amount) {
      setMessage('⚠️ Vui lòng chọn học viên, khoá học và nhập số tiền');
      return;
    }

    if (isNaN(formData.amount) || parseFloat(formData.amount) <= 0) {
      setMessage('⚠️ Số tiền phải lớn hơn 0');
      return;
    }

    setSubmitting(true);
    try {
      await createPayment({
        student_id: selectedStudent.id,
        course_id: parseInt(formData.course_id),
        amount: parseFloat(formData.amount),
        method: formData.method,
        note: formData.note,
      });

      setMessage('✅ Tạo hoá đơn thành công! Học viên đã được cập nhật trạng thái PAID');
      setFormData({ course_id: '', amount: '', method: 'cash', note: '' });
      setSelectedStudent(null);
      
      // Refresh danh sách sau 1s
      setTimeout(() => fetchData(), 1000);
    } catch (err) {
      setMessage('❌ Lỗi: ' + (err.response?.data?.message || err.message));
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('currentUser');
    navigate('/login');
  };

  return (
    <div style={{
      width: '100%',
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
      paddingTop: 0,
    }}>
      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: '#fff',
        padding: '30px 20px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
        marginBottom: 30,
      }}>
        <div style={{
          maxWidth: 1200,
          margin: '0 auto',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <div>
            <h1 style={{ margin: 0, fontSize: 32, fontWeight: 'bold' }}>💳 Quản Lý Thu Học Phí</h1>
            <p style={{ margin: '5px 0 0 0', opacity: 0.9 }}>Xin chào, {stored?.username || 'Kế toán'}</p>
          </div>
          <button
            onClick={handleLogout}
            style={{
              padding: '10px 20px',
              borderRadius: 8,
              background: '#ff6b6b',
              color: '#fff',
              border: 'none',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: 14,
            }}
          >
            🚪 Đăng xuất
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div style={{
        maxWidth: 1200,
        margin: '0 auto',
        padding: '0 20px 40px',
      }}>
        {/* Tabs */}
        <div style={{
          display: 'flex',
          gap: 10,
          marginBottom: 20,
          borderBottom: '2px solid #e0e0e0',
        }}>
          <button
            onClick={() => setTab('create')}
            style={{
              padding: '12px 24px',
              background: tab === 'create' ? '#667eea' : '#fff',
              color: tab === 'create' ? '#fff' : '#333',
              border: 'none',
              borderRadius: '8px 8px 0 0',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: 15,
              transition: 'all 0.3s',
            }}
          >
            📝 Tạo Hoá Đơn
          </button>
          <button
            onClick={() => setTab('paid')}
            style={{
              padding: '12px 24px',
              background: tab === 'paid' ? '#667eea' : '#fff',
              color: tab === 'paid' ? '#fff' : '#333',
              border: 'none',
              borderRadius: '8px 8px 0 0',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: 15,
              transition: 'all 0.3s',
            }}
          >
            ✅ Học Viên Đã Thanh Toán
          </button>
        </div>

        {/* Message */}
        {message && (
          <div style={{
            padding: 15,
            borderRadius: 8,
            marginBottom: 20,
            background: message.includes('✅') ? '#d1fae5' : '#fee2e2',
            color: message.includes('✅') ? '#065f46' : '#991b1b',
            fontSize: 14,
            fontWeight: 500,
          }}>
            {message}
          </div>
        )}

        {/* Tab Content */}
        {tab === 'create' ? (
          <div style={{
            background: '#fff',
            borderRadius: 12,
            padding: 30,
            boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
          }}>
            <h2 style={{ marginTop: 0, marginBottom: 20, fontSize: 20 }}>📝 Tạo Hoá Đơn Học Phí</h2>

            {loading ? (
              <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>Đang tải dữ liệu...</div>
            ) : students.length === 0 ? (
              <div style={{
                textAlign: 'center',
                padding: '60px 20px',
                background: '#f9fafb',
                borderRadius: 8,
                color: '#666',
              }}>
                <div style={{ fontSize: 48, marginBottom: 10 }}>✨</div>
                <div style={{ fontSize: 16, fontWeight: 500 }}>Không có học viên mới cần tạo hoá đơn</div>
              </div>
            ) : (
              <div>
                <div style={{ marginBottom: 24 }}>
                  <label style={{ display: 'block', marginBottom: 8, fontWeight: 600, fontSize: 14 }}>
                    Chọn Học Viên (NEW)
                  </label>
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                    gap: 12,
                    maxHeight: '300px',
                    overflowY: 'auto',
                  }}>
                    {students.map(student => (
                      <div
                        key={student.id}
                        onClick={() => setSelectedStudent(student)}
                        style={{
                          padding: 12,
                          border: selectedStudent?.id === student.id ? '2px solid #667eea' : '1px solid #e0e0e0',
                          borderRadius: 8,
                          cursor: 'pointer',
                          background: selectedStudent?.id === student.id ? '#f0f4ff' : '#fff',
                          transition: 'all 0.2s',
                        }}
                      >
                        <div style={{ fontWeight: 600, fontSize: 14 }}>{student.name}</div>
                        <div style={{ fontSize: 12, color: '#666', marginTop: 4 }}>📞 {student.phone}</div>
                        <div style={{ fontSize: 12, color: '#666', marginTop: 2 }}>📧 {student.email}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {selectedStudent && (
                  <form onSubmit={handleCreateInvoice} style={{
                    background: '#f9fafb',
                    padding: 20,
                    borderRadius: 8,
                    marginTop: 20,
                  }}>
                    <div style={{ marginBottom: 16 }}>
                      <label style={{ display: 'block', marginBottom: 6, fontWeight: 600, fontSize: 14 }}>
                        Học Viên Đã Chọn
                      </label>
                      <div style={{
                        padding: 12,
                        background: '#fff',
                        borderRadius: 6,
                        border: '1px solid #e0e0e0',
                        fontSize: 14,
                      }}>
                        <strong>{selectedStudent.name}</strong> - {selectedStudent.phone}
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                      <div>
                        <label style={{ display: 'block', marginBottom: 6, fontWeight: 600, fontSize: 14 }}>
                          Khoá Học <span style={{ color: '#ef4444' }}>*</span>
                        </label>
                        <select
                          value={formData.course_id}
                          onChange={(e) => setFormData({ ...formData, course_id: e.target.value })}
                          style={{
                            width: '100%',
                            padding: '10px 12px',
                            borderRadius: 6,
                            border: '1px solid #d1d5db',
                            fontSize: 14,
                          }}
                        >
                          <option value="">-- Chọn khoá học --</option>
                          {courses.map(c => (
                            <option key={c.id} value={c.id}>
                              {c.name} ({c.level})
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label style={{ display: 'block', marginBottom: 6, fontWeight: 600, fontSize: 14 }}>
                          Số Tiền (VNĐ) <span style={{ color: '#ef4444' }}>*</span>
                        </label>
                        <input
                          type="number"
                          value={formData.amount}
                          onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                          placeholder="Ví dụ: 5000000"
                          style={{
                            width: '100%',
                            padding: '10px 12px',
                            borderRadius: 6,
                            border: '1px solid #d1d5db',
                            fontSize: 14,
                          }}
                        />
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                      <div>
                        <label style={{ display: 'block', marginBottom: 6, fontWeight: 600, fontSize: 14 }}>
                          Phương Thức Thanh Toán
                        </label>
                        <select
                          value={formData.method}
                          onChange={(e) => setFormData({ ...formData, method: e.target.value })}
                          style={{
                            width: '100%',
                            padding: '10px 12px',
                            borderRadius: 6,
                            border: '1px solid #d1d5db',
                            fontSize: 14,
                          }}
                        >
                          <option value="cash">💵 Tiền Mặt</option>
                          <option value="bank">🏦 Chuyển Khoản</option>
                          <option value="card">💳 Thẻ</option>
                        </select>
                      </div>

                      <div>
                        <label style={{ display: 'block', marginBottom: 6, fontWeight: 600, fontSize: 14 }}>
                          Ghi Chú (Tùy Chọn)
                        </label>
                        <input
                          type="text"
                          value={formData.note}
                          onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                          placeholder="Ví dụ: Thanh toán 50% học phí"
                          style={{
                            width: '100%',
                            padding: '10px 12px',
                            borderRadius: 6,
                            border: '1px solid #d1d5db',
                            fontSize: 14,
                          }}
                        />
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: 10 }}>
                      <button
                        type="submit"
                        disabled={submitting}
                        style={{
                          padding: '12px 24px',
                          borderRadius: 8,
                          background: submitting ? '#9ca3af' : '#10b981',
                          color: '#fff',
                          border: 'none',
                          cursor: submitting ? 'not-allowed' : 'pointer',
                          fontWeight: 600,
                          fontSize: 14,
                        }}
                      >
                        {submitting ? '⏳ Đang lưu...' : '💾 Tạo Hoá Đơn'}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedStudent(null);
                          setFormData({ course_id: '', amount: '', method: 'cash', note: '' });
                        }}
                        style={{
                          padding: '12px 24px',
                          borderRadius: 8,
                          background: '#fff',
                          color: '#374151',
                          border: '1px solid #d1d5db',
                          cursor: 'pointer',
                          fontWeight: 600,
                          fontSize: 14,
                        }}
                      >
                        ✖ Hủy
                      </button>
                    </div>
                  </form>
                )}
              </div>
            )}
          </div>
        ) : (
          <div style={{
            background: '#fff',
            borderRadius: 12,
            padding: 30,
            boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
          }}>
            <h2 style={{ marginTop: 0, marginBottom: 20, fontSize: 20 }}>✅ Học Viên Đã Thanh Toán</h2>

            {loading ? (
              <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>Đang tải dữ liệu...</div>
            ) : paidStudents.length === 0 ? (
              <div style={{
                textAlign: 'center',
                padding: '60px 20px',
                background: '#f9fafb',
                borderRadius: 8,
                color: '#666',
              }}>
                <div style={{ fontSize: 48, marginBottom: 10 }}>📭</div>
                <div style={{ fontSize: 16, fontWeight: 500 }}>Chưa có học viên thanh toán</div>
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{
                  width: '100%',
                  borderCollapse: 'collapse',
                }}>
                  <thead>
                    <tr style={{ background: '#f3f4f6', borderBottom: '2px solid #e5e7eb' }}>
                      <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, fontSize: 13 }}>Tên Học Viên</th>
                      <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, fontSize: 13 }}>Điện Thoại</th>
                      <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, fontSize: 13 }}>Email</th>
                      <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, fontSize: 13 }}>Trạng Thái</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paidStudents.map((student) => (
                      <tr key={student.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                        <td style={{ padding: '12px 16px', fontSize: 14, fontWeight: 500 }}>{student.name}</td>
                        <td style={{ padding: '12px 16px', fontSize: 14 }}>{student.phone}</td>
                        <td style={{ padding: '12px 16px', fontSize: 14 }}>{student.email}</td>
                        <td style={{ padding: '12px 16px', fontSize: 14 }}>
                          <span style={{
                            display: 'inline-block',
                            padding: '4px 10px',
                            borderRadius: 6,
                            background: '#d1fae5',
                            color: '#065f46',
                            fontSize: 12,
                            fontWeight: 500,
                          }}>
                            ✓ PAID
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
