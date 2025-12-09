import { useState, useEffect } from 'react';import { useState, useEffect } from 'react';

import { useNavigate } from 'react-router-dom';import { useNavigate } from 'react-router-dom';



const API_BASE = 'http://localhost:8080/api';const API_BASE = 'http://localhost:8080/api';



export default function FeeManagement() {export default function FeeManagement() {

  const navigate = useNavigate();  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem('currentUser'));  const user = JSON.parse(localStorage.getItem('currentUser'));

  const username = user?.username || 'Kế Toán';  const username = user?.username || 'Kế Toán';



  if (!user) {  if (!user) {

    navigate('/login');    navigate('/login');

    return null;    return null;

  }  }



  const [tab, setTab] = useState('create');  const [tab, setTab] = useState('create');

  const [students, setStudents] = useState([]);  const [students, setStudents] = useState([]);

  const [courses, setCourses] = useState([]);  const [courses, setCourses] = useState([]);

  const [invoices, setInvoices] = useState([]);  const [invoices, setInvoices] = useState([]);

  const [loading, setLoading] = useState(false);  const [loading, setLoading] = useState(false);

  const [selectedStudent, setSelectedStudent] = useState(null);  const [selectedStudent, setSelectedStudent] = useState(null);

  const [selectedInvoice, setSelectedInvoice] = useState(null);  const [selectedInvoice, setSelectedInvoice] = useState(null);

  const [amount, setAmount] = useState('');  const [amount, setAmount] = useState('');

  const [courseId, setCourseId] = useState('');  const [courseId, setCourseId] = useState('');

  const [paymentMethod, setPaymentMethod] = useState('cash');  const [paymentMethod, setPaymentMethod] = useState('cash');

  const [paymentNote, setPaymentNote] = useState('');  const [paymentNote, setPaymentNote] = useState('');

  const [message, setMessage] = useState('');  const [message, setMessage] = useState('');

  const [submitting, setSubmitting] = useState(false);  const [submitting, setSubmitting] = useState(false);

  const [filterStatus, setFilterStatus] = useState('all');  const [filterStatus, setFilterStatus] = useState('all');

  const [searchText, setSearchText] = useState('');  const [searchText, setSearchText] = useState('');

  const [bankInfo, setBankInfo] = useState(null);  const [bankInfo, setBankInfo] = useState(null);



  useEffect(() => {  useEffect(() => {

    loadTabData();    loadTabData();

  }, [tab]);  }, [tab]);



  const loadTabData = async () => {  const loadTabData = async () => {

    setLoading(true);    setLoading(true);

    setMessage('');    setMessage('');

    try {    try {

      if (tab === 'create') {      if (tab === 'create') {

        const s = await fetch(`${API_BASE}/fee/students/new`).then(r => r.json());        const s = await fetch(`${API_BASE}/fee/students/new`).then(r => r.json());

        const c = await fetch(`${API_BASE}/fee/courses/active`).then(r => r.json());        const c = await fetch(`${API_BASE}/fee/courses/active`).then(r => r.json());

        setStudents(s.students || []);        setStudents(s.students || []);

        setCourses(c.courses || []);        setCourses(c.courses || []);

      } else if (tab === 'payment') {      } else if (tab === 'payment') {

        const inv = await fetch(`${API_BASE}/fee/invoices/pending`).then(r => r.json());        const inv = await fetch(`${API_BASE}/fee/invoices/pending`).then(r => r.json());

        const bank = await fetch(`${API_BASE}/fee/bank-info`).then(r => r.json());        const bank = await fetch(`${API_BASE}/fee/bank-info`).then(r => r.json());

        setInvoices(inv.invoices || []);        setInvoices(inv.invoices || []);

        if (bank.success && bank.bank) {        if (bank.success && bank.bank) {

          setBankInfo(bank.bank);          setBankInfo(bank.bank);

        }        }

      } else if (tab === 'list') {      } else if (tab === 'list') {

        const inv = await fetch(`${API_BASE}/fee/invoices/all`).then(r => r.json());        const inv = await fetch(`${API_BASE}/fee/invoices/all`).then(r => r.json());

        setInvoices(inv.invoices || []);        setInvoices(inv.invoices || []);

      }      }

    } catch (e) {    } catch (e) {

      setMessage('❌ Lỗi: ' + e.message);      setMessage('❌ Lỗi: ' + e.message);

    }    }

    setLoading(false);    setLoading(false);

  };  };



  const createInvoice = async (e) => {  const createInvoice = async (e) => {

    e.preventDefault();    e.preventDefault();

    if (!selectedStudent || !courseId || !amount) {    if (!selectedStudent || !courseId || !amount) {

      setMessage('⚠️ Vui lòng chọn đầy đủ');      setMessage('⚠️ Vui lòng chọn đầy đủ');

      return;      return;

    }    }

    setSubmitting(true);    setSubmitting(true);

    try {    try {

      const res = await fetch(`${API_BASE}/fee/invoices`, {      const res = await fetch(`${API_BASE}/fee/invoices`, {

        method: 'POST',        method: 'POST',

        headers: { 'Content-Type': 'application/json' },        headers: { 'Content-Type': 'application/json' },

        body: JSON.stringify({        body: JSON.stringify({

          student_id: selectedStudent.id,          student_id: selectedStudent.id,

          course_id: parseInt(courseId),          course_id: parseInt(courseId),

          amount: parseFloat(amount),          amount: parseFloat(amount),

        }),        }),

      }).then(r => r.json());      }).then(r => r.json());

      if (res.success) {      if (res.success) {

        setMessage('✅ Tạo hoá đơn thành công');        setMessage('✅ Tạo hoá đơn thành công');

        setAmount('');        setAmount('');

        setCourseId('');        setCourseId('');

        setSelectedStudent(null);        setSelectedStudent(null);

        setTimeout(() => loadTabData(), 1000);        setTimeout(() => loadTabData(), 1000);

      } else {      } else {

        setMessage('❌ ' + (res.message || 'Lỗi'));        setMessage('❌ ' + (res.message || 'Lỗi'));

      }      }

    } catch (e) {    } catch (e) {

      setMessage('❌ ' + e.message);      setMessage('❌ ' + e.message);

    }    }

    setSubmitting(false);    setSubmitting(false);

  };  };



  const processPayment = async (e) => {  const processPayment = async (e) => {

    e.preventDefault();    e.preventDefault();

    if (!selectedInvoice) {    if (!selectedInvoice) {

      setMessage('⚠️ Chọn hoá đơn');      setMessage('⚠️ Chọn hoá đơn');

      return;      return;

    }    }

    setSubmitting(true);    setSubmitting(true);

    try {    try {

      const res = await fetch(`${API_BASE}/fee/invoices/${selectedInvoice.id}/payment`, {      const res = await fetch(`${API_BASE}/fee/invoices/${selectedInvoice.id}/payment`, {

        method: 'PUT',        method: 'PUT',

        headers: { 'Content-Type': 'application/json' },        headers: { 'Content-Type': 'application/json' },

        body: JSON.stringify({        body: JSON.stringify({

          method: paymentMethod,          method: paymentMethod,

          note: paymentNote,          note: paymentNote,

        }),        }),

      }).then(r => r.json());      }).then(r => r.json());

      if (res.success) {      if (res.success) {

        setMessage('✅ Thanh toán thành công');        setMessage('✅ Thanh toán thành công');

        setPaymentMethod('cash');        setPaymentMethod('cash');

        setPaymentNote('');        setPaymentNote('');

        setSelectedInvoice(null);        setSelectedInvoice(null);

        setTimeout(() => loadTabData(), 1000);        setTimeout(() => loadTabData(), 1000);

      } else {      } else {

        setMessage('❌ ' + (res.message || 'Lỗi'));        setMessage('❌ ' + (res.message || 'Lỗi'));

      }      }

    } catch (e) {    } catch (e) {

      setMessage('❌ ' + e.message);      setMessage('❌ ' + e.message);

    }    }

    setSubmitting(false);    setSubmitting(false);

  };  };



  const handleLogout = () => {  const handleLogout = () => {

    localStorage.removeItem('currentUser');    localStorage.removeItem('currentUser');

    navigate('/login');    navigate('/login');

  };  };



  return (  return (

    <div style={{    <div style={{

      width: '100%',      width: '100%',

      minHeight: '100vh',      minHeight: '100vh',

      background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',      background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',

      paddingTop: 0,      paddingTop: 0,

    }}>    }}>

      {/* Header */}      {/* Header */}

      <div style={{      <div style={{

        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',

        color: 'white',        color: 'white',

        padding: '40px 20px',        padding: '40px 20px',

        boxShadow: '0 4px 20px rgba(0,0,0,0.1)',        boxShadow: '0 4px 20px rgba(0,0,0,0.1)',

        marginBottom: 30,        marginBottom: 30,

      }}>      }}>

        <div style={{        <div style={{

          maxWidth: 1200,          maxWidth: 1200,

          margin: '0 auto',          margin: '0 auto',

          display: 'flex',          display: 'flex',

          justifyContent: 'space-between',          justifyContent: 'space-between',

          alignItems: 'center',          alignItems: 'center',

        }}>        }}>

          <div>          <div>

            <h1 style={{ margin: 0, fontSize: 32, fontWeight: 700 }}>            <h1 style={{ margin: 0, fontSize: 32, fontWeight: 700 }}>

              💰 Dashboard Kế Toán              💰 Dashboard Kế Toán

            </h1>            </h1>

            <p style={{ margin: '8px 0 0 0', fontSize: 16, opacity: 0.9 }}>            <p style={{ margin: '8px 0 0 0', fontSize: 16, opacity: 0.9 }}>

              Xin chào, <b>{username}</b>              Xin chào, <b>{username}</b>

            </p>            </p>

          </div>          </div>

          <button          <button

            onClick={handleLogout}            onClick={handleLogout}

            style={{            style={{

              padding: '10px 24px',              padding: '10px 24px',

              background: 'rgba(255,255,255,0.2)',              background: 'rgba(255,255,255,0.2)',

              color: 'white',              color: 'white',

              border: '2px solid white',              border: '2px solid white',

              borderRadius: 6,              borderRadius: 6,

              cursor: 'pointer',              cursor: 'pointer',

              fontWeight: 600,              fontWeight: 600,

              transition: 'all 0.3s',              transition: 'all 0.3s',

              fontSize: 14,              fontSize: 14,

            }}            }}

            onMouseOver={(e) => {            onMouseOver={(e) => {

              e.target.style.background = 'rgba(255,255,255,0.3)';              e.target.style.background = 'rgba(255,255,255,0.3)';

            }}            }}

            onMouseOut={(e) => {            onMouseOut={(e) => {

              e.target.style.background = 'rgba(255,255,255,0.2)';              e.target.style.background = 'rgba(255,255,255,0.2)';

            }}            }}

          >          >

            Đăng xuất            Đăng xuất

          </button>          </button>

        </div>        </div>

      </div>      </div>



      {/* Main Content */}      {/* Main Content */}

      <div style={{      <div style={{

        display: 'flex',        display: 'flex',

        justifyContent: 'center',        justifyContent: 'center',

        paddingBottom: 40,        paddingBottom: 40,

      }}>      }}>

        <div style={{ width: 1200 }}>        <div style={{ width: 1200 }}>

          {/* Khối chức năng */}          {/* Khối chức năng */}

          <div style={{ marginBottom: 30 }}>          <div style={{ marginBottom: 30 }}>

            <div style={{            <div style={{

              fontWeight: 700,              fontWeight: 700,

              marginBottom: 16,              marginBottom: 16,

              fontSize: 18,              fontSize: 18,

              color: '#333',              color: '#333',

            }}>            }}>

              📚 Chức Năng              📚 Chức Năng

            </div>            </div>

            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>

              {/* Tab buttons */}              {/* Tab buttons */}

              <button              <button

                onClick={() => setTab('create')}                onClick={() => setTab('create')}

                style={{                style={{

                  padding: '12px 20px',                  padding: '12px 20px',

                  borderRadius: 8,                  borderRadius: 8,

                  border: 'none',                  border: 'none',

                  background: tab === 'create' ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : '#fff',                  background: tab === 'create' ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : '#fff',

                  color: tab === 'create' ? '#fff' : '#333',                  color: tab === 'create' ? '#fff' : '#333',

                  cursor: 'pointer',                  cursor: 'pointer',

                  fontWeight: 600,                  fontWeight: 600,

                  boxShadow: tab === 'create' ? '0 4px 12px rgba(102, 126, 234, 0.4)' : '0 2px 8px rgba(0,0,0,0.1)',                  boxShadow: tab === 'create' ? '0 4px 12px rgba(102, 126, 234, 0.4)' : '0 2px 8px rgba(0,0,0,0.1)',

                  transition: 'all 0.3s',                  transition: 'all 0.3s',

                  fontSize: 14,                  fontSize: 14,

                }}                }}

                onMouseOver={(e) => {                onMouseOver={(e) => {

                  if (tab === 'create') {                  if (tab === 'create') {

                    e.target.style.transform = 'translateY(-2px)';                    e.target.style.transform = 'translateY(-2px)';

                    e.target.style.boxShadow = '0 6px 16px rgba(102, 126, 234, 0.6)';                    e.target.style.boxShadow = '0 6px 16px rgba(102, 126, 234, 0.6)';

                  }                  }

                }}                }}

                onMouseOut={(e) => {                onMouseOut={(e) => {

                  if (tab === 'create') {                  if (tab === 'create') {

                    e.target.style.transform = 'translateY(0)';                    e.target.style.transform = 'translateY(0)';

                    e.target.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.4)';                    e.target.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.4)';

                  }                  }

                }}                }}

              >              >

                📝 Tạo Hoá Đơn                📝 Tạo Hoá Đơn

              </button>              </button>



              <button              <button

                onClick={() => setTab('payment')}                onClick={() => setTab('payment')}

                style={{                style={{

                  padding: '12px 20px',                  padding: '12px 20px',

                  borderRadius: 8,                  borderRadius: 8,

                  border: 'none',                  border: 'none',

                  background: tab === 'payment' ? 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' : '#fff',                  background: tab === 'payment' ? 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' : '#fff',

                  color: tab === 'payment' ? '#fff' : '#333',                  color: tab === 'payment' ? '#fff' : '#333',

                  cursor: 'pointer',                  cursor: 'pointer',

                  fontWeight: 600,                  fontWeight: 600,

                  boxShadow: tab === 'payment' ? '0 4px 12px rgba(245, 87, 108, 0.4)' : '0 2px 8px rgba(0,0,0,0.1)',                  boxShadow: tab === 'payment' ? '0 4px 12px rgba(245, 87, 108, 0.4)' : '0 2px 8px rgba(0,0,0,0.1)',

                  transition: 'all 0.3s',                  transition: 'all 0.3s',

                  fontSize: 14,                  fontSize: 14,

                }}                }}

                onMouseOver={(e) => {                onMouseOver={(e) => {

                  if (tab === 'payment') {                  if (tab === 'payment') {

                    e.target.style.transform = 'translateY(-2px)';                    e.target.style.transform = 'translateY(-2px)';

                    e.target.style.boxShadow = '0 6px 16px rgba(245, 87, 108, 0.6)';                    e.target.style.boxShadow = '0 6px 16px rgba(245, 87, 108, 0.6)';

                  }                  }

                }}                }}

                onMouseOut={(e) => {                onMouseOut={(e) => {

                  if (tab === 'payment') {                  if (tab === 'payment') {

                    e.target.style.transform = 'translateY(0)';                    e.target.style.transform = 'translateY(0)';

                    e.target.style.boxShadow = '0 4px 12px rgba(245, 87, 108, 0.4)';                    e.target.style.boxShadow = '0 4px 12px rgba(245, 87, 108, 0.4)';

                  }                  }

                }}                }}

              >              >

                💳 Thanh Toán                � Thanh Toán

              </button>              </button>



              <button              <button

                onClick={() => setTab('list')}                onClick={() => setTab('list')}

                style={{                style={{

                  padding: '12px 20px',                  padding: '12px 20px',

                  borderRadius: 8,                  borderRadius: 8,

                  border: 'none',                  border: 'none',

                  background: tab === 'list' ? 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' : '#fff',                  background: tab === 'list' ? 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' : '#fff',

                  color: tab === 'list' ? '#fff' : '#333',                  color: tab === 'list' ? '#fff' : '#333',

                  cursor: 'pointer',                  cursor: 'pointer',

                  fontWeight: 600,                  fontWeight: 600,

                  boxShadow: tab === 'list' ? '0 4px 12px rgba(79, 172, 254, 0.4)' : '0 2px 8px rgba(0,0,0,0.1)',                  boxShadow: tab === 'list' ? '0 4px 12px rgba(79, 172, 254, 0.4)' : '0 2px 8px rgba(0,0,0,0.1)',

                  transition: 'all 0.3s',                  transition: 'all 0.3s',

                  fontSize: 14,                  fontSize: 14,

                }}                }}

                onMouseOver={(e) => {                onMouseOver={(e) => {

                  if (tab === 'list') {                  if (tab === 'list') {

                    e.target.style.transform = 'translateY(-2px)';                    e.target.style.transform = 'translateY(-2px)';

                    e.target.style.boxShadow = '0 6px 16px rgba(79, 172, 254, 0.6)';                    e.target.style.boxShadow = '0 6px 16px rgba(79, 172, 254, 0.6)';

                  }                  }

                }}                }}

                onMouseOut={(e) => {                onMouseOut={(e) => {

                  if (tab === 'list') {                  if (tab === 'list') {

                    e.target.style.transform = 'translateY(0)';                    e.target.style.transform = 'translateY(0)';

                    e.target.style.boxShadow = '0 4px 12px rgba(79, 172, 254, 0.4)';                    e.target.style.boxShadow = '0 4px 12px rgba(79, 172, 254, 0.4)';

                  }                  }

                }}                }}

              >              >

                📋 Danh Sách                📋 Danh Sách

              </button>              </button>



              {/* Separator */}              {/* Separator */}

              <div style={{ flex: 1 }}></div>              <div style={{ flex: 1 }}></div>



              {/* Action buttons */}              {/* Action buttons */}

              <button              <button

                onClick={() => navigate('/accountant/report')}                onClick={() => navigate('/accountant/report')}

                style={{                style={{

                  padding: '12px 20px',                  padding: '12px 20px',

                  borderRadius: 8,                  borderRadius: 8,

                  border: '2px solid #667eea',                  border: '2px solid #667eea',

                  background: '#fff',                  background: '#fff',

                  color: '#667eea',                  color: '#667eea',

                  cursor: 'pointer',                  cursor: 'pointer',

                  fontWeight: 600,                  fontWeight: 600,

                  transition: 'all 0.3s',                  transition: 'all 0.3s',

                  fontSize: 14,                  fontSize: 14,

                }}                }}

                onMouseOver={(e) => {                onMouseOver={(e) => {

                  e.target.style.background = '#667eea';                  e.target.style.background = '#667eea';

                  e.target.style.color = '#fff';                  e.target.style.color = '#fff';

                }}                }}

                onMouseOut={(e) => {                onMouseOut={(e) => {

                  e.target.style.background = '#fff';                  e.target.style.background = '#fff';

                  e.target.style.color = '#667eea';                  e.target.style.color = '#667eea';

                }}                }}

              >              >

                📊 Xem Báo Cáo                📊 Xem Báo Cáo

              </button>              </button>



              <button              <button

                onClick={() => navigate('/accountant/inquiry')}                onClick={() => navigate('/accountant/inquiry')}

                style={{                style={{

                  padding: '12px 20px',                  padding: '12px 20px',

                  borderRadius: 8,                  borderRadius: 8,

                  border: 'none',                  border: 'none',

                  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',                  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',

                  color: '#fff',                  color: '#fff',

                  cursor: 'pointer',                  cursor: 'pointer',

                  fontWeight: 600,                  fontWeight: 600,

                  boxShadow: '0 4px 12px rgba(16, 185, 129, 0.4)',                  boxShadow: '0 4px 12px rgba(16, 185, 129, 0.4)',

                  transition: 'all 0.3s',                  transition: 'all 0.3s',

                  fontSize: 14,                  fontSize: 14,

                }}                }}

                onMouseOver={(e) => {                onMouseOver={(e) => {

                  e.target.style.transform = 'translateY(-2px)';                  e.target.style.transform = 'translateY(-2px)';

                  e.target.style.boxShadow = '0 6px 16px rgba(16, 185, 129, 0.6)';                  e.target.style.boxShadow = '0 6px 16px rgba(16, 185, 129, 0.6)';

                }}                }}

                onMouseOut={(e) => {                onMouseOut={(e) => {

                  e.target.style.transform = 'translateY(0)';                  e.target.style.transform = 'translateY(0)';

                  e.target.style.boxShadow = '0 4px 12px rgba(16, 185, 129, 0.4)';                  e.target.style.boxShadow = '0 4px 12px rgba(16, 185, 129, 0.4)';

                }}                }}

              >              >

                🔍 Tra Cứu                🔍 Tra Cứu

              </button>              </button>



              <button              <button

                onClick={() => navigate('/accountant/notification')}                onClick={() => navigate('/accountant/notification')}

                style={{                style={{

                  padding: '12px 20px',                  padding: '12px 20px',

                  borderRadius: 8,                  borderRadius: 8,

                  border: 'none',                  border: 'none',

                  background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',                  background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',

                  color: '#fff',                  color: '#fff',

                  cursor: 'pointer',                  cursor: 'pointer',

                  fontWeight: 600,                  fontWeight: 600,

                  boxShadow: '0 4px 12px rgba(245, 158, 11, 0.4)',                  boxShadow: '0 4px 12px rgba(245, 158, 11, 0.4)',

                  transition: 'all 0.3s',                  transition: 'all 0.3s',

                  fontSize: 14,                  fontSize: 14,

                }}                }}

                onMouseOver={(e) => {                onMouseOver={(e) => {

                  e.target.style.transform = 'translateY(-2px)';                  e.target.style.transform = 'translateY(-2px)';

                  e.target.style.boxShadow = '0 6px 16px rgba(245, 158, 11, 0.6)';                  e.target.style.boxShadow = '0 6px 16px rgba(245, 158, 11, 0.6)';

                }}                }}

                onMouseOut={(e) => {                onMouseOut={(e) => {

                  e.target.style.transform = 'translateY(0)';                  e.target.style.transform = 'translateY(0)';

                  e.target.style.boxShadow = '0 4px 12px rgba(245, 158, 11, 0.4)';                  e.target.style.boxShadow = '0 4px 12px rgba(245, 158, 11, 0.4)';

                }}                }}

              >              >

                📧 Gửi Thông Báo                📧 Gửi Thông Báo

              </button>              </button>

            </div>            </div>

          </div>          </div>



          {/* Message */}        {message && <div style={{ padding: 15, borderRadius: 8, marginBottom: 20, background: message.includes('✅') ? '#d1fae5' : '#fee2e2', color: message.includes('✅') ? '#065f46' : '#991b1b' }}>{message}</div>}

          {message && (

            <div style={{        {tab === 'create' && (

              padding: '15px 20px',          <div style={{ background: '#fff', padding: 30, borderRadius: 12 }}>

              borderRadius: 8,            <h2>📝 Tạo Hoá Đơn Học Phí</h2>

              marginBottom: 20,            {loading ? <p>Loading...</p> : students.length === 0 ? <p>Không có học viên NEW</p> : (

              background: message.includes('✅') ? '#d1fae5' : '#fee2e2',              <div>

              color: message.includes('✅') ? '#065f46' : '#991b1b',                <div style={{ marginBottom: 20 }}>

              fontWeight: 600,                  <label style={{ fontWeight: 600, display: 'block', marginBottom: 10 }}>Chọn Học Viên</label>

            }}>                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 10 }}>

              {message}                    {students.map(s => (

            </div>                      <div key={s.id} onClick={() => setSelectedStudent(s)} style={{ padding: 10, border: selectedStudent?.id === s.id ? '2px solid #667eea' : '1px solid #e0e0e0', borderRadius: 6, cursor: 'pointer', background: selectedStudent?.id === s.id ? '#f0f4ff' : '#fff' }}>

          )}                        <div style={{ fontWeight: 600 }}>{s.name}</div>

                        <div style={{ fontSize: 12, color: '#666' }}>{s.phone}</div>

          {/* Content */}                      </div>

          <div style={{                    ))}

            background: '#fff',                  </div>

            borderRadius: 12,                </div>

            padding: 30,                {selectedStudent && (

            boxShadow: '0 4px 20px rgba(0,0,0,0.1)',                  <form onSubmit={createInvoice} style={{ background: '#f9fafb', padding: 20, borderRadius: 8 }}>

          }}>                    <div style={{ marginBottom: 15 }}>

            {tab === 'create' && (                      <label style={{ fontWeight: 600, display: 'block', marginBottom: 5 }}>Khoá Học *</label>

              <div>                      <select value={courseId} onChange={(e) => setCourseId(e.target.value)} style={{ width: '100%', padding: '8px 10px', borderRadius: 6, border: '1px solid #d1d5db' }}>

                <h2 style={{ marginTop: 0, marginBottom: 20, color: '#333' }}>Tạo Hoá Đơn Mới</h2>                        <option value="">-- Chọn --</option>

                {loading ? (                        {courses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}

                  <p>⏳ Đang tải...</p>                      </select>

                ) : students.length === 0 ? (                    </div>

                  <p style={{ color: '#6b7280' }}>Không có học viên trạng thái NEW</p>                    <div style={{ marginBottom: 15 }}>

                ) : (                      <label style={{ fontWeight: 600, display: 'block', marginBottom: 5 }}>Số Tiền (VNĐ) *</label>

                  <form onSubmit={createInvoice}>                      <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="5000000" style={{ width: '100%', padding: '8px 10px', borderRadius: 6, border: '1px solid #d1d5db' }} />

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>                    </div>

                      <div>                    <button type="submit" disabled={submitting} style={{ padding: '10px 20px', background: submitting ? '#9ca3af' : '#10b981', color: '#fff', border: 'none', cursor: 'pointer', borderRadius: 6, fontWeight: 600 }}>

                        <label style={{ display: 'block', marginBottom: 8, fontWeight: 600 }}>Chọn Học Viên</label>                      {submitting ? 'Đang lưu...' : 'Tạo Hoá Đơn'}

                        <select                    </button>

                          value={selectedStudent?.id || ''}                  </form>

                          onChange={(e) => setSelectedStudent(students.find(s => s.id === parseInt(e.target.value)))}                )}

                          style={{              </div>

                            width: '100%',            )}

                            padding: '10px 12px',          </div>

                            border: '1px solid #d1d5db',        )}

                            borderRadius: 6,

                            fontSize: 14,        {tab === 'payment' && (

                          }}          <div style={{ background: '#fff', padding: 30, borderRadius: 12 }}>

                        >            <h2>💰 Thanh Toán Hoá Đơn</h2>

                          <option value="">-- Chọn --</option>            {loading ? <p>Loading...</p> : invoices.length === 0 ? <p>Không có hoá đơn PENDING</p> : (

                          {students.map(s => (              <div>

                            <option key={s.id} value={s.id}>{s.full_name} ({s.phone})</option>                <div style={{ marginBottom: 20 }}>

                          ))}                  <label style={{ fontWeight: 600, display: 'block', marginBottom: 10 }}>Chọn Hoá Đơn</label>

                        </select>                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: 10 }}>

                      </div>                    {invoices.map(inv => (

                      <div>                      <div key={inv.id} onClick={() => setSelectedInvoice(inv)} style={{ padding: 10, border: selectedInvoice?.id === inv.id ? '2px solid #667eea' : '1px solid #e0e0e0', borderRadius: 6, cursor: 'pointer', background: selectedInvoice?.id === inv.id ? '#f0f4ff' : '#fff' }}>

                        <label style={{ display: 'block', marginBottom: 8, fontWeight: 600 }}>Chọn Khoá Học</label>                        <div style={{ fontWeight: 600 }}>HĐ #{inv.id}</div>

                        <select                        <div style={{ fontSize: 12, color: '#666' }}>👤 {inv.student_name}</div>

                          value={courseId}                        <div style={{ fontSize: 13, fontWeight: 600, color: '#10b981', marginTop: 5 }}>💰 {Number(inv.amount || 0).toLocaleString('vi-VN')} đ</div>

                          onChange={(e) => setCourseId(e.target.value)}                      </div>

                          style={{                    ))}

                            width: '100%',                  </div>

                            padding: '10px 12px',                </div>

                            border: '1px solid #d1d5db',                {selectedInvoice && (

                            borderRadius: 6,                  <form onSubmit={processPayment} style={{ background: '#f9fafb', padding: 20, borderRadius: 8 }}>

                            fontSize: 14,                    <div style={{ marginBottom: 15 }}>

                          }}                      <label style={{ fontWeight: 600 }}>Hoá Đơn: HĐ #{selectedInvoice.id} - {selectedInvoice.student_name}</label>

                        >                    </div>

                          <option value="">-- Chọn --</option>                    <div style={{ marginBottom: 15 }}>

                          {courses.map(c => (                      <label style={{ fontWeight: 600, display: 'block', marginBottom: 5 }}>Phương Thức *</label>

                            <option key={c.id} value={c.id}>{c.name}</option>                      <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)} style={{ width: '100%', padding: '8px 10px', borderRadius: 6, border: '1px solid #d1d5db' }}>

                          ))}                        <option value="cash">💵 Tiền Mặt</option>

                        </select>                        <option value="bank">🏦 Chuyển Khoán</option>

                      </div>                        <option value="card">💳 Thẻ</option>

                    </div>                        <option value="other">📱 Khác</option>

                    <div style={{ marginBottom: 20 }}>                      </select>

                      <label style={{ display: 'block', marginBottom: 8, fontWeight: 600 }}>Số Tiền (VNĐ)</label>                    </div>

                      <input                    

                        type="number"                    {paymentMethod === 'bank' && bankInfo && (

                        value={amount}                      <div style={{ marginBottom: 15, background: '#ecfdf5', padding: 15, borderRadius: 8, border: '2px solid #10b981' }}>

                        onChange={(e) => setAmount(e.target.value)}                        <h3 style={{ color: '#059669', marginTop: 0 }}>📋 Thông Tin Chuyển Khoán</h3>

                        placeholder="VD: 5000000"                        <div style={{ lineHeight: 1.8 }}>

                        style={{                          <p><strong>Ngân Hàng:</strong> {bankInfo.bank_name}</p>

                          width: '100%',                          <p><strong>Số Tài Khoản:</strong> <span style={{ fontFamily: 'monospace', background: '#fff', padding: '4px 8px', borderRadius: 4 }}>{bankInfo.account_number}</span></p>

                          padding: '10px 12px',                          <p><strong>Chủ Tài Khoản:</strong> {bankInfo.account_holder}</p>

                          border: '1px solid #d1d5db',                          <p style={{ fontSize: 12, color: '#666', marginTop: 10 }}>💡 Vui lòng chuyển khoản theo thông tin trên và ghi đúng số hoá đơn trong nội dung chuyển khoản</p>

                          borderRadius: 6,                        </div>

                          fontSize: 14,                      </div>

                        }}                    )}

                      />                    

                    </div>                    <div style={{ marginBottom: 15 }}>

                    <button                      <label style={{ fontWeight: 600, display: 'block', marginBottom: 5 }}>Ghi Chú</label>

                      type="submit"                      <input type="text" value={paymentNote} onChange={(e) => setPaymentNote(e.target.value)} placeholder="Ghi chú" style={{ width: '100%', padding: '8px 10px', borderRadius: 6, border: '1px solid #d1d5db' }} />

                      disabled={submitting}                    </div>

                      style={{                    <button type="submit" disabled={submitting} style={{ padding: '10px 20px', background: submitting ? '#9ca3af' : '#10b981', color: '#fff', border: 'none', cursor: 'pointer', borderRadius: 6, fontWeight: 600 }}>

                        padding: '12px 24px',                      {submitting ? 'Đang xử lý...' : 'Xác Nhận Thanh Toán'}

                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',                    </button>

                        color: '#fff',                  </form>

                        border: 'none',                )}

                        borderRadius: 6,              </div>

                        cursor: submitting ? 'not-allowed' : 'pointer',            )}

                        fontWeight: 600,          </div>

                        fontSize: 14,        )}

                      }}

                    >        {tab === 'list' && (

                      {submitting ? '⏳ Đang tạo...' : '✅ Tạo Hoá Đơn'}          <div style={{ background: '#fff', padding: 30, borderRadius: 12 }}>

                    </button>            <h2>📋 Danh Sách Tất Cả Hoá Đơn</h2>

                  </form>            {loading ? <p>Loading...</p> : invoices.length === 0 ? <p>Chưa có hoá đơn</p> : (

                )}              <div>

              </div>                <div style={{ display: 'grid', gridTemplateColumns: '1fr 150px', gap: 15, marginBottom: 20 }}>

            )}                  <div>

                    <label style={{ fontWeight: 600, display: 'block', marginBottom: 5 }}>🔍 Tìm Kiếm</label>

            {tab === 'payment' && (                    <input type="text" value={searchText} onChange={(e) => setSearchText(e.target.value.toLowerCase())} placeholder="Tên / Khoá" style={{ width: '100%', padding: '8px 10px', borderRadius: 6, border: '1px solid #d1d5db' }} />

              <div>                  </div>

                <h2 style={{ marginTop: 0, marginBottom: 20, color: '#333' }}>Xử Lý Thanh Toán</h2>                  <div>

                {selectedInvoice && bankInfo && (                    <label style={{ fontWeight: 600, display: 'block', marginBottom: 5 }}>🏷️ Lọc</label>

                  <div style={{                    <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} style={{ width: '100%', padding: '8px 10px', borderRadius: 6, border: '1px solid #d1d5db' }}>

                    padding: 15,                      <option value="all">Tất Cả</option>

                    background: '#fef3c7',                      <option value="pending">⏳ PENDING</option>

                    borderRadius: 8,                      <option value="paid">✅ PAID</option>

                    marginBottom: 20,                    </select>

                    borderLeft: '4px solid #f59e0b',                  </div>

                  }}>                </div>

                    <p style={{ margin: 0, fontWeight: 600, marginBottom: 8 }}>🏦 Thông Tin Ngân Hàng (Chuyển Khoán):</p>                {(() => {

                    <p style={{ margin: 0, fontSize: 14 }}>🏪 {bankInfo.bank_name}</p>                  const filtered = invoices.filter(inv => {

                    <p style={{ margin: 0, fontSize: 14, fontFamily: 'monospace', fontWeight: 600 }}>STK: {bankInfo.account_number}</p>                    const match1 = filterStatus === 'all' || inv.status?.toLowerCase() === filterStatus;

                  </div>                    const match2 = searchText === '' || (inv.student_name || '').toLowerCase().includes(searchText) || (inv.course_name || '').toLowerCase().includes(searchText);

                )}                    return match1 && match2;

                {loading ? (                  });

                  <p>⏳ Đang tải...</p>                  if (filtered.length === 0) return <p>Không tìm thấy</p>;

                ) : invoices.length === 0 ? (                  return (

                  <p style={{ color: '#6b7280' }}>Không có hoá đơn chưa thanh toán</p>                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>

                ) : (                      <thead>

                  <div>                        <tr style={{ background: '#f3f4f6', borderBottom: '2px solid #e5e7eb' }}>

                    <div style={{ marginBottom: 20 }}>                          <th style={{ padding: '10px', textAlign: 'left' }}>HĐ #</th>

                      <label style={{ display: 'block', marginBottom: 8, fontWeight: 600 }}>Chọn Hoá Đơn Cần Thanh Toán</label>                          <th style={{ padding: '10px', textAlign: 'left' }}>Học Viên</th>

                      <select                          <th style={{ padding: '10px', textAlign: 'left' }}>Khoá</th>

                        value={selectedInvoice?.id || ''}                          <th style={{ padding: '10px', textAlign: 'right' }}>Số Tiền</th>

                        onChange={(e) => setSelectedInvoice(invoices.find(i => i.id === parseInt(e.target.value)))}                          <th style={{ padding: '10px', textAlign: 'center' }}>Trạng Thái</th>

                        style={{                          <th style={{ padding: '10px', textAlign: 'center' }}>Ngày Nộp</th>

                          width: '100%',                        </tr>

                          padding: '10px 12px',                      </thead>

                          border: '1px solid #d1d5db',                      <tbody>

                          borderRadius: 6,                        {filtered.map(inv => (

                          fontSize: 14,                          <tr key={inv.id} style={{ borderBottom: '1px solid #f3f4f6', background: inv.status?.toUpperCase() === 'PENDING' ? '#fef3c7' : '#fff' }}>

                        }}                            <td style={{ padding: '10px', fontWeight: 600 }}>#{inv.id}</td>

                      >                            <td style={{ padding: '10px' }}>{inv.student_name}</td>

                        <option value="">-- Chọn --</option>                            <td style={{ padding: '10px' }}>{inv.course_name}</td>

                        {invoices.map(i => (                            <td style={{ padding: '10px', textAlign: 'right', fontWeight: 600, color: '#10b981' }}>{Number(inv.amount || 0).toLocaleString('vi-VN')} đ</td>

                          <option key={i.id} value={i.id}>                            <td style={{ padding: '10px', textAlign: 'center' }}>

                            HĐ #{i.id} - {i.student_name} - {Number(i.amount).toLocaleString('vi-VN')}đ                              <span style={{ padding: '4px 8px', borderRadius: 4, background: inv.status?.toUpperCase() === 'PENDING' ? '#fcd34d' : '#d1fae5', color: inv.status?.toUpperCase() === 'PENDING' ? '#78350f' : '#065f46', fontSize: 11, fontWeight: 500 }}>

                          </option>                                {inv.status?.toUpperCase() === 'PENDING' ? '⏳' : '✓'}

                        ))}                              </span>

                      </select>                            </td>

                    </div>                            <td style={{ padding: '10px', textAlign: 'center', fontSize: 13, color: '#6b7280' }}>

                    {selectedInvoice && (                              {inv.paid_at ? new Date(inv.paid_at).toLocaleDateString('vi-VN') : '—'}

                      <form onSubmit={processPayment}>                            </td>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>                          </tr>

                          <div>                        ))}

                            <label style={{ display: 'block', marginBottom: 8, fontWeight: 600 }}>Phương Thức Thanh Toán</label>                      </tbody>

                            <select                    </table>

                              value={paymentMethod}                  );

                              onChange={(e) => setPaymentMethod(e.target.value)}                })()}

                              style={{              </div>

                                width: '100%',            )}

                                padding: '10px 12px',          </div>

                                border: '1px solid #d1d5db',        )}

                                borderRadius: 6,      </div>

                                fontSize: 14,    </div>

                              }}  );

                            >}

                              <option value="cash">💵 Tiền Mặt</option>
                              <option value="transfer">🏦 Chuyển Khoán</option>
                            </select>
                          </div>
                          <div>
                            <label style={{ display: 'block', marginBottom: 8, fontWeight: 600 }}>Ghi Chú</label>
                            <input
                              type="text"
                              value={paymentNote}
                              onChange={(e) => setPaymentNote(e.target.value)}
                              placeholder="VD: Thanh toán lớp A..."
                              style={{
                                width: '100%',
                                padding: '10px 12px',
                                border: '1px solid #d1d5db',
                                borderRadius: 6,
                                fontSize: 14,
                              }}
                            />
                          </div>
                        </div>
                        <button
                          type="submit"
                          disabled={submitting}
                          style={{
                            padding: '12px 24px',
                            background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                            color: '#fff',
                            border: 'none',
                            borderRadius: 6,
                            cursor: submitting ? 'not-allowed' : 'pointer',
                            fontWeight: 600,
                            fontSize: 14,
                          }}
                        >
                          {submitting ? '⏳ Đang xử lý...' : '✅ Xác Nhận Thanh Toán'}
                        </button>
                      </form>
                    )}
                  </div>
                )}
              </div>
            )}

            {tab === 'list' && (
              <div>
                <h2 style={{ marginTop: 0, marginBottom: 20, color: '#333' }}>Danh Sách Hoá Đơn</h2>
                {loading ? (
                  <p>⏳ Đang tải...</p>
                ) : invoices.length === 0 ? (
                  <p style={{ color: '#6b7280' }}>Không có hoá đơn</p>
                ) : (
                  <div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 150px', gap: 15, marginBottom: 20 }}>
                      <div>
                        <label style={{ display: 'block', marginBottom: 8, fontWeight: 600 }}>🔍 Tìm Kiếm</label>
                        <input
                          type="text"
                          value={searchText}
                          onChange={(e) => setSearchText(e.target.value.toLowerCase())}
                          placeholder="Tên / Khoá"
                          style={{
                            width: '100%',
                            padding: '10px 12px',
                            border: '1px solid #d1d5db',
                            borderRadius: 6,
                            fontSize: 14,
                          }}
                        />
                      </div>
                      <div>
                        <label style={{ display: 'block', marginBottom: 8, fontWeight: 600 }}>🏷️ Lọc</label>
                        <select
                          value={filterStatus}
                          onChange={(e) => setFilterStatus(e.target.value)}
                          style={{
                            width: '100%',
                            padding: '10px 12px',
                            border: '1px solid #d1d5db',
                            borderRadius: 6,
                            fontSize: 14,
                          }}
                        >
                          <option value="all">Tất Cả</option>
                          <option value="pending">⏳ Chưa Nộp</option>
                          <option value="paid">✅ Đã Nộp</option>
                        </select>
                      </div>
                    </div>
                    {(() => {
                      const filtered = invoices.filter(inv => {
                        const match1 = filterStatus === 'all' || inv.status?.toLowerCase() === filterStatus;
                        const match2 = searchText === '' || (inv.student_name || '').toLowerCase().includes(searchText) || (inv.course_name || '').toLowerCase().includes(searchText);
                        return match1 && match2;
                      });
                      if (filtered.length === 0)
                        return <p style={{ color: '#6b7280' }}>Không tìm thấy hoá đơn</p>;
                      return (
                        <div style={{ overflowX: 'auto' }}>
                          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                              <tr style={{ background: '#f3f4f6', borderBottom: '2px solid #d1d5db' }}>
                                <th style={{ padding: 12, textAlign: 'left', fontWeight: 600 }}>HĐ #</th>
                                <th style={{ padding: 12, textAlign: 'left', fontWeight: 600 }}>Học Viên</th>
                                <th style={{ padding: 12, textAlign: 'left', fontWeight: 600 }}>Khoá</th>
                                <th style={{ padding: 12, textAlign: 'right', fontWeight: 600 }}>Số Tiền</th>
                                <th style={{ padding: 12, textAlign: 'center', fontWeight: 600 }}>Trạng Thái</th>
                                <th style={{ padding: 12, textAlign: 'center', fontWeight: 600 }}>Ngày Nộp</th>
                              </tr>
                            </thead>
                            <tbody>
                              {filtered.map((inv, idx) => (
                                <tr key={inv.id} style={{ borderBottom: '1px solid #e5e7eb', background: idx % 2 === 0 ? '#fff' : '#f9fafb' }}>
                                  <td style={{ padding: 12, fontWeight: 600 }}>#{inv.id}</td>
                                  <td style={{ padding: 12 }}>{inv.student_name}</td>
                                  <td style={{ padding: 12 }}>{inv.course_name}</td>
                                  <td style={{ padding: 12, textAlign: 'right', color: '#10b981', fontWeight: 600 }}>
                                    {Number(inv.amount || 0).toLocaleString('vi-VN')} đ
                                  </td>
                                  <td style={{ padding: 12, textAlign: 'center' }}>
                                    <span style={{
                                      padding: '4px 8px',
                                      borderRadius: 4,
                                      background: inv.status?.toUpperCase() === 'PAID' ? '#d1fae5' : '#fef3c7',
                                      color: inv.status?.toUpperCase() === 'PAID' ? '#065f46' : '#78350f',
                                      fontSize: 11,
                                      fontWeight: 600,
                                    }}>
                                      {inv.status?.toUpperCase() === 'PAID' ? '✅ Đã Nộp' : '⏳ Chưa Nộp'}
                                    </span>
                                  </td>
                                  <td style={{ padding: 12, textAlign: 'center', color: '#6b7280', fontSize: 12 }}>
                                    {inv.paid_at ? new Date(inv.paid_at).toLocaleDateString('vi-VN') : '—'}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      );
                    })()}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
