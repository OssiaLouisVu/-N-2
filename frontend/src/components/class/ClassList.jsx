import React from 'react';
import { deleteClass } from '../../api/classApi';

export default function ClassList({
  classes = [],
  refresh = () => {},
  onEdit = () => {},
  onSelectClass = () => {},
  readOnly = false,
}) {
  const now = new Date(); // ngày hiện tại

  async function handleDelete(id, startDate) {
    // Chặn xoá nếu đã tới hoặc qua ngày bắt đầu hành chính
    if (startDate && new Date(startDate) <= now) {
      alert('Lớp đã đến hoặc qua ngày bắt đầu, không thể xoá.');
      return;
    }

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
          <th>Sức chứa</th>
          <th>Thời gian</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        {classes.map((c) => {
          const canDeleteByDate =
            !c.start_date || new Date(c.start_date) > now; // chỉ xoá khi chưa tới ngày bắt đầu

          return (
            <tr key={c.id} style={{ borderTop: '1px solid #eee' }}>
              <td>{c.id}</td>
              <td>{c.name}</td>
              <td>{c.capacity}</td>
              <td>
                {c.start_date
                  ? new Date(c.start_date).toLocaleDateString('vi-VN', {
                      timeZone: 'Asia/Ho_Chi_Minh',
                    })
                  : '—'}{' '}
                →{' '}
                {c.end_date
                  ? new Date(c.end_date).toLocaleDateString('vi-VN', {
                      timeZone: 'Asia/Ho_Chi_Minh',
                    })
                  : '—'}
              </td>
              <td>
                {!readOnly && <button onClick={() => onEdit(c)}>Sửa</button>}
                <button
                  onClick={() => onSelectClass(c.id)}
                  style={{ marginLeft: 8 }}
                >
                  Chi tiết
                </button>

                {!readOnly && (
                  canDeleteByDate ? (
                    <button
                      onClick={() => handleDelete(c.id, c.start_date)}
                      style={{ marginLeft: 8 }}
                    >
                      Xoá
                    </button>
                  ) : (
                    <button
                      disabled
                      style={{
                        marginLeft: 8,
                        opacity: 0.5,
                        cursor: 'not-allowed',
                      }}
                      title="Lớp đã bắt đầu, không thể xoá"
                    >
                      Xoá
                    </button>
                  )
                )}
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
