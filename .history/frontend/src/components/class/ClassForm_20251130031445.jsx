import React, { useState, useEffect } from 'react';

export default function ClassForm({ onSubmit, onCancel, initialData = null }) {
  const [name, setName] = useState('');
  const [teacherId, setTeacherId] = useState('');
  const [capacity, setCapacity] = useState(20);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    if (initialData) {
      setName(initialData.name || '');
      setTeacherId(initialData.teacher_id || '');
      setCapacity(initialData.capacity || 20);
      setStartDate(initialData.start_date || '');
      setEndDate(initialData.end_date || '');
    }
  }, [initialData]);

  function handleSubmit(e) {
    e.preventDefault();
    if (!name.trim()) return alert('Nhập tên lớp');
    onSubmit({ name: name.trim(), teacher_id: teacherId || null, capacity, start_date: startDate || null, end_date: endDate || null });
  }

  return (
    <form onSubmit={handleSubmit} style={{ border: '1px solid #ddd', padding: 12, marginBottom: 12 }}>
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
