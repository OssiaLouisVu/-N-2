import React, { useState } from 'react';
import { enrollStudent } from '../../api/feeApi';

export default function StudentEnrollForm({ courseId, onEnrolled }) {
  const [studentId, setStudentId] = useState('');
  const [message, setMessage] = useState('');

  const handleEnroll = () => {
    if (!studentId) return;
    enrollStudent(studentId, courseId)
      .then(() => {
        setMessage('Đăng ký thành công!');
        onEnrolled && onEnrolled();
      })
      .catch(e => setMessage(e.response?.data?.message || 'Lỗi đăng ký!'));
  };

  return (
    <div>
      <h4>Đăng ký học viên vào khoá học</h4>
      <input placeholder="ID học viên" value={studentId} onChange={e => setStudentId(e.target.value)} />
      <button onClick={handleEnroll}>Đăng ký</button>
      {message && <div>{message}</div>}
    </div>
  );
}
