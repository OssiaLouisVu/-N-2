import React, { useEffect, useState } from 'react';
import { getClasses, createClass, updateClass } from '../../api/classApi';
import ClassList from './ClassList';
import ClassForm from './ClassForm';
import ClassDetail from './ClassDetail';

// Định nghĩa Styles cho các nút View Mode (giúp code gọn hơn)
const VIEW_BUTTON_STYLES = {
  base: {
    padding: '8px 16px',
    borderRadius: 8,
    border: '1px solid transparent',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.2s',
    fontSize: 14,
    minWidth: 100,
    textAlign: 'center',
    boxSizing: 'border-box',
  },
  active: {
    backgroundColor: '#4f46e5', // Xanh đậm chủ đạo
    color: '#fff',
    boxShadow: '0 4px 8px rgba(79, 70, 229, 0.4)',
    borderColor: '#4f46e5',
  },
  inactive: {
    backgroundColor: '#fff',
    color: '#4b5563',
    borderColor: '#d1d5db',
    boxShadow: 'none',
  },
};

export default function ClassManagementPanel() {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  // Filters
  const [courseView, setCourseView] = useState('current'); // 'current' | 'old'
  const [keyword, setKeyword] = useState('');

  // ----------------------------------------------------
  // KHÔNG CHẠM VÀO LOGIC: Giữ nguyên các hàm logic
  // ----------------------------------------------------

  async function load() {
    setLoading(true);
    try {
      const res = await getClasses({ status: courseView, q: keyword });
      if (res && res.classes) setClasses(res.classes);
    } catch (err) {
      console.error('Load classes failed', err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, [courseView]);

  async function handleCreate(payload) {
    try {
      if (editingClass) {
        const res = await updateClass(editingClass.id, payload);
        if (res && res.success) {
          await load();
          setShowForm(false);
          setEditingClass(null);
          setSelectedClassId(editingClass.id);
        }
      } else {
        const res = await createClass(payload);
        if (res && res.id) {
          await load();
          setShowForm(false);
          setSelectedClassId(res.id);
        }
      }
    } catch (err) {
      console.error('Create class failed', err);
    }
  }

  const [selectedClassId, setSelectedClassId] = useState(null);
  const [editingClass, setEditingClass] = useState(null);

  function handleEdit(c) {
    setEditingClass(c);
    setShowForm(true);
  }
  
  // ----------------------------------------------------
  // BẮT ĐẦU CODE GIAO DIỆN ĐẸP VÀ GỌN
  // ----------------------------------------------------

  return (
    <div className="class-management" style={{ padding: '0 10px' }}>
      
      {/* HEADER & ADD NEW BUTTON */}
      <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          marginBottom: 20 
      }}>
        <h2 style={{ fontSize: 22, fontWeight: 700, color: '#1f2937' }}>
          Quản lý lớp học
        </h2>
        
        {/* Nút THÊM LỚP MỚI */}
        <button 
          onClick={() => { setEditingClass(null); setShowForm((s) => !s); }}
          style={{ 
            padding: '10px 24px', 
            borderRadius: 8, 
            background: showForm ? '#dc2626' : '#4f46e5', // Đổi màu khi mở form
            color: '#fff', 
            border: 'none',
            fontWeight: 600,
            fontSize: 15,
            cursor: 'pointer',
            boxShadow: '0 4px 10px rgba(79, 70, 229, 0.3)'
          }}
        >
          {showForm ? '✖ Đóng Form' : '➕ Thêm lớp học mới'}
        </button>
      </div>

      {/* FILTER PANEL */}
      <div style={{ 
          padding: '16px',
          backgroundColor: '#ffffff', 
          borderRadius: 12,
          border: '1px solid #e5e7eb',
          marginBottom: 24,
      }}>
        
        {/* ROW 1: VIEW MODE (Lớp Hiện tại / Lớp Cũ) */}
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 15, gap: 20 }}>
          
          <span style={{ fontWeight: 600, color: '#374151' }}>Chế độ xem:</span>
          
          <div style={{ display: 'flex', gap: 10 }}>
            {/* Hiện tại */}
            <button
              onClick={() => setCourseView('current')}
              style={{
                ...VIEW_BUTTON_STYLES.base,
                ...(courseView === 'current' ? VIEW_BUTTON_STYLES.active : VIEW_BUTTON_STYLES.inactive),
              }}
            >
              Hiện tại
            </button>
            
            {/* Lớp Cũ */}
            <button
              onClick={() => setCourseView('old')}
              style={{
                ...VIEW_BUTTON_STYLES.base,
                ...(courseView === 'old' 
                    ? {...VIEW_BUTTON_STYLES.active, backgroundColor: '#f97316', borderColor: '#f97316'} // Cam cho Lớp Cũ
                    : VIEW_BUTTON_STYLES.inactive),
              }}
            >
              Lớp Cũ
            </button>
          </div>
        </div>
        
        {/* ROW 2: SEARCH AND FILTER BUTTON (Gom Lọc và Tìm kiếm lại gần nhau) */}
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          
          <span style={{ fontWeight: 600, color: '#374151', minWidth: 80 }}>Tìm kiếm:</span>
          
          <input
            placeholder="🔍 Tên lớp, level..."
            value={keyword}
            onChange={(e)=> setKeyword(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') load(); }}
            style={{ 
              padding: '10px 14px', 
              borderRadius: 8, 
              border: '1px solid #d1d5db', 
              flexGrow: 1,
              maxWidth: 350,
              fontSize: 14,
              boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.05)'
            }}
          />
          
          <button 
            onClick={load} 
            style={{ 
              padding: '10px 20px', 
              borderRadius: 8, 
              backgroundColor: '#10b981', // Màu xanh lá cho nút hành động
              color: '#fff',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'background-color 0.2s',
              fontSize: 14,
              border: 'none',
            }}
          >
            Áp dụng
          </button>
        </div>
      </div>

      {/* CLASS FORM (CREATE/EDIT) */}
      {showForm && (
        <div style={{ marginBottom: 30, border: '1px dashed #93c5fd', padding: 25, borderRadius: 12, backgroundColor: '#eff6ff' }}>
          <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 15, color: '#4f46e5' }}>
            {editingClass ? 'Sửa thông tin Lớp' : 'Tạo Lớp học Mới'}
          </h3>
          <ClassForm 
            onSubmit={handleCreate} 
            onCancel={() => { setShowForm(false); setEditingClass(null); }} 
            initialData={editingClass} 
          />
        </div>
      )}

      {/* CONTENT: LOADING / LIST / DETAIL */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '50px', fontSize: 16, color: '#6b7280' }}>
          Đang tải dữ liệu lớp học...
        </div>
      ) : (
        <>
          {classes.length === 0 && (
            <div style={{ textAlign: 'center', padding: '50px', fontSize: 16, color: '#9ca3af', border: '1px solid #e5e7eb', borderRadius: 8, backgroundColor: '#fff' }}>
                Chưa có lớp nào được tìm thấy theo điều kiện.
            </div>
          )}

          <ClassList
            classes={classes}
            refresh={load}
            onSelectClass={(id) => setSelectedClassId(id)}
            onEdit={handleEdit}
            readOnly={courseView === 'old'}
          />

          {selectedClassId && (
            <div style={{ 
              marginTop: 30, 
              padding: 28, 
              border: '1px solid #4f46e5', // Viền màu chính cho phần Detail
              borderRadius: 16, 
              backgroundColor: '#ffffff',
              boxShadow: '0 8px 16px rgba(0,0,0,0.08)'
            }}>
              <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 20, color: '#4f46e5', borderBottom: '2px solid #e0e7ff', paddingBottom: 10 }}>
                Chi tiết Lớp (ID: {selectedClassId})
              </h3>
              <ClassDetail 
                classId={selectedClassId} 
                onDone={() => { setSelectedClassId(null); load(); }} 
              />
            </div>
          )}
        </>
      )}
    </div>
  );
}