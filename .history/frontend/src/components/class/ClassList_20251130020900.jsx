import React from 'react';
import { deleteClass } from '../../api/classApi';

export default function ClassList({ classes = [], refresh = () => {} }) {
  async function handleDelete(id) {
    if (!confirm('Xác nhận xoá lớp?')) return;
    try {
      await deleteClass(id);
      refresh();
    } catch (err) {
      console.error('Delete class failed', err);
      alert('Xoá lớp thất bại');
    }
  }

  if (!classes.length) return <div>Chưa có lớp nào.</div>;

  return (
    <table className="class-list" style={{ width: '100%', borderCollapse: 'collapse' }}>
      <thead>
        <tr>
          <th>ID</th>
          <th>Tên</th>
          <th>GV</th>
          <th>Sức chứa</th>
          <th>Thời gian</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        {classes.map((c) => (
          <tr key={c.id} style={{ borderTop: '1px solid #eee' }}>
            <td>{c.id}</td>
            <td>{c.name}</td>
            <td>{c.teacher_id || '-'}</td>
            <td>{c.capacity}</td>
            <td>{c.start_date || '-'} → {c.end_date || '-'}</td>
            <td>
              <button onClick={() => navigator.clipboard.writeText(String(c.id))}>Sao chép ID</button>
              <button onClick={() => handleDelete(c.id)} style={{ marginLeft: 8 }}>Xoá</button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
