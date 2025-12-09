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

    <div style={{ width: '100%', minHeight: '100vh', background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)', paddingTop: 0 }}>    <div style={{width:'100%',minHeight:'100vh',background:'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',paddingTop:0}}>

      <div style={{      <div style={{background:'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',color:'white',padding:'40px 20px',boxShadow:'0 4px 20px rgba(0,0,0,0.1)',marginBottom:30}}>

        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',        <div style={{maxWidth:1200,margin:'0 auto',display:'flex',justifyContent:'space-between',alignItems:'center'}}>

        color: 'white',          <div>

        padding: '40px 20px',            <h1 style={{margin:0,fontSize:32,fontWeight:700}}>💰 Dashboard Kế Toán</h1>

        boxShadow: '0 4px 20px rgba(0,0,0,0.1)',            <p style={{margin:'8px 0 0 0',fontSize:16,opacity:0.9}}>Xin chào, <b>{username}</b></p>

        marginBottom: 30          </div>

      }}>          <button onClick={handleLogout} style={{padding:'10px 24px',background:'rgba(255,255,255,0.2)',color:'white',border:'2px solid white',borderRadius:6,cursor:'pointer',fontWeight:600,transition:'all 0.3s',fontSize:14}} onMouseOver={(e) => {e.target.style.background='rgba(255,255,255,0.3)';}} onMouseOut={(e) => {e.target.style.background='rgba(255,255,255,0.2)';}}>Đăng xuất</button>

        <div style={{        </div>

          maxWidth: 1200,      </div>

          margin: '0 auto',      <div style={{display:'flex',justifyContent:'center',paddingBottom:40}}>

          display: 'flex',        <div style={{width:1200}}>

          justifyContent: 'space-between',          <div style={{marginBottom:30}}>

          alignItems: 'center'            <div style={{fontWeight:700,marginBottom:16,fontSize:18,color:'#333'}}>📚 Chức Năng</div>

        }}>            <div style={{display:'flex',gap:12,flexWrap:'wrap',alignItems:'center'}}>

          <div>              <button onClick={() => setTab('create')} style={{padding:'12px 20px',borderRadius:8,border:'none',background:tab==='create'?'linear-gradient(135deg, #667eea 0%, #764ba2 100%)':'#fff',color:tab==='create'?'#fff':'#333',cursor:'pointer',fontWeight:600,boxShadow:tab==='create'?'0 4px 12px rgba(102, 126, 234, 0.4)':'0 2px 8px rgba(0,0,0,0.1)',transition:'all 0.3s',fontSize:14}} onMouseOver={(e) => {if(tab==='create'){e.target.style.transform='translateY(-2px)';e.target.style.boxShadow='0 6px 16px rgba(102, 126, 234, 0.6)';}}} onMouseOut={(e) => {if(tab==='create'){e.target.style.transform='translateY(0)';e.target.style.boxShadow='0 4px 12px rgba(102, 126, 234, 0.4)';}}}}>📝 Tạo Hoá Đơn</button>

            <h1 style={{ margin: 0, fontSize: 32, fontWeight: 700 }}>💰 Dashboard Kế Toán</h1>              <button onClick={() => setTab('payment')} style={{padding:'12px 20px',borderRadius:8,border:'none',background:tab==='payment'?'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)':'#fff',color:tab==='payment'?'#fff':'#333',cursor:'pointer',fontWeight:600,boxShadow:tab==='payment'?'0 4px 12px rgba(245, 87, 108, 0.4)':'0 2px 8px rgba(0,0,0,0.1)',transition:'all 0.3s',fontSize:14}} onMouseOver={(e) => {if(tab==='payment'){e.target.style.transform='translateY(-2px)';e.target.style.boxShadow='0 6px 16px rgba(245, 87, 108, 0.6)';}}} onMouseOut={(e) => {if(tab==='payment'){e.target.style.transform='translateY(0)';e.target.style.boxShadow='0 4px 12px rgba(245, 87, 108, 0.4)';}}}}>💳 Thanh Toán</button>

            <p style={{ margin: '8px 0 0 0', fontSize: 16, opacity: 0.9 }}>Xin chào, <b>{username}</b></p>              <button onClick={() => setTab('list')} style={{padding:'12px 20px',borderRadius:8,border:'none',background:tab==='list'?'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)':'#fff',color:tab==='list'?'#fff':'#333',cursor:'pointer',fontWeight:600,boxShadow:tab==='list'?'0 4px 12px rgba(79, 172, 254, 0.4)':'0 2px 8px rgba(0,0,0,0.1)',transition:'all 0.3s',fontSize:14}} onMouseOver={(e) => {if(tab==='list'){e.target.style.transform='translateY(-2px)';e.target.style.boxShadow='0 6px 16px rgba(79, 172, 254, 0.6)';}}} onMouseOut={(e) => {if(tab==='list'){e.target.style.transform='translateY(0)';e.target.style.boxShadow='0 4px 12px rgba(79, 172, 254, 0.4)';}}}}>�� Danh Sách</button>

          </div>              <div style={{flex:1}}></div>

          <button              <button onClick={() => navigate('/accountant/report')} style={{padding:'12px 20px',borderRadius:8,border:'2px solid #667eea',background:'#fff',color:'#667eea',cursor:'pointer',fontWeight:600,transition:'all 0.3s',fontSize:14}} onMouseOver={(e) => {e.target.style.background='#667eea';e.target.style.color='#fff';}} onMouseOut={(e) => {e.target.style.background='#fff';e.target.style.color='#667eea';}}>📊 Xem Báo Cáo</button>

            onClick={handleLogout}              <button onClick={() => navigate('/accountant/inquiry')} style={{padding:'12px 20px',borderRadius:8,border:'none',background:'linear-gradient(135deg, #10b981 0%, #059669 100%)',color:'#fff',cursor:'pointer',fontWeight:600,boxShadow:'0 4px 12px rgba(16, 185, 129, 0.4)',transition:'all 0.3s',fontSize:14}} onMouseOver={(e) => {e.target.style.transform='translateY(-2px)';e.target.style.boxShadow='0 6px 16px rgba(16, 185, 129, 0.6)';}} onMouseOut={(e) => {e.target.style.transform='translateY(0)';e.target.style.boxShadow='0 4px 12px rgba(16, 185, 129, 0.4)';}}>🔍 Tra Cứu</button>

            style={{              <button onClick={() => navigate('/accountant/notification')} style={{padding:'12px 20px',borderRadius:8,border:'none',background:'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',color:'#fff',cursor:'pointer',fontWeight:600,boxShadow:'0 4px 12px rgba(245, 158, 11, 0.4)',transition:'all 0.3s',fontSize:14}} onMouseOver={(e) => {e.target.style.transform='translateY(-2px)';e.target.style.boxShadow='0 6px 16px rgba(245, 158, 11, 0.6)';}} onMouseOut={(e) => {e.target.style.transform='translateY(0)';e.target.style.boxShadow='0 4px 12px rgba(245, 158, 11, 0.4)';}}>📧 Gửi Thông Báo</button>

              padding: '10px 24px',            </div>

              background: 'rgba(255,255,255,0.2)',          </div>

              color: 'white',          {message && <div style={{padding:'15px 20px',borderRadius:8,marginBottom:20,background:message.includes('✅')?'#d1fae5':'#fee2e2',color:message.includes('✅')?'#065f46':'#991b1b',fontWeight:600}}>{message}</div>}

              border: '2px solid white',          <div style={{background:'#fff',borderRadius:12,padding:30,boxShadow:'0 4px 20px rgba(0,0,0,0.1)'}}>

              borderRadius: 6,            {tab==='create' && <div><h2 style={{marginTop:0,marginBottom:20,color:'#333'}}>Tạo Hoá Đơn Mới</h2>{loading?<p>⏳ Đang tải...</p>:students.length===0?<p style={{color:'#6b7280'}}>Không có học viên trạng thái NEW</p>:<form onSubmit={createInvoice}><div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:20,marginBottom:20}}><div><label style={{display:'block',marginBottom:8,fontWeight:600}}>Chọn Học Viên</label><select value={selectedStudent?.id||''} onChange={(e) => setSelectedStudent(students.find(s => s.id===parseInt(e.target.value)))} style={{width:'100%',padding:'10px 12px',border:'1px solid #d1d5db',borderRadius:6,fontSize:14}}><option value="">-- Chọn --</option>{students.map(s => <option key={s.id} value={s.id}>{s.full_name} ({s.phone})</option>)}</select></div><div><label style={{display:'block',marginBottom:8,fontWeight:600}}>Chọn Khoá Học</label><select value={courseId} onChange={(e) => setCourseId(e.target.value)} style={{width:'100%',padding:'10px 12px',border:'1px solid #d1d5db',borderRadius:6,fontSize:14}}><option value="">-- Chọn --</option>{courses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select></div></div><div style={{marginBottom:20}}><label style={{display:'block',marginBottom:8,fontWeight:600}}>Số Tiền (VNĐ)</label><input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="VD: 5000000" style={{width:'100%',padding:'10px 12px',border:'1px solid #d1d5db',borderRadius:6,fontSize:14}}/></div><button type="submit" disabled={submitting} style={{padding:'12px 24px',background:'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',color:'#fff',border:'none',borderRadius:6,cursor:submitting?'not-allowed':'pointer',fontWeight:600,fontSize:14}}>{submitting?'⏳ Đang tạo...':'✅ Tạo Hoá Đơn'}</button></form>}</div>}

              cursor: 'pointer',            {tab==='payment' && <div><h2 style={{marginTop:0,marginBottom:20,color:'#333'}}>Xử Lý Thanh Toán</h2>{selectedInvoice&&bankInfo&&<div style={{padding:15,background:'#fef3c7',borderRadius:8,marginBottom:20,borderLeft:'4px solid #f59e0b'}}><p style={{margin:0,fontWeight:600,marginBottom:8}}>🏦 Thông Tin Ngân Hàng (Chuyển Khoán):</p><p style={{margin:0,fontSize:14}}>🏪 {bankInfo.bank_name}</p><p style={{margin:0,fontSize:14,fontFamily:'monospace',fontWeight:600}}>STK: {bankInfo.account_number}</p></div>}{loading?<p>⏳ Đang tải...</p>:invoices.length===0?<p style={{color:'#6b7280'}}>Không có hoá đơn chưa thanh toán</p>:<div><div style={{marginBottom:20}}><label style={{display:'block',marginBottom:8,fontWeight:600}}>Chọn Hoá Đơn Cần Thanh Toán</label><select value={selectedInvoice?.id||''} onChange={(e) => setSelectedInvoice(invoices.find(i => i.id===parseInt(e.target.value)))} style={{width:'100%',padding:'10px 12px',border:'1px solid #d1d5db',borderRadius:6,fontSize:14}}><option value="">-- Chọn --</option>{invoices.map(i => <option key={i.id} value={i.id}>HĐ #{i.id} - {i.student_name} - {Number(i.amount).toLocaleString('vi-VN')}đ</option>)}</select></div>{selectedInvoice&&<form onSubmit={processPayment}><div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:20,marginBottom:20}}><div><label style={{display:'block',marginBottom:8,fontWeight:600}}>Phương Thức Thanh Toán</label><select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)} style={{width:'100%',padding:'10px 12px',border:'1px solid #d1d5db',borderRadius:6,fontSize:14}}><option value="cash">💵 Tiền Mặt</option><option value="transfer">🏦 Chuyển Khoán</option></select></div><div><label style={{display:'block',marginBottom:8,fontWeight:600}}>Ghi Chú</label><input type="text" value={paymentNote} onChange={(e) => setPaymentNote(e.target.value)} placeholder="VD: Thanh toán lớp A..." style={{width:'100%',padding:'10px 12px',border:'1px solid #d1d5db',borderRadius:6,fontSize:14}}/></div></div><button type="submit" disabled={submitting} style={{padding:'12px 24px',background:'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',color:'#fff',border:'none',borderRadius:6,cursor:submitting?'not-allowed':'pointer',fontWeight:600,fontSize:14}}>{submitting?'⏳ Đang xử lý...':'✅ Xác Nhận Thanh Toán'}</button></form>}</div>}</div>}

              fontWeight: 600,            {tab==='list' && <div><h2 style={{marginTop:0,marginBottom:20,color:'#333'}}>Danh Sách Hoá Đơn</h2>{loading?<p>⏳ Đang tải...</p>:invoices.length===0?<p style={{color:'#6b7280'}}>Không có hoá đơn</p>:<div><div style={{display:'grid',gridTemplateColumns:'1fr 150px',gap:15,marginBottom:20}}><div><label style={{display:'block',marginBottom:8,fontWeight:600}}>🔍 Tìm Kiếm</label><input type="text" value={searchText} onChange={(e) => setSearchText(e.target.value.toLowerCase())} placeholder="Tên / Khoá" style={{width:'100%',padding:'10px 12px',border:'1px solid #d1d5db',borderRadius:6,fontSize:14}}/></div><div><label style={{display:'block',marginBottom:8,fontWeight:600}}>🏷️ Lọc</label><select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} style={{width:'100%',padding:'10px 12px',border:'1px solid #d1d5db',borderRadius:6,fontSize:14}}><option value="all">Tất Cả</option><option value="pending">⏳ Chưa Nộp</option><option value="paid">✅ Đã Nộp</option></select></div></div>{(() => {const filtered=invoices.filter(inv => {const match1=filterStatus==='all'||inv.status?.toLowerCase()===filterStatus;const match2=searchText===''||(inv.student_name||'').toLowerCase().includes(searchText)||(inv.course_name||'').toLowerCase().includes(searchText);return match1&&match2;});if(filtered.length===0)return <p style={{color:'#6b7280'}}>Không tìm thấy hoá đơn</p>;return <div style={{overflowX:'auto'}}><table style={{width:'100%',borderCollapse:'collapse'}}><thead><tr style={{background:'#f3f4f6',borderBottom:'2px solid #d1d5db'}}><th style={{padding:12,textAlign:'left',fontWeight:600}}>HĐ #</th><th style={{padding:12,textAlign:'left',fontWeight:600}}>Học Viên</th><th style={{padding:12,textAlign:'left',fontWeight:600}}>Khoá</th><th style={{padding:12,textAlign:'right',fontWeight:600}}>Số Tiền</th><th style={{padding:12,textAlign:'center',fontWeight:600}}>Trạng Thái</th><th style={{padding:12,textAlign:'center',fontWeight:600}}>Ngày Nộp</th></tr></thead><tbody>{filtered.map((inv,idx) => <tr key={inv.id} style={{borderBottom:'1px solid #e5e7eb',background:idx%2===0?'#fff':'#f9fafb'}}><td style={{padding:12,fontWeight:600}}>#{inv.id}</td><td style={{padding:12}}>{inv.student_name}</td><td style={{padding:12}}>{inv.course_name}</td><td style={{padding:12,textAlign:'right',color:'#10b981',fontWeight:600}}>{Number(inv.amount||0).toLocaleString('vi-VN')} đ</td><td style={{padding:12,textAlign:'center'}}><span style={{padding:'4px 8px',borderRadius:4,background:inv.status?.toUpperCase()==='PAID'?'#d1fae5':'#fef3c7',color:inv.status?.toUpperCase()==='PAID'?'#065f46':'#78350f',fontSize:11,fontWeight:600}}>{inv.status?.toUpperCase()==='PAID'?'✅ Đã Nộp':'⏳ Chưa Nộp'}</span></td><td style={{padding:12,textAlign:'center',color:'#6b7280',fontSize:12}}>{inv.paid_at?new Date(inv.paid_at).toLocaleDateString('vi-VN'):'—'}</td></tr>)}</tbody></table></div>;})()}</div>}</div>}

              transition: 'all 0.3s',          </div>

              fontSize: 14        </div>

            }}      </div>

            onMouseOver={(e) => { e.target.style.background = 'rgba(255,255,255,0.3)'; }}    </div>

            onMouseOut={(e) => { e.target.style.background = 'rgba(255,255,255,0.2)'; }}  );

          >}

            Đăng xuất
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', paddingBottom: 40 }}>
        <div style={{ width: 1200 }}>
          <div style={{ marginBottom: 30 }}>
            <div style={{ fontWeight: 700, marginBottom: 16, fontSize: 18, color: '#333' }}>📚 Chức Năng</div>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
              <button
                onClick={() => setTab('create')}
                style={{
                  padding: '12px 20px',
                  borderRadius: 8,
                  border: 'none',
                  background: tab === 'create' ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : '#fff',
                  color: tab === 'create' ? '#fff' : '#333',
                  cursor: 'pointer',
                  fontWeight: 600,
                  boxShadow: tab === 'create' ? '0 4px 12px rgba(102, 126, 234, 0.4)' : '0 2px 8px rgba(0,0,0,0.1)',
                  transition: 'all 0.3s',
                  fontSize: 14
                }}
                onMouseOver={(e) => {
                  if (tab === 'create') {
                    e.target.style.transform = 'translateY(-2px)';
                    e.target.style.boxShadow = '0 6px 16px rgba(102, 126, 234, 0.6)';
                  }
                }}
                onMouseOut={(e) => {
                  if (tab === 'create') {
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.4)';
                  }
                }}
              >
                📝 Tạo Hoá Đơn
              </button>

              <button
                onClick={() => setTab('payment')}
                style={{
                  padding: '12px 20px',
                  borderRadius: 8,
                  border: 'none',
                  background: tab === 'payment' ? 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' : '#fff',
                  color: tab === 'payment' ? '#fff' : '#333',
                  cursor: 'pointer',
                  fontWeight: 600,
                  boxShadow: tab === 'payment' ? '0 4px 12px rgba(245, 87, 108, 0.4)' : '0 2px 8px rgba(0,0,0,0.1)',
                  transition: 'all 0.3s',
                  fontSize: 14
                }}
                onMouseOver={(e) => {
                  if (tab === 'payment') {
                    e.target.style.transform = 'translateY(-2px)';
                    e.target.style.boxShadow = '0 6px 16px rgba(245, 87, 108, 0.6)';
                  }
                }}
                onMouseOut={(e) => {
                  if (tab === 'payment') {
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.boxShadow = '0 4px 12px rgba(245, 87, 108, 0.4)';
                  }
                }}
              >
                💳 Thanh Toán
              </button>

              <button
                onClick={() => setTab('list')}
                style={{
                  padding: '12px 20px',
                  borderRadius: 8,
                  border: 'none',
                  background: tab === 'list' ? 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' : '#fff',
                  color: tab === 'list' ? '#fff' : '#333',
                  cursor: 'pointer',
                  fontWeight: 600,
                  boxShadow: tab === 'list' ? '0 4px 12px rgba(79, 172, 254, 0.4)' : '0 2px 8px rgba(0,0,0,0.1)',
                  transition: 'all 0.3s',
                  fontSize: 14
                }}
                onMouseOver={(e) => {
                  if (tab === 'list') {
                    e.target.style.transform = 'translateY(-2px)';
                    e.target.style.boxShadow = '0 6px 16px rgba(79, 172, 254, 0.6)';
                  }
                }}
                onMouseOut={(e) => {
                  if (tab === 'list') {
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.boxShadow = '0 4px 12px rgba(79, 172, 254, 0.4)';
                  }
                }}
              >
                📋 Danh Sách
              </button>

              <div style={{ flex: 1 }}></div>

              <button
                onClick={() => navigate('/accountant/report')}
                style={{
                  padding: '12px 20px',
                  borderRadius: 8,
                  border: '2px solid #667eea',
                  background: '#fff',
                  color: '#667eea',
                  cursor: 'pointer',
                  fontWeight: 600,
                  transition: 'all 0.3s',
                  fontSize: 14
                }}
                onMouseOver={(e) => {
                  e.target.style.background = '#667eea';
                  e.target.style.color = '#fff';
                }}
                onMouseOut={(e) => {
                  e.target.style.background = '#fff';
                  e.target.style.color = '#667eea';
                }}
              >
                📊 Xem Báo Cáo
              </button>

              <button
                onClick={() => navigate('/accountant/inquiry')}
                style={{
                  padding: '12px 20px',
                  borderRadius: 8,
                  border: 'none',
                  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  color: '#fff',
                  cursor: 'pointer',
                  fontWeight: 600,
                  boxShadow: '0 4px 12px rgba(16, 185, 129, 0.4)',
                  transition: 'all 0.3s',
                  fontSize: 14
                }}
                onMouseOver={(e) => {
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = '0 6px 16px rgba(16, 185, 129, 0.6)';
                }}
                onMouseOut={(e) => {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = '0 4px 12px rgba(16, 185, 129, 0.4)';
                }}
              >
                🔍 Tra Cứu
              </button>

              <button
                onClick={() => navigate('/accountant/notification')}
                style={{
                  padding: '12px 20px',
                  borderRadius: 8,
                  border: 'none',
                  background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                  color: '#fff',
                  cursor: 'pointer',
                  fontWeight: 600,
                  boxShadow: '0 4px 12px rgba(245, 158, 11, 0.4)',
                  transition: 'all 0.3s',
                  fontSize: 14
                }}
                onMouseOver={(e) => {
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = '0 6px 16px rgba(245, 158, 11, 0.6)';
                }}
                onMouseOut={(e) => {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = '0 4px 12px rgba(245, 158, 11, 0.4)';
                }}
              >
                📧 Gửi Thông Báo
              </button>
            </div>
          </div>

          {message && (
            <div style={{
              padding: '15px 20px',
              borderRadius: 8,
              marginBottom: 20,
              background: message.includes('✅') ? '#d1fae5' : '#fee2e2',
              color: message.includes('✅') ? '#065f46' : '#991b1b',
              fontWeight: 600
            }}>
              {message}
            </div>
          )}

          <div style={{
            background: '#fff',
            borderRadius: 12,
            padding: 30,
            boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
          }}>
            {tab === 'create' && (
              <div>
                <h2 style={{ marginTop: 0, marginBottom: 20, color: '#333' }}>Tạo Hoá Đơn Mới</h2>
                {loading ? (
                  <p>⏳ Đang tải...</p>
                ) : students.length === 0 ? (
                  <p style={{ color: '#6b7280' }}>Không có học viên trạng thái NEW</p>
                ) : (
                  <form onSubmit={createInvoice}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
                      <div>
                        <label style={{ display: 'block', marginBottom: 8, fontWeight: 600 }}>Chọn Học Viên</label>
                        <select
                          value={selectedStudent?.id || ''}
                          onChange={(e) => setSelectedStudent(students.find(s => s.id === parseInt(e.target.value)))}
                          style={{
                            width: '100%',
                            padding: '10px 12px',
                            border: '1px solid #d1d5db',
                            borderRadius: 6,
                            fontSize: 14
                          }}
                        >
                          <option value="">-- Chọn --</option>
                          {students.map(s => (
                            <option key={s.id} value={s.id}>{s.full_name} ({s.phone})</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label style={{ display: 'block', marginBottom: 8, fontWeight: 600 }}>Chọn Khoá Học</label>
                        <select
                          value={courseId}
                          onChange={(e) => setCourseId(e.target.value)}
                          style={{
                            width: '100%',
                            padding: '10px 12px',
                            border: '1px solid #d1d5db',
                            borderRadius: 6,
                            fontSize: 14
                          }}
                        >
                          <option value="">-- Chọn --</option>
                          {courses.map(c => (
                            <option key={c.id} value={c.id}>{c.name}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div style={{ marginBottom: 20 }}>
                      <label style={{ display: 'block', marginBottom: 8, fontWeight: 600 }}>Số Tiền (VNĐ)</label>
                      <input
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        placeholder="VD: 5000000"
                        style={{
                          width: '100%',
                          padding: '10px 12px',
                          border: '1px solid #d1d5db',
                          borderRadius: 6,
                          fontSize: 14
                        }}
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={submitting}
                      style={{
                        padding: '12px 24px',
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        color: '#fff',
                        border: 'none',
                        borderRadius: 6,
                        cursor: submitting ? 'not-allowed' : 'pointer',
                        fontWeight: 600,
                        fontSize: 14
                      }}
                    >
                      {submitting ? '⏳ Đang tạo...' : '✅ Tạo Hoá Đơn'}
                    </button>
                  </form>
                )}
              </div>
            )}

            {tab === 'payment' && (
              <div>
                <h2 style={{ marginTop: 0, marginBottom: 20, color: '#333' }}>Xử Lý Thanh Toán</h2>
                {selectedInvoice && bankInfo && (
                  <div style={{
                    padding: 15,
                    background: '#fef3c7',
                    borderRadius: 8,
                    marginBottom: 20,
                    borderLeft: '4px solid #f59e0b'
                  }}>
                    <p style={{ margin: 0, fontWeight: 600, marginBottom: 8 }}>🏦 Thông Tin Ngân Hàng (Chuyển Khoán):</p>
                    <p style={{ margin: 0, fontSize: 14 }}>🏪 {bankInfo.bank_name}</p>
                    <p style={{ margin: 0, fontSize: 14, fontFamily: 'monospace', fontWeight: 600 }}>STK: {bankInfo.account_number}</p>
                  </div>
                )}
                {loading ? (
                  <p>⏳ Đang tải...</p>
                ) : invoices.length === 0 ? (
                  <p style={{ color: '#6b7280' }}>Không có hoá đơn chưa thanh toán</p>
                ) : (
                  <div>
                    <div style={{ marginBottom: 20 }}>
                      <label style={{ display: 'block', marginBottom: 8, fontWeight: 600 }}>Chọn Hoá Đơn Cần Thanh Toán</label>
                      <select
                        value={selectedInvoice?.id || ''}
                        onChange={(e) => setSelectedInvoice(invoices.find(i => i.id === parseInt(e.target.value)))}
                        style={{
                          width: '100%',
                          padding: '10px 12px',
                          border: '1px solid #d1d5db',
                          borderRadius: 6,
                          fontSize: 14
                        }}
                      >
                        <option value="">-- Chọn --</option>
                        {invoices.map(i => (
                          <option key={i.id} value={i.id}>HĐ #{i.id} - {i.student_name} - {Number(i.amount).toLocaleString('vi-VN')}đ</option>
                        ))}
                      </select>
                    </div>
                    {selectedInvoice && (
                      <form onSubmit={processPayment}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
                          <div>
                            <label style={{ display: 'block', marginBottom: 8, fontWeight: 600 }}>Phương Thức Thanh Toán</label>
                            <select
                              value={paymentMethod}
                              onChange={(e) => setPaymentMethod(e.target.value)}
                              style={{
                                width: '100%',
                                padding: '10px 12px',
                                border: '1px solid #d1d5db',
                                borderRadius: 6,
                                fontSize: 14
                              }}
                            >
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
                                fontSize: 14
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
                            fontSize: 14
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
                            fontSize: 14
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
                            fontSize: 14
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
                      if (filtered.length === 0) return <p style={{ color: '#6b7280' }}>Không tìm thấy hoá đơn</p>;
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
                                  <td style={{ padding: 12, textAlign: 'right', color: '#10b981', fontWeight: 600 }}>{Number(inv.amount || 0).toLocaleString('vi-VN')} đ</td>
                                  <td style={{ padding: 12, textAlign: 'center' }}>
                                    <span style={{
                                      padding: '4px 8px',
                                      borderRadius: 4,
                                      background: inv.status?.toUpperCase() === 'PAID' ? '#d1fae5' : '#fef3c7',
                                      color: inv.status?.toUpperCase() === 'PAID' ? '#065f46' : '#78350f',
                                      fontSize: 11,
                                      fontWeight: 600
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
