import React, { useState, useEffect } from 'react';
import axios from 'axios';

function FeeManagementPanel() {
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [payments, setPayments] = useState([]);
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState('cash');
  const [summary, setSummary] = useState([]);
  const [message, setMessage] = useState('');

  useEffect(() => {
    axios.get('/api/fee/courses').then(res => setCourses(res.data.courses));
    axios.get('/api/fee/summary').then(res => setSummary(res.data.summary));
  }, []);

  const loadStudents = (courseId) => {
    setSelectedCourse(courseId);
    setSelectedStudent(null);
    setPayments([]);
    axios.get(`/api/fee/courses/${courseId}/students`).then(res => setStudents(res.data.students));
  };

  const loadPayments = (studentId) => {
    setSelectedStudent(studentId);
    axios.get(`/api/fee/payments?course_id=${selectedCourse}&student_id=${studentId}`).then(res => setPayments(res.data.payments));
  };

  const handlePayment = () => {
    if (!selectedStudent) return;
    const enrollment = students.find(s => s.id === selectedStudent)?.enrollment_id;
    axios.post('/api/fee/payments', { enrollment_id: enrollment, amount, method }).then(() => {
      setMessage('Đã ghi nhận thanh toán!');
      loadPayments(selectedStudent);
    });
  };

  return (
    <div>
      <h2>Quản lý thu học phí</h2>
      <div>
        <label>Chọn khoá học: </label>
        <select onChange={e => loadStudents(e.target.value)}>
          <option value=''>--Chọn--</option>
          {courses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </div>
      {selectedCourse && (
        <div>
          <h3>Danh sách học viên</h3>
          <ul>
            {students.map(s => (
              <li key={s.id}>
                {s.name} - {s.phone}
                <button onClick={() => loadPayments(s.id)}>Xem thu phí</button>
              </li>
            ))}
          </ul>
        </div>
      )}
      {selectedStudent && (
        <div>
          <h4>Lịch sử thanh toán</h4>
          <ul>
            {payments.map(p => (
              <li key={p.id}>{p.paid_at}: {p.amount} ({p.method})</li>
            ))}
          </ul>
          <div>
            <input type='number' placeholder='Số tiền' value={amount} onChange={e => setAmount(e.target.value)} />
            <select value={method} onChange={e => setMethod(e.target.value)}>
              <option value='cash'>Tiền mặt</option>
              <option value='bank_transfer'>Chuyển khoản</option>
            </select>
            <button onClick={handlePayment}>Ghi nhận thanh toán</button>
          </div>
          {message && <div>{message}</div>}
        </div>
      )}
      <div>
        <h4>Báo cáo tổng hợp</h4>
        <ul>
          {summary.map(s => (
            <li key={s.id}>{s.name}: {s.total_paid || 0} VND</li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default FeeManagementPanel;
