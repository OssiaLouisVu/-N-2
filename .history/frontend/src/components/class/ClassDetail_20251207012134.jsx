import React, { useEffect, useState } from 'react';
import { getClass, assignStudentToClass, finishStudentInClass, createClassSchedules } from '../../api/classApi';
import { searchStudents } from '../../api/studentApi';
import LessonsPanel from './LessonsPanel';
import SubLessonsPanel from './SubLessonsPanel';
import MaterialsPanel from './MaterialsPanel';

export default function ClassDetail({ classId, refreshToken = 0, onDone = () => {} }) {
  const [cls, setCls] = useState(null);
  const [loading, setLoading] = useState(false);
  const [newStudents, setNewStudents] = useState([]);
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [sessionDates, setSessionDates] = useState(['', '', '', '', '']);
  const [sessionStart, setSessionStart] = useState('09:00');
  const [sessionEnd, setSessionEnd] = useState('11:00');
  const [room, setRoom] = useState('');
  const [message, setMessage] = useState('');
  const [tab, setTab] = useState('info'); // info | lessons | sublessons | materials

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
      // Load only PAID students who can be assigned to class
      // Changed from status: 'NEW' to status: 'NEW', payment_status: 'PAID'
      const res = await searchStudents({ status: 'NEW', keyword: '' });
      if (res && res.students) {
        // Filter to only include PAID students
        const paidStudents = res.students.filter(s => s.payment_status === 'PAID');
        setNewStudents(paidStudents);
        if (paidStudents.length === 0 && res.students.length > 0) {
          setMessage('⚠️ Tất cả học viên NEW đều chưa thanh toán. Vui lòng thanh toán trước khi gán vào lớp.');
        }
      }
    } catch (err) {
      console.error('Load new students failed', err);
    }
  }

  useEffect(() => { load(); loadNewStudents(); }, [classId]);
  // reload NEW students when parent signals refresh (e.g., new student created)
  useEffect(() => { loadNewStudents(); }, [refreshToken, classId]);

  async function handleAssign() {
    if (!selectedStudentId) return alert('Chọn học viên để gán');
    
    // Double check: verify selected student is PAID
    const selectedStudent = newStudents.find(s => s.id === Number(selectedStudentId));
    if (!selectedStudent || selectedStudent.payment_status !== 'PAID') {
      return alert('❌ Chỉ có thể gán học viên đã THANH TOÁN. Vui lòng thanh toán học phí trước tiên!');
    }
    
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

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
        <button onClick={()=>setTab('info')} style={{ padding:'6px 10px', borderRadius:8, border:'1px solid #ddd', background: tab==='info' ? '#eef2ff' : '#fff' }}>Thông tin</button>
        <button onClick={()=>setTab('lessons')} style={{ padding:'6px 10px', borderRadius:8, border:'1px solid #ddd', background: tab==='lessons' ? '#ecfeff' : '#fff' }}>Bài học</button>
        <button onClick={()=>setTab('sublessons')} style={{ padding:'6px 10px', borderRadius:8, border:'1px solid #ddd', background: tab==='sublessons' ? '#fef3c7' : '#fff' }}>Bài học nhỏ</button>
        <button onClick={()=>setTab('materials')} style={{ padding:'6px 10px', borderRadius:8, border:'1px solid #ddd', background: tab==='materials' ? '#eafff1' : '#fff' }}>Tài liệu học tập</button>
      </div>

      {message && <div style={{ marginBottom: 8, color: '#165', background: '#e6fffa', padding: 8, borderRadius: 8 }}>{message}</div>}

      {tab === 'info' && (
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
          <label style={{ fontSize: 13, marginLeft: 12, marginRight: 8 }}>Phòng</label>
          <input type="text" value={room} onChange={(e) => setRoom(e.target.value)} placeholder="VD: P101" style={{ padding: '6px 8px', borderRadius: 6, border: '1px solid #ddd', minWidth: 120 }} />
          <div style={{ fontSize: 12, color: '#666' }}>Áp dụng cho tất cả ngày đã nhập</div>
        </div>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <select value={selectedStudentId} onChange={(e) => setSelectedStudentId(e.target.value)}>
              <option value="">-- Chọn học viên (NEW) --</option>
              {newStudents.length === 0 && <option disabled>Không có học viên đã thanh toán</option>}
              {newStudents.map((s) => (
                <option key={s.id} value={s.id}>{s.full_name} — {s.phone}</option>
              ))}
            </select>
            <button onClick={handleAssign} style={{ padding: '6px 12px' }}>Gán vào lớp</button>
          </div>
          <div style={{ fontSize: 12, color: '#d97706', fontWeight: 500 }}>
            ⚠️ Chỉ học viên đã THANH TOÁN mới có thể gán vào lớp
          </div>

          <div style={{ marginLeft: 'auto', display: 'flex', gap: 12 }}>
            <button onClick={async () => {
              // create class-level schedules for entered dates/time
              const dates = (sessionDates || []).map(d => d && d.trim()).filter(Boolean);
              if (dates.length === 0) return alert('Nhập ít nhất 1 ngày để tạo lịch lớp');
              if (!confirm('Tạo lịch cho lớp và sao chép vào học viên hiện có (nếu có)?')) return;
              try {
                const res = await createClassSchedules(classId, dates, sessionStart, sessionEnd, room);
                if (!res || !res.success) {
                  setMessage((res && res.message) || 'Tạo lịch lớp thất bại');
                  return;
                }
                setMessage('Tạo lịch lớp thành công');
                // notify student dashboard to refresh (class-level created)
                try { window.dispatchEvent(new CustomEvent('studentScheduleUpdated', { detail: { classId } })); } catch (e) {}
                await load();
              } catch (err) {
                console.error(err);
                setMessage('Lỗi khi tạo lịch lớp');
              }
            }} style={{ padding: '6px 12px' }}>Tạo lịch lớp</button>
            <button onClick={() => { setSelectedStudentId(''); onDone(); }} style={{}}>Đóng</button>
          </div>
        </div>
      </div>
      )}

      {tab === 'lessons' && (
        <LessonsPanel classId={classId} />
      )}

      {tab === 'sublessons' && (
        <SubLessonsPanel classId={classId} />
      )}

      {tab === 'materials' && (
        <MaterialsPanel classId={classId} />
      )}

      {tab === 'info' && <>
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
      </>}
    </div>
  );
}
