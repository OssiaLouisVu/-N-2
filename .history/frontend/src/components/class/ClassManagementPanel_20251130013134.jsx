import React, { useEffect, useState } from 'react';
import { getClasses, createClass, updateClass } from '../../api/classApi';
import ClassList from './ClassList';
import ClassForm from './ClassForm';
import ClassDetail from './ClassDetail';

export default function ClassManagementPanel() {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const res = await getClasses();
      if (res && res.classes) setClasses(res.classes);
    } catch (err) {
      console.error('Load classes failed', err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function handleCreate(payload) {
    try {
      if (editingClass) {
        // update
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
      console.error('Create/update class failed', err);
    }
  }

  const [selectedClassId, setSelectedClassId] = useState(null);
  const [editingClass, setEditingClass] = useState(null);

  return (
    <div className="class-management">
      <h2>Quản lý lớp</h2>
      <div style={{ marginBottom: 12 }}>
        <button onClick={() => setShowForm((s) => !s)}>{showForm ? 'Đóng' : 'Tạo lớp mới'}</button>
      </div>

  {showForm && <ClassForm initialData={editingClass} onSubmit={handleCreate} onCancel={() => { setShowForm(false); setEditingClass(null); }} />}

      {loading ? (
        <div>Đang tải...</div>
      ) : (
        <>
          <ClassList classes={classes} refresh={load} onSelectClass={(id) => setSelectedClassId(id)} onEdit={(c) => { setEditingClass(c); setShowForm(true); }} />
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
