import React, { useEffect, useState } from 'react';
import { getClasses, createClass, updateClass } from '../../api/classApi';
import ClassList from './ClassList';
import ClassForm from './ClassForm';
import ClassDetail from './ClassDetail';

export default function ClassManagementPanel() {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  // Filters
  const [courseView, setCourseView] = useState('current'); // 'current' | 'old'
  const [keyword, setKeyword] = useState('');

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
          // refresh
          await load();
          setShowForm(false);
          // open newly created class detail
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

  return (
    <div className="class-management">
      <h2 style={{ marginBottom: 8 }}>Quản lý khoá học</h2>
      {/* Controls: Khoá học (hiện tại | cũ) + tìm kiếm + Thêm khoá học mới */}
      <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap', marginBottom: 12 }}>
        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          <span style={{ fontWeight: 600 }}>Khoá học:</span>
          <button
            onClick={() => setCourseView('current')}
            style={{ padding: '6px 10px', borderRadius: 20, border: '1px solid #ddd', background: courseView==='current' ? '#e0e7ff' : '#fff' }}
          >Hiện tại</button>
          <button
            onClick={() => setCourseView('old')}
            style={{ padding: '6px 10px', borderRadius: 20, border: '1px solid #ddd', background: courseView==='old' ? '#ffe4e6' : '#fff' }}
          >Cũ</button>
        </div>
        <input
          placeholder="Tìm kiếm tên/level"
          value={keyword}
          onChange={(e)=> setKeyword(e.target.value)}
          onBlur={load}
          style={{ padding: '6px 10px', borderRadius: 8, border: '1px solid #ddd', minWidth: 220 }}
        />
        <button onClick={load} style={{ padding: '6px 12px', borderRadius: 8, border: '1px solid #ddd' }}>Lọc</button>
        <div style={{ marginLeft: 'auto' }}>
          <button onClick={() => { setEditingClass(null); setShowForm(true); }} style={{ padding: '6px 12px', borderRadius: 8, background: '#4f46e5', color: '#fff', border: 'none' }}>{showForm ? 'Đóng' : 'Thêm khoá học mới'}</button>
        </div>
      </div>

  {showForm && <ClassForm onSubmit={handleCreate} onCancel={() => { setShowForm(false); setEditingClass(null); }} initialData={editingClass} />}

      {loading ? (
        <div>Đang tải...</div>
      ) : (
        <>
          <ClassList classes={classes} refresh={load} onSelectClass={(id) => setSelectedClassId(id)} onEdit={handleEdit} />
          {selectedClassId && (
            <div style={{ marginTop: 16 }}>
              <ClassDetail classId={selectedClassId} onDone={() => { setSelectedClassId(null); load(); }} />
            </div>
          )}
        </>
      )}
    </div>
  );
}
