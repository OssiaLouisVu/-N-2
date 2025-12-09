import axios from 'axios';

export const getCourses = () => axios.get('/api/fee/courses');
export const getStudents = (courseId) => axios.get(`/api/fee/courses/${courseId}/students`);
export const enrollStudent = (student_id, course_id) => axios.post('/api/fee/enroll', { student_id, course_id });
export const getPayments = (course_id, student_id) => axios.get(`/api/fee/payments?course_id=${course_id}&student_id=${student_id}`);
export const makePayment = (enrollment_id, amount, method, note) => axios.post('/api/fee/payments', { enrollment_id, amount, method, note });
export const getSummary = () => axios.get('/api/fee/summary');
export const sendNotification = (student_id, message) => axios.post('/api/fee/notify', { student_id, message });
