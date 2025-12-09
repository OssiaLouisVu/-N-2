// src/components/course/CourseManagementPanel.jsx
import React, { useEffect, useState } from 'react';
import { getCourses } from '../../api/courseApi';
import CourseList from './CourseList';
import CourseForm from './CourseForm';
import CourseDetail from './CourseDetail';

export default function CourseManagementPanel() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [selectedCourseId, setSelectedCourseId] = useState(null);
  const [editingCourse, setEditingCourse] = useState(null);
  
  // Filters
  const [courseView, setCourseView] = useState('ACTIVE'); // 'ACTIVE' | 'ARCHIVED'
  const [levelFilter, setLevelFilter] = useState('');
  const [searchKeyword, setSearchKeyword] = useState('');

  async function loadCourses() {
    setLoading(true);
    try {
      const res = await getCourses({ 
        status: courseView, 
        level: levelFilter || undefined,
        search: searchKeyword || undefined
      });
      if (res && res.courses) setCourses(res.courses);
    } catch (err) {
      console.error('Load courses failed', err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadCourses(); }, [courseView]);

  function handleEdit(course) {
    setEditingCourse(course);
    setShowForm(true);
  }

  function handleFormSuccess() {
    setShowForm(false);
    setEditingCourse(null);
    loadCourses();
  }

  function handleSelectCourse(id) {
    setSelectedCourseId(id);
    setShowForm(false);
  }

  return (
    <div className="course-management" style={{ width: '100%' }}>
      <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 16 }}>📚 Quản lý Khóa học</h2>
      
      {/* Controls */}
      <div style={{ 
        display: 'flex', 
        gap: 12, 
        alignItems: 'center', 
        flexWrap: 'wrap', 
        marginBottom: 16,
        padding: 16,
        background: '#f9fafb',
        borderRadius: 12,
        border: '1px solid #e5e7eb'
      }}>
        {/* View Filter */}
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <span style={{ fontWeight: 600, fontSize: 14 }}>Trạng thái:</span>
          <button
            onClick={() => setCourseView('ACTIVE')}
            style={{ 
              padding: '8px 16px', 
              borderRadius: 20, 
              border: '1px solid #ddd', 
              background: courseView === 'ACTIVE' ? '#3b82f6' : '#fff',
              color: courseView === 'ACTIVE' ? '#fff' : '#333',
              cursor: 'pointer',
              fontWeight: 500,
              fontSize: 13
            }}
          >
            ⚡ Đang hoạt động
          </button>
          <button
            onClick={() => setCourseView('ARCHIVED')}
            style={{ 
              padding: '8px 16px', 
              borderRadius: 20, 
              border: '1px solid #ddd', 
              background: courseView === 'ARCHIVED' ? '#ef4444' : '#fff',
              color: courseView === 'ARCHIVED' ? '#fff' : '#333',
              cursor: 'pointer',
              fontWeight: 500,
              fontSize: 13
            }}
          >
            📦 Đã lưu trữ
          </button>
        </div>

        {/* Level Filter */}
        <select
          value={levelFilter}
          onChange={(e) => setLevelFilter(e.target.value)}
          style={{ 
            padding: '8px 12px', 
            borderRadius: 8, 
            border: '1px solid #ddd',
            fontSize: 13
          }}
        >
          <option value="">Tất cả Level</option>
          <option value="Beginner">Beginner</option>
          <option value="Intermediate">Intermediate</option>
          <option value="Advanced">Advanced</option>
        </select>

        {/* Search */}
        <input
          placeholder="Tìm tên hoặc mã khóa học..."
          value={searchKeyword}
          onChange={(e) => setSearchKeyword(e.target.value)}
          style={{ 
            padding: '8px 12px', 
            borderRadius: 8, 
            border: '1px solid #ddd', 
            minWidth: 240,
            fontSize: 13
          }}
        />

        <button 
          onClick={loadCourses}
          style={{ 
            padding: '8px 16px', 
            borderRadius: 8, 
            border: '1px solid #ddd',
            background: '#fff',
            cursor: 'pointer',
            fontWeight: 500,
            fontSize: 13
          }}
        >
          🔍 Lọc
        </button>

        {/* Add Button */}
        <div style={{ marginLeft: 'auto' }}>
          <button 
            onClick={() => { 
              setEditingCourse(null); 
              setShowForm(!showForm);
              setSelectedCourseId(null);
            }}
            style={{ 
              padding: '8px 18px', 
              borderRadius: 8, 
              background: showForm ? '#6b7280' : '#10b981',
              color: '#fff', 
              border: 'none',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: 13
            }}
          >
            {showForm ? '✖ Đóng' : '➕ Thêm khóa học mới'}
          </button>
        </div>
      </div>

      {/* Form */}
      {showForm && (
        <div style={{ marginBottom: 20 }}>
          <CourseForm 
            initialData={editingCourse} 
            onSuccess={handleFormSuccess}
            onCancel={() => { setShowForm(false); setEditingCourse(null); }}
          />
        </div>
      )}

      {/* Course List */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: 40, color: '#666' }}>
          ⏳ Đang tải danh sách khóa học...
        </div>
      ) : (
        <>
          <CourseList
            courses={courses}
            refresh={loadCourses}
            onSelectCourse={handleSelectCourse}
            onEdit={handleEdit}
            readOnly={courseView === 'ARCHIVED'}
          />

          {/* Course Detail */}
          {selectedCourseId && (
            <div style={{ marginTop: 24 }}>
              <CourseDetail 
                courseId={selectedCourseId} 
                onDone={() => { 
                  setSelectedCourseId(null); 
                  loadCourses(); 
                }} 
              />
            </div>
          )}
        </>
      )}
    </div>
  );
}
