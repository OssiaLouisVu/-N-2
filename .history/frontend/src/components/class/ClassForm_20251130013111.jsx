import React, { useState } from 'react';

export default function ClassForm({ onSubmit, onCancel, initialData = null }) {
  const [name, setName] = useState(initialData ? initialData.name : '');
  const [teacherId, setTeacherId] = useState(initialData ? (initialData.teacher_id || '') : '');
  const [capacity, setCapacity] = useState(initialData ? (initialData.capacity || 20) : 20);
  const [startDate, setStartDate] = useState(initialData ? (initialData.start_date || '') : '');
  const [endDate, setEndDate] = useState(initialData ? (initialData.end_date || '') : '');

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
