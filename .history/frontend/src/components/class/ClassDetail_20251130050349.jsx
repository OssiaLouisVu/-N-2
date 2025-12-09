import React, { useEffect, useState } from 'react';
import { getClass, assignStudentToClass, finishStudentInClass, createSchedulesForClass, getSchedules, updateSchedule, deleteSchedule } from '../../api/classApi';
import { searchStudents } from '../../api/studentApi';

export default function ClassDetail({ classId, refreshToken = 0, onDone = () => {} }) {
  const [cls, setCls] = useState(null);
  const [loading, setLoading] = useState(false);
  const [newStudents, setNewStudents] = useState([]);
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [sessionDates, setSessionDates] = useState(['', '', '', '', '']);
  const [sessionStart, setSessionStart] = useState('09:00');
  const [sessionEnd, setSessionEnd] = useState('11:00');
  const [message, setMessage] = useState('');
  const [studentSchedules, setStudentSchedules] = useState([]);

  async function load() {
    setLoading(true);
    try {
      const res = await getClass(classId);
      // API returns { class, students }
      if (res && res.class) setCls({ ...res.class, students: res.students || [] });
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
      const res = await assignStudentToClass(classId, Number(selectedStudentId), dates.length ? dates : undefined, sessionStart, sessionEnd);
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

  // load schedules for selected student
  useEffect(() => {
    async function loadSchedules() {
      if (!selectedStudentId) { setStudentSchedules([]); return; }
      try {
        const res = await getSchedules({ classId: classId, studentId: selectedStudentId });
        if (res && res.schedules) setStudentSchedules(res.schedules);
      } catch (e) {
        console.error('Load schedules failed', e);
      }
    }
    loadSchedules();
  }, [selectedStudentId, classId]);

  async function handleCreateSchedules() {
    if (!selectedStudentId) return alert('Chọn học viên để tạo lịch');
    const dates = (sessionDates || []).map(d => d && d.trim()).filter(Boolean);
    if (dates.length === 0) return alert('Chọn ít nhất 1 ngày');
    try {
      const res = await createSchedulesForClass(classId, Number(selectedStudentId), dates, sessionStart || null, sessionEnd || null);
      if (!res || !res.success) return setMessage((res && res.message) || 'Tạo lịch thất bại');
      setMessage('Đã tạo lịch cho học viên');
      // reload schedules and notify student dashboard
      const r2 = await getSchedules({ classId, studentId: selectedStudentId });
      if (r2 && r2.schedules) setStudentSchedules(r2.schedules);
      try { window.dispatchEvent(new CustomEvent('studentScheduleUpdated', { detail: { studentId: Number(selectedStudentId) } })); } catch (e) {}
    } catch (e) {
      console.error(e);
      setMessage('Lỗi khi tạo lịch');
    }
  }

  async function handleDeleteSchedule(id) {
    if (!confirm('Xóa lịch này?')) return;
    try {
      const res = await deleteSchedule(id);
      if (!res || !res.success) return setMessage((res && res.message) || 'Xóa thất bại');
      setStudentSchedules(s => s.filter(x => x.id !== id));
      try { window.dispatchEvent(new CustomEvent('studentScheduleUpdated', { detail: { studentId: Number(selectedStudentId) } })); } catch (e) {}
    } catch (e) {
      console.error(e);
      setMessage('Lỗi khi xóa lịch');
    }
  }

  async function handleUpdateSchedule(id, newDate, newTimeStart, newMeta) {
    try {
      const scheduled_at = newDate && newTimeStart ? `${newDate} ${newTimeStart}` : undefined;
      const payload = {};
      if (scheduled_at !== undefined) payload.scheduled_at = scheduled_at;
      if (newMeta !== undefined) payload.meta = newMeta;
      const res = await updateSchedule(id, payload);
      if (!res || !res.success) return setMessage((res && res.message) || 'Cập nhật thất bại');
      // reload schedules
      const r2 = await getSchedules({ classId, studentId: selectedStudentId });
      if (r2 && r2.schedules) setStudentSchedules(r2.schedules);
      try { window.dispatchEvent(new CustomEvent('studentScheduleUpdated', { detail: { studentId: Number(selectedStudentId) } })); } catch (e) {}
    } catch (e) {
      console.error(e);
      setMessage('Lỗi khi cập nhật lịch');
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
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
          <label style={{ fontSize: 13, marginRight: 8 }}>Giờ bắt đầu</label>
          <input type="time" value={sessionStart} onChange={(e) => setSessionStart(e.target.value)} style={{ padding: '6px 8px', borderRadius: 6, border: '1px solid #ddd' }} />
          <label style={{ fontSize: 13, marginLeft: 12, marginRight: 8 }}>Giờ kết thúc</label>
          <input type="time" value={sessionEnd} onChange={(e) => setSessionEnd(e.target.value)} style={{ padding: '6px 8px', borderRadius: 6, border: '1px solid #ddd' }} />
          <div style={{ fontSize: 12, color: '#666' }}>Áp dụng cho tất cả ngày đã nhập</div>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <select value={selectedStudentId} onChange={(e) => setSelectedStudentId(e.target.value)}>
          <option value="">-- Chọn học viên (NEW) --</option>
          {newStudents.map((s) => (
            <option key={s.id} value={s.id}>{s.full_name} — {s.phone}</option>
          ))}
        </select>
        <button onClick={handleAssign} style={{ padding: '6px 12px' }}>Gán vào lớp</button>
        <button onClick={handleCreateSchedules} style={{ padding: '6px 12px', marginLeft: 8 }}>Tạo lịch</button>
        <button onClick={() => { setSelectedStudentId(''); onDone(); }} style={{ marginLeft: 'auto' }}>Đóng</button>
        </div>
      </div>

      {/* Hiển thị danh sách lịch đã tạo cho học viên này */}
      <div style={{ marginTop: 8, marginBottom: 12 }}>
        <h5>Lịch của học viên (cho lớp này)</h5>
        {studentSchedules.length === 0 ? (
          <div style={{ color: '#666' }}>Chưa có lịch</div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr><th style={{ textAlign: 'left', padding: 6 }}>Ngày giờ</th><th style={{ textAlign: 'left', padding: 6 }}>Meta</th><th style={{ padding: 6 }}>Hành động</th></tr>
            </thead>
            <tbody>
              {studentSchedules.map(s => (
                <tr key={s.id}>
                  <td style={{ padding: 6 }}>{s.scheduled_at || '-'} </td>
                  <td style={{ padding: 6 }}>{s.meta || '-'}</td>
                  <td style={{ padding: 6 }}>
                    <button onClick={() => handleDeleteSchedule(s.id)} style={{ padding: '6px 8px' }}>Xóa</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
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
