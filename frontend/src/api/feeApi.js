import axios from 'axios';

// Lấy danh sách học viên chưa nộp học phí
export async function getUnpaidStudents() {
  const res = await axios.get('/api/fee/students/unpaid');
  return res.data.students;
}

// Lấy danh sách khóa học
export async function getCourses() {
  const res = await axios.get('/api/fee/courses');
  return res.data.courses;
}

// Ghi nhận thanh toán học phí (student_id + course_id)
export async function createPayment({ student_id, course_id, amount, method, note }) {
  const res = await axios.post('/api/fee/payments', {
    student_id,
    course_id,
    amount,
    method,
    note,
  });
  return res.data;
}

// Lấy danh sách học viên đã nộp học phí (cho staff gán lớp)
export async function getPaidStudents() {
  const res = await axios.get('/api/fee/students/paid');
  return res.data.students;
}
