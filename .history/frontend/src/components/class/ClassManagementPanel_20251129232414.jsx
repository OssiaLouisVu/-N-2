import React, { useEffect, useState } from 'react';
import { getClasses, createClass } from '../../api/classApi';
import ClassList from './ClassList';
import ClassForm from './ClassForm';

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
      const res = await createClass(payload);
      if (res && res.id) {
        // refresh
        await load();
        setShowForm(false);
      }
    } catch (err) {
      console.error('Create class failed', err);
    }
  }

  return (
    <div className="class-management">
      <h2>Quản lý lớp</h2>
      <div style={{ marginBottom: 12 }}>
        <button onClick={() => setShowForm((s) => !s)}>{showForm ? 'Đóng' : 'Tạo lớp mới'}</button>
      </div>

      {showForm && <ClassForm onSubmit={handleCreate} onCancel={() => setShowForm(false)} />}

      {loading ? <div>Đang tải...</div> : <ClassList classes={classes} refresh={load} />}
    </div>
  );
}
