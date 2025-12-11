import React, { useEffect, useState } from 'react';
import {
  getClass,
  assignStudentToClass,
  assignInstructorToClass,
  finishStudentInClass,
  createClassSchedules,
} from '../../api/classApi';
import { searchStudents } from '../../api/studentApi';
import { searchInstructors } from '../../api/instructorApi';

import LessonsPanel from './LessonsPanel';
import SubLessonsPanel from './SubLessonsPanel';
import MaterialsPanel from './MaterialsPanel';

export default function ClassDetail({ classId, refreshToken = 0, onDone = () => {} }) {
  const [cls, setCls] = useState(null);
  const [loading, setLoading] = useState(false);
  const [newStudents, setNewStudents] = useState([]);
  const [newInstructors, setNewInstructors] = useState([]);
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [selectedInstructorId, setSelectedInstructorId] = useState('');
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
      // Backend nên trả: { success, class, students, schedules, instructor? }
      if (res && res.class) {
        setCls({
          ...res.class,
          students: res.students || [],
          schedules: res.schedules || [],
          // nhận thêm thông tin giảng viên nếu backend trả ra
          instructor: res.instructor || res.class.instructor || null,
        });
      }
    } catch (err) {
      console.error('Load class failed', err);
    } finally {
      setLoading(false);
    }
  }

  async function loadNewStudents() {
    try {
      const resNew = await searchStudents({ status: 'NEW', keyword: '' });
      const resActive = await searchStudents({ status: 'ACTIVE', keyword: '' });

      let allStudents = [];
      if (resNew && resNew.students) allStudents.push(...resNew.students);
      if (resActive && resActive.students) allStudents.push(...resActive.students);

      const paidStudents = [];
      const seenIds = new Set();
      for (const s of allStudents) {
        if (s.payment_status === 'PAID' 
    && s.status !== 'ACTIVE'      // ❌ bỏ HV đang học lớp khác
    && !seenIds.has(s.id)) {

          paidStudents.push(s);
          seenIds.add(s.id);
        }
      }

      setNewStudents(paidStudents);
      if (paidStudents.length === 0 && allStudents.length > 0) {
        setMessage('⚠️ Tất cả học viên đều chưa thanh toán. Vui lòng thanh toán trước khi gán vào lớp.');
      }
    } catch (err) {
      console.error('Load new students failed', err);
    }
  }

  async function loadNewInstructors() {
  try {
    // Lấy cả giảng viên NEW + ACTIVE
    const resNew = await searchInstructors({ status: "NEW", keyword: "" });
    const resActive = await searchInstructors({ status: "ACTIVE", keyword: "" });

    let all = [];

    if (resNew?.instructors) all.push(...resNew.instructors);
    if (resActive?.instructors) all.push(...resActive.instructors);

    // Lọc trùng (nếu có)
    const seen = new Set();
    const merged = [];

    for (const ins of all) {
      if (!seen.has(ins.id)) {
        merged.push(ins);
        seen.add(ins.id);
      }
    }

    setNewInstructors(merged);
  } catch (err) {
    console.error("Load instructors failed", err);
  }
}


  useEffect(() => {
    load();
    loadNewStudents();
    loadNewInstructors();
  }, [classId]);

  useEffect(() => {
    loadNewStudents();
    loadNewInstructors();
  }, [refreshToken, classId]);

  async function handleAssign() {
    if (!selectedStudentId) return alert('Chọn học viên để gán');

    const selectedStudent = newStudents.find((s) => s.id === Number(selectedStudentId));
    if (!selectedStudent || selectedStudent.payment_status !== 'PAID') {
      return alert('❌ Chỉ có thể gán học viên đã THANH TOÁN. Vui lòng thanh toán học phí trước tiên!');
    }

    if (!confirm('Gán học viên vào lớp và chuyển sang ACTIVE?')) return;
    try {
      const dates = (sessionDates || []).map((d) => d && d.trim()).filter(Boolean);
      const res = await assignStudentToClass(
        classId,
        Number(selectedStudentId),
        dates.length ? dates : undefined,
        sessionStart,
        sessionEnd
      );
      if (!res || !res.success) {
        setMessage((res && res.message) || 'Gán thất bại');
        return;
      }
      setMessage('Gán học viên thành công');
      await load();
      await loadNewStudents();
      try {
        window.dispatchEvent(
          new CustomEvent('studentScheduleUpdated', { detail: { studentId: Number(selectedStudentId) } })
        );
      } catch (e) {}
    } catch (err) {
      console.error(err);
      setMessage('Lỗi khi gán học viên');
    }
  }

  async function handleAssignInstructor() {
    if (!selectedInstructorId) return alert('Chọn giảng viên để gán');

    if (!confirm('Gán giảng viên vào lớp? Hệ thống sẽ kiểm tra trùng lịch và chuyển trạng thái sang ACTIVE.')) return;

    try {
      // gọi đúng hàm API với role 'MAIN'
      const res = await assignInstructorToClass(classId, Number(selectedInstructorId), 'MAIN');
      if (!res || !res.success) {
        setMessage((res && res.message) || 'Gán giảng viên thất bại');
        return;
      }
      setMessage(res.message || 'Gán giảng viên thành công');
      setSelectedInstructorId('');
      await load();
      await loadNewInstructors();
    } catch (err) {
      console.error(err);
      setMessage('Lỗi khi gán giảng viên');
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
      <h3>
        {cls.name} (ID: {cls.id})
      </h3>

      <div style={{ marginBottom: 8 }}>
        <strong>Giảng viên chính:</strong>{' '}
        {cls.instructor ? (
          `${cls.instructor.full_name} (${cls.instructor.phone || cls.instructor.email || ''})`
        ) : (
          <span style={{ color: '#999' }}>Chưa gán</span>
        )}
        <br />
        <strong>Sức chứa:</strong> {cls.capacity}
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
        <button
          onClick={() => setTab('info')}
          style={{
            padding: '6px 10px',
            borderRadius: 8,
            border: '1px solid #ddd',
            background: tab === 'info' ? '#eef2ff' : '#fff',
          }}
        >
          Thông tin
        </button>
        <button
          onClick={() => setTab('lessons')}
          style={{
            padding: '6px 10px',
            borderRadius: 8,
            border: '1px solid #ddd',
            background: tab === 'lessons' ? '#ecfeff' : '#fff',
          }}
        >
          Bài học
        </button>
        <button
          onClick={() => setTab('sublessons')}
          style={{
            padding: '6px 10px',
            borderRadius: 8,
            border: '1px solid #ddd',
            background: tab === 'sublessons' ? '#fef3c7' : '#fff',
          }}
        >
          Bài học nhỏ
        </button>
        <button
          onClick={() => setTab('materials')}
          style={{
  padding: '6px 10px',
  borderRadius: 8,
  border: '1px solid #ddd',    // ✅ đúng: chỉ một cặp nháy
  background: tab === 'materials' ? '#eafff1' : '#fff',
}}

        >
          Tài liệu học tập
        </button>
      </div>

      {message && (
        <div
          style={{
            marginBottom: 8,
            color: '#165',
            background: '#e6fffa',
            padding: 8,
            borderRadius: 8,
          }}
        >
          {message}
        </div>
      )}

      {tab === 'info' && (
        <>
          {/* Form tạo lịch lớp + gán HV/GV */}
          <div style={{ marginBottom: 12 }}>
            <div style={{ marginBottom: 8, fontSize: 13, color: '#444' }}>
              Nhập tối đa 5 ngày lịch học (tùy chọn). Nếu để trống, hệ thống sẽ dùng lịch của lớp (nếu có) hoặc không
              tạo buổi.
            </div>
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
              <input
                type="time"
                value={sessionStart}
                onChange={(e) => setSessionStart(e.target.value)}
                style={{ padding: '6px 8px', borderRadius: 6, border: '1px solid #ddd' }}
              />
              <label style={{ fontSize: 13, marginLeft: 12, marginRight: 8 }}>Giờ kết thúc</label>
              <input
                type="time"
                value={sessionEnd}
                onChange={(e) => setSessionEnd(e.target.value)}
                style={{ padding: '6px 8px', borderRadius: 6, border: '1px solid #ddd' }}
              />
              <label style={{ fontSize: 13, marginLeft: 12, marginRight: 8 }}>Phòng</label>
              <input
                type="text"
                value={room}
                onChange={(e) => setRoom(e.target.value)}
                placeholder="VD: P101"
                style={{ padding: '6px 8px', borderRadius: 6, border: '1px solid #ddd', minWidth: 120 }}
              />
              <div style={{ fontSize: 12, color: '#666' }}>Áp dụng cho tất cả ngày đã nhập</div>
            </div>

            <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 12 }}>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <select value={selectedStudentId} onChange={(e) => setSelectedStudentId(e.target.value)}>
                  <option value="">-- Chọn học viên (NEW) --</option>
                  {newStudents.length === 0 && <option disabled>Không có học viên đã thanh toán</option>}
                  {newStudents.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.full_name} — {s.phone}
                    </option>
                  ))}
                </select>
                <button onClick={handleAssign} style={{ padding: '6px 12px' }}>
                  Gán vào lớp
                </button>
              </div>
              <div style={{ fontSize: 12, color: '#d97706', fontWeight: 500 }}>
                ⚠️ Chỉ học viên đã THANH TOÁN mới có thể gán vào lớp
              </div>
            </div>

            {/* GÁN GIẢNG VIÊN */}
            <div
              style={{
                display: 'flex',
                gap: 12,
                alignItems: 'center',
                marginBottom: 12,
                padding: 12,
                background: '#fef3c7',
                borderRadius: 8,
              }}
            >
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <label style={{ fontSize: 13, fontWeight: 600, color: '#92400e' }}>👨‍🏫 Gán giảng viên:</label>
                <select
                  value={selectedInstructorId}
                  onChange={(e) => setSelectedInstructorId(e.target.value)}
                  style={{ padding: '6px 10px', borderRadius: 6, border: '1px solid #d97706' }}
                >
                  <option value="">-- Chọn giảng viên mới --</option>
                  {newInstructors.length === 0 && <option disabled>Không có giảng viên NEW</option>}
                  {newInstructors.map((ins) => (
                    <option key={ins.id} value={ins.id}>
                      {ins.full_name} — {ins.phone || ins.email}
                    </option>
                  ))}
                </select>
                <button
                  onClick={handleAssignInstructor}
                  style={{
                    padding: '6px 16px',
                    background: '#f59e0b',
                    color: '#fff',
                    border: 'none',
                    borderRadius: 6,
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Gán giảng viên
                </button>
              </div>
              <div style={{ fontSize: 12, color: '#92400e', fontWeight: 500 }}>
                ✅ Tự động kiểm tra trùng lịch và chuyển trạng thái NEW → ACTIVE
              </div>
            </div>

            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
              <div style={{ marginLeft: 'auto', display: 'flex', gap: 12 }}>
                <button
                  onClick={async () => {
                    const dates = (sessionDates || []).map((d) => d && d.trim()).filter(Boolean);
                    if (dates.length === 0) return alert('Nhập ít nhất 1 ngày để tạo lịch lớp');
                    if (!confirm('Tạo lịch cho lớp và sao chép vào học viên hiện có (nếu có)?')) return;
                    try {
                      const res = await createClassSchedules(classId, dates, sessionStart, sessionEnd, room);
                      if (!res || !res.success) {
                        setMessage((res && res.message) || 'Tạo lịch lớp thất bại');
                        return;
                      }
                      setMessage('Tạo lịch lớp thành công');
                      try {
                        window.dispatchEvent(new CustomEvent('studentScheduleUpdated', { detail: { classId } }));
                      } catch (e) {}
                      await load();
                    } catch (err) {
                      console.error(err);
                      setMessage('Lỗi khi tạo lịch lớp');
                    }
                  }}
                  style={{ padding: '6px 12px' }}
                >
                  Tạo lịch lớp
                </button>
                <button
                  onClick={() => {
                    setSelectedStudentId('');
                    onDone();
                  }}
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>

          {/* HIỂN THỊ LỊCH LỚP: ngày, giờ, phòng */}
          {cls.schedules && cls.schedules.length > 0 && (
            <div style={{ marginBottom: 16 }}>
              <h4>Lịch học của lớp</h4>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#fff' }}>
                    <th style={{ textAlign: 'left', padding: 6 }}>#</th>
                    <th style={{ textAlign: 'left', padding: 6 }}>Ngày</th>
                    <th style={{ textAlign: 'left', padding: 6 }}>Giờ</th>
                    <th style={{ textAlign: 'left', padding: 6 }}>Phòng</th>
                  </tr>
                </thead>
                <tbody>
                  {cls.schedules.map((s, idx) => {
                    let meta = {};
                    try {
                      meta = s.meta
                        ? typeof s.meta === 'string'
                          ? JSON.parse(s.meta)
                          : s.meta
                        : {};
                    } catch (e) {}

                    const date =
                      meta.providedSessionDate || (s.scheduled_at ? s.scheduled_at.slice(0, 10) : '');
                    const start = meta.start || (s.scheduled_at ? s.scheduled_at.slice(11, 16) : '');
                    const end = meta.end || '';
                    const roomValue = meta.room || '';

                    return (
                      <tr key={s.id || idx}>
                        <td style={{ padding: 6 }}>{idx + 1}</td>
                        <td style={{ padding: 6 }}>{date}</td>
                        <td style={{ padding: 6 }}>
                          {start}
                          {end && ` - ${end}`}
                        </td>
                        <td style={{ padding: 6 }}>{roomValue}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Học viên trong lớp */}
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
                      <button onClick={() => handleFinish(s.id)} style={{ padding: '6px 10px' }}>
                        Kết thúc khoá
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}

      {tab === 'lessons' && <LessonsPanel classId={classId} />}
      {tab === 'sublessons' && <SubLessonsPanel classId={classId} />}
      {tab === 'materials' && <MaterialsPanel classId={classId} />}
    </div>
  );
}
