import React from 'react';

export default function MaterialsPanel({ classId }) {
  return (
    <div style={{ border: '1px dashed #ddd', padding: 12, borderRadius: 8 }}>
      <div style={{ fontWeight: 600, marginBottom: 8 }}>Tài liệu học tập</div>
      <div style={{ color: '#666' }}>
        Chưa triển khai API. Sẽ có danh sách tài liệu (link, file), kèm mô tả, và phân loại theo bài học.
      </div>
    </div>
  );
}
