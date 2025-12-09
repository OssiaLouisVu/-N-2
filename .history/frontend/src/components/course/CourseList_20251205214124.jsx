// src/components/course/CourseList.jsx
import React from 'react';
import { deleteCourse } from '../../api/courseApi';

export default function CourseList({ courses = [], refresh = () => {}, onEdit = () => {}, onSelectCourse = () => {}, readOnly = false }) {
  async function handleDelete(id) {
    if (!confirm('Xác nhận xóa khóa học? (Chỉ xóa được nếu chưa có lớp học nào sử dụng)')) return;
    try {
      const res = await deleteCourse(id);
      if (res.success) {
        alert('Đã xóa khóa học');
        refresh();
      } else {
        alert(res.message || 'Không thể xóa khóa học');
      }
    } catch (err) {
      console.error('Delete course failed', err);
      alert('Lỗi khi xóa khóa học');
    }
  }

  if (!courses.length) {
    return (
      <div style={{ 
        textAlign: 'center', 
        padding: 60, 
        background: '#f9fafb',
        borderRadius: 12,
        color: '#6b7280'
      }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>📚</div>
        <div style={{ fontSize: 16, fontWeight: 500 }}>Chưa có khóa học nào</div>
        <div style={{ fontSize: 14, marginTop: 8 }}>Nhấn "Thêm khóa học mới" để bắt đầu</div>
      </div>
    );
  }

  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ 
        width: '100%', 
        borderCollapse: 'collapse',
        background: '#fff',
        borderRadius: 12,
        overflow: 'hidden',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
      }}>
        <thead>
          <tr style={{ background: '#f3f4f6', borderBottom: '2px solid #e5e7eb' }}>
            <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, fontSize: 13 }}>Mã</th>
            <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, fontSize: 13 }}>Tên khóa học</th>
            <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, fontSize: 13 }}>Level</th>
            <th style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 600, fontSize: 13 }}>Học phí</th>
            <th style={{ padding: '12px 16px', textAlign: 'center', fontWeight: 600, fontSize: 13 }}>Thời lượng</th>
            <th style={{ padding: '12px 16px', textAlign: 'center', fontWeight: 600, fontSize: 13 }}>Trạng thái</th>
            <th style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 600, fontSize: 13 }}>Thao tác</th>
          </tr>
        </thead>
        <tbody>
          {courses.map((c) => (
            <tr key={c.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
              <td style={{ padding: '12px 16px', fontSize: 13, fontFamily: 'monospace', color: '#6b7280' }}>
                {c.course_code}
              </td>
              <td style={{ padding: '12px 16px', fontSize: 13, fontWeight: 500 }}>
                {c.name}
              </td>
              <td style={{ padding: '12px 16px', fontSize: 13 }}>
                <span style={{ 
                  padding: '4px 8px',
                  borderRadius: 6,
                  background: c.level === 'Beginner' ? '#dbeafe' : c.level === 'Intermediate' ? '#fef3c7' : '#fee2e2',
                  color: c.level === 'Beginner' ? '#1e40af' : c.level === 'Intermediate' ? '#92400e' : '#991b1b',
                  fontSize: 12,
                  fontWeight: 500
                }}>
                  {c.level || 'N/A'}
                </span>
              </td>
              <td style={{ padding: '12px 16px', fontSize: 13, textAlign: 'right', fontWeight: 500 }}>
                {c.tuition_fee ? `${Number(c.tuition_fee).toLocaleString('vi-VN')} đ` : '-'}
              </td>
              <td style={{ padding: '12px 16px', fontSize: 13, textAlign: 'center' }}>
                {c.duration_weeks ? `${c.duration_weeks} tuần` : '-'}
              </td>
              <td style={{ padding: '12px 16px', fontSize: 13, textAlign: 'center' }}>
                <span style={{ 
                  padding: '4px 10px',
                  borderRadius: 6,
                  background: c.status === 'ACTIVE' ? '#d1fae5' : '#fee2e2',
                  color: c.status === 'ACTIVE' ? '#065f46' : '#991b1b',
                  fontSize: 12,
                  fontWeight: 500
                }}>
                  {c.status === 'ACTIVE' ? '✓ Hoạt động' : '✗ Lưu trữ'}
                </span>
              </td>
              <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                  <button 
                    onClick={() => onSelectCourse(c.id)}
                    style={{ 
                      padding: '6px 12px',
                      borderRadius: 6,
                      border: '1px solid #3b82f6',
                      background: '#eff6ff',
                      color: '#1e40af',
                      cursor: 'pointer',
                      fontSize: 12,
                      fontWeight: 500
                    }}
                  >
                    📋 Chi tiết
                  </button>
                  {!readOnly && (
                    <>
                      <button 
                        onClick={() => onEdit(c)}
                        style={{ 
                          padding: '6px 12px',
                          borderRadius: 6,
                          border: '1px solid #f59e0b',
                          background: '#fffbeb',
                          color: '#92400e',
                          cursor: 'pointer',
                          fontSize: 12,
                          fontWeight: 500
                        }}
                      >
                        ✏️ Sửa
                      </button>
                      <button 
                        onClick={() => handleDelete(c.id)}
                        style={{ 
                          padding: '6px 12px',
                          borderRadius: 6,
                          border: '1px solid #ef4444',
                          background: '#fef2f2',
                          color: '#991b1b',
                          cursor: 'pointer',
                          fontSize: 12,
                          fontWeight: 500
                        }}
                      >
                        🗑️ Xóa
                      </button>
                    </>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
