import React, { useEffect, useState } from 'react';
import { getClass, assignStudentToClass, finishStudentInClass } from '../../api/classApi';
import { searchStudents } from '../../api/studentApi';

export default function ClassDetail({ classId, refreshToken = 0, onDone = () => {} }) {
  const [cls, setCls] = useState(null);
  const [loading, setLoading] = useState(false);
  const [newStudents, setNewStudents] = useState([]);
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [sessionDates, setSessionDates] = useState(['', '', '', '', '']);
  const [message, setMessage] = useState('');

  async function load() {
    setLoading(true);
    try {
      const res = await getClass(classId);
      if (res && res.class) setCls(res.class);
    } catch (err) {
      console.error('Load class failed', err);
    } finally {
      setLoading(false);
    }
  }

  async function loadNewStudents() {
    try {
      const res = await searchStudents({ status: 'NEW', keyword: '' });
      if (res && res.students) setNewStudents(res.students);
    } catch (err) {
      console.error('Load new students failed', err);
    }
  }

  useEffect(() => { load(); loadNewStudents(); }, [classId]);
  // reload NEW students when parent signals refresh (e.g., new student created)
  useEffect(() => { loadNewStudents(); }, [refreshToken, classId]);

  async function handleAssign() {
    if (!selectedStudentId) return alert('Chọn học viên để gán');
    if (!confirm('Gán học viên vào lớp và chuyển sang ACTIVE?')) return;
    try {
      // collect non-empty dates
      const dates = (sessionDates || []).map(d => d && d.trim()).filter(Boolean);
      const res = await assignStudentToClass(classId, Number(selectedStudentId), dates.length ? dates : undefined);
      if (!res || !res.success) {
        setMessage((res && res.message) || 'Gán thất bại');
        return;
      }
      setMessage('Gán học viên thành công');
      // refresh class and list of NEW students
      await load();
      await loadNewStudents();
      // notify other parts of the app (e.g., student dashboard) to refresh schedule
      try {
        window.dispatchEvent(new CustomEvent('studentScheduleUpdated', { detail: { studentId: Number(selectedStudentId) } }));
      } catch (e) {
        // ignore if environment doesn't support CustomEvent
      }
    } catch (err) {
      console.error(err);
      setMessage('Lỗi khi gán học viên');
    }
  }

  async function handleFinish(studentId) {
    if (!confirm('Đánh dấu học viên kết thúc khoá (COMPLETED)?')) return;
    try {
      const res = await finishStudentInClass(classId, studentId);
      if (!res || !res.success) {
        setMessage((res && res.message) || 'Hoàn thành thất bại');
        return;
      }
      setMessage('Đã đánh dấu COMPLETED');
      await load();
      try {
        window.dispatchEvent(new CustomEvent('studentScheduleUpdated', { detail: { studentId } }));
      } catch (e) {}
    } catch (err) {
      console.error(err);
      setMessage('Lỗi khi đánh dấu hoàn thành');
    }
  }

  if (loading) return <div>Đang tải chi tiết lớp...</div>;
  if (!cls) return <div>Không tìm thấy lớp.</div>;

  return (
    <div style={{ border: '1px solid #eee', padding: 12, borderRadius: 12, background: '#fafafa' }}>
      <h3>{cls.name} (ID: {cls.id})</h3>
      <div style={{ marginBottom: 8 }}><strong>GV:</strong> {cls.teacher_id || '-' } &nbsp; <strong>Sức chứa:</strong> {cls.capacity}</div>

      {message && <div style={{ marginBottom: 8, color: '#165', background: '#e6fffa', padding: 8, borderRadius: 8 }}>{message}</div>}

      <div style={{ marginBottom: 12 }}>
        <div style={{ marginBottom: 8, fontSize: 13, color: '#444' }}>Nhập tối đa 5 ngày lịch học (tùy chọn). Nếu để trống, hệ thống sẽ dùng lịch của lớp (nếu có) hoặc không tạo buổi.</div>
        <div style={{ display: 'flex', gap: 8, marginBottom: 10, flexWrap: 'wrap' }}>
          {sessionDates.map((d, idx) => (
            <input
              key={idx}
              type="date"
              value={d}
              onChange={(e) => {
                const copy = [...sessionDates];
                copy[idx] = e.target.value;
                setSessionDates(copy);
              }}
              style={{ padding: '6px 8px', borderRadius: 6, border: '1px solid #ddd' }}
            />
          ))}
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <select value={selectedStudentId} onChange={(e) => setSelectedStudentId(e.target.value)}>
          <option value="">-- Chọn học viên (NEW) --</option>
          {newStudents.map((s) => (
            <option key={s.id} value={s.id}>{s.full_name} — {s.phone}</option>
          ))}
        </select>
        <button onClick={handleAssign} style={{ padding: '6px 12px' }}>Gán vào lớp</button>
        <button onClick={() => { setSelectedStudentId(''); onDone(); }} style={{ marginLeft: 'auto' }}>Đóng</button>
        </div>
      </div>

      <h4>Học viên trong lớp</h4>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ background: '#fff' }}>
            <th style={{ textAlign: 'left', padding: 6 }}>ID</th>
            <th style={{ textAlign: 'left', padding: 6 }}>Tên</th>
            <th style={{ textAlign: 'left', padding: 6 }}>SĐT</th>
            <th style={{ textAlign: 'left', padding: 6 }}>Trạng thái</th>
            <th style={{ textAlign: 'left', padding: 6 }}>Hành động</th>
          </tr>
        </thead>
        <tbody>
          {(cls.students || []).map((s) => (
            <tr key={s.id}>
              <td style={{ padding: 6 }}>{s.id}</td>
              <td style={{ padding: 6 }}>{s.full_name}</td>
              <td style={{ padding: 6 }}>{s.phone}</td>
              <td style={{ padding: 6 }}>{s.status}</td>
              <td style={{ padding: 6 }}>
                {s.status !== 'COMPLETED' && (
                  <button onClick={() => handleFinish(s.id)} style={{ padding: '6px 10px' }}>Kết thúc khoá</button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
