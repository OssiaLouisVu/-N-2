import React, { useState, useEffect } from 'react';
import { getCourses } from '../../api/courseApi';

export default function ClassForm({ onSubmit, onCancel, initialData = null }) {
  const [courses, setCourses] = useState([]);
  const [courseId, setCourseId] = useState('');
  const [name, setName] = useState('');
  const [teacherId, setTeacherId] = useState('');
  const [capacity, setCapacity] = useState(20);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    // Load active courses for dropdown
    getCourses({ status: 'ACTIVE' }).then(res => {
      if (res && res.courses) setCourses(res.courses);
    });
    if (initialData) {
      setName(initialData.name || '');
      setTeacherId(initialData.teacher_id || '');
      setCapacity(initialData.capacity || 20);
      setStartDate(initialData.start_date || '');
      setEndDate(initialData.end_date || '');
      setCourseId(initialData.course_id || '');
    }
  }, [initialData]);

  function handleSubmit(e) {
    e.preventDefault();
    if (!name.trim()) return alert('Nhập tên lớp');
    if (!courseId) return alert('Chọn khoá học');
    onSubmit({
      name: name.trim(),
      teacher_id: teacherId || null,
      capacity,
      start_date: startDate || null,
      end_date: endDate || null,
      course_id: courseId
    });
  }

  return (
    <form onSubmit={handleSubmit} style={{ border: '1px solid #ddd', padding: 12, marginBottom: 12 }}>
      <div>
        <label>Khoá học</label>
        <select value={courseId} onChange={e => setCourseId(e.target.value)} required>
          <option value="">-- Chọn khoá học --</option>
          {courses.map(c => (
            <option key={c.id} value={c.id}>{c.name} ({c.level || ''})</option>
          ))}
        </select>
      </div>
      <div>
        <label>Tên lớp</label>
        <input value={name} onChange={(e) => setName(e.target.value)} />
      </div>
      <div>
        <label>Teacher ID</label>
        <input value={teacherId} onChange={(e) => setTeacherId(e.target.value)} />
      </div>
      <div>
        <label>Capacity</label>
        <input type="number" value={capacity} onChange={(e) => setCapacity(Number(e.target.value))} />
      </div>
      <div>
        <label>Start</label>
        <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
      </div>
      <div>
        <label>End</label>
        <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
      </div>
      <div style={{ marginTop: 8 }}>
        <button type="submit">Lưu</button>
        <button type="button" onClick={onCancel} style={{ marginLeft: 8 }}>Huỷ</button>
      </div>
    </form>
  );
}
