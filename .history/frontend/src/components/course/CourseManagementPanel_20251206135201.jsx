  // Chi tiết khóa học
  const [detailCourse, setDetailCourse] = useState(null);
  const [detailTab, setDetailTab] = useState('info');
  const [history, setHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
// src/components/course/CourseManagementPanel.jsx
import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

function CourseManagementPanel({ refreshToken }) {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  
  // Filter states
  const [filterStatus, setFilterStatus] = useState('');
  const [filterLevel, setFilterLevel] = useState('');
  const [searchText, setSearchText] = useState('');

  // Form states
  const [formData, setFormData] = useState({
    course_code: '',
    name: '',
    level: '',
    short_description: '',
    detailed_description: '',
    duration_weeks: '',
    sessions_per_week: '',
    hours_per_session: '',
    tuition_fee: '',
    requirements: '',
    objectives: '',
    status: 'ACTIVE'
  });

  // Load courses
  const loadCourses = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filterStatus) params.append('status', filterStatus);
      if (filterLevel) params.append('level', filterLevel);
      if (searchText) params.append('search', searchText);

      const res = await fetch(`http://localhost:8080/api/courses?${params}`);
      const data = await res.json();
      if (data.success) {
        setCourses(data.courses || []);
      } else {
        setMessage('❌ ' + (data.message || 'Lỗi tải khóa học'));
      }
    } catch (err) {
      setMessage('❌ Lỗi kết nối server: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCourses();
  }, [refreshToken, filterStatus, filterLevel]);

  // Handle form change
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      course_code: '',
      name: '',
      level: '',
      short_description: '',
      detailed_description: '',
      duration_weeks: '',
      sessions_per_week: '',
      hours_per_session: '',
      tuition_fee: '',
      requirements: '',
      objectives: '',
      status: 'ACTIVE'
    });
    setEditingCourse(null);
    setShowAddForm(false);
  };

  // Create course
  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const res = await fetch('http://localhost:8080/api/courses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (data.success) {
        setMessage('✅ Tạo khóa học thành công!');
        resetForm();
        loadCourses();
      } else {
        setMessage('❌ ' + (data.message || 'Lỗi tạo khóa học'));
      }
    } catch (err) {
      setMessage('❌ Lỗi: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Update course
  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const res = await fetch(`http://localhost:8080/api/courses/${editingCourse.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (data.success) {
        setMessage('✅ Cập nhật khóa học thành công!');
        resetForm();
        loadCourses();
      } else {
        setMessage('❌ ' + (data.message || 'Lỗi cập nhật'));
      }
    } catch (err) {
      setMessage('❌ Lỗi: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Delete course
  const handleDelete = async (id) => {
    if (!confirm('Bạn có chắc muốn xóa khóa học này?')) return;
    try {
      setLoading(true);
      const res = await fetch(`http://localhost:8080/api/courses/${id}`, {
        method: 'DELETE'
      });
      const data = await res.json();
      if (data.success) {
        setMessage('✅ Đã xóa khóa học');
        loadCourses();
      } else {
        setMessage('❌ ' + (data.message || 'Lỗi xóa'));
      }
    } catch (err) {
      setMessage('❌ Lỗi: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Edit course
  const handleEdit = (course) => {
    setEditingCourse(course);
    setFormData({
      course_code: course.course_code || '',
      name: course.name || '',
      level: course.level || '',
      short_description: course.short_description || '',
      detailed_description: course.detailed_description || '',
      duration_weeks: course.duration_weeks || '',
      sessions_per_week: course.sessions_per_week || '',
      hours_per_session: course.hours_per_session || '',
      tuition_fee: course.tuition_fee || '',
      requirements: course.requirements || '',
      objectives: course.objectives || '',
      status: course.status || 'ACTIVE'
    });
    setShowAddForm(true);
  };

  // Archive course
  const handleArchive = async (id) => {
    if (!confirm('Bạn có chắc muốn kết thúc khóa học này?')) return;
    try {
      setLoading(true);
      const res = await fetch(`http://localhost:8080/api/courses/${id}/archive`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ changed_by: 1 })
      });
      const data = await res.json();
      if (data.success) {
        setMessage('✅ ' + data.message);
        loadCourses();
      } else {
        setMessage('❌ ' + (data.message || 'Lỗi'));
      }
    } catch (err) {
      setMessage('❌ Lỗi: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {/* Message */}
      {message && (
        <div style={{
          padding: 12,
          borderRadius: 8,
          marginBottom: 16,
          background: message.startsWith('✅') ? '#d4edda' : '#f8d7da',
          color: message.startsWith('✅') ? '#155724' : '#721c24',
          border: `1px solid ${message.startsWith('✅') ? '#c3e6cb' : '#f5c6cb'}`
        }}>
          {message}
        </div>
      )}

      {/* Filters */}
      <div style={{ 
        display: 'flex', 
        gap: 12, 
        marginBottom: 20,
        flexWrap: 'wrap',
        alignItems: 'center'
      }}>
        <input
          type="text"
          placeholder="🔍 Tìm theo tên hoặc mã..."
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          style={{
            padding: '8px 12px',
            borderRadius: 8,
            border: '1px solid #ddd',
            minWidth: 200
          }}
        />
        
        <select
          value={filterLevel}
          onChange={(e) => setFilterLevel(e.target.value)}
          style={{
            padding: '8px 12px',
            borderRadius: 8,
            border: '1px solid #ddd'
          }}
        >
          <option value="">Tất cả cấp độ</option>
          <option value="HSK1">HSK1</option>
          <option value="HSK2">HSK2</option>
          <option value="HSK3">HSK3</option>
          <option value="HSK4">HSK4</option>
          <option value="HSK5">HSK5</option>
          <option value="HSK6">HSK6</option>
        </select>

        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          style={{
            padding: '8px 12px',
            borderRadius: 8,
            border: '1px solid #ddd'
          }}
        >
          <option value="">Tất cả trạng thái</option>
          <option value="ACTIVE">Đang hoạt động</option>
          <option value="INACTIVE">Tạm dừng</option>
          <option value="ARCHIVED">Đã kết thúc</option>
        </select>

        <button
          onClick={() => {
            setSearchText('');
            setFilterLevel('');
            setFilterStatus('');
          }}
          style={{
            padding: '8px 16px',
            borderRadius: 8,
            border: '1px solid #ddd',
            background: '#f8f9fa',
            cursor: 'pointer'
          }}
        >
          🔄 Reset
        </button>

        <button
          onClick={loadCourses}
          disabled={loading}
          style={{
            padding: '8px 16px',
            borderRadius: 8,
            border: 'none',
            background: '#007bff',
            color: '#fff',
            cursor: loading ? 'not-allowed' : 'pointer',
            fontWeight: 600
          }}
        >
          {loading ? '⏳ Đang tải...' : '🔍 Tìm kiếm'}
        </button>

        <button
          onClick={() => {
            resetForm();
            setShowAddForm(!showAddForm);
          }}
          style={{
            padding: '8px 16px',
            borderRadius: 8,
            border: 'none',
            background: '#28a745',
            color: '#fff',
            cursor: 'pointer',
            fontWeight: 600,
            marginLeft: 'auto'
          }}
        >
          {showAddForm ? '❌ Hủy' : '➕ Thêm khóa học'}
        </button>
      </div>

      {/* Add/Edit Form */}
      {showAddForm && (
        <div style={{
          background: '#f8f9fa',
          padding: 20,
          borderRadius: 12,
          marginBottom: 20,
          border: '2px solid #007bff'
        }}>
          <h3 style={{ marginBottom: 16, fontSize: 18, fontWeight: 600 }}>
            {editingCourse ? '✏️ Chỉnh sửa khóa học' : '➕ Thêm khóa học mới'}
          </h3>
          
          <form onSubmit={editingCourse ? handleUpdate : handleCreate}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              {/* Mã khóa học */}
              <div>
                <label style={{ display: 'block', marginBottom: 4, fontWeight: 500 }}>
                  Mã khóa học *
                </label>
                <input
                  type="text"
                  name="course_code"
                  value={formData.course_code}
                  onChange={handleChange}
                  required
                  disabled={!!editingCourse}
                  placeholder="VD: HSK1-2024"
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: 8,
                    border: '1px solid #ddd'
                  }}
                />
              </div>

              {/* Tên khóa học */}
              <div>
                <label style={{ display: 'block', marginBottom: 4, fontWeight: 500 }}>
                  Tên khóa học *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  placeholder="VD: Tiếng Trung HSK1 Cơ Bản"
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: 8,
                    border: '1px solid #ddd'
                  }}
                />
              </div>

              {/* Cấp độ */}
              <div>
                <label style={{ display: 'block', marginBottom: 4, fontWeight: 500 }}>
                  Cấp độ
                </label>
                <select
                  name="level"
                  value={formData.level}
                  onChange={handleChange}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: 8,
                    border: '1px solid #ddd'
                  }}
                >
                  <option value="">-- Chọn cấp độ --</option>
                  <option value="HSK1">HSK1</option>
                  <option value="HSK2">HSK2</option>
                  <option value="HSK3">HSK3</option>
                  <option value="HSK4">HSK4</option>
                  <option value="HSK5">HSK5</option>
                  <option value="HSK6">HSK6</option>
                </select>
              </div>

              {/* Trạng thái */}
              <div>
                <label style={{ display: 'block', marginBottom: 4, fontWeight: 500 }}>
                  Trạng thái
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: 8,
                    border: '1px solid #ddd'
                  }}
                >
                  <option value="ACTIVE">Đang hoạt động</option>
                  <option value="INACTIVE">Tạm dừng</option>
                  <option value="ARCHIVED">Đã kết thúc</option>
                </select>
              </div>

              {/* Thời lượng (tuần) */}
              <div>
                <label style={{ display: 'block', marginBottom: 4, fontWeight: 500 }}>
                  Thời lượng (tuần)
                </label>
                <input
                  type="number"
                  name="duration_weeks"
                  value={formData.duration_weeks}
                  onChange={handleChange}
                  placeholder="VD: 12"
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: 8,
                    border: '1px solid #ddd'
                  }}
                />
              </div>

              {/* Buổi/tuần */}
              <div>
                <label style={{ display: 'block', marginBottom: 4, fontWeight: 500 }}>
                  Số buổi/tuần
                </label>
                <input
                  type="number"
                  name="sessions_per_week"
                  value={formData.sessions_per_week}
                  onChange={handleChange}
                  placeholder="VD: 3"
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: 8,
                    border: '1px solid #ddd'
                  }}
                />
              </div>

              {/* Giờ/buổi */}
              <div>
                <label style={{ display: 'block', marginBottom: 4, fontWeight: 500 }}>
                  Số giờ/buổi
                </label>
                <input
                  type="number"
                  step="0.5"
                  name="hours_per_session"
                  value={formData.hours_per_session}
                  onChange={handleChange}
                  placeholder="VD: 2"
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: 8,
                    border: '1px solid #ddd'
                  }}
                />
              </div>

              {/* Học phí */}
              <div>
                <label style={{ display: 'block', marginBottom: 4, fontWeight: 500 }}>
                  Học phí (VND)
                </label>
                <input
                  type="number"
                  name="tuition_fee"
                  value={formData.tuition_fee}
                  onChange={handleChange}
                  placeholder="VD: 3000000"
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: 8,
                    border: '1px solid #ddd'
                  }}
                />
              </div>
            </div>

            {/* Mô tả ngắn */}
            <div style={{ marginTop: 16 }}>
              <label style={{ display: 'block', marginBottom: 4, fontWeight: 500 }}>
                Mô tả ngắn
              </label>
              <textarea
                name="short_description"
                value={formData.short_description}
                onChange={handleChange}
                rows={2}
                placeholder="Mô tả ngắn gọn về khóa học..."
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: 8,
                  border: '1px solid #ddd',
                  fontFamily: 'inherit'
                }}
              />
            </div>

            {/* Mô tả chi tiết */}
            <div style={{ marginTop: 16 }}>
              <label style={{ display: 'block', marginBottom: 4, fontWeight: 500 }}>
                Mô tả chi tiết
              </label>
              <textarea
                name="detailed_description"
                value={formData.detailed_description}
                onChange={handleChange}
                rows={3}
                placeholder="Mô tả chi tiết về nội dung, phương pháp giảng dạy..."
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: 8,
                  border: '1px solid #ddd',
                  fontFamily: 'inherit'
                }}
              />
            </div>

            {/* Yêu cầu đầu vào */}
            <div style={{ marginTop: 16 }}>
              <label style={{ display: 'block', marginBottom: 4, fontWeight: 500 }}>
                Yêu cầu đầu vào
              </label>
              <textarea
                name="requirements"
                value={formData.requirements}
                onChange={handleChange}
                rows={2}
                placeholder="VD: Không yêu cầu kiến thức trước"
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: 8,
                  border: '1px solid #ddd',
                  fontFamily: 'inherit'
                }}
              />
            </div>

            {/* Mục tiêu */}
            <div style={{ marginTop: 16 }}>
              <label style={{ display: 'block', marginBottom: 4, fontWeight: 500 }}>
                Mục tiêu khóa học
              </label>
              <textarea
                name="objectives"
                value={formData.objectives}
                onChange={handleChange}
                rows={2}
                placeholder="VD: Giao tiếp cơ bản, đọc hiểu văn bản đơn giản..."
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: 8,
                  border: '1px solid #ddd',
                  fontFamily: 'inherit'
                }}
              />
            </div>

            {/* Buttons */}
            <div style={{ marginTop: 20, display: 'flex', gap: 12 }}>
              <button
                type="submit"
                disabled={loading}
                style={{
                  padding: '10px 24px',
                  borderRadius: 8,
                  border: 'none',
                  background: editingCourse ? '#ffc107' : '#28a745',
                  color: '#fff',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  fontWeight: 600
                }}
              >
                {loading ? '⏳ Đang xử lý...' : (editingCourse ? '💾 Cập nhật' : '➕ Tạo mới')}
              </button>
              <button
                type="button"
                onClick={resetForm}
                style={{
                  padding: '10px 24px',
                  borderRadius: 8,
                  border: '1px solid #ddd',
                  background: '#fff',
                  cursor: 'pointer'
                }}
              >
                ❌ Hủy
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Course List */}
      <div style={{ marginTop: 20 }}>
        <h3 style={{ marginBottom: 16, fontSize: 18, fontWeight: 600 }}>
          📚 Danh sách khóa học ({courses.length})
        </h3>
        
        {loading && <p>⏳ Đang tải...</p>}
        
        {!loading && courses.length === 0 && (
          <p style={{ color: '#999', textAlign: 'center', padding: 40 }}>
            Không có khóa học nào
          </p>
        )}

        {!loading && courses.length > 0 && (
          <div style={{ display: 'grid', gap: 16 }}>
            {courses.map((course) => (
              <div
                key={course.id}
                style={{
                  background: '#fff',
                  border: '1px solid #e0e0e0',
                  borderRadius: 12,
                  padding: 16,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                      <h4 style={{ margin: 0, fontSize: 16, fontWeight: 600 }}>
                        {course.name}
                      </h4>
                      <span style={{
                        padding: '2px 8px',
                        borderRadius: 4,
                        fontSize: 11,
                        fontWeight: 600,
                        background: 
                          course.status === 'ACTIVE' ? '#d4edda' :
                          course.status === 'INACTIVE' ? '#fff3cd' : '#f8d7da',
                        color:
                          course.status === 'ACTIVE' ? '#155724' :
                          course.status === 'INACTIVE' ? '#856404' : '#721c24'
                      }}>
                        {course.status === 'ACTIVE' ? '✅ Hoạt động' :
                         course.status === 'INACTIVE' ? '⏸️ Tạm dừng' : '🔒 Đã kết thúc'}
                      </span>
                      {course.level && (
                        <span style={{
                          padding: '2px 8px',
                          borderRadius: 4,
                          fontSize: 11,
                          fontWeight: 600,
                          background: '#e3f2fd',
                          color: '#0d47a1'
                        }}>
                          {course.level}
                        </span>
                      )}
                    </div>
                    
                    <p style={{ margin: '4px 0', fontSize: 13, color: '#666' }}>
                      <strong>Mã:</strong> {course.course_code}
                    </p>
                    
                    {course.short_description && (
                      <p style={{ margin: '8px 0', fontSize: 14, color: '#444' }}>
                        {course.short_description}
                      </p>
                    )}
                    
                    <div style={{ display: 'flex', gap: 16, marginTop: 8, fontSize: 13, color: '#666' }}>
                      {course.duration_weeks && (
                        <span>⏱️ {course.duration_weeks} tuần</span>
                      )}
                      {course.sessions_per_week && (
                        <span>📅 {course.sessions_per_week} buổi/tuần</span>
                      )}
                      {course.hours_per_session && (
                        <span>🕐 {course.hours_per_session}h/buổi</span>
                      )}
                      {course.tuition_fee && (
                        <span>💰 {Number(course.tuition_fee).toLocaleString('vi-VN')} VND</span>
                      )}
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: 8 }}>
                    <button
                      onClick={() => handleEdit(course)}
                      style={{
                        padding: '6px 12px',
                        borderRadius: 6,
                        border: 'none',
                        background: '#ffc107',
                        color: '#fff',
                        cursor: 'pointer',
                        fontSize: 13,
                        fontWeight: 600
                      }}
                    >
                      ✏️ Sửa
                    </button>
                    
                    {course.status !== 'ARCHIVED' && (
                      <button
                        onClick={() => handleArchive(course.id)}
                        style={{
                          padding: '6px 12px',
                          borderRadius: 6,
                          border: 'none',
                          background: '#6c757d',
                          color: '#fff',
                          cursor: 'pointer',
                          fontSize: 13,
                          fontWeight: 600
                        }}
                      >
                        🔒 Kết thúc
                      </button>
                    )}
                    
                    <button
                      onClick={() => handleDelete(course.id)}
                      style={{
                        padding: '6px 12px',
                        borderRadius: 6,
                        border: 'none',
                        background: '#dc3545',
                        color: '#fff',
                        cursor: 'pointer',
                        fontSize: 13,
                        fontWeight: 600
                      }}
                    >
                      🗑️ Xóa
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

CourseManagementPanel.propTypes = {
  refreshToken: PropTypes.number
};

export default CourseManagementPanel;
            </div>
            <div style={{ display: 'flex', gap: 16, marginBottom: 16 }}>
              <button onClick={() => setDetailTab('info')} style={{ padding: '8px 18px', borderRadius: 8, border: 'none', background: detailTab==='info' ? '#e3f2fd' : '#f8f9fa', fontWeight: 600, color: '#1976d2', cursor: 'pointer' }}>Thông tin</button>
              <button onClick={() => setDetailTab('lessons')} style={{ padding: '8px 18px', borderRadius: 8, border: 'none', background: detailTab==='lessons' ? '#e3f2fd' : '#f8f9fa', fontWeight: 600, color: '#1976d2', cursor: 'pointer' }}>Bài học</button>
              <button onClick={() => setDetailTab('materials')} style={{ padding: '8px 18px', borderRadius: 8, border: 'none', background: detailTab==='materials' ? '#e3f2fd' : '#f8f9fa', fontWeight: 600, color: '#1976d2', cursor: 'pointer' }}>Tài liệu</button>
              <button onClick={() => { setDetailTab('history'); fetchHistory(detailCourse.id); }} style={{ padding: '8px 18px', borderRadius: 8, border: 'none', background: detailTab==='history' ? '#e3f2fd' : '#f8f9fa', fontWeight: 600, color: '#1976d2', cursor: 'pointer' }}>Lịch sử</button>
              <button onClick={() => setDetailCourse(null)} style={{ marginLeft: 'auto', padding: '8px 18px', borderRadius: 8, border: 'none', background: '#eee', color: '#333', fontWeight: 600, cursor: 'pointer' }}>✖ Đóng</button>
            </div>
            {/* Tab content */}
            {detailTab==='info' && (
              <div>
                <div style={{ marginBottom: 8 }}><b>Mô tả ngắn:</b> {detailCourse.short_description}</div>
                <div style={{ marginBottom: 8 }}><b>Mô tả chi tiết:</b> {detailCourse.detailed_description}</div>
                <div style={{ marginBottom: 8 }}><b>Yêu cầu đầu vào:</b> {detailCourse.requirements}</div>
                <div style={{ marginBottom: 8 }}><b>Mục tiêu:</b> {detailCourse.objectives}</div>
                <div style={{ marginBottom: 8 }}><b>Thời lượng:</b> {detailCourse.duration_weeks} tuần, {detailCourse.sessions_per_week} buổi/tuần, {detailCourse.hours_per_session}h/buổi</div>
              </div>
            )}
            {detailTab==='lessons' && (
              <div style={{ color: '#888' }}>Đang phát triển...</div>
            )}
            {detailTab==='materials' && (
              <div style={{ color: '#888' }}>Đang phát triển...</div>
            )}
            {detailTab==='history' && (
              <div>
                {loadingHistory && <div>⏳ Đang tải lịch sử...</div>}
                {!loadingHistory && history.length === 0 && <div style={{ color: '#888' }}>Không có lịch sử thay đổi</div>}
                {!loadingHistory && history.length > 0 && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {history.map((h, idx) => (
                      <div key={idx} style={{ background: '#f8f9fa', borderRadius: 8, padding: 12, border: '1px solid #eee' }}>
                        <div style={{ fontWeight: 600, marginBottom: 4 }}>
                          {h.changed_by_name || 'Unknown'} - {h.action}
                        </div>
                        <div style={{ color: '#555', fontSize: 14 }}>
                          {h.field_changed ? `${h.field_changed}: ${h.old_value} → ${h.new_value}` : ''}
                          {h.reason ? ` (${h.reason})` : ''}
                        </div>
                        <div style={{ color: '#888', fontSize: 13, marginTop: 2 }}>{new Date(h.changed_at).toLocaleString('vi-VN')}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

CourseManagementPanel.propTypes = {
  refreshToken: PropTypes.number
};

export default CourseManagementPanel;
