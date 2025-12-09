import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const API_BASE = 'http://localhost:8080/api';

export default function StudentNotification() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('currentUser'));

  if (!user) {
    navigate('/login');
    return null;
  }

  const [filterStatus, setFilterStatus] = useState('all'); // all, paid, pending
  const [students, setStudents] = useState([]);
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState('');
  const [emailTemplate, setEmailTemplate] = useState('default');
  const [customSubject, setCustomSubject] = useState('');
  const [customBody, setCustomBody] = useState('');

  // Load students on mount and when filter changes
  useEffect(() => {
    loadStudents();
  }, [filterStatus]);

  const loadStudents = async () => {
    setLoading(true);
    setMessage('');
    try {
      const res = await fetch(`${API_BASE}/students`);
      const data = await res.json();
      if (data.success && data.students) {
        // Filter by payment status
        let filtered = data.students;
        if (filterStatus === 'paid') {
          filtered = filtered.filter(s => s.payment_status === 'PAID');
        } else if (filterStatus === 'pending') {
          filtered = filtered.filter(s => s.payment_status === 'PENDING' || s.payment_status === 'NEW');
        }
        setStudents(filtered);
        setSelectedStudents([]); // Reset selection
      }
    } catch (e) {
      setMessage('❌ Lỗi tải học viên: ' + e.message);
    }
    setLoading(false);
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedStudents(students.map(s => s.id));
    } else {
      setSelectedStudents([]);
    }
  };

  const handleSelectStudent = (studentId) => {
    if (selectedStudents.includes(studentId)) {
      setSelectedStudents(selectedStudents.filter(id => id !== studentId));
    } else {
      setSelectedStudents([...selectedStudents, studentId]);
    }
  };

  const getEmailContent = () => {
    if (emailTemplate === 'custom') {
      return { subject: customSubject, body: customBody };
    }

    const templates = {
      default: {
        subject: '📚 Thông báo về hoá đơn học phí',
        body: `Xin chào,\n\nCảm ơn bạn đã tin tưởng trung tâm tiếng Anh của chúng tôi.\n\nĐây là thông báo về trạng thái hoá đơn học phí của bạn.\n\nVui lòng truy cập hệ thống để xem chi tiết hoá đơn và thanh toán.\n\nNếu có bất kỳ câu hỏi nào, vui lòng liên hệ với chúng tôi.\n\nTrân trọng,\nTrung tâm Tiếng Anh`
      },
      paid: {
        subject: '✅ Cảm ơn bạn đã thanh toán học phí',
        body: `Xin chào,\n\nCảm ơn bạn đã nộp học phí!\n\nChúng tôi đã nhận được thanh toán của bạn. Bạn có thể bắt đầu học tập ngay lập tức.\n\nNếu bạn có bất kỳ câu hỏi nào, vui lòng liên hệ với chúng tôi.\n\nChúc bạn học tập tốt!\n\nTrân trọng,\nTrung tâm Tiếng Anh`
      },
      pending: {
        subject: '⏳ Nhắc nhở: Vui lòng thanh toán học phí',
        body: `Xin chào,\n\nChúng tôi nhận thấy rằng bạn chưa thanh toán học phí.\n\nVui lòng hoàn tất thanh toán sớm để bảo đảm chỗ học tập của bạn.\n\nThông tin thanh toán:\n- Tên ngân hàng: MB Bank\n- Số tài khoản: 038204019305\n\nVui lòng liên hệ với chúng tôi nếu có bất kỳ vấn đề nào.\n\nTrân trọng,\nTrung tâm Tiếng Anh`
      }
    };

    return templates[emailTemplate] || templates.default;
  };

  const handleSendEmails = async () => {
    if (selectedStudents.length === 0) {
      setMessage('⚠️ Vui lòng chọn ít nhất 1 học viên');
      return;
    }

    if (emailTemplate === 'custom' && (!customSubject.trim() || !customBody.trim())) {
      setMessage('⚠️ Vui lòng nhập chủ đề và nội dung email');
      return;
    }

    setSending(true);
    setMessage('');

    try {
      const selectedStudentList = students.filter(s => selectedStudents.includes(s.id));
      const content = getEmailContent();

      const res = await fetch(`${API_BASE}/notify/send-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          students: selectedStudentList,
          subject: content.subject,
          body: content.body
        })
      });

      const data = await res.json();
      if (data.success) {
        setMessage(`✅ Gửi email thành công cho ${data.sent || selectedStudents.length} học viên`);
        setSelectedStudents([]);
      } else {
        setMessage('❌ ' + (data.message || 'Lỗi khi gửi email'));
      }
    } catch (e) {
      setMessage('❌ Lỗi: ' + e.message);
    }

    setSending(false);
  };

  const content = getEmailContent();

  return (
    <div style={{ minHeight: '100vh', background: '#f5f7fa', paddingBottom: 40 }}>
      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg, #667eea, #764ba2)', color: '#fff', padding: '20px', marginBottom: 30 }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h1>📧 Gửi Thông Báo Cho Học Viên</h1>
          <button 
            onClick={() => navigate(-1)} 
            style={{ padding: '8px 16px', background: '#fff', color: '#667eea', border: 'none', cursor: 'pointer', borderRadius: 6, fontWeight: 600 }}
          >
            ← Quay lại
          </button>
        </div>
      </div>

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 20px' }}>
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

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 30 }}>
          {/* Left: Student Selection */}
          <div style={{ background: '#fff', padding: 20, borderRadius: 12, boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
            <h3 style={{ marginTop: 0, marginBottom: 15 }}>👥 Chọn Học Viên</h3>

            {/* Filter */}
            <div style={{ marginBottom: 15 }}>
              <label style={{ display: 'block', fontWeight: 600, marginBottom: 8, fontSize: 13 }}>Lọc Theo Trạng Thái Thanh Toán</label>
              <select 
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                style={{ width: '100%', padding: '10px', borderRadius: 6, border: '1px solid #d1d5db', fontSize: 13 }}
              >
                <option value="all">Tất Cả Học Viên</option>
                <option value="paid">✅ Đã Nộp Học Phí</option>
                <option value="pending">⏳ Chưa Nộp Học Phí</option>
              </select>
            </div>

            {/* Select All Checkbox */}
            <div style={{ marginBottom: 10, paddingBottom: 10, borderBottom: '1px solid #e5e7eb' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                <input 
                  type="checkbox"
                  checked={selectedStudents.length === students.length && students.length > 0}
                  onChange={handleSelectAll}
                  style={{ width: 18, height: 18, cursor: 'pointer' }}
                />
                <span style={{ fontWeight: 600 }}>Chọn Tất Cả ({students.length})</span>
              </label>
            </div>

            {/* Students List */}
            <div style={{ maxHeight: 400, overflowY: 'auto' }}>
              {loading ? (
                <div style={{ textAlign: 'center', color: '#6b7280', padding: '20px' }}>Đang tải...</div>
              ) : students.length === 0 ? (
                <div style={{ textAlign: 'center', color: '#6b7280', padding: '20px' }}>Không có học viên nào</div>
              ) : (
                students.map(student => (
                  <label 
                    key={student.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      padding: 10,
                      marginBottom: 8,
                      border: '1px solid #e5e7eb',
                      borderRadius: 6,
                      cursor: 'pointer',
                      background: selectedStudents.includes(student.id) ? '#eef2ff' : '#fff'
                    }}
                  >
                    <input 
                      type="checkbox"
                      checked={selectedStudents.includes(student.id)}
                      onChange={() => handleSelectStudent(student.id)}
                      style={{ width: 18, height: 18, cursor: 'pointer' }}
                    />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, color: '#1f2937' }}>{student.full_name}</div>
                      <div style={{ fontSize: 12, color: '#6b7280' }}>{student.phone} {student.email ? `• ${student.email}` : ''}</div>
                    </div>
                    <div style={{ fontSize: 11, color: '#667eea', fontWeight: 600 }}>
                      {student.payment_status === 'PAID' ? '✅ Đã Nộp' : '⏳ Chưa Nộp'}
                    </div>
                  </label>
                ))
              )}
            </div>

            {/* Send Button */}
            <button 
              onClick={handleSendEmails}
              disabled={sending || selectedStudents.length === 0}
              style={{
                width: '100%',
                marginTop: 15,
                padding: '12px',
                background: sending || selectedStudents.length === 0 ? '#d1d5db' : '#10b981',
                color: '#fff',
                border: 'none',
                borderRadius: 6,
                fontWeight: 600,
                cursor: sending || selectedStudents.length === 0 ? 'not-allowed' : 'pointer'
              }}
            >
              {sending ? '⏳ Đang gửi...' : `📧 Gửi Email (${selectedStudents.length})`}
            </button>
          </div>

          {/* Right: Email Template */}
          <div style={{ background: '#fff', padding: 20, borderRadius: 12, boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
            <h3 style={{ marginTop: 0, marginBottom: 15 }}>📝 Mẫu Email</h3>

            {/* Template Selection */}
            <div style={{ marginBottom: 15 }}>
              <label style={{ display: 'block', fontWeight: 600, marginBottom: 8, fontSize: 13 }}>Chọn Mẫu</label>
              <select 
                value={emailTemplate}
                onChange={(e) => setEmailTemplate(e.target.value)}
                style={{ width: '100%', padding: '10px', borderRadius: 6, border: '1px solid #d1d5db', fontSize: 13 }}
              >
                <option value="default">📌 Thông Báo Chung</option>
                <option value="paid">✅ Cảm Ơn Đã Thanh Toán</option>
                <option value="pending">⏳ Nhắc Nhở Thanh Toán</option>
                <option value="custom">✏️ Tuỳ Chỉnh</option>
              </select>
            </div>

            {/* Preview */}
            <div style={{ marginBottom: 15 }}>
              <label style={{ display: 'block', fontWeight: 600, marginBottom: 8, fontSize: 13 }}>Chủ Đề</label>
              {emailTemplate === 'custom' ? (
                <input 
                  type="text"
                  value={customSubject}
                  onChange={(e) => setCustomSubject(e.target.value)}
                  placeholder="Nhập chủ đề email..."
                  style={{ width: '100%', padding: '10px', borderRadius: 6, border: '1px solid #d1d5db', fontSize: 13 }}
                />
              ) : (
                <div style={{ padding: '10px', background: '#f3f4f6', borderRadius: 6, fontSize: 13, color: '#1f2937' }}>
                  {content.subject}
                </div>
              )}
            </div>

            {/* Body */}
            <div>
              <label style={{ display: 'block', fontWeight: 600, marginBottom: 8, fontSize: 13 }}>Nội Dung</label>
              {emailTemplate === 'custom' ? (
                <textarea 
                  value={customBody}
                  onChange={(e) => setCustomBody(e.target.value)}
                  placeholder="Nhập nội dung email..."
                  style={{ 
                    width: '100%', 
                    height: 250, 
                    padding: '10px', 
                    borderRadius: 6, 
                    border: '1px solid #d1d5db', 
                    fontSize: 12,
                    fontFamily: 'monospace'
                  }}
                />
              ) : (
                <div style={{ 
                  padding: '10px', 
                  background: '#f3f4f6', 
                  borderRadius: 6, 
                  fontSize: 12, 
                  color: '#1f2937',
                  height: 250,
                  overflowY: 'auto',
                  whiteSpace: 'pre-wrap',
                  fontFamily: 'monospace'
                }}>
                  {content.body}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
