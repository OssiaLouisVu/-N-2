import React, { useState, useEffect } from 'react';

// Cấu hình URL Backend
const API_URL = 'http://localhost:8080/api'; 

export default function ClassManagementPanel() {
  const [classes, setClasses] = useState([]);
  const [instructors, setInstructors] = useState([]);
  const [courses, setCourses] = useState([]);
  
  // State quản lý phần Học viên
  const [selectedClassId, setSelectedClassId] = useState(null); 
  const [studentsInClass, setStudentsInClass] = useState([]);   
  
  // Input form thêm học viên
  const [studentIdInput, setStudentIdInput] = useState('');     
  const [courseIdInput, setCourseIdInput] = useState(''); 

  // Form tạo lớp (Đã có sẵn trường room, startTime, endTime)
  const [formData, setFormData] = useState({
    name: '', teacher_id: '', dates: ['', '', '', '', ''], 
    startTime: '09:00', endTime: '11:00', room: 'P101', capacity: 20
  });

  // --- 1. LOAD DỮ LIỆU ---
  useEffect(() => { 
      loadData(); 
      loadInstructors(); 
      loadCourses(); 
  }, []);

  const loadData = async () => {
    try {
      const res = await fetch(`${API_URL}/classes`);
      const data = await res.json();
      if(data.success) setClasses(data.classes);
    } catch(e) {}
  };

 const loadInstructors = async () => {
    try {
      // 👇 BỎ tham số ?status=ACTIVE đi để lấy hết
      const res = await fetch(`${API_URL}/instructors`); 
      const data = await res.json();
      
      if(data.success) {
          // Lọc thủ công: Lấy cả NEW và ACTIVE (trừ những người đã nghỉ việc INACTIVE)
          const allInstructors = data.instructors || [];
          const validOnes = allInstructors.filter(i => i.status !== 'INACTIVE');
          setInstructors(validOnes);
      }
    } catch(e) { console.error("Lỗi tải GV:", e); }
  };

  const loadCourses = async () => {
    try {
      const res = await fetch(`${API_URL}/fee/courses/active`); 
      const data = await res.json();
      if(data.success) setCourses(data.courses || []);
    } catch(e) {}
  };

  // --- 2. LOGIC HỌC VIÊN ---
  const loadClassStudents = async (classId) => {
    setSelectedClassId(classId);
    setStudentsInClass([]); 
    try {
      const res = await fetch(`${API_URL}/classes/${classId}/students`);
      const data = await res.json();
      if(data.success) setStudentsInClass(data.students);
    } catch(e) { alert("Lỗi tải danh sách HV"); }
  };

  const handleAddStudent = async () => {
    if(!studentIdInput) return alert("Vui lòng nhập ID học viên!");
    if(!courseIdInput) return alert("Vui lòng chọn Khóa học để kiểm tra học phí!");

    try {
      const res = await fetch(`${API_URL}/classes/${selectedClassId}/assign`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
            studentId: studentIdInput,
            courseId: courseIdInput 
        })
      });
      const data = await res.json();
      
      if(data.success) {
        alert(data.message);
        setStudentIdInput('');
        loadClassStudents(selectedClassId); 
        loadData(); 
      } else {
        alert("❌ " + data.message); 
      }
    } catch(e) { alert("Lỗi kết nối server"); }
  };

  // --- 3. LOGIC TẠO LỚP ---
  const handleCreate = async () => {
    if (!formData.name.trim()) return alert("Chưa nhập tên lớp!");
    if (!formData.room.trim()) return alert("Chưa nhập phòng học!"); // Validate phòng
    if (formData.dates.some(d => d === '')) return alert("Vui lòng chọn đủ 5 ngày học!");

    try {
      const res = await fetch(`${API_URL}/classes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if(data.success) {
        alert("✅ Tạo lớp thành công!");
        loadData();
        // Reset form
        setFormData({ name: '', teacher_id: '', dates: ['', '', '', '', ''], startTime: '09:00', endTime: '11:00', room: 'P101', capacity: 20 });
      } else {
        alert("❌ " + data.message);
      }
    } catch(e) { alert("Lỗi tạo lớp"); }
  };

  const handleDelete = async (id) => {
    if(!window.confirm("CẢNH BÁO: Xóa lớp sẽ trả học viên về trạng thái NEW. Tiếp tục?")) return;
    try {
      const res = await fetch(`${API_URL}/classes/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if(data.success) {
        alert("✅ " + data.message);
        loadData();
        if(selectedClassId === id) setSelectedClassId(null);
      } else {
        alert("❌ " + data.message);
      }
    } catch(e) {}
  };

  return (
    <div style={{ padding: 20, background: '#f9fafb', borderRadius: 12, border: '1px solid #e5e7eb' }}>
      
      {/* --- FORM TẠO LỚP --- */}
      <div style={{ background: '#fff', padding: 20, borderRadius: 8, boxShadow: '0 2px 5px rgba(0,0,0,0.05)', marginBottom: 30 }}>
        <h3 style={{ color: '#4f46e5', marginTop: 0 }}>🛠 Tạo Lớp Mới (5 Buổi)</h3>
        
        {/* Tên & Giảng viên */}
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 15, marginBottom: 15 }}>
            <div>
                <label style={{fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 4}}>Tên Lớp</label>
                <input 
                    placeholder="VD: HSK1 - K55" 
                    value={formData.name} 
                    onChange={e => setFormData({...formData, name: e.target.value})} 
                    style={{padding:8, border:'1px solid #ccc', borderRadius:4, width: '100%'}} 
                />
            </div>
            <div>
                <label style={{fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 4}}>Giảng viên</label>
                <select 
                    value={formData.teacher_id} 
                    onChange={e => setFormData({...formData, teacher_id: e.target.value})} 
                    style={{padding:8, border:'1px solid #ccc', borderRadius:4, width: '100%'}}
                >
                    <option value="">-- Chọn GV (Không bắt buộc) --</option>
                    {instructors.map(gv => <option key={gv.id} value={gv.id}>{gv.full_name}</option>)}
                </select>
            </div>
        </div>

        {/* 5 Ngày học */}
        <label style={{fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 4}}>Chọn 5 Ngày học:</label>
        <div style={{ display: 'flex', gap: 5, marginBottom: 15, flexWrap: 'wrap' }}>
            {formData.dates.map((d, i) => (
                <div key={i} style={{flex: 1, minWidth: 120}}>
                    <input 
                        type="date" 
                        value={d} 
                        onChange={e => {const n=[...formData.dates]; n[i]=e.target.value; setFormData({...formData, dates:n})}} 
                        style={{padding:6, border:'1px solid #ddd', borderRadius:4, width: '100%'}} 
                    />
                </div>
            ))}
        </div>

        {/* 👇 [MỚI] Dòng nhập Giờ học & Phòng học */}
        <div style={{ display: 'flex', gap: 15, marginBottom: 20, alignItems: 'flex-end' }}>
            <div>
                <label style={{fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 4}}>Giờ Bắt đầu</label>
                <input 
                    type="time" 
                    value={formData.startTime} 
                    onChange={e => setFormData({...formData, startTime: e.target.value})} 
                    style={{padding:8, border:'1px solid #ccc', borderRadius:4}} 
                />
            </div>
            <div>
                <label style={{fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 4}}>Giờ Kết thúc</label>
                <input 
                    type="time" 
                    value={formData.endTime} 
                    onChange={e => setFormData({...formData, endTime: e.target.value})} 
                    style={{padding:8, border:'1px solid #ccc', borderRadius:4}} 
                />
            </div>
            <div style={{ flexGrow: 1 }}>
                <label style={{fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 4}}>Phòng học</label>
                <input 
                    type="text" 
                    placeholder="VD: Phòng 101, Lab 3..." 
                    value={formData.room} 
                    onChange={e => setFormData({...formData, room: e.target.value})} 
                    style={{padding:8, border:'1px solid #ccc', borderRadius:4, width: '100%'}} 
                />
            </div>
        </div>

        <button onClick={handleCreate} style={{width:'100%', padding:12, background:'#10b981', color:'#fff', border:'none', borderRadius:6, fontWeight:'bold', cursor:'pointer', fontSize: 14}}>
            + TẠO LỚP NGAY
        </button>
      </div>

      {/* --- DANH SÁCH LỚP --- */}
      <h3 style={{ borderBottom: '2px solid #e5e7eb', paddingBottom: 10, color: '#374151' }}>📚 Danh sách Lớp hiện tại</h3>
      
      <table style={{ width: '100%', background: '#fff', borderCollapse: 'collapse', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', borderRadius: 8, overflow: 'hidden' }}>
        <thead style={{ background: '#f3f4f6' }}>
          <tr>
            <th style={{padding:12, textAlign:'left'}}>ID</th>
            <th style={{padding:12, textAlign:'left'}}>Tên Lớp</th>
            <th style={{padding:12, textAlign:'left'}}>Thông tin</th>
            <th style={{padding:12, textAlign:'center'}}>Sĩ số</th>
            <th style={{padding:12, textAlign:'right'}}>Hành động</th>
          </tr>
        </thead>
        <tbody>
          {classes.length === 0 && <tr><td colSpan="5" style={{padding:20, textAlign:'center', color:'#888'}}>Chưa có lớp nào</td></tr>}
          
          {classes.map(cls => (
            <React.Fragment key={cls.id}>
              <tr style={{ borderBottom: '1px solid #eee', background: selectedClassId === cls.id ? '#eff6ff' : '#fff' }}>
                <td style={{padding:12}}>{cls.id}</td>
                <td style={{padding:12, fontWeight:'bold', color: '#2563eb'}}>{cls.name}</td>
                <td style={{padding:12, fontSize: 13, color: '#555'}}>
                   <div>👨‍🏫 {cls.teacher_name || 'Chưa gán'}</div>
                   <div style={{marginTop: 4}}>📅 {cls.start_date ? new Date(cls.start_date).toLocaleDateString('vi-VN') : ''}</div>
                </td>
                <td style={{padding:12, textAlign:'center'}}>
                    <span style={{background: '#dbeafe', color: '#1e40af', padding: '2px 8px', borderRadius: 12, fontSize: 12, fontWeight: 600}}>
                        {cls.student_count} / {cls.capacity}
                    </span>
                </td>
                <td style={{padding:12, textAlign:'right'}}>
                  <button onClick={() => loadClassStudents(cls.id)} style={{marginRight:8, padding:'6px 12px', background:'#3b82f6', color:'#fff', border:'none', borderRadius:4, cursor:'pointer', fontSize: 13}}>
                     👥 Học viên
                  </button>
                  <button onClick={() => handleDelete(cls.id)} style={{padding:'6px 12px', background:'#ef4444', color:'#fff', border:'none', borderRadius:4, cursor:'pointer', fontSize: 13}}>
                     🗑 Xóa
                  </button>
                </td>
              </tr>
              
              {/* --- KHU VỰC QUẢN LÝ HỌC VIÊN --- */}
              {selectedClassId === cls.id && (
                <tr>
                  <td colSpan="5" style={{ padding: 20, background: '#f8fafc', borderBottom:'2px solid #bfdbfe' }}>
                    <h4 style={{marginTop:0, color: '#333'}}>Danh sách Học viên lớp: <span style={{color: '#2563eb'}}>{cls.name}</span></h4>
                    
                    {/* Form Thêm HV */}
                    <div style={{background: '#fff', padding: 15, borderRadius: 6, border: '1px solid #e2e8f0', marginBottom: 15}}>
                        <p style={{marginTop: 0, marginBottom: 8, fontSize: 13, fontWeight: 600, color: '#475569'}}>Thêm học viên vào lớp (Yêu cầu đã thanh toán):</p>
                        <div style={{display:'flex', gap:10, alignItems: 'center', flexWrap: 'wrap'}}>
                            <input 
                                placeholder="Nhập ID (VD: 101)" 
                                value={studentIdInput}
                                onChange={e => setStudentIdInput(e.target.value)}
                                style={{padding:8, border:'1px solid #ccc', borderRadius:4, width: 120}}
                            />
                            
                            <select 
                                value={courseIdInput} 
                                onChange={e => setCourseIdInput(e.target.value)}
                                style={{padding:8, border:'1px solid #ccc', borderRadius:4, minWidth: 250, flex: 1}}
                            >
                                <option value="">-- Chọn Khóa học đã đóng tiền --</option>
                                {courses.map(c => (
                                    <option key={c.id} value={c.id}>{c.name} (Level: {c.level})</option> 
                                ))}
                            </select>

                            <button onClick={handleAddStudent} style={{padding:'8px 16px', background:'#22c55e', color:'#fff', border:'none', borderRadius:4, cursor:'pointer', fontWeight: 600}}>
                                + Kiểm tra & Thêm
                            </button>
                        </div>
                        <p style={{fontSize: 12, color: '#64748b', fontStyle: 'italic', margin: '5px 0 0 0'}}>
                            * Hệ thống sẽ tự động kiểm tra bảng hóa đơn. Nếu chưa có hóa đơn <b>PAID</b> cho khóa học này, học viên sẽ không được thêm vào.
                        </p>
                    </div>

                    {/* Danh sách hiển thị */}
                    {studentsInClass.length === 0 ? <p style={{color:'#666', fontStyle: 'italic'}}>Lớp hiện chưa có học viên nào.</p> : (
                        <div style={{background: '#fff', border: '1px solid #e2e8f0', borderRadius: 6, overflow: 'hidden'}}>
                            <table style={{width: '100%', borderCollapse: 'collapse'}}>
                                <thead style={{background: '#f1f5f9', fontSize: 13}}>
                                    <tr>
                                        <th style={{padding: 8, textAlign: 'left'}}>STT</th>
                                        <th style={{padding: 8, textAlign: 'left'}}>Tên Học viên</th>
                                        <th style={{padding: 8, textAlign: 'left'}}>Email</th>
                                        <th style={{padding: 8, textAlign: 'center'}}>Trạng thái</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {studentsInClass.map((st, idx) => (
                                        <tr key={st.id} style={{borderBottom: '1px solid #f1f5f9'}}>
                                            <td style={{padding: 8}}>{idx+1}</td>
                                            <td style={{padding: 8, fontWeight: 600}}>{st.full_name} <span style={{color: '#888', fontWeight: 400}}>(ID: {st.id})</span></td>
                                            <td style={{padding: 8}}>{st.email}</td>
                                            <td style={{padding: 8, textAlign: 'center'}}>
                                                <span style={{color: 'green', fontWeight: 'bold', fontSize: 12, background: '#dcfce7', padding: '2px 6px', borderRadius: 4}}>
                                                    {st.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                  </td>
                </tr>
              )}
            </React.Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
}