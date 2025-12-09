// src/components/course/CourseDetail.jsx
import React, { useEffect, useState } from 'react';
import { getCourse, getCourseHistory, getLessons, getMaterials } from '../../api/courseApi';

export default function CourseDetail({ courseId, onDone = () => {} }) {
  const [course, setCourse] = useState(null);
  const [tab, setTab] = useState('info'); // info | lessons | materials | history
  const [lessons, setLessons] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const res = await getCourse(courseId);
      if (res.success) setCourse(res.course);
    } catch (err) {
      console.error('Load course failed', err);
    } finally {
      setLoading(false);
    }
  }

  async function loadLessons() {
    try {
      const res = await getLessons(courseId);
      if (res.success) setLessons(res.lessons);
    } catch (err) {
      console.error('Load lessons failed', err);
    }
  }

  async function loadMaterials() {
    try {
      const res = await getMaterials(courseId);
      if (res.success) setMaterials(res.materials);
    } catch (err) {
      console.error('Load materials failed', err);
    }
  }

  async function loadHistory() {
    try {
      const res = await getCourseHistory(courseId);
      if (res.success) setHistory(res.history);
    } catch (err) {
      console.error('Load history failed', err);
    }
  }

  useEffect(() => {
    load();
  }, [courseId]);

  useEffect(() => {
    if (tab === 'lessons') loadLessons();
    if (tab === 'materials') loadMaterials();
    if (tab === 'history') loadHistory();
  }, [tab]);

  if (loading) return <div>Đang tải...</div>;
  if (!course) return <div>Không tìm thấy khóa học</div>;

  return (
    <div style={{ 
      border: '1px solid #e5e7eb', 
      padding: 20, 
      borderRadius: 12, 
      background: '#fff',
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h3 style={{ fontSize: 18, fontWeight: 600 }}>
          📚 {course.name}
        </h3>
        <button 
          onClick={onDone}
          style={{ 
            padding: '6px 12px', 
            borderRadius: 6, 
            background: '#f3f4f6',
            border: '1px solid #d1d5db',
            cursor: 'pointer',
            fontSize: 13
          }}
        >
          ✖ Đóng
        </button>
      </div>

      <div style={{ marginBottom: 12, fontSize: 13, color: '#6b7280' }}>
        <strong>Mã:</strong> {course.course_code} | 
        <strong> Level:</strong> {course.level} | 
        <strong> Học phí:</strong> {course.tuition_fee ? `${Number(course.tuition_fee).toLocaleString('vi-VN')} đ` : '-'}
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16, borderBottom: '2px solid #f3f4f6' }}>
        {['info', 'lessons', 'materials', 'history'].map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            style={{
              padding: '10px 16px',
              border: 'none',
              background: 'transparent',
              cursor: 'pointer',
              fontWeight: tab === t ? 600 : 400,
              fontSize: 14,
              color: tab === t ? '#3b82f6' : '#6b7280',
              borderBottom: tab === t ? '2px solid #3b82f6' : '2px solid transparent',
              marginBottom: '-2px'
            }}
          >
            {t === 'info' && '📋 Thông tin'}
            {t === 'lessons' && '📚 Bài học'}
            {t === 'materials' && '📁 Tài liệu'}
            {t === 'history' && '🕐 Lịch sử'}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {tab === 'info' && (
        <div style={{ fontSize: 14, lineHeight: 1.8 }}>
          <div style={{ marginBottom: 16 }}>
            <strong>Mô tả ngắn:</strong>
            <p style={{ margin: '8px 0', color: '#374151' }}>{course.short_description || 'Chưa có'}</p>
          </div>
          <div style={{ marginBottom: 16 }}>
            <strong>Mô tả chi tiết:</strong>
            <p style={{ margin: '8px 0', color: '#374151' }}>{course.detailed_description || 'Chưa có'}</p>
          </div>
          <div style={{ marginBottom: 16 }}>
            <strong>Yêu cầu đầu vào:</strong>
            <p style={{ margin: '8px 0', color: '#374151' }}>{course.requirements || 'Chưa có'}</p>
          </div>
          <div style={{ marginBottom: 16 }}>
            <strong>Mục tiêu đầu ra:</strong>
            <p style={{ margin: '8px 0', color: '#374151' }}>{course.objectives || 'Chưa có'}</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
            <div>
              <strong>Thời lượng:</strong> {course.duration_weeks} tuần
            </div>
            <div>
              <strong>Buổi/tuần:</strong> {course.sessions_per_week}
            </div>
            <div>
              <strong>Giờ/buổi:</strong> {course.hours_per_session}
            </div>
          </div>
        </div>
      )}

      {tab === 'lessons' && (
        <div>
          {lessons.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 40, color: '#6b7280' }}>
              Chưa có bài học nào. Thêm bài học mới để bắt đầu.
            </div>
          ) : (
            <div>
              {lessons.map((l) => (
                <div key={l.id} style={{ 
                  padding: 12, 
                  background: '#f9fafb', 
                  borderRadius: 8, 
                  marginBottom: 8,
                  fontSize: 13
                }}>
                  <strong>Bài {l.lesson_number}:</strong> {l.title}
                  <div style={{ color: '#6b7280', marginTop: 4 }}>{l.description}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {tab === 'materials' && (
        <div>
          {materials.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 40, color: '#6b7280' }}>
              Chưa có tài liệu nào.
            </div>
          ) : (
            <div>
              {materials.map((m) => (
                <div key={m.id} style={{ 
                  padding: 12, 
                  background: '#f9fafb', 
                  borderRadius: 8, 
                  marginBottom: 8,
                  fontSize: 13
                }}>
                  <strong>{m.title}</strong>
                  <div style={{ color: '#6b7280', marginTop: 4 }}>
                    {m.type} | {m.url || m.file_path}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {tab === 'history' && (
        <div>
          {history.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 40, color: '#6b7280' }}>
              Chưa có lịch sử chỉnh sửa.
            </div>
          ) : (
            <div>
              {history.map((h) => (
                <div key={h.id} style={{ 
                  padding: 12, 
                  background: '#f9fafb', 
                  borderRadius: 8, 
                  marginBottom: 8,
                  fontSize: 13
                }}>
                  <div>
                    <strong>{h.changed_by_name || 'Unknown'}</strong> - {h.action}
                  </div>
                  {h.field_changed && (
                    <div style={{ color: '#6b7280', marginTop: 4 }}>
                      {h.field_changed}: {h.old_value} → {h.new_value}
                    </div>
                  )}
                  <div style={{ color: '#9ca3af', fontSize: 12, marginTop: 4 }}>
                    {new Date(h.changed_at).toLocaleString('vi-VN')}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
