import { useState, useEffect } from 'react';import { useState, useEffect } from 'react';

import { useNavigate } from 'react-router-dom';import { useNavigate } from 'react-router-dom';



const API_BASE = 'http://localhost:5000/api'; // Backend APIconst API_BASE = 'http://localhost:5173/api'; // Sẽ call backend API



export default function FeeManagement() {export default function FeeManagement() {

  const navigate = useNavigate();  const navigate = useNavigate();

  const stored = JSON.parse(localStorage.getItem('currentUser'));  const stored = JSON.parse(localStorage.getItem('currentUser'));



  if (!stored) {  if (!stored) {

    window.location.href = '/login';    window.location.href = '/login';

    return null;    return null;

  }  }



  const [tab, setTab] = useState('create'); // create | payment | list  const [tab, setTab] = useState('create'); // create | payment | list

  const [students, setStudents] = useState([]);  const [students, setStudents] = useState([]);

  const [courses, setCourses] = useState([]);  const [paidStudents, setPaidStudents] = useState([]);

  const [invoices, setInvoices] = useState([]);  const [courses, setCourses] = useState([]);

  const [loading, setLoading] = useState(true);  const [loading, setLoading] = useState(true);



  // Form tạo hoá đơn  // Form tạo hoá đơn

  const [selectedStudent, setSelectedStudent] = useState(null);  const [selectedStudent, setSelectedStudent] = useState(null);

  const [formCreate, setFormCreate] = useState({  const [formData, setFormData] = useState({

    course_id: '',    course_id: '',

    amount: '',    amount: '',

  });    method: 'cash',

    note: ''

  // Form thanh toán  });

  const [selectedInvoice, setSelectedInvoice] = useState(null);  const [message, setMessage] = useState('');

  const [formPayment, setFormPayment] = useState({  const [submitting, setSubmitting] = useState(false);

    method: 'cash',

    note: '',  useEffect(() => {

  });    fetchData();

  }, [tab]);

  // Tab 3 filter + search

  const [filterStatus, setFilterStatus] = useState('all'); // all | pending | paid  async function fetchData() {

  const [searchText, setSearchText] = useState('');    setLoading(true);

    setMessage('');

  const [message, setMessage] = useState('');    try {

  const [submitting, setSubmitting] = useState(false);      if (tab === 'create') {

        const [studentsRes, coursesRes] = await Promise.all([

  useEffect(() => {          getUnpaidStudents(),

    fetchData();          getCourses()

  }, [tab]);        ]);

        setStudents(studentsRes || []);

  async function fetchData() {        setCourses(coursesRes || []);

    setLoading(true);      } else {

    setMessage('');        const paidRes = await getPaidStudents();

    try {        setPaidStudents(paidRes || []);

      if (tab === 'create') {      }

        const [studentsRes, coursesRes] = await Promise.all([    } catch (err) {

          fetch(`${API_BASE}/fee/students/new`).then(r => r.json()),      setMessage('❌ Lỗi tải dữ liệu');

          fetch(`${API_BASE}/fee/courses/active`).then(r => r.json()),      console.error(err);

        ]);    }

        setStudents(studentsRes.students || []);    setLoading(false);

        setCourses(coursesRes.courses || []);  }

      } else if (tab === 'payment') {

        const invoicesRes = await fetch(`${API_BASE}/fee/invoices/pending`).then(r => r.json());  async function handleCreateInvoice(e) {

        setInvoices(invoicesRes.invoices || []);    e.preventDefault();

      } else if (tab === 'list') {    

        const invoicesRes = await fetch(`${API_BASE}/fee/invoices/all`).then(r => r.json());    if (!selectedStudent || !formData.course_id || !formData.amount) {

        setInvoices(invoicesRes.invoices || []);      setMessage('⚠️ Vui lòng chọn học viên, khoá học và nhập số tiền');

      }      return;

    } catch (err) {    }

      setMessage('❌ Lỗi tải dữ liệu: ' + err.message);

      console.error(err);    if (isNaN(formData.amount) || parseFloat(formData.amount) <= 0) {

    }      setMessage('⚠️ Số tiền phải lớn hơn 0');

    setLoading(false);      return;

  }    }



  async function handleCreateInvoice(e) {    setSubmitting(true);

    e.preventDefault();    try {

      await createPayment({

    if (!selectedStudent || !formCreate.course_id || !formCreate.amount) {        student_id: selectedStudent.id,

      setMessage('⚠️ Vui lòng chọn học viên, khoá học và nhập số tiền');        course_id: parseInt(formData.course_id),

      return;        amount: parseFloat(formData.amount),

    }        method: formData.method,

        note: formData.note,

    if (isNaN(formCreate.amount) || parseFloat(formCreate.amount) <= 0) {      });

      setMessage('⚠️ Số tiền phải lớn hơn 0');

      return;      setMessage('✅ Tạo hoá đơn thành công! Học viên đã được cập nhật trạng thái PAID');

    }      setFormData({ course_id: '', amount: '', method: 'cash', note: '' });

      setSelectedStudent(null);

    setSubmitting(true);      

    try {      // Refresh danh sách sau 1s

      const res = await fetch(`${API_BASE}/fee/invoices`, {      setTimeout(() => fetchData(), 1000);

        method: 'POST',    } catch (err) {

        headers: { 'Content-Type': 'application/json' },      setMessage('❌ Lỗi: ' + (err.response?.data?.message || err.message));

        body: JSON.stringify({      console.error(err);

          student_id: selectedStudent.id,    } finally {

          course_id: parseInt(formCreate.course_id),      setSubmitting(false);

          amount: parseFloat(formCreate.amount),    }

        }),  }

      }).then(r => r.json());

  const handleLogout = () => {

      if (res.success) {    localStorage.removeItem('currentUser');

        setMessage('✅ Tạo hoá đơn thành công! (Trạng thái: PENDING)');    navigate('/login');

        setFormCreate({ course_id: '', amount: '' });  };

        setSelectedStudent(null);

        setTimeout(() => fetchData(), 1000);  return (

      } else {    <div style={{

        setMessage('❌ Lỗi: ' + (res.message || 'Không xác định'));      width: '100%',

      }      minHeight: '100vh',

    } catch (err) {      background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',

      setMessage('❌ Lỗi: ' + err.message);      paddingTop: 0,

      console.error(err);    }}>

    } finally {      {/* Header */}

      setSubmitting(false);      <div style={{

    }        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',

  }        color: '#fff',

        padding: '30px 20px',

  async function handleProcessPayment(e) {        boxShadow: '0 4px 20px rgba(0,0,0,0.1)',

    e.preventDefault();        marginBottom: 30,

      }}>

    if (!selectedInvoice) {        <div style={{

      setMessage('⚠️ Vui lòng chọn hoá đơn');          maxWidth: 1200,

      return;          margin: '0 auto',

    }          display: 'flex',

          justifyContent: 'space-between',

    setSubmitting(true);          alignItems: 'center',

    try {        }}>

      const res = await fetch(`${API_BASE}/fee/invoices/${selectedInvoice.id}/payment`, {          <div>

        method: 'PUT',            <h1 style={{ margin: 0, fontSize: 32, fontWeight: 'bold' }}>💳 Quản Lý Thu Học Phí</h1>

        headers: { 'Content-Type': 'application/json' },            <p style={{ margin: '5px 0 0 0', opacity: 0.9 }}>Xin chào, {stored?.username || 'Kế toán'}</p>

        body: JSON.stringify({          </div>

          method: formPayment.method,          <button

          note: formPayment.note,            onClick={handleLogout}

        }),            style={{

      }).then(r => r.json());              padding: '10px 20px',

              borderRadius: 8,

      if (res.success) {              background: '#ff6b6b',

        setMessage('✅ Thanh toán thành công! Học viên chuyển sang PAID');              color: '#fff',

        setFormPayment({ method: 'cash', note: '' });              border: 'none',

        setSelectedInvoice(null);              cursor: 'pointer',

        setTimeout(() => fetchData(), 1000);              fontWeight: 600,

      } else {              fontSize: 14,

        setMessage('❌ Lỗi: ' + (res.message || 'Không xác định'));            }}

      }          >

    } catch (err) {            🚪 Đăng xuất

      setMessage('❌ Lỗi: ' + err.message);          </button>

      console.error(err);        </div>

    } finally {      </div>

      setSubmitting(false);

    }      {/* Main Content */}

  }      <div style={{

        maxWidth: 1200,

  const handleLogout = () => {        margin: '0 auto',

    localStorage.removeItem('currentUser');        padding: '0 20px 40px',

    navigate('/login');      }}>

  };        {/* Tabs */}

        <div style={{

  return (          display: 'flex',

    <div style={{          gap: 10,

      width: '100%',          marginBottom: 20,

      minHeight: '100vh',          borderBottom: '2px solid #e0e0e0',

      background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',        }}>

      paddingTop: 0,          <button

    }}>            onClick={() => setTab('create')}

      {/* Header */}            style={{

      <div style={{              padding: '12px 24px',

        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',              background: tab === 'create' ? '#667eea' : '#fff',

        color: '#fff',              color: tab === 'create' ? '#fff' : '#333',

        padding: '30px 20px',              border: 'none',

        boxShadow: '0 4px 20px rgba(0,0,0,0.1)',              borderRadius: '8px 8px 0 0',

        marginBottom: 30,              cursor: 'pointer',

      }}>              fontWeight: 600,

        <div style={{              fontSize: 15,

          maxWidth: 1200,              transition: 'all 0.3s',

          margin: '0 auto',            }}

          display: 'flex',          >

          justifyContent: 'space-between',            📝 Tạo Hoá Đơn

          alignItems: 'center',          </button>

        }}>          <button

          <div>            onClick={() => setTab('paid')}

            <h1 style={{ margin: 0, fontSize: 32, fontWeight: 'bold' }}>💳 Quản Lý Thu Học Phí</h1>            style={{

            <p style={{ margin: '5px 0 0 0', opacity: 0.9 }}>Xin chào, {stored?.username || 'Kế toán'}</p>              padding: '12px 24px',

          </div>              background: tab === 'paid' ? '#667eea' : '#fff',

          <button              color: tab === 'paid' ? '#fff' : '#333',

            onClick={handleLogout}              border: 'none',

            style={{              borderRadius: '8px 8px 0 0',

              padding: '10px 20px',              cursor: 'pointer',

              borderRadius: 8,              fontWeight: 600,

              background: '#ff6b6b',              fontSize: 15,

              color: '#fff',              transition: 'all 0.3s',

              border: 'none',            }}

              cursor: 'pointer',          >

              fontWeight: 600,            ✅ Học Viên Đã Thanh Toán

              fontSize: 14,          </button>

            }}        </div>

          >

            🚪 Đăng xuất        {/* Message */}

          </button>        {message && (

        </div>          <div style={{

      </div>            padding: 15,

            borderRadius: 8,

      {/* Main Content */}            marginBottom: 20,

      <div style={{            background: message.includes('✅') ? '#d1fae5' : '#fee2e2',

        maxWidth: 1200,            color: message.includes('✅') ? '#065f46' : '#991b1b',

        margin: '0 auto',            fontSize: 14,

        padding: '0 20px 40px',            fontWeight: 500,

      }}>          }}>

        {/* Tabs */}            {message}

        <div style={{          </div>

          display: 'flex',        )}

          gap: 10,

          marginBottom: 20,        {/* Tab Content */}

          borderBottom: '2px solid #e0e0e0',        {tab === 'create' ? (

        }}>          <div style={{

          <button            background: '#fff',

            onClick={() => setTab('create')}            borderRadius: 12,

            style={{            padding: 30,

              padding: '12px 24px',            boxShadow: '0 4px 20px rgba(0,0,0,0.1)',

              background: tab === 'create' ? '#667eea' : '#fff',          }}>

              color: tab === 'create' ? '#fff' : '#333',            <h2 style={{ marginTop: 0, marginBottom: 20, fontSize: 20 }}>📝 Tạo Hoá Đơn Học Phí</h2>

              border: 'none',

              borderRadius: '8px 8px 0 0',            {loading ? (

              cursor: 'pointer',              <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>Đang tải dữ liệu...</div>

              fontWeight: 600,            ) : students.length === 0 ? (

              fontSize: 15,              <div style={{

              transition: 'all 0.3s',                textAlign: 'center',

            }}                padding: '60px 20px',

          >                background: '#f9fafb',

            📝 Tạo Hoá Đơn                borderRadius: 8,

          </button>                color: '#666',

          <button              }}>

            onClick={() => setTab('payment')}                <div style={{ fontSize: 48, marginBottom: 10 }}>✨</div>

            style={{                <div style={{ fontSize: 16, fontWeight: 500 }}>Không có học viên mới cần tạo hoá đơn</div>

              padding: '12px 24px',              </div>

              background: tab === 'payment' ? '#667eea' : '#fff',            ) : (

              color: tab === 'payment' ? '#fff' : '#333',              <div>

              border: 'none',                <div style={{ marginBottom: 24 }}>

              borderRadius: '8px 8px 0 0',                  <label style={{ display: 'block', marginBottom: 8, fontWeight: 600, fontSize: 14 }}>

              cursor: 'pointer',                    Chọn Học Viên (NEW)

              fontWeight: 600,                  </label>

              fontSize: 15,                  <div style={{

              transition: 'all 0.3s',                    display: 'grid',

            }}                    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',

          >                    gap: 12,

            💰 Thanh Toán                    maxHeight: '300px',

          </button>                    overflowY: 'auto',

          <button                  }}>

            onClick={() => setTab('list')}                    {students.map(student => (

            style={{                      <div

              padding: '12px 24px',                        key={student.id}

              background: tab === 'list' ? '#667eea' : '#fff',                        onClick={() => setSelectedStudent(student)}

              color: tab === 'list' ? '#fff' : '#333',                        style={{

              border: 'none',                          padding: 12,

              borderRadius: '8px 8px 0 0',                          border: selectedStudent?.id === student.id ? '2px solid #667eea' : '1px solid #e0e0e0',

              cursor: 'pointer',                          borderRadius: 8,

              fontWeight: 600,                          cursor: 'pointer',

              fontSize: 15,                          background: selectedStudent?.id === student.id ? '#f0f4ff' : '#fff',

              transition: 'all 0.3s',                          transition: 'all 0.2s',

            }}                        }}

          >                      >

            ✅ Danh Sách Tất Cả                        <div style={{ fontWeight: 600, fontSize: 14 }}>{student.name}</div>

          </button>                        <div style={{ fontSize: 12, color: '#666', marginTop: 4 }}>📞 {student.phone}</div>

        </div>                        <div style={{ fontSize: 12, color: '#666', marginTop: 2 }}>📧 {student.email}</div>

                      </div>

        {/* Message */}                    ))}

        {message && (                  </div>

          <div style={{                </div>

            padding: 15,

            borderRadius: 8,                {selectedStudent && (

            marginBottom: 20,                  <form onSubmit={handleCreateInvoice} style={{

            background: message.includes('✅') ? '#d1fae5' : '#fee2e2',                    background: '#f9fafb',

            color: message.includes('✅') ? '#065f46' : '#991b1b',                    padding: 20,

            fontSize: 14,                    borderRadius: 8,

            fontWeight: 500,                    marginTop: 20,

          }}>                  }}>

            {message}                    <div style={{ marginBottom: 16 }}>

          </div>                      <label style={{ display: 'block', marginBottom: 6, fontWeight: 600, fontSize: 14 }}>

        )}                        Học Viên Đã Chọn

                      </label>

        {/* TAB 1: TẠO HÓA ĐƠN */}                      <div style={{

        {tab === 'create' && (                        padding: 12,

          <div style={{                        background: '#fff',

            background: '#fff',                        borderRadius: 6,

            borderRadius: 12,                        border: '1px solid #e0e0e0',

            padding: 30,                        fontSize: 14,

            boxShadow: '0 4px 20px rgba(0,0,0,0.1)',                      }}>

          }}>                        <strong>{selectedStudent.name}</strong> - {selectedStudent.phone}

            <h2 style={{ marginTop: 0, marginBottom: 20, fontSize: 20 }}>📝 Tạo Hoá Đơn Học Phí</h2>                      </div>

            <p style={{ color: '#666', fontSize: 14, marginBottom: 20 }}>Tạo hoá đơn cho học viên mới (NEW). Hoá đơn sẽ có trạng thái PENDING</p>                    </div>



            {loading ? (                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>

              <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>⏳ Đang tải dữ liệu...</div>                      <div>

            ) : students.length === 0 ? (                        <label style={{ display: 'block', marginBottom: 6, fontWeight: 600, fontSize: 14 }}>

              <div style={{                          Khoá Học <span style={{ color: '#ef4444' }}>*</span>

                textAlign: 'center',                        </label>

                padding: '60px 20px',                        <select

                background: '#f9fafb',                          value={formData.course_id}

                borderRadius: 8,                          onChange={(e) => setFormData({ ...formData, course_id: e.target.value })}

                color: '#666',                          style={{

              }}>                            width: '100%',

                <div style={{ fontSize: 48, marginBottom: 10 }}>✨</div>                            padding: '10px 12px',

                <div style={{ fontSize: 16, fontWeight: 500 }}>Không có học viên mới cần tạo hoá đơn</div>                            borderRadius: 6,

              </div>                            border: '1px solid #d1d5db',

            ) : (                            fontSize: 14,

              <div>                          }}

                <div style={{ marginBottom: 24 }}>                        >

                  <label style={{ display: 'block', marginBottom: 8, fontWeight: 600, fontSize: 14 }}>                          <option value="">-- Chọn khoá học --</option>

                    Chọn Học Viên (Status = NEW)                          {courses.map(c => (

                  </label>                            <option key={c.id} value={c.id}>

                  <div style={{                              {c.name} ({c.level})

                    display: 'grid',                            </option>

                    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',                          ))}

                    gap: 12,                        </select>

                    maxHeight: '300px',                      </div>

                    overflowY: 'auto',

                  }}>                      <div>

                    {students.map(student => (                        <label style={{ display: 'block', marginBottom: 6, fontWeight: 600, fontSize: 14 }}>

                      <div                          Số Tiền (VNĐ) <span style={{ color: '#ef4444' }}>*</span>

                        key={student.id}                        </label>

                        onClick={() => setSelectedStudent(student)}                        <input

                        style={{                          type="number"

                          padding: 12,                          value={formData.amount}

                          border: selectedStudent?.id === student.id ? '2px solid #667eea' : '1px solid #e0e0e0',                          onChange={(e) => setFormData({ ...formData, amount: e.target.value })}

                          borderRadius: 8,                          placeholder="Ví dụ: 5000000"

                          cursor: 'pointer',                          style={{

                          background: selectedStudent?.id === student.id ? '#f0f4ff' : '#fff',                            width: '100%',

                          transition: 'all 0.2s',                            padding: '10px 12px',

                        }}                            borderRadius: 6,

                      >                            border: '1px solid #d1d5db',

                        <div style={{ fontWeight: 600, fontSize: 14 }}>{student.name}</div>                            fontSize: 14,

                        <div style={{ fontSize: 12, color: '#666', marginTop: 4 }}>📞 {student.phone}</div>                          }}

                        <div style={{ fontSize: 12, color: '#666', marginTop: 2 }}>📧 {student.email}</div>                        />

                      </div>                      </div>

                    ))}                    </div>

                  </div>

                </div>                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>

                      <div>

                {selectedStudent && (                        <label style={{ display: 'block', marginBottom: 6, fontWeight: 600, fontSize: 14 }}>

                  <form onSubmit={handleCreateInvoice} style={{                          Phương Thức Thanh Toán

                    background: '#f9fafb',                        </label>

                    padding: 20,                        <select

                    borderRadius: 8,                          value={formData.method}

                    marginTop: 20,                          onChange={(e) => setFormData({ ...formData, method: e.target.value })}

                  }}>                          style={{

                    <div style={{ marginBottom: 16 }}>                            width: '100%',

                      <label style={{ display: 'block', marginBottom: 6, fontWeight: 600, fontSize: 14 }}>                            padding: '10px 12px',

                        Học Viên Đã Chọn                            borderRadius: 6,

                      </label>                            border: '1px solid #d1d5db',

                      <div style={{                            fontSize: 14,

                        padding: 12,                          }}

                        background: '#fff',                        >

                        borderRadius: 6,                          <option value="cash">💵 Tiền Mặt</option>

                        border: '1px solid #e0e0e0',                          <option value="bank">🏦 Chuyển Khoản</option>

                        fontSize: 14,                          <option value="card">💳 Thẻ</option>

                      }}>                        </select>

                        <strong>{selectedStudent.name}</strong> - {selectedStudent.phone}                      </div>

                      </div>

                    </div>                      <div>

                        <label style={{ display: 'block', marginBottom: 6, fontWeight: 600, fontSize: 14 }}>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>                          Ghi Chú (Tùy Chọn)

                      <div>                        </label>

                        <label style={{ display: 'block', marginBottom: 6, fontWeight: 600, fontSize: 14 }}>                        <input

                          Khoá Học <span style={{ color: '#ef4444' }}>*</span>                          type="text"

                        </label>                          value={formData.note}

                        <select                          onChange={(e) => setFormData({ ...formData, note: e.target.value })}

                          value={formCreate.course_id}                          placeholder="Ví dụ: Thanh toán 50% học phí"

                          onChange={(e) => setFormCreate({ ...formCreate, course_id: e.target.value })}                          style={{

                          style={{                            width: '100%',

                            width: '100%',                            padding: '10px 12px',

                            padding: '10px 12px',                            borderRadius: 6,

                            borderRadius: 6,                            border: '1px solid #d1d5db',

                            border: '1px solid #d1d5db',                            fontSize: 14,

                            fontSize: 14,                          }}

                          }}                        />

                        >                      </div>

                          <option value="">-- Chọn khoá học ACTIVE --</option>                    </div>

                          {courses.map(c => (

                            <option key={c.id} value={c.id}>                    <div style={{ display: 'flex', gap: 10 }}>

                              {c.name} ({c.level})                      <button

                            </option>                        type="submit"

                          ))}                        disabled={submitting}

                        </select>                        style={{

                      </div>                          padding: '12px 24px',

                          borderRadius: 8,

                      <div>                          background: submitting ? '#9ca3af' : '#10b981',

                        <label style={{ display: 'block', marginBottom: 6, fontWeight: 600, fontSize: 14 }}>                          color: '#fff',

                          Số Tiền (VNĐ) <span style={{ color: '#ef4444' }}>*</span>                          border: 'none',

                        </label>                          cursor: submitting ? 'not-allowed' : 'pointer',

                        <input                          fontWeight: 600,

                          type="number"                          fontSize: 14,

                          value={formCreate.amount}                        }}

                          onChange={(e) => setFormCreate({ ...formCreate, amount: e.target.value })}                      >

                          placeholder="Ví dụ: 5000000"                        {submitting ? '⏳ Đang lưu...' : '💾 Tạo Hoá Đơn'}

                          style={{                      </button>

                            width: '100%',                      <button

                            padding: '10px 12px',                        type="button"

                            borderRadius: 6,                        onClick={() => {

                            border: '1px solid #d1d5db',                          setSelectedStudent(null);

                            fontSize: 14,                          setFormData({ course_id: '', amount: '', method: 'cash', note: '' });

                          }}                        }}

                        />                        style={{

                      </div>                          padding: '12px 24px',

                    </div>                          borderRadius: 8,

                          background: '#fff',

                    <div style={{ display: 'flex', gap: 10 }}>                          color: '#374151',

                      <button                          border: '1px solid #d1d5db',

                        type="submit"                          cursor: 'pointer',

                        disabled={submitting}                          fontWeight: 600,

                        style={{                          fontSize: 14,

                          padding: '12px 24px',                        }}

                          borderRadius: 8,                      >

                          background: submitting ? '#9ca3af' : '#10b981',                        ✖ Hủy

                          color: '#fff',                      </button>

                          border: 'none',                    </div>

                          cursor: submitting ? 'not-allowed' : 'pointer',                  </form>

                          fontWeight: 600,                )}

                          fontSize: 14,              </div>

                        }}            )}

                      >          </div>

                        {submitting ? '⏳ Đang lưu...' : '💾 Tạo Hoá Đơn (PENDING)'}        ) : (

                      </button>          <div style={{

                      <button            background: '#fff',

                        type="button"            borderRadius: 12,

                        onClick={() => {            padding: 30,

                          setSelectedStudent(null);            boxShadow: '0 4px 20px rgba(0,0,0,0.1)',

                          setFormCreate({ course_id: '', amount: '' });          }}>

                        }}            <h2 style={{ marginTop: 0, marginBottom: 20, fontSize: 20 }}>✅ Học Viên Đã Thanh Toán</h2>

                        style={{

                          padding: '12px 24px',            {loading ? (

                          borderRadius: 8,              <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>Đang tải dữ liệu...</div>

                          background: '#fff',            ) : paidStudents.length === 0 ? (

                          color: '#374151',              <div style={{

                          border: '1px solid #d1d5db',                textAlign: 'center',

                          cursor: 'pointer',                padding: '60px 20px',

                          fontWeight: 600,                background: '#f9fafb',

                          fontSize: 14,                borderRadius: 8,

                        }}                color: '#666',

                      >              }}>

                        ✖ Hủy                <div style={{ fontSize: 48, marginBottom: 10 }}>📭</div>

                      </button>                <div style={{ fontSize: 16, fontWeight: 500 }}>Chưa có học viên thanh toán</div>

                    </div>              </div>

                  </form>            ) : (

                )}              <div style={{ overflowX: 'auto' }}>

              </div>                <table style={{

            )}                  width: '100%',

          </div>                  borderCollapse: 'collapse',

        )}                }}>

                  <thead>

        {/* TAB 2: THANH TOÁN */}                    <tr style={{ background: '#f3f4f6', borderBottom: '2px solid #e5e7eb' }}>

        {tab === 'payment' && (                      <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, fontSize: 13 }}>Tên Học Viên</th>

          <div style={{                      <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, fontSize: 13 }}>Điện Thoại</th>

            background: '#fff',                      <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, fontSize: 13 }}>Email</th>

            borderRadius: 12,                      <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, fontSize: 13 }}>Trạng Thái</th>

            padding: 30,                    </tr>

            boxShadow: '0 4px 20px rgba(0,0,0,0.1)',                  </thead>

          }}>                  <tbody>

            <h2 style={{ marginTop: 0, marginBottom: 20, fontSize: 20 }}>💰 Thanh Toán Hoá Đơn</h2>                    {paidStudents.map((student) => (

            <p style={{ color: '#666', fontSize: 14, marginBottom: 20 }}>Chọn hoá đơn PENDING và xác nhận thanh toán. Học viên sẽ chuyển sang PAID</p>                      <tr key={student.id} style={{ borderBottom: '1px solid #f3f4f6' }}>

                        <td style={{ padding: '12px 16px', fontSize: 14, fontWeight: 500 }}>{student.name}</td>

            {loading ? (                        <td style={{ padding: '12px 16px', fontSize: 14 }}>{student.phone}</td>

              <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>⏳ Đang tải dữ liệu...</div>                        <td style={{ padding: '12px 16px', fontSize: 14 }}>{student.email}</td>

            ) : invoices.length === 0 ? (                        <td style={{ padding: '12px 16px', fontSize: 14 }}>

              <div style={{                          <span style={{

                textAlign: 'center',                            display: 'inline-block',

                padding: '60px 20px',                            padding: '4px 10px',

                background: '#f9fafb',                            borderRadius: 6,

                borderRadius: 8,                            background: '#d1fae5',

                color: '#666',                            color: '#065f46',

              }}>                            fontSize: 12,

                <div style={{ fontSize: 48, marginBottom: 10 }}>📭</div>                            fontWeight: 500,

                <div style={{ fontSize: 16, fontWeight: 500 }}>Không có hoá đơn chờ thanh toán</div>                          }}>

              </div>                            ✓ PAID

            ) : (                          </span>

              <div>                        </td>

                <div style={{ marginBottom: 24 }}>                      </tr>

                  <label style={{ display: 'block', marginBottom: 8, fontWeight: 600, fontSize: 14 }}>                    ))}

                    Chọn Hoá Đơn (Status = PENDING)                  </tbody>

                  </label>                </table>

                  <div style={{              </div>

                    display: 'grid',            )}

                    gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',          </div>

                    gap: 12,        )}

                    maxHeight: '350px',      </div>

                    overflowY: 'auto',    </div>

                  }}>  );

                    {invoices.map(inv => (}

                      <div
                        key={inv.id}
                        onClick={() => setSelectedInvoice(inv)}
                        style={{
                          padding: 12,
                          border: selectedInvoice?.id === inv.id ? '2px solid #667eea' : '1px solid #e0e0e0',
                          borderRadius: 8,
                          cursor: 'pointer',
                          background: selectedInvoice?.id === inv.id ? '#f0f4ff' : '#fff',
                          transition: 'all 0.2s',
                        }}
                      >
                        <div style={{ fontWeight: 600, fontSize: 14 }}>HĐ #{inv.id}</div>
                        <div style={{ fontSize: 12, color: '#666', marginTop: 4 }}>👤 {inv.student_name}</div>
                        <div style={{ fontSize: 12, color: '#666', marginTop: 2 }}>📚 {inv.course_name}</div>
                        <div style={{ fontSize: 13, fontWeight: 600, color: '#10b981', marginTop: 6 }}>
                          💰 {Number(inv.amount || 0).toLocaleString('vi-VN')} đ
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {selectedInvoice && (
                  <form onSubmit={handleProcessPayment} style={{
                    background: '#f9fafb',
                    padding: 20,
                    borderRadius: 8,
                    marginTop: 20,
                  }}>
                    <div style={{ marginBottom: 16 }}>
                      <label style={{ display: 'block', marginBottom: 6, fontWeight: 600, fontSize: 14 }}>
                        Hoá Đơn Đã Chọn
                      </label>
                      <div style={{
                        padding: 12,
                        background: '#fff',
                        borderRadius: 6,
                        border: '1px solid #e0e0e0',
                        fontSize: 14,
                      }}>
                        <div><strong>HĐ #{selectedInvoice.id}</strong> - {selectedInvoice.student_name}</div>
                        <div style={{ marginTop: 8, color: '#666' }}>
                          💰 Số tiền: <strong>{Number(selectedInvoice.amount || 0).toLocaleString('vi-VN')} đ</strong>
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                      <div>
                        <label style={{ display: 'block', marginBottom: 6, fontWeight: 600, fontSize: 14 }}>
                          Phương Thức Thanh Toán <span style={{ color: '#ef4444' }}>*</span>
                        </label>
                        <select
                          value={formPayment.method}
                          onChange={(e) => setFormPayment({ ...formPayment, method: e.target.value })}
                          style={{
                            width: '100%',
                            padding: '10px 12px',
                            borderRadius: 6,
                            border: '1px solid #d1d5db',
                            fontSize: 14,
                          }}
                        >
                          <option value="cash">💵 Tiền Mặt</option>
                          <option value="bank">🏦 Chuyển Khoán</option>
                          <option value="card">💳 Thẻ</option>
                          <option value="other">📱 Khác</option>
                        </select>
                      </div>

                      <div>
                        <label style={{ display: 'block', marginBottom: 6, fontWeight: 600, fontSize: 14 }}>
                          Ghi Chú (Tùy Chọn)
                        </label>
                        <input
                          type="text"
                          value={formPayment.note}
                          onChange={(e) => setFormPayment({ ...formPayment, note: e.target.value })}
                          placeholder="Ví dụ: Thanh toán đủ học phí"
                          style={{
                            width: '100%',
                            padding: '10px 12px',
                            borderRadius: 6,
                            border: '1px solid #d1d5db',
                            fontSize: 14,
                          }}
                        />
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: 10 }}>
                      <button
                        type="submit"
                        disabled={submitting}
                        style={{
                          padding: '12px 24px',
                          borderRadius: 8,
                          background: submitting ? '#9ca3af' : '#10b981',
                          color: '#fff',
                          border: 'none',
                          cursor: submitting ? 'not-allowed' : 'pointer',
                          fontWeight: 600,
                          fontSize: 14,
                        }}
                      >
                        {submitting ? '⏳ Đang xử lý...' : '✅ Xác Nhận Thanh Toán (→ PAID)'}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedInvoice(null);
                          setFormPayment({ method: 'cash', note: '' });
                        }}
                        style={{
                          padding: '12px 24px',
                          borderRadius: 8,
                          background: '#fff',
                          color: '#374151',
                          border: '1px solid #d1d5db',
                          cursor: 'pointer',
                          fontWeight: 600,
                          fontSize: 14,
                        }}
                      >
                        ✖ Hủy
                      </button>
                    </div>
                  </form>
                )}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: DANH SÁCH TẤT CẢ */}
        {tab === 'list' && (
          <div style={{
            background: '#fff',
            borderRadius: 12,
            padding: 30,
            boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
          }}>
            <h2 style={{ marginTop: 0, marginBottom: 20, fontSize: 20 }}>📋 Danh Sách Tất Cả Hoá Đơn</h2>
            <p style={{ color: '#666', fontSize: 14, marginBottom: 20 }}>Xem tất cả hoá đơn (PENDING + PAID). Tìm kiếm và lọc theo trạng thái</p>

            {loading ? (
              <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>⏳ Đang tải dữ liệu...</div>
            ) : invoices.length === 0 ? (
              <div style={{
                textAlign: 'center',
                padding: '60px 20px',
                background: '#f9fafb',
                borderRadius: 8,
                color: '#666',
              }}>
                <div style={{ fontSize: 48, marginBottom: 10 }}>📭</div>
                <div style={{ fontSize: 16, fontWeight: 500 }}>Chưa có hoá đơn nào</div>
              </div>
            ) : (
              <div>
                {/* Search + Filter */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 200px',
                  gap: 16,
                  marginBottom: 24,
                }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: 8, fontWeight: 600, fontSize: 14 }}>
                      🔍 Tìm Kiếm (Tên Học Viên / Tên Khoá Học / Số Tiền)
                    </label>
                    <input
                      type="text"
                      value={searchText}
                      onChange={(e) => setSearchText(e.target.value.toLowerCase())}
                      placeholder="Nhập để tìm kiếm..."
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        borderRadius: 6,
                        border: '1px solid #d1d5db',
                        fontSize: 14,
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', marginBottom: 8, fontWeight: 600, fontSize: 14 }}>
                      🏷️ Lọc Trạng Thái
                    </label>
                    <select
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        borderRadius: 6,
                        border: '1px solid #d1d5db',
                        fontSize: 14,
                      }}
                    >
                      <option value="all">Tất Cả</option>
                      <option value="pending">⏳ PENDING</option>
                      <option value="paid">✅ PAID</option>
                    </select>
                  </div>
                </div>

                {/* Filtered Results */}
                {(() => {
                  const filtered = invoices.filter(inv => {
                    const matchStatus = filterStatus === 'all' || inv.status?.toLowerCase() === filterStatus;
                    const matchSearch = searchText === '' || 
                      (inv.student_name || '').toLowerCase().includes(searchText) ||
                      (inv.course_name || '').toLowerCase().includes(searchText) ||
                      String(inv.amount || '').includes(searchText);
                    return matchStatus && matchSearch;
                  });

                  return filtered.length === 0 ? (
                    <div style={{
                      textAlign: 'center',
                      padding: '40px 20px',
                      background: '#f9fafb',
                      borderRadius: 8,
                      color: '#666',
                    }}>
                      <div style={{ fontSize: 40, marginBottom: 10 }}>🔎</div>
                      <div style={{ fontSize: 14, fontWeight: 500 }}>Không tìm thấy hoá đơn phù hợp</div>
                    </div>
                  ) : (
                    <div style={{ overflowX: 'auto' }}>
                      <table style={{
                        width: '100%',
                        borderCollapse: 'collapse',
                      }}>
                        <thead>
                          <tr style={{ background: '#f3f4f6', borderBottom: '2px solid #e5e7eb' }}>
                            <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, fontSize: 13 }}>HĐ #</th>
                            <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, fontSize: 13 }}>Học Viên</th>
                            <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, fontSize: 13 }}>Khoá Học</th>
                            <th style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 600, fontSize: 13 }}>Số Tiền</th>
                            <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, fontSize: 13 }}>Phương Thức</th>
                            <th style={{ padding: '12px 16px', textAlign: 'center', fontWeight: 600, fontSize: 13 }}>Trạng Thái</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filtered.map((inv) => {
                            const isPending = inv.status?.toUpperCase() === 'PENDING';
                            const isPaid = inv.status?.toUpperCase() === 'PAID';
                            return (
                              <tr key={inv.id} style={{ 
                                borderBottom: '1px solid #f3f4f6',
                                background: isPending ? '#fef3c7' : '#fff'
                              }}>
                                <td style={{ padding: '12px 16px', fontSize: 14, fontWeight: 600 }}>#{inv.id}</td>
                                <td style={{ padding: '12px 16px', fontSize: 14, fontWeight: 500 }}>{inv.student_name}</td>
                                <td style={{ padding: '12px 16px', fontSize: 14 }}>{inv.course_name}</td>
                                <td style={{ padding: '12px 16px', fontSize: 14, textAlign: 'right', fontWeight: 600, color: '#10b981' }}>
                                  {Number(inv.amount || 0).toLocaleString('vi-VN')} đ
                                </td>
                                <td style={{ padding: '12px 16px', fontSize: 14 }}>
                                  {isPaid ? (
                                    inv.method === 'cash' ? '💵 Tiền Mặt' : inv.method === 'bank' ? '🏦 Chuyển Khoán' : inv.method === 'card' ? '💳 Thẻ' : '📱 Khác'
                                  ) : (
                                    <span style={{ color: '#999', fontSize: 12 }}>-</span>
                                  )}
                                </td>
                                <td style={{ padding: '12px 16px', fontSize: 14, textAlign: 'center' }}>
                                  <span style={{
                                    display: 'inline-block',
                                    padding: '4px 10px',
                                    borderRadius: 6,
                                    background: isPending ? '#fcd34d' : '#d1fae5',
                                    color: isPending ? '#78350f' : '#065f46',
                                    fontSize: 12,
                                    fontWeight: 500,
                                  }}>
                                    {isPending ? '⏳ PENDING' : '✓ PAID'}
                                  </span>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  );
                })()}

                {/* Stats */}
                <div style={{
                  marginTop: 24,
                  padding: 16,
                  background: '#f3f4f6',
                  borderRadius: 8,
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                  gap: 12,
                }}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 24, fontWeight: 700, color: '#667eea' }}>
                      {invoices.length}
                    </div>
                    <div style={{ fontSize: 12, color: '#666', marginTop: 4 }}>Tổng Hoá Đơn</div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 24, fontWeight: 700, color: '#fbbf24' }}>
                      {invoices.filter(i => i.status?.toUpperCase() === 'PENDING').length}
                    </div>
                    <div style={{ fontSize: 12, color: '#666', marginTop: 4 }}>Chưa Thanh Toán</div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 24, fontWeight: 700, color: '#10b981' }}>
                      {invoices.filter(i => i.status?.toUpperCase() === 'PAID').length}
                    </div>
                    <div style={{ fontSize: 12, color: '#666', marginTop: 4 }}>Đã Thanh Toán</div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 24, fontWeight: 700, color: '#ef4444' }}>
                      {Number(invoices
                        .filter(i => i.status?.toUpperCase() === 'PENDING')
                        .reduce((sum, i) => sum + (Number(i.amount) || 0), 0)
                      ).toLocaleString('vi-VN')} đ
                    </div>
                    <div style={{ fontSize: 12, color: '#666', marginTop: 4 }}>Tổng Nợ</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
