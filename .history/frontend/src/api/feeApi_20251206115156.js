
import axios from 'axios';

export async function getUnpaidStudents() {
	const res = await axios.get('/api/fee/students/unpaid');
	return res.data.students;
}

export async function createPayment({ enrollment_id, amount, method, note }) {
	const res = await axios.post('/api/fee/payments', {
		enrollment_id,
		amount,
		method,
		note,
	});
	return res.data;
}
