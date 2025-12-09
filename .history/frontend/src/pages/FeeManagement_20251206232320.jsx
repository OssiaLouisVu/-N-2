import { useState, useEffect } from 'react';import { useState, useEffect } from 'react';import { useState, useEffect } from 'react';import { useState, useEffect } from 'react';import { useState, useEffect } from 'react';

import { useNavigate } from 'react-router-dom';

import { useNavigate } from 'react-router-dom';

const API_BASE = 'http://localhost:5000/api';

import { useNavigate } from 'react-router-dom';

export default function FeeManagement() {

  const navigate = useNavigate();const API_BASE = 'http://localhost:5000/api';

  const user = JSON.parse(localStorage.getItem('currentUser'));

import { useNavigate } from 'react-router-dom';import { useNavigate } from 'react-router-dom';

  if (!user) {

    navigate('/login');export default function FeeManagement() {

    return null;

  }  const navigate = useNavigate();const API_BASE = 'http://localhost:5000/api';



  const [tab, setTab] = useState('create');  const stored = JSON.parse(localStorage.getItem('currentUser'));

  const [students, setStudents] = useState([]);

  const [courses, setCourses] = useState([]);

  const [invoices, setInvoices] = useState([]);

  const [loading, setLoading] = useState(false);  if (!stored) {

  const [selectedStudent, setSelectedStudent] = useState(null);

  const [selectedInvoice, setSelectedInvoice] = useState(null);    window.location.href = '/login';export default function FeeManagement() {

  const [amount, setAmount] = useState('');

  const [courseId, setCourseId] = useState('');    return null;

  const [paymentMethod, setPaymentMethod] = useState('cash');

  const [paymentNote, setPaymentNote] = useState('');  }  const navigate = useNavigate();const API_BASE = 'http://localhost:5000/api'; // Backend APIconst API_BASE = 'http://localhost:5173/api'; // Sẽ call backend API

  const [message, setMessage] = useState('');

  const [submitting, setSubmitting] = useState(false);

  const [filterStatus, setFilterStatus] = useState('all');

  const [searchText, setSearchText] = useState('');  const [tab, setTab] = useState('create');  const stored = JSON.parse(localStorage.getItem('currentUser'));



  useEffect(() => {  const [students, setStudents] = useState([]);

    loadTabData();

  }, [tab]);  const [courses, setCourses] = useState([]);



  const loadTabData = async () => {  const [invoices, setInvoices] = useState([]);

    setLoading(true);

    setMessage('');  const [loading, setLoading] = useState(true);  if (!stored) {

    try {

      if (tab === 'create') {  const [selectedStudent, setSelectedStudent] = useState(null);

        const s = await fetch(`${API_BASE}/fee/students/new`).then(r => r.json());

        const c = await fetch(`${API_BASE}/fee/courses/active`).then(r => r.json());  const [formCreate, setFormCreate] = useState({ course_id: '', amount: '' });    window.location.href = '/login';export default function FeeManagement() {export default function FeeManagement() {

        setStudents(s.students || []);

        setCourses(c.courses || []);  const [selectedInvoice, setSelectedInvoice] = useState(null);

      } else if (tab === 'payment') {

        const inv = await fetch(`${API_BASE}/fee/invoices/pending`).then(r => r.json());  const [formPayment, setFormPayment] = useState({ method: 'cash', note: '' });    return null;

        setInvoices(inv.invoices || []);

      } else if (tab === 'list') {  const [filterStatus, setFilterStatus] = useState('all');

        const inv = await fetch(`${API_BASE}/fee/invoices/all`).then(r => r.json());

        setInvoices(inv.invoices || []);  const [searchText, setSearchText] = useState('');  }  const navigate = useNavigate();  const navigate = useNavigate();

      }

    } catch (e) {  const [message, setMessage] = useState('');

      setMessage('❌ Lỗi: ' + e.message);

    }  const [submitting, setSubmitting] = useState(false);

    setLoading(false);

  };



  const createInvoice = async (e) => {  useEffect(() => {  const [tab, setTab] = useState('create');  const stored = JSON.parse(localStorage.getItem('currentUser'));  const stored = JSON.parse(localStorage.getItem('currentUser'));

    e.preventDefault();

    if (!selectedStudent || !courseId || !amount) {    loadData();

      setMessage('⚠️ Vui lòng chọn đầy đủ');

      return;  }, [tab]);  const [students, setStudents] = useState([]);

    }

    setSubmitting(true);

    try {

      const res = await fetch(`${API_BASE}/fee/invoices`, {  const loadData = async () => {  const [courses, setCourses] = useState([]);

        method: 'POST',

        headers: { 'Content-Type': 'application/json' },    setLoading(true);

        body: JSON.stringify({

          student_id: selectedStudent.id,    setMessage('');  const [invoices, setInvoices] = useState([]);

          course_id: parseInt(courseId),

          amount: parseFloat(amount),    try {

        }),

      }).then(r => r.json());      if (tab === 'create') {  const [loading, setLoading] = useState(true);  if (!stored) {  if (!stored) {

      if (res.success) {

        setMessage('✅ Tạo hoá đơn thành công');        const res1 = await fetch(`${API_BASE}/fee/students/new`).then(r => r.json());

        setAmount('');

        setCourseId('');        const res2 = await fetch(`${API_BASE}/fee/courses/active`).then(r => r.json());  const [selectedStudent, setSelectedStudent] = useState(null);

        setSelectedStudent(null);

        setTimeout(() => loadTabData(), 1000);        setStudents(res1.students || []);

      } else {

        setMessage('❌ ' + (res.message || 'Lỗi'));        setCourses(res2.courses || []);  const [formCreate, setFormCreate] = useState({ course_id: '', amount: '' });    window.location.href = '/login';    window.location.href = '/login';

      }

    } catch (e) {      } else if (tab === 'payment') {

      setMessage('❌ ' + e.message);

    }        const res = await fetch(`${API_BASE}/fee/invoices/pending`).then(r => r.json());  const [selectedInvoice, setSelectedInvoice] = useState(null);

    setSubmitting(false);

  };        setInvoices(res.invoices || []);



  const processPayment = async (e) => {      } else if (tab === 'list') {  const [formPayment, setFormPayment] = useState({ method: 'cash', note: '' });    return null;    return null;

    e.preventDefault();

    if (!selectedInvoice) {        const res = await fetch(`${API_BASE}/fee/invoices/all`).then(r => r.json());

      setMessage('⚠️ Chọn hoá đơn');

      return;        setInvoices(res.invoices || []);  const [filterStatus, setFilterStatus] = useState('all');

    }

    setSubmitting(true);      }

    try {

      const res = await fetch(`${API_BASE}/fee/invoices/${selectedInvoice.id}/payment`, {    } catch (err) {  const [searchText, setSearchText] = useState('');  }  }

        method: 'PUT',

        headers: { 'Content-Type': 'application/json' },      setMessage('❌ Lỗi tải dữ liệu: ' + err.message);

        body: JSON.stringify({

          method: paymentMethod,      console.error(err);  const [message, setMessage] = useState('');

          note: paymentNote,

        }),    }

      }).then(r => r.json());

      if (res.success) {    setLoading(false);  const [submitting, setSubmitting] = useState(false);

        setMessage('✅ Thanh toán thành công');

        setPaymentMethod('cash');  };

        setPaymentNote('');

        setSelectedInvoice(null);

        setTimeout(() => loadTabData(), 1000);

      } else {  const handleCreateInvoice = async (e) => {

        setMessage('❌ ' + (res.message || 'Lỗi'));

      }    e.preventDefault();  useEffect(() => {  const [tab, setTab] = useState('create'); // create | payment | list  const [tab, setTab] = useState('create'); // create | payment | list

    } catch (e) {

      setMessage('❌ ' + e.message);    if (!selectedStudent || !formCreate.course_id || !formCreate.amount) {

    }

    setSubmitting(false);      setMessage('⚠️ Vui lòng chọn học viên, khoá học và nhập số tiền');    fetchData();

  };

      return;

  const handleLogout = () => {

    localStorage.removeItem('currentUser');    }  }, [tab]);  const [students, setStudents] = useState([]);  const [students, setStudents] = useState([]);

    navigate('/login');

  };    if (isNaN(formCreate.amount) || parseFloat(formCreate.amount) <= 0) {



  return (      setMessage('⚠️ Số tiền phải lớn hơn 0');

    <div style={{ minHeight: '100vh', background: '#f5f7fa', paddingBottom: 40 }}>

      <div style={{ background: 'linear-gradient(135deg, #667eea, #764ba2)', color: '#fff', padding: '20px', marginBottom: 30 }}>      return;

        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', justifyContent: 'space-between' }}>

          <h1>💳 Quản Lý Thu Học Phí</h1>    }  async function fetchData() {  const [courses, setCourses] = useState([]);  const [paidStudents, setPaidStudents] = useState([]);

          <button onClick={handleLogout} style={{ padding: '8px 16px', background: '#ff6b6b', border: 'none', color: '#fff', cursor: 'pointer', borderRadius: 6 }}>Đăng xuất</button>

        </div>    setSubmitting(true);

      </div>

    try {    setLoading(true);

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 20px' }}>

        <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>      const res = await fetch(`${API_BASE}/fee/invoices`, {

          <button onClick={() => setTab('create')} style={{ padding: '10px 20px', background: tab === 'create' ? '#667eea' : '#fff', color: tab === 'create' ? '#fff' : '#333', border: 'none', cursor: 'pointer', borderRadius: 6 }}>📝 Tạo Hoá Đơn</button>

          <button onClick={() => setTab('payment')} style={{ padding: '10px 20px', background: tab === 'payment' ? '#667eea' : '#fff', color: tab === 'payment' ? '#fff' : '#333', border: 'none', cursor: 'pointer', borderRadius: 6 }}>💰 Thanh Toán</button>        method: 'POST',    setMessage('');  const [invoices, setInvoices] = useState([]);  const [courses, setCourses] = useState([]);

          <button onClick={() => setTab('list')} style={{ padding: '10px 20px', background: tab === 'list' ? '#667eea' : '#fff', color: tab === 'list' ? '#fff' : '#333', border: 'none', cursor: 'pointer', borderRadius: 6 }}>📋 Danh Sách</button>

        </div>        headers: { 'Content-Type': 'application/json' },



        {message && <div style={{ padding: 15, borderRadius: 8, marginBottom: 20, background: message.includes('✅') ? '#d1fae5' : '#fee2e2', color: message.includes('✅') ? '#065f46' : '#991b1b' }}>{message}</div>}        body: JSON.stringify({    try {



        {tab === 'create' && (          student_id: selectedStudent.id,

          <div style={{ background: '#fff', padding: 30, borderRadius: 12 }}>

            <h2>📝 Tạo Hoá Đơn Học Phí</h2>          course_id: parseInt(formCreate.course_id),      if (tab === 'create') {  const [loading, setLoading] = useState(true);  const [loading, setLoading] = useState(true);

            {loading ? <p>Loading...</p> : students.length === 0 ? <p>Không có học viên NEW</p> : (

              <div>          amount: parseFloat(formCreate.amount),

                <div style={{ marginBottom: 20 }}>

                  <label style={{ fontWeight: 600, display: 'block', marginBottom: 10 }}>Chọn Học Viên</label>        }),        const [studentsRes, coursesRes] = await Promise.all([

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 10 }}>

                    {students.map(s => (      }).then(r => r.json());

                      <div key={s.id} onClick={() => setSelectedStudent(s)} style={{ padding: 10, border: selectedStudent?.id === s.id ? '2px solid #667eea' : '1px solid #e0e0e0', borderRadius: 6, cursor: 'pointer', background: selectedStudent?.id === s.id ? '#f0f4ff' : '#fff' }}>

                        <div style={{ fontWeight: 600 }}>{s.name}</div>      if (res.success) {          fetch(`${API_BASE}/fee/students/new`).then(r => r.json()),

                        <div style={{ fontSize: 12, color: '#666' }}>{s.phone}</div>

                      </div>        setMessage('✅ Tạo hoá đơn thành công! (Trạng thái: PENDING)');

                    ))}

                  </div>        setFormCreate({ course_id: '', amount: '' });          fetch(`${API_BASE}/fee/courses/active`).then(r => r.json()),

                </div>

                {selectedStudent && (        setSelectedStudent(null);

                  <form onSubmit={createInvoice} style={{ background: '#f9fafb', padding: 20, borderRadius: 8 }}>

                    <div style={{ marginBottom: 15 }}>        setTimeout(() => loadData(), 1000);        ]);  // Form tạo hoá đơn  // Form tạo hoá đơn

                      <label style={{ fontWeight: 600, display: 'block', marginBottom: 5 }}>Khoá Học *</label>

                      <select value={courseId} onChange={(e) => setCourseId(e.target.value)} style={{ width: '100%', padding: '8px 10px', borderRadius: 6, border: '1px solid #d1d5db' }}>      } else {

                        <option value="">-- Chọn --</option>

                        {courses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}        setMessage('❌ Lỗi: ' + (res.message || 'Không xác định'));        setStudents(studentsRes.students || []);

                      </select>

                    </div>      }

                    <div style={{ marginBottom: 15 }}>

                      <label style={{ fontWeight: 600, display: 'block', marginBottom: 5 }}>Số Tiền (VNĐ) *</label>    } catch (err) {        setCourses(coursesRes.courses || []);  const [selectedStudent, setSelectedStudent] = useState(null);  const [selectedStudent, setSelectedStudent] = useState(null);

                      <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="5000000" style={{ width: '100%', padding: '8px 10px', borderRadius: 6, border: '1px solid #d1d5db' }} />

                    </div>      setMessage('❌ Lỗi: ' + err.message);

                    <button type="submit" disabled={submitting} style={{ padding: '10px 20px', background: submitting ? '#9ca3af' : '#10b981', color: '#fff', border: 'none', cursor: 'pointer', borderRadius: 6, fontWeight: 600 }}>

                      {submitting ? 'Đang lưu...' : 'Tạo Hoá Đơn'}      console.error(err);      } else if (tab === 'payment') {

                    </button>

                  </form>    }

                )}

              </div>    setSubmitting(false);        const invoicesRes = await fetch(`${API_BASE}/fee/invoices/pending`).then(r => r.json());  const [formCreate, setFormCreate] = useState({  const [formData, setFormData] = useState({

            )}

          </div>  };

        )}

        setInvoices(invoicesRes.invoices || []);

        {tab === 'payment' && (

          <div style={{ background: '#fff', padding: 30, borderRadius: 12 }}>  const handlePayment = async (e) => {

            <h2>💰 Thanh Toán Hoá Đơn</h2>

            {loading ? <p>Loading...</p> : invoices.length === 0 ? <p>Không có hoá đơn PENDING</p> : (    e.preventDefault();      } else if (tab === 'list') {    course_id: '',    course_id: '',

              <div>

                <div style={{ marginBottom: 20 }}>    if (!selectedInvoice) {

                  <label style={{ fontWeight: 600, display: 'block', marginBottom: 10 }}>Chọn Hoá Đơn</label>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: 10 }}>      setMessage('⚠️ Vui lòng chọn hoá đơn');        const invoicesRes = await fetch(`${API_BASE}/fee/invoices/all`).then(r => r.json());

                    {invoices.map(inv => (

                      <div key={inv.id} onClick={() => setSelectedInvoice(inv)} style={{ padding: 10, border: selectedInvoice?.id === inv.id ? '2px solid #667eea' : '1px solid #e0e0e0', borderRadius: 6, cursor: 'pointer', background: selectedInvoice?.id === inv.id ? '#f0f4ff' : '#fff' }}>      return;

                        <div style={{ fontWeight: 600 }}>HĐ #{inv.id}</div>

                        <div style={{ fontSize: 12, color: '#666' }}>👤 {inv.student_name}</div>    }        setInvoices(invoicesRes.invoices || []);    amount: '',    amount: '',

                        <div style={{ fontSize: 13, fontWeight: 600, color: '#10b981', marginTop: 5 }}>💰 {Number(inv.amount || 0).toLocaleString('vi-VN')} đ</div>

                      </div>    setSubmitting(true);

                    ))}

                  </div>    try {      }

                </div>

                {selectedInvoice && (      const res = await fetch(`${API_BASE}/fee/invoices/${selectedInvoice.id}/payment`, {

                  <form onSubmit={processPayment} style={{ background: '#f9fafb', padding: 20, borderRadius: 8 }}>

                    <div style={{ marginBottom: 15 }}>        method: 'PUT',    } catch (err) {  });    method: 'cash',

                      <label style={{ fontWeight: 600 }}>Hoá Đơn: HĐ #{selectedInvoice.id} - {selectedInvoice.student_name}</label>

                    </div>        headers: { 'Content-Type': 'application/json' },

                    <div style={{ marginBottom: 15 }}>

                      <label style={{ fontWeight: 600, display: 'block', marginBottom: 5 }}>Phương Thức *</label>        body: JSON.stringify({      setMessage('❌ Lỗi tải dữ liệu: ' + err.message);

                      <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)} style={{ width: '100%', padding: '8px 10px', borderRadius: 6, border: '1px solid #d1d5db' }}>

                        <option value="cash">💵 Tiền Mặt</option>          method: formPayment.method,

                        <option value="bank">🏦 Chuyển Khoán</option>

                        <option value="card">💳 Thẻ</option>          note: formPayment.note,      console.error(err);    note: ''

                        <option value="other">📱 Khác</option>

                      </select>        }),

                    </div>

                    <div style={{ marginBottom: 15 }}>      }).then(r => r.json());    }

                      <label style={{ fontWeight: 600, display: 'block', marginBottom: 5 }}>Ghi Chú</label>

                      <input type="text" value={paymentNote} onChange={(e) => setPaymentNote(e.target.value)} placeholder="Ghi chú" style={{ width: '100%', padding: '8px 10px', borderRadius: 6, border: '1px solid #d1d5db' }} />      if (res.success) {

                    </div>

                    <button type="submit" disabled={submitting} style={{ padding: '10px 20px', background: submitting ? '#9ca3af' : '#10b981', color: '#fff', border: 'none', cursor: 'pointer', borderRadius: 6, fontWeight: 600 }}>        setMessage('✅ Thanh toán thành công! Học viên chuyển sang PAID');    setLoading(false);  // Form thanh toán  });

                      {submitting ? 'Đang xử lý...' : 'Xác Nhận Thanh Toán'}

                    </button>        setFormPayment({ method: 'cash', note: '' });

                  </form>

                )}        setSelectedInvoice(null);  }

              </div>

            )}        setTimeout(() => loadData(), 1000);

          </div>

        )}      } else {  const [selectedInvoice, setSelectedInvoice] = useState(null);  const [message, setMessage] = useState('');



        {tab === 'list' && (        setMessage('❌ Lỗi: ' + (res.message || 'Không xác định'));

          <div style={{ background: '#fff', padding: 30, borderRadius: 12 }}>

            <h2>📋 Danh Sách Tất Cả Hoá Đơn</h2>      }  async function handleCreateInvoice(e) {

            {loading ? <p>Loading...</p> : invoices.length === 0 ? <p>Chưa có hoá đơn</p> : (

              <div>    } catch (err) {

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 150px', gap: 15, marginBottom: 20 }}>

                  <div>      setMessage('❌ Lỗi: ' + err.message);    e.preventDefault();  const [formPayment, setFormPayment] = useState({  const [submitting, setSubmitting] = useState(false);

                    <label style={{ fontWeight: 600, display: 'block', marginBottom: 5 }}>🔍 Tìm Kiếm</label>

                    <input type="text" value={searchText} onChange={(e) => setSearchText(e.target.value.toLowerCase())} placeholder="Tên / Khoá" style={{ width: '100%', padding: '8px 10px', borderRadius: 6, border: '1px solid #d1d5db' }} />      console.error(err);

                  </div>

                  <div>    }    if (!selectedStudent || !formCreate.course_id || !formCreate.amount) {

                    <label style={{ fontWeight: 600, display: 'block', marginBottom: 5 }}>🏷️ Lọc</label>

                    <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} style={{ width: '100%', padding: '8px 10px', borderRadius: 6, border: '1px solid #d1d5db' }}>    setSubmitting(false);

                      <option value="all">Tất Cả</option>

                      <option value="pending">⏳ PENDING</option>  };      setMessage('⚠️ Vui lòng chọn học viên, khoá học và nhập số tiền');    method: 'cash',

                      <option value="paid">✅ PAID</option>

                    </select>

                  </div>

                </div>  const handleLogout = () => {      return;

                {(() => {

                  const filtered = invoices.filter(inv => {    localStorage.removeItem('currentUser');

                    const match1 = filterStatus === 'all' || inv.status?.toLowerCase() === filterStatus;

                    const match2 = searchText === '' || (inv.student_name || '').toLowerCase().includes(searchText) || (inv.course_name || '').toLowerCase().includes(searchText);    navigate('/login');    }    note: '',  useEffect(() => {

                    return match1 && match2;

                  });  };

                  if (filtered.length === 0) return <p>Không tìm thấy</p>;

                  return (    if (isNaN(formCreate.amount) || parseFloat(formCreate.amount) <= 0) {

                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>

                      <thead>  return (

                        <tr style={{ background: '#f3f4f6', borderBottom: '2px solid #e5e7eb' }}>

                          <th style={{ padding: '10px', textAlign: 'left' }}>HĐ #</th>    <div style={{      setMessage('⚠️ Số tiền phải lớn hơn 0');  });    fetchData();

                          <th style={{ padding: '10px', textAlign: 'left' }}>Học Viên</th>

                          <th style={{ padding: '10px', textAlign: 'left' }}>Khoá</th>      width: '100%',

                          <th style={{ padding: '10px', textAlign: 'right' }}>Số Tiền</th>

                          <th style={{ padding: '10px', textAlign: 'center' }}>Trạng Thái</th>      minHeight: '100vh',      return;

                        </tr>

                      </thead>      background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',

                      <tbody>

                        {filtered.map(inv => (      paddingTop: 0,    }  }, [tab]);

                          <tr key={inv.id} style={{ borderBottom: '1px solid #f3f4f6', background: inv.status?.toUpperCase() === 'PENDING' ? '#fef3c7' : '#fff' }}>

                            <td style={{ padding: '10px', fontWeight: 600 }}>#{inv.id}</td>    }}>

                            <td style={{ padding: '10px' }}>{inv.student_name}</td>

                            <td style={{ padding: '10px' }}>{inv.course_name}</td>      <div style={{    setSubmitting(true);

                            <td style={{ padding: '10px', textAlign: 'right', fontWeight: 600, color: '#10b981' }}>{Number(inv.amount || 0).toLocaleString('vi-VN')} đ</td>

                            <td style={{ padding: '10px', textAlign: 'center' }}>        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',

                              <span style={{ padding: '4px 8px', borderRadius: 4, background: inv.status?.toUpperCase() === 'PENDING' ? '#fcd34d' : '#d1fae5', color: inv.status?.toUpperCase() === 'PENDING' ? '#78350f' : '#065f46', fontSize: 11, fontWeight: 500 }}>

                                {inv.status?.toUpperCase() === 'PENDING' ? '⏳' : '✓'}        color: '#fff',    try {  // Tab 3 filter + search

                              </span>

                            </td>        padding: '30px 20px',

                          </tr>

                        ))}        boxShadow: '0 4px 20px rgba(0,0,0,0.1)',      const res = await fetch(`${API_BASE}/fee/invoices`, {

                      </tbody>

                    </table>        marginBottom: 30,

                  );

                })()}      }}>        method: 'POST',  const [filterStatus, setFilterStatus] = useState('all'); // all | pending | paid  async function fetchData() {

              </div>

            )}        <div style={{

          </div>

        )}          maxWidth: 1200,        headers: { 'Content-Type': 'application/json' },

      </div>

    </div>          margin: '0 auto',

  );

}          display: 'flex',        body: JSON.stringify({  const [searchText, setSearchText] = useState('');    setLoading(true);


          justifyContent: 'space-between',

          alignItems: 'center',          student_id: selectedStudent.id,

        }}>

          <div>          course_id: parseInt(formCreate.course_id),    setMessage('');

            <h1 style={{ margin: 0, fontSize: 32, fontWeight: 'bold' }}>💳 Quản Lý Thu Học Phí</h1>

            <p style={{ margin: '5px 0 0 0', opacity: 0.9 }}>Xin chào, {stored?.username || 'Kế toán'}</p>          amount: parseFloat(formCreate.amount),

          </div>

          <button onClick={handleLogout} style={{        }),  const [message, setMessage] = useState('');    try {

            padding: '10px 20px',

            borderRadius: 8,      }).then(r => r.json());

            background: '#ff6b6b',

            color: '#fff',      if (res.success) {  const [submitting, setSubmitting] = useState(false);      if (tab === 'create') {

            border: 'none',

            cursor: 'pointer',        setMessage('✅ Tạo hoá đơn thành công! (Trạng thái: PENDING)');

            fontWeight: 600,

            fontSize: 14,        setFormCreate({ course_id: '', amount: '' });        const [studentsRes, coursesRes] = await Promise.all([

          }}>

            🚪 Đăng xuất        setSelectedStudent(null);

          </button>

        </div>        setTimeout(() => fetchData(), 1000);  useEffect(() => {          getUnpaidStudents(),

      </div>

      } else {

      <div style={{

        maxWidth: 1200,        setMessage('❌ Lỗi: ' + (res.message || 'Không xác định'));    fetchData();          getCourses()

        margin: '0 auto',

        padding: '0 20px 40px',      }

      }}>

        <div style={{    } catch (err) {  }, [tab]);        ]);

          display: 'flex',

          gap: 10,      setMessage('❌ Lỗi: ' + err.message);

          marginBottom: 20,

          borderBottom: '2px solid #e0e0e0',      console.error(err);        setStudents(studentsRes || []);

        }}>

          <button    } finally {

            onClick={() => setTab('create')}

            style={{      setSubmitting(false);  async function fetchData() {        setCourses(coursesRes || []);

              padding: '12px 24px',

              background: tab === 'create' ? '#667eea' : '#fff',    }

              color: tab === 'create' ? '#fff' : '#333',

              border: 'none',  }    setLoading(true);      } else {

              borderRadius: '8px 8px 0 0',

              cursor: 'pointer',

              fontWeight: 600,

              fontSize: 15,  async function handleProcessPayment(e) {    setMessage('');        const paidRes = await getPaidStudents();

            }}

          >    e.preventDefault();

            📝 Tạo Hoá Đơn

          </button>    if (!selectedInvoice) {    try {        setPaidStudents(paidRes || []);

          <button

            onClick={() => setTab('payment')}      setMessage('⚠️ Vui lòng chọn hoá đơn');

            style={{

              padding: '12px 24px',      return;      if (tab === 'create') {      }

              background: tab === 'payment' ? '#667eea' : '#fff',

              color: tab === 'payment' ? '#fff' : '#333',    }

              border: 'none',

              borderRadius: '8px 8px 0 0',    setSubmitting(true);        const [studentsRes, coursesRes] = await Promise.all([    } catch (err) {

              cursor: 'pointer',

              fontWeight: 600,    try {

              fontSize: 15,

            }}      const res = await fetch(`${API_BASE}/fee/invoices/${selectedInvoice.id}/payment`, {          fetch(`${API_BASE}/fee/students/new`).then(r => r.json()),      setMessage('❌ Lỗi tải dữ liệu');

          >

            💰 Thanh Toán        method: 'PUT',

          </button>

          <button        headers: { 'Content-Type': 'application/json' },          fetch(`${API_BASE}/fee/courses/active`).then(r => r.json()),      console.error(err);

            onClick={() => setTab('list')}

            style={{        body: JSON.stringify({

              padding: '12px 24px',

              background: tab === 'list' ? '#667eea' : '#fff',          method: formPayment.method,        ]);    }

              color: tab === 'list' ? '#fff' : '#333',

              border: 'none',          note: formPayment.note,

              borderRadius: '8px 8px 0 0',

              cursor: 'pointer',        }),        setStudents(studentsRes.students || []);    setLoading(false);

              fontWeight: 600,

              fontSize: 15,      }).then(r => r.json());

            }}

          >      if (res.success) {        setCourses(coursesRes.courses || []);  }

            ✅ Danh Sách

          </button>        setMessage('✅ Thanh toán thành công! Học viên chuyển sang PAID');

        </div>

        setFormPayment({ method: 'cash', note: '' });      } else if (tab === 'payment') {

        {message && (

          <div style={{        setSelectedInvoice(null);

            padding: 15,

            borderRadius: 8,        setTimeout(() => fetchData(), 1000);        const invoicesRes = await fetch(`${API_BASE}/fee/invoices/pending`).then(r => r.json());  async function handleCreateInvoice(e) {

            marginBottom: 20,

            background: message.includes('✅') ? '#d1fae5' : '#fee2e2',      } else {

            color: message.includes('✅') ? '#065f46' : '#991b1b',

            fontSize: 14,        setMessage('❌ Lỗi: ' + (res.message || 'Không xác định'));        setInvoices(invoicesRes.invoices || []);    e.preventDefault();

            fontWeight: 500,

          }}>      }

            {message}

          </div>    } catch (err) {      } else if (tab === 'list') {    

        )}

      setMessage('❌ Lỗi: ' + err.message);

        {/* TAB 1: Tạo Hoá Đơn */}

        {tab === 'create' && (      console.error(err);        const invoicesRes = await fetch(`${API_BASE}/fee/invoices/all`).then(r => r.json());    if (!selectedStudent || !formData.course_id || !formData.amount) {

          <div style={{ background: '#fff', borderRadius: 12, padding: 30, boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}>

            <h2 style={{ marginTop: 0, marginBottom: 20, fontSize: 20 }}>📝 Tạo Hoá Đơn Học Phí</h2>    } finally {

            {loading ? (

              <p>⏳ Đang tải...</p>      setSubmitting(false);        setInvoices(invoicesRes.invoices || []);      setMessage('⚠️ Vui lòng chọn học viên, khoá học và nhập số tiền');

            ) : students.length === 0 ? (

              <p style={{ textAlign: 'center', padding: '60px 20px', color: '#666' }}>✨ Không có học viên NEW</p>    }

            ) : (

              <div>  }      }      return;

                <label style={{ display: 'block', marginBottom: 12, fontWeight: 600 }}>👥 Chọn Học Viên (NEW)</label>

                <div style={{

                  display: 'grid',

                  gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',  const handleLogout = () => {    } catch (err) {    }

                  gap: 12,

                  marginBottom: 24,    localStorage.removeItem('currentUser');

                }}>

                  {students.map(s => (    navigate('/login');      setMessage('❌ Lỗi tải dữ liệu: ' + err.message);

                    <div

                      key={s.id}  };

                      onClick={() => setSelectedStudent(s)}

                      style={{      console.error(err);    if (isNaN(formData.amount) || parseFloat(formData.amount) <= 0) {

                        padding: 12,

                        border: selectedStudent?.id === s.id ? '2px solid #667eea' : '1px solid #e0e0e0',  return (

                        borderRadius: 8,

                        cursor: 'pointer',    <div style={{    }      setMessage('⚠️ Số tiền phải lớn hơn 0');

                        background: selectedStudent?.id === s.id ? '#f0f4ff' : '#fff',

                      }}      width: '100%',

                    >

                      <div style={{ fontWeight: 600 }}>{s.name}</div>      minHeight: '100vh',    setLoading(false);      return;

                      <div style={{ fontSize: 12, color: '#666', marginTop: 4 }}>📞 {s.phone}</div>

                    </div>      background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',

                  ))}

                </div>      paddingTop: 0,  }    }

                {selectedStudent && (

                  <form onSubmit={handleCreateInvoice} style={{ background: '#f9fafb', padding: 20, borderRadius: 8 }}>    }}>

                    <div style={{ marginBottom: 16 }}>

                      <label style={{ fontWeight: 600 }}>Học Viên Đã Chọn</label>      <div style={{

                      <div style={{

                        padding: 12,        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',

                        background: '#fff',

                        borderRadius: 6,        color: '#fff',  async function handleCreateInvoice(e) {    setSubmitting(true);

                        marginTop: 6,

                        borderLeft: '4px solid #667eea',        padding: '30px 20px',

                      }}>

                        {selectedStudent.name}        boxShadow: '0 4px 20px rgba(0,0,0,0.1)',    e.preventDefault();    try {

                      </div>

                    </div>        marginBottom: 30,

                    <div style={{

                      display: 'grid',      }}>      await createPayment({

                      gridTemplateColumns: '1fr 1fr',

                      gap: 16,        <div style={{

                      marginBottom: 16,

                    }}>          maxWidth: 1200,    if (!selectedStudent || !formCreate.course_id || !formCreate.amount) {        student_id: selectedStudent.id,

                      <div>

                        <label style={{ fontWeight: 600, display: 'block', marginBottom: 6 }}>Khoá Học *</label>          margin: '0 auto',

                        <select

                          value={formCreate.course_id}          display: 'flex',      setMessage('⚠️ Vui lòng chọn học viên, khoá học và nhập số tiền');        course_id: parseInt(formData.course_id),

                          onChange={(e) => setFormCreate({ ...formCreate, course_id: e.target.value })}

                          style={{          justifyContent: 'space-between',

                            width: '100%',

                            padding: '10px 12px',          alignItems: 'center',      return;        amount: parseFloat(formData.amount),

                            borderRadius: 6,

                            border: '1px solid #d1d5db',        }}>

                          }}

                        >          <div>    }        method: formData.method,

                          <option value="">-- Chọn khoá --</option>

                          {courses.map(c => (            <h1 style={{ margin: 0, fontSize: 32, fontWeight: 'bold' }}>💳 Quản Lý Thu Học Phí</h1>

                            <option key={c.id} value={c.id}>{c.name}</option>

                          ))}            <p style={{ margin: '5px 0 0 0', opacity: 0.9 }}>Xin chào, {stored?.username || 'Kế toán'}</p>        note: formData.note,

                        </select>

                      </div>          </div>

                      <div>

                        <label style={{ fontWeight: 600, display: 'block', marginBottom: 6 }}>Số Tiền (VNĐ) *</label>          <button    if (isNaN(formCreate.amount) || parseFloat(formCreate.amount) <= 0) {      });

                        <input

                          type="number"            onClick={handleLogout}

                          value={formCreate.amount}

                          onChange={(e) => setFormCreate({ ...formCreate, amount: e.target.value })}            style={{      setMessage('⚠️ Số tiền phải lớn hơn 0');

                          placeholder="5000000"

                          style={{              padding: '10px 20px',

                            width: '100%',

                            padding: '10px 12px',              borderRadius: 8,      return;      setMessage('✅ Tạo hoá đơn thành công! Học viên đã được cập nhật trạng thái PAID');

                            borderRadius: 6,

                            border: '1px solid #d1d5db',              background: '#ff6b6b',

                          }}

                        />              color: '#fff',    }      setFormData({ course_id: '', amount: '', method: 'cash', note: '' });

                      </div>

                    </div>              border: 'none',

                    <button

                      type="submit"              cursor: 'pointer',      setSelectedStudent(null);

                      disabled={submitting}

                      style={{              fontWeight: 600,

                        padding: '12px 24px',

                        background: submitting ? '#9ca3af' : '#10b981',              fontSize: 14,    setSubmitting(true);      

                        color: '#fff',

                        border: 'none',            }}

                        borderRadius: 8,

                        cursor: 'pointer',          >    try {      // Refresh danh sách sau 1s

                        fontWeight: 600,

                      }}            🚪 Đăng xuất

                    >

                      {submitting ? '⏳ Đang lưu...' : '💾 Tạo Hoá Đơn'}          </button>      const res = await fetch(`${API_BASE}/fee/invoices`, {      setTimeout(() => fetchData(), 1000);

                    </button>

                  </form>        </div>

                )}

              </div>      </div>        method: 'POST',    } catch (err) {

            )}

          </div>

        )}

      <div style={{        headers: { 'Content-Type': 'application/json' },      setMessage('❌ Lỗi: ' + (err.response?.data?.message || err.message));

        {/* TAB 2: Thanh Toán */}

        {tab === 'payment' && (        maxWidth: 1200,

          <div style={{ background: '#fff', borderRadius: 12, padding: 30, boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}>

            <h2 style={{ marginTop: 0, marginBottom: 20, fontSize: 20 }}>💰 Thanh Toán Hoá Đơn</h2>        margin: '0 auto',        body: JSON.stringify({      console.error(err);

            {loading ? (

              <p>⏳ Đang tải...</p>        padding: '0 20px 40px',

            ) : invoices.length === 0 ? (

              <p style={{ textAlign: 'center', padding: '60px 20px', color: '#666' }}>📭 Không có hoá đơn PENDING</p>      }}>          student_id: selectedStudent.id,    } finally {

            ) : (

              <div>        <div style={{

                <label style={{ display: 'block', marginBottom: 12, fontWeight: 600 }}>📄 Chọn Hoá Đơn (PENDING)</label>

                <div style={{          display: 'flex',          course_id: parseInt(formCreate.course_id),      setSubmitting(false);

                  display: 'grid',

                  gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',          gap: 10,

                  gap: 12,

                  marginBottom: 24,          marginBottom: 20,          amount: parseFloat(formCreate.amount),    }

                }}>

                  {invoices.map(inv => (          borderBottom: '2px solid #e0e0e0',

                    <div

                      key={inv.id}        }}>        }),  }

                      onClick={() => setSelectedInvoice(inv)}

                      style={{          <button

                        padding: 12,

                        border: selectedInvoice?.id === inv.id ? '2px solid #667eea' : '1px solid #e0e0e0',            onClick={() => setTab('create')}      }).then(r => r.json());

                        borderRadius: 8,

                        cursor: 'pointer',            style={{

                        background: selectedInvoice?.id === inv.id ? '#f0f4ff' : '#fff',

                      }}              padding: '12px 24px',  const handleLogout = () => {

                    >

                      <div style={{ fontWeight: 600 }}>HĐ #{inv.id}</div>              background: tab === 'create' ? '#667eea' : '#fff',

                      <div style={{ fontSize: 12, color: '#666', marginTop: 4 }}>👤 {inv.student_name}</div>

                      <div style={{ fontSize: 13, fontWeight: 600, color: '#10b981', marginTop: 6 }}>              color: tab === 'create' ? '#fff' : '#333',      if (res.success) {    localStorage.removeItem('currentUser');

                        💰 {Number(inv.amount || 0).toLocaleString('vi-VN')} đ

                      </div>              border: 'none',

                    </div>

                  ))}              borderRadius: '8px 8px 0 0',        setMessage('✅ Tạo hoá đơn thành công! (Trạng thái: PENDING)');    navigate('/login');

                </div>

                {selectedInvoice && (              cursor: 'pointer',

                  <form onSubmit={handlePayment} style={{ background: '#f9fafb', padding: 20, borderRadius: 8 }}>

                    <div style={{ marginBottom: 16 }}>              fontWeight: 600,        setFormCreate({ course_id: '', amount: '' });  };

                      <label style={{ fontWeight: 600 }}>Hoá Đơn Đã Chọn</label>

                      <div style={{              fontSize: 15,

                        padding: 12,

                        background: '#fff',            }}        setSelectedStudent(null);

                        borderRadius: 6,

                        marginTop: 6,          >

                        borderLeft: '4px solid #667eea',

                      }}>            📝 Tạo Hoá Đơn        setTimeout(() => fetchData(), 1000);  return (

                        HĐ #{selectedInvoice.id} - {selectedInvoice.student_name}

                      </div>          </button>

                    </div>

                    <div style={{          <button      } else {    <div style={{

                      display: 'grid',

                      gridTemplateColumns: '1fr 1fr',            onClick={() => setTab('payment')}

                      gap: 16,

                      marginBottom: 16,            style={{        setMessage('❌ Lỗi: ' + (res.message || 'Không xác định'));      width: '100%',

                    }}>

                      <div>              padding: '12px 24px',

                        <label style={{ fontWeight: 600, display: 'block', marginBottom: 6 }}>Phương Thức *</label>

                        <select              background: tab === 'payment' ? '#667eea' : '#fff',      }      minHeight: '100vh',

                          value={formPayment.method}

                          onChange={(e) => setFormPayment({ ...formPayment, method: e.target.value })}              color: tab === 'payment' ? '#fff' : '#333',

                          style={{

                            width: '100%',              border: 'none',    } catch (err) {      background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',

                            padding: '10px 12px',

                            borderRadius: 6,              borderRadius: '8px 8px 0 0',

                            border: '1px solid #d1d5db',

                          }}              cursor: 'pointer',      setMessage('❌ Lỗi: ' + err.message);      paddingTop: 0,

                        >

                          <option value="cash">💵 Tiền Mặt</option>              fontWeight: 600,

                          <option value="bank">🏦 Chuyển Khoán</option>

                          <option value="card">💳 Thẻ</option>              fontSize: 15,      console.error(err);    }}>

                          <option value="other">📱 Khác</option>

                        </select>            }}

                      </div>

                      <div>          >    } finally {      {/* Header */}

                        <label style={{ fontWeight: 600, display: 'block', marginBottom: 6 }}>Ghi Chú</label>

                        <input            💰 Thanh Toán

                          type="text"

                          value={formPayment.note}          </button>      setSubmitting(false);      <div style={{

                          onChange={(e) => setFormPayment({ ...formPayment, note: e.target.value })}

                          placeholder="Ghi chú"          <button

                          style={{

                            width: '100%',            onClick={() => setTab('list')}    }        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',

                            padding: '10px 12px',

                            borderRadius: 6,            style={{

                            border: '1px solid #d1d5db',

                          }}              padding: '12px 24px',  }        color: '#fff',

                        />

                      </div>              background: tab === 'list' ? '#667eea' : '#fff',

                    </div>

                    <button              color: tab === 'list' ? '#fff' : '#333',        padding: '30px 20px',

                      type="submit"

                      disabled={submitting}              border: 'none',

                      style={{

                        padding: '12px 24px',              borderRadius: '8px 8px 0 0',  async function handleProcessPayment(e) {        boxShadow: '0 4px 20px rgba(0,0,0,0.1)',

                        background: submitting ? '#9ca3af' : '#10b981',

                        color: '#fff',              cursor: 'pointer',

                        border: 'none',

                        borderRadius: 8,              fontWeight: 600,    e.preventDefault();        marginBottom: 30,

                        cursor: 'pointer',

                        fontWeight: 600,              fontSize: 15,

                      }}

                    >            }}      }}>

                      {submitting ? '⏳ Đang xử lý...' : '✅ Xác Nhận Thanh Toán'}

                    </button>          >

                  </form>

                )}            ✅ Danh Sách Tất Cả    if (!selectedInvoice) {        <div style={{

              </div>

            )}          </button>

          </div>

        )}        </div>      setMessage('⚠️ Vui lòng chọn hoá đơn');          maxWidth: 1200,



        {/* TAB 3: Danh Sách */}

        {tab === 'list' && (

          <div style={{ background: '#fff', borderRadius: 12, padding: 30, boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}>        {message && (      return;          margin: '0 auto',

            <h2 style={{ marginTop: 0, marginBottom: 20, fontSize: 20 }}>📋 Danh Sách Tất Cả Hoá Đơn</h2>

            {loading ? (          <div style={{

              <p>⏳ Đang tải...</p>

            ) : invoices.length === 0 ? (            padding: 15,    }          display: 'flex',

              <p style={{ textAlign: 'center', padding: '60px 20px', color: '#666' }}>📭 Chưa có hoá đơn</p>

            ) : (            borderRadius: 8,

              <div>

                <div style={{            marginBottom: 20,          justifyContent: 'space-between',

                  display: 'grid',

                  gridTemplateColumns: '1fr 200px',            background: message.includes('✅') ? '#d1fae5' : '#fee2e2',

                  gap: 16,

                  marginBottom: 24,            color: message.includes('✅') ? '#065f46' : '#991b1b',    setSubmitting(true);          alignItems: 'center',

                }}>

                  <div>            fontSize: 14,

                    <label style={{ fontWeight: 600, display: 'block', marginBottom: 8 }}>🔍 Tìm Kiếm</label>

                    <input            fontWeight: 500,    try {        }}>

                      type="text"

                      value={searchText}          }}>

                      onChange={(e) => setSearchText(e.target.value.toLowerCase())}

                      placeholder="Tên / Khoá / Số tiền"            {message}      const res = await fetch(`${API_BASE}/fee/invoices/${selectedInvoice.id}/payment`, {          <div>

                      style={{

                        width: '100%',          </div>

                        padding: '10px 12px',

                        borderRadius: 6,        )}        method: 'PUT',            <h1 style={{ margin: 0, fontSize: 32, fontWeight: 'bold' }}>💳 Quản Lý Thu Học Phí</h1>

                        border: '1px solid #d1d5db',

                      }}

                    />

                  </div>        {/* TAB 1 */}        headers: { 'Content-Type': 'application/json' },            <p style={{ margin: '5px 0 0 0', opacity: 0.9 }}>Xin chào, {stored?.username || 'Kế toán'}</p>

                  <div>

                    <label style={{ fontWeight: 600, display: 'block', marginBottom: 8 }}>🏷️ Lọc</label>        {tab === 'create' && (

                    <select

                      value={filterStatus}          <div style={{ background: '#fff', borderRadius: 12, padding: 30, boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}>        body: JSON.stringify({          </div>

                      onChange={(e) => setFilterStatus(e.target.value)}

                      style={{            <h2 style={{ marginTop: 0, marginBottom: 20, fontSize: 20 }}>📝 Tạo Hoá Đơn Học Phí</h2>

                        width: '100%',

                        padding: '10px 12px',            {loading ? <div>⏳ Đang tải...</div> : students.length === 0 ? (          method: formPayment.method,          <button

                        borderRadius: 6,

                        border: '1px solid #d1d5db',              <div style={{ textAlign: 'center', padding: '60px 20px', color: '#666' }}>✨ Không có học viên NEW</div>

                      }}

                    >            ) : (          note: formPayment.note,            onClick={handleLogout}

                      <option value="all">Tất Cả</option>

                      <option value="pending">⏳ PENDING</option>              <div>

                      <option value="paid">✅ PAID</option>

                    </select>                <label style={{ display: 'block', marginBottom: 8, fontWeight: 600 }}>Chọn Học Viên (NEW)</label>        }),            style={{

                  </div>

                </div>                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 12, marginBottom: 20 }}>



                {(() => {                  {students.map(s => (      }).then(r => r.json());              padding: '10px 20px',

                  const filtered = invoices.filter(inv => {

                    const matchStatus = filterStatus === 'all' || inv.status?.toLowerCase() === filterStatus;                    <div key={s.id} onClick={() => setSelectedStudent(s)} style={{

                    const matchSearch = searchText === '' ||

                      (inv.student_name || '').toLowerCase().includes(searchText) ||                      padding: 12,              borderRadius: 8,

                      (inv.course_name || '').toLowerCase().includes(searchText);

                    return matchStatus && matchSearch;                      border: selectedStudent?.id === s.id ? '2px solid #667eea' : '1px solid #e0e0e0',

                  });

                      borderRadius: 8,      if (res.success) {              background: '#ff6b6b',

                  if (filtered.length === 0) {

                    return <p style={{ textAlign: 'center', padding: '40px 20px', color: '#666' }}>🔎 Không tìm thấy</p>;                      cursor: 'pointer',

                  }

                      background: selectedStudent?.id === s.id ? '#f0f4ff' : '#fff',        setMessage('✅ Thanh toán thành công! Học viên chuyển sang PAID');              color: '#fff',

                  return (

                    <div style={{ overflowX: 'auto' }}>                    }}>

                      <table style={{ width: '100%', borderCollapse: 'collapse' }}>

                        <thead>                      <div style={{ fontWeight: 600 }}>{s.name}</div>        setFormPayment({ method: 'cash', note: '' });              border: 'none',

                          <tr style={{ background: '#f3f4f6', borderBottom: '2px solid #e5e7eb' }}>

                            <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600 }}>HĐ #</th>                      <div style={{ fontSize: 12, color: '#666', marginTop: 4 }}>📞 {s.phone}</div>

                            <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600 }}>Học Viên</th>

                            <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600 }}>Khoá</th>                    </div>        setSelectedInvoice(null);              cursor: 'pointer',

                            <th style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 600 }}>Số Tiền</th>

                            <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600 }}>PT</th>                  ))}

                            <th style={{ padding: '12px 16px', textAlign: 'center', fontWeight: 600 }}>Trạng Thái</th>

                          </tr>                </div>        setTimeout(() => fetchData(), 1000);              fontWeight: 600,

                        </thead>

                        <tbody>                {selectedStudent && (

                          {filtered.map((inv) => {

                            const isPending = inv.status?.toUpperCase() === 'PENDING';                  <form onSubmit={handleCreateInvoice} style={{ background: '#f9fafb', padding: 20, borderRadius: 8 }}>      } else {              fontSize: 14,

                            return (

                              <tr                    <div style={{ marginBottom: 16 }}>

                                key={inv.id}

                                style={{                      <label style={{ fontWeight: 600 }}>Học Viên Đã Chọn</label>        setMessage('❌ Lỗi: ' + (res.message || 'Không xác định'));            }}

                                  borderBottom: '1px solid #f3f4f6',

                                  background: isPending ? '#fef3c7' : '#fff',                      <div style={{ padding: 12, background: '#fff', borderRadius: 6, marginTop: 6 }}>{selectedStudent.name}</div>

                                }}

                              >                    </div>      }          >

                                <td style={{ padding: '12px 16px', fontWeight: 600 }}>#{inv.id}</td>

                                <td style={{ padding: '12px 16px' }}>{inv.student_name}</td>                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>

                                <td style={{ padding: '12px 16px' }}>{inv.course_name}</td>

                                <td style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 600, color: '#10b981' }}>                      <div>    } catch (err) {            🚪 Đăng xuất

                                  {Number(inv.amount || 0).toLocaleString('vi-VN')} đ

                                </td>                        <label style={{ fontWeight: 600, display: 'block', marginBottom: 6 }}>Khoá Học *</label>

                                <td style={{ padding: '12px 16px' }}>

                                  {inv.method ? (                        <select value={formCreate.course_id} onChange={(e) => setFormCreate({ ...formCreate, course_id: e.target.value })} style={{ width: '100%', padding: '10px 12px', borderRadius: 6, border: '1px solid #d1d5db' }}>      setMessage('❌ Lỗi: ' + err.message);          </button>

                                    inv.method === 'cash' ? '💵' :

                                      inv.method === 'bank' ? '🏦' : '💳'                          <option value="">-- Chọn khoá --</option>

                                  ) : '-'}

                                </td>                          {courses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}      console.error(err);        </div>

                                <td style={{ padding: '12px 16px', textAlign: 'center' }}>

                                  <span style={{                        </select>

                                    padding: '4px 10px',

                                    borderRadius: 6,                      </div>    } finally {      </div>

                                    background: isPending ? '#fcd34d' : '#d1fae5',

                                    color: isPending ? '#78350f' : '#065f46',                      <div>

                                    fontSize: 12,

                                    fontWeight: 500,                        <label style={{ fontWeight: 600, display: 'block', marginBottom: 6 }}>Số Tiền (VNĐ) *</label>      setSubmitting(false);

                                  }}>

                                    {isPending ? '⏳' : '✓'}                        <input type="number" value={formCreate.amount} onChange={(e) => setFormCreate({ ...formCreate, amount: e.target.value })} placeholder="5000000" style={{ width: '100%', padding: '10px 12px', borderRadius: 6, border: '1px solid #d1d5db' }} />

                                  </span>

                                </td>                      </div>    }      {/* Main Content */}

                              </tr>

                            );                    </div>

                          })}

                        </tbody>                    <button type="submit" disabled={submitting} style={{ padding: '12px 24px', background: submitting ? '#9ca3af' : '#10b981', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600 }}>  }      <div style={{

                      </table>

                    </div>                      {submitting ? '⏳ Đang lưu...' : '💾 Tạo Hoá Đơn'}

                  );

                })()}                    </button>        maxWidth: 1200,

              </div>

            )}                  </form>

          </div>

        )}                )}  const handleLogout = () => {        margin: '0 auto',

      </div>

    </div>              </div>

  );

}            )}    localStorage.removeItem('currentUser');        padding: '0 20px 40px',


          </div>

        )}    navigate('/login');      }}>



        {/* TAB 2 */}  };        {/* Tabs */}

        {tab === 'payment' && (

          <div style={{ background: '#fff', borderRadius: 12, padding: 30, boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}>        <div style={{

            <h2 style={{ marginTop: 0, marginBottom: 20, fontSize: 20 }}>💰 Thanh Toán Hoá Đơn</h2>

            {loading ? <div>⏳ Đang tải...</div> : invoices.length === 0 ? (  return (          display: 'flex',

              <div style={{ textAlign: 'center', padding: '60px 20px', color: '#666' }}>📭 Không có hoá đơn PENDING</div>

            ) : (    <div style={{          gap: 10,

              <div>

                <label style={{ display: 'block', marginBottom: 8, fontWeight: 600 }}>Chọn Hoá Đơn (PENDING)</label>      width: '100%',          marginBottom: 20,

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 12, marginBottom: 20 }}>

                  {invoices.map(inv => (      minHeight: '100vh',          borderBottom: '2px solid #e0e0e0',

                    <div key={inv.id} onClick={() => setSelectedInvoice(inv)} style={{

                      padding: 12,      background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',        }}>

                      border: selectedInvoice?.id === inv.id ? '2px solid #667eea' : '1px solid #e0e0e0',

                      borderRadius: 8,      paddingTop: 0,          <button

                      cursor: 'pointer',

                      background: selectedInvoice?.id === inv.id ? '#f0f4ff' : '#fff',    }}>            onClick={() => setTab('create')}

                    }}>

                      <div style={{ fontWeight: 600 }}>HĐ #{inv.id}</div>      {/* Header */}            style={{

                      <div style={{ fontSize: 12, color: '#666', marginTop: 4 }}>👤 {inv.student_name}</div>

                      <div style={{ fontSize: 13, fontWeight: 600, color: '#10b981', marginTop: 6 }}>💰 {Number(inv.amount || 0).toLocaleString('vi-VN')} đ</div>      <div style={{              padding: '12px 24px',

                    </div>

                  ))}        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',              background: tab === 'create' ? '#667eea' : '#fff',

                </div>

                {selectedInvoice && (        color: '#fff',              color: tab === 'create' ? '#fff' : '#333',

                  <form onSubmit={handleProcessPayment} style={{ background: '#f9fafb', padding: 20, borderRadius: 8 }}>

                    <div style={{ marginBottom: 16 }}>        padding: '30px 20px',              border: 'none',

                      <label style={{ fontWeight: 600 }}>Hoá Đơn Đã Chọn</label>

                      <div style={{ padding: 12, background: '#fff', borderRadius: 6, marginTop: 6 }}>HĐ #{selectedInvoice.id} - {selectedInvoice.student_name}</div>        boxShadow: '0 4px 20px rgba(0,0,0,0.1)',              borderRadius: '8px 8px 0 0',

                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>        marginBottom: 30,              cursor: 'pointer',

                      <div>

                        <label style={{ fontWeight: 600, display: 'block', marginBottom: 6 }}>Phương Thức *</label>      }}>              fontWeight: 600,

                        <select value={formPayment.method} onChange={(e) => setFormPayment({ ...formPayment, method: e.target.value })} style={{ width: '100%', padding: '10px 12px', borderRadius: 6, border: '1px solid #d1d5db' }}>

                          <option value="cash">💵 Tiền Mặt</option>        <div style={{              fontSize: 15,

                          <option value="bank">🏦 Chuyển Khoán</option>

                          <option value="card">💳 Thẻ</option>          maxWidth: 1200,              transition: 'all 0.3s',

                          <option value="other">📱 Khác</option>

                        </select>          margin: '0 auto',            }}

                      </div>

                      <div>          display: 'flex',          >

                        <label style={{ fontWeight: 600, display: 'block', marginBottom: 6 }}>Ghi Chú</label>

                        <input type="text" value={formPayment.note} onChange={(e) => setFormPayment({ ...formPayment, note: e.target.value })} placeholder="Ghi chú" style={{ width: '100%', padding: '10px 12px', borderRadius: 6, border: '1px solid #d1d5db' }} />          justifyContent: 'space-between',            📝 Tạo Hoá Đơn

                      </div>

                    </div>          alignItems: 'center',          </button>

                    <button type="submit" disabled={submitting} style={{ padding: '12px 24px', background: submitting ? '#9ca3af' : '#10b981', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600 }}>

                      {submitting ? '⏳ Đang xử lý...' : '✅ Xác Nhận Thanh Toán'}        }}>          <button

                    </button>

                  </form>          <div>            onClick={() => setTab('paid')}

                )}

              </div>            <h1 style={{ margin: 0, fontSize: 32, fontWeight: 'bold' }}>💳 Quản Lý Thu Học Phí</h1>            style={{

            )}

          </div>            <p style={{ margin: '5px 0 0 0', opacity: 0.9 }}>Xin chào, {stored?.username || 'Kế toán'}</p>              padding: '12px 24px',

        )}

          </div>              background: tab === 'paid' ? '#667eea' : '#fff',

        {/* TAB 3 */}

        {tab === 'list' && (          <button              color: tab === 'paid' ? '#fff' : '#333',

          <div style={{ background: '#fff', borderRadius: 12, padding: 30, boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}>

            <h2 style={{ marginTop: 0, marginBottom: 20, fontSize: 20 }}>📋 Danh Sách Tất Cả Hoá Đơn</h2>            onClick={handleLogout}              border: 'none',

            {loading ? <div>⏳ Đang tải...</div> : invoices.length === 0 ? (

              <div style={{ textAlign: 'center', padding: '60px 20px', color: '#666' }}>📭 Chưa có hoá đơn</div>            style={{              borderRadius: '8px 8px 0 0',

            ) : (

              <div>              padding: '10px 20px',              cursor: 'pointer',

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 200px', gap: 16, marginBottom: 24 }}>

                  <div>              borderRadius: 8,              fontWeight: 600,

                    <label style={{ fontWeight: 600, display: 'block', marginBottom: 8 }}>🔍 Tìm Kiếm</label>

                    <input type="text" value={searchText} onChange={(e) => setSearchText(e.target.value.toLowerCase())} placeholder="Tên / Khoá / Số tiền" style={{ width: '100%', padding: '10px 12px', borderRadius: 6, border: '1px solid #d1d5db' }} />              background: '#ff6b6b',              fontSize: 15,

                  </div>

                  <div>              color: '#fff',              transition: 'all 0.3s',

                    <label style={{ fontWeight: 600, display: 'block', marginBottom: 8 }}>🏷️ Lọc</label>

                    <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} style={{ width: '100%', padding: '10px 12px', borderRadius: 6, border: '1px solid #d1d5db' }}>              border: 'none',            }}

                      <option value="all">Tất Cả</option>

                      <option value="pending">⏳ PENDING</option>              cursor: 'pointer',          >

                      <option value="paid">✅ PAID</option>

                    </select>              fontWeight: 600,            ✅ Học Viên Đã Thanh Toán

                  </div>

                </div>              fontSize: 14,          </button>

                {(() => {

                  const filtered = invoices.filter(inv => {            }}        </div>

                    const matchStatus = filterStatus === 'all' || inv.status?.toLowerCase() === filterStatus;

                    const matchSearch = searchText === '' || (inv.student_name || '').toLowerCase().includes(searchText) || (inv.course_name || '').toLowerCase().includes(searchText);          >

                    return matchStatus && matchSearch;

                  });            🚪 Đăng xuất        {/* Message */}

                  return filtered.length === 0 ? (

                    <div style={{ textAlign: 'center', padding: '40px 20px', color: '#666' }}>🔎 Không tìm thấy</div>          </button>        {message && (

                  ) : (

                    <div style={{ overflowX: 'auto' }}>        </div>          <div style={{

                      <table style={{ width: '100%', borderCollapse: 'collapse' }}>

                        <thead>      </div>            padding: 15,

                          <tr style={{ background: '#f3f4f6', borderBottom: '2px solid #e5e7eb' }}>

                            <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600 }}>HĐ #</th>            borderRadius: 8,

                            <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600 }}>Học Viên</th>

                            <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600 }}>Khoá</th>      {/* Main Content */}            marginBottom: 20,

                            <th style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 600 }}>Số Tiền</th>

                            <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600 }}>PT</th>      <div style={{            background: message.includes('✅') ? '#d1fae5' : '#fee2e2',

                            <th style={{ padding: '12px 16px', textAlign: 'center', fontWeight: 600 }}>Trạng Thái</th>

                          </tr>        maxWidth: 1200,            color: message.includes('✅') ? '#065f46' : '#991b1b',

                        </thead>

                        <tbody>        margin: '0 auto',            fontSize: 14,

                          {filtered.map((inv) => {

                            const isPending = inv.status?.toUpperCase() === 'PENDING';        padding: '0 20px 40px',            fontWeight: 500,

                            return (

                              <tr key={inv.id} style={{ borderBottom: '1px solid #f3f4f6', background: isPending ? '#fef3c7' : '#fff' }}>      }}>          }}>

                                <td style={{ padding: '12px 16px', fontWeight: 600 }}>#{inv.id}</td>

                                <td style={{ padding: '12px 16px' }}>{inv.student_name}</td>        {/* Tabs */}            {message}

                                <td style={{ padding: '12px 16px' }}>{inv.course_name}</td>

                                <td style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 600, color: '#10b981' }}>{Number(inv.amount || 0).toLocaleString('vi-VN')} đ</td>        <div style={{          </div>

                                <td style={{ padding: '12px 16px' }}>{inv.method ? (inv.method === 'cash' ? '💵' : inv.method === 'bank' ? '🏦' : '💳') : '-'}</td>

                                <td style={{ padding: '12px 16px', textAlign: 'center' }}>          display: 'flex',        )}

                                  <span style={{ padding: '4px 10px', borderRadius: 6, background: isPending ? '#fcd34d' : '#d1fae5', color: isPending ? '#78350f' : '#065f46', fontSize: 12, fontWeight: 500 }}>

                                    {isPending ? '⏳' : '✓'}          gap: 10,

                                  </span>

                                </td>          marginBottom: 20,        {/* Tab Content */}

                              </tr>

                            );          borderBottom: '2px solid #e0e0e0',        {tab === 'create' ? (

                          })}

                        </tbody>        }}>          <div style={{

                      </table>

                    </div>          <button            background: '#fff',

                  );

                })()}            onClick={() => setTab('create')}            borderRadius: 12,

              </div>

            )}            style={{            padding: 30,

          </div>

        )}              padding: '12px 24px',            boxShadow: '0 4px 20px rgba(0,0,0,0.1)',

      </div>

    </div>              background: tab === 'create' ? '#667eea' : '#fff',          }}>

  );

}              color: tab === 'create' ? '#fff' : '#333',            <h2 style={{ marginTop: 0, marginBottom: 20, fontSize: 20 }}>📝 Tạo Hoá Đơn Học Phí</h2>


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
