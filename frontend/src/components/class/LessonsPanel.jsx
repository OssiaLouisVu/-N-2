import React from 'react';

export default function LessonsPanel({ classId }) {
  return (
    <div style={{ border: '1px dashed #ddd', padding: 12, borderRadius: 8 }}>
      <div style={{ fontWeight: 600, marginBottom: 8 }}>Quản lý bài học</div>
      <div style={{ color: '#666' }}>
        Chưa triển khai API. Ở đây sẽ có danh sách Bài học của khoá, thêm/sửa/xoá bài học,
        sắp xếp thứ tự, và mở "Bài học nhỏ" theo từng bài.
      </div>
    </div>
  );
}
