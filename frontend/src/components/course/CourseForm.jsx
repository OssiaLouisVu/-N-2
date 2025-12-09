import React, { useState, useEffect } from 'react';
import { createCourse, updateCourse } from '../../api/courseApi';

export default function CourseForm({ initialData = null, onSuccess = () => {}, onCancel = () => {} }) {
	const [formData, setFormData] = useState({
		course_code: '',
		name: '',
		level: 'Beginner',
		short_description: '',
		detailed_description: '',
		duration_weeks: '',
		sessions_per_week: '',
		hours_per_session: '',
		tuition_fee: '',
		requirements: '',
		objectives: '',
		status: 'ACTIVE'
	});
	const [loading, setLoading] = useState(false);
	const [message, setMessage] = useState('');

	useEffect(() => {
		if (initialData) {
			setFormData({
				course_code: initialData.course_code || '',
				name: initialData.name || '',
				level: initialData.level || 'Beginner',
				short_description: initialData.short_description || '',
				detailed_description: initialData.detailed_description || '',
				duration_weeks: initialData.duration_weeks || '',
				sessions_per_week: initialData.sessions_per_week || '',
				hours_per_session: initialData.hours_per_session || '',
				tuition_fee: initialData.tuition_fee || '',
				requirements: initialData.requirements || '',
				objectives: initialData.objectives || '',
				status: initialData.status || 'ACTIVE'
			});
		}
	}, [initialData]);

	function handleChange(e) {
		setFormData({ ...formData, [e.target.name]: e.target.value });
	}

	async function handleSubmit(e) {
		e.preventDefault();
		setLoading(true);
		setMessage('');

		try {
			const payload = {
				...formData,
				duration_weeks: formData.duration_weeks ? parseInt(formData.duration_weeks) : null,
				sessions_per_week: formData.sessions_per_week ? parseInt(formData.sessions_per_week) : null,
				hours_per_session: formData.hours_per_session ? parseFloat(formData.hours_per_session) : null,
				tuition_fee: formData.tuition_fee ? parseFloat(formData.tuition_fee) : null,
			};

			let res;
			if (initialData?.id) {
				res = await updateCourse(initialData.id, { ...payload, reason: 'Cập nhật thông tin khóa học' });
			} else {
				res = await createCourse(payload);
			}

			if (res.success) {
				setMessage(initialData ? '✅ Cập nhật thành công!' : '✅ Tạo khóa học thành công!');
				setTimeout(() => onSuccess(), 500);
			} else {
				setMessage('❌ ' + (res.message || 'Có lỗi xảy ra'));
			}
		} catch (error) {
			console.error('Error:', error);
			setMessage('❌ Lỗi khi lưu khóa học');
		} finally {
			setLoading(false);
		}
	}

	return (
		<form onSubmit={handleSubmit} style={{ 
			background: '#fff', 
			padding: 24, 
			borderRadius: 12, 
			border: '1px solid #e5e7eb',
			boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
		}}>
			<h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 16 }}>
				{initialData ? '✏️ Sửa thông tin khóa học' : '➕ Thêm khóa học mới'}
			</h3>

			{message && (
				<div style={{ 
					padding: 12, 
					borderRadius: 8, 
					background: message.includes('✅') ? '#d1fae5' : '#fee2e2',
					color: message.includes('✅') ? '#065f46' : '#991b1b',
					marginBottom: 16,
					fontSize: 14
				}}>
					{message}
				</div>
			)}

			<div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
				<div>
					<label style={{ display: 'block', marginBottom: 6, fontSize: 13, fontWeight: 500 }}>
						Mã khóa học <span style={{ color: '#ef4444' }}>*</span>
					</label>
					<input
						required
						name="course_code"
						value={formData.course_code}
						onChange={handleChange}
						placeholder="VD: ENG-BEG-001"
						disabled={!!initialData}
						style={{ 
							width: '100%', 
							padding: '8px 12px', 
							borderRadius: 6, 
							border: '1px solid #d1d5db',
							fontSize: 13
						}}
					/>
				</div>

				<div>
					<label style={{ display: 'block', marginBottom: 6, fontSize: 13, fontWeight: 500 }}>
						Tên khóa học <span style={{ color: '#ef4444' }}>*</span>
					</label>
					<input
						required
						name="name"
						value={formData.name}
						onChange={handleChange}
						placeholder="VD: English for Beginners"
						style={{ 
							width: '100%', 
							padding: '8px 12px', 
							borderRadius: 6, 
							border: '1px solid #d1d5db',
							fontSize: 13
						}}
					/>
				</div>

				<div>
					<label style={{ display: 'block', marginBottom: 6, fontSize: 13, fontWeight: 500 }}>Level</label>
					<select
						name="level"
						value={formData.level}
						onChange={handleChange}
						style={{ 
							width: '100%', 
							padding: '8px 12px', 
							borderRadius: 6, 
							border: '1px solid #d1d5db',
							fontSize: 13
						}}
					>
						<option value="Beginner">Beginner</option>
						<option value="Intermediate">Intermediate</option>
						<option value="Advanced">Advanced</option>
					</select>
				</div>

				<div>
					<label style={{ display: 'block', marginBottom: 6, fontSize: 13, fontWeight: 500 }}>Trạng thái</label>
					<select
						name="status"
						value={formData.status}
						onChange={handleChange}
						style={{ 
							width: '100%', 
							padding: '8px 12px', 
							borderRadius: 6, 
							border: '1px solid #d1d5db',
							fontSize: 13
						}}
					>
						<option value="ACTIVE">Hoạt động</option>
						<option value="ARCHIVED">Lưu trữ</option>
					</select>
				</div>

				<div>
					<label style={{ display: 'block', marginBottom: 6, fontSize: 13, fontWeight: 500 }}>Thời lượng (tuần)</label>
					<input
						type="number"
						name="duration_weeks"
						value={formData.duration_weeks}
						onChange={handleChange}
						placeholder="VD: 12"
						style={{ 
							width: '100%', 
							padding: '8px 12px', 
							borderRadius: 6, 
							border: '1px solid #d1d5db',
							fontSize: 13
						}}
					/>
				</div>

				<div>
					<label style={{ display: 'block', marginBottom: 6, fontSize: 13, fontWeight: 500 }}>Số buổi/tuần</label>
					<input
						type="number"
						name="sessions_per_week"
						value={formData.sessions_per_week}
						onChange={handleChange}
						placeholder="VD: 3"
						style={{ 
							width: '100%', 
							padding: '8px 12px', 
							borderRadius: 6, 
							border: '1px solid #d1d5db',
							fontSize: 13
						}}
					/>
				</div>

				<div>
					<label style={{ display: 'block', marginBottom: 6, fontSize: 13, fontWeight: 500 }}>Giờ/buổi</label>
					<input
						type="number"
						step="0.5"
						name="hours_per_session"
						value={formData.hours_per_session}
						onChange={handleChange}
						placeholder="VD: 1.5"
						style={{ 
							width: '100%', 
							padding: '8px 12px', 
							borderRadius: 6, 
							border: '1px solid #d1d5db',
							fontSize: 13
						}}
					/>
				</div>

				<div>
					<label style={{ display: 'block', marginBottom: 6, fontSize: 13, fontWeight: 500 }}>Học phí (VNĐ)</label>
					<input
						type="number"
						name="tuition_fee"
						value={formData.tuition_fee}
						onChange={handleChange}
						placeholder="VD: 5000000"
						style={{ 
							width: '100%', 
							padding: '8px 12px', 
							borderRadius: 6, 
							border: '1px solid #d1d5db',
							fontSize: 13
						}}
					/>
				</div>
			</div>

			<div style={{ marginBottom: 16 }}>
				<label style={{ display: 'block', marginBottom: 6, fontSize: 13, fontWeight: 500 }}>Mô tả ngắn</label>
				<textarea
					name="short_description"
					value={formData.short_description}
					onChange={handleChange}
					rows={2}
					placeholder="Mô tả ngắn gọn về khóa học..."
					style={{ 
						width: '100%', 
						padding: '8px 12px', 
						borderRadius: 6, 
						border: '1px solid #d1d5db',
						fontSize: 13,
						resize: 'vertical'
					}}
				/>
			</div>

			<div style={{ marginBottom: 16 }}>
				<label style={{ display: 'block', marginBottom: 6, fontSize: 13, fontWeight: 500 }}>Mô tả chi tiết</label>
				<textarea
					name="detailed_description"
					value={formData.detailed_description}
					onChange={handleChange}
					rows={4}
					placeholder="Mô tả chi tiết về nội dung, phương pháp giảng dạy..."
					style={{ 
						width: '100%', 
						padding: '8px 12px', 
						borderRadius: 6, 
						border: '1px solid #d1d5db',
						fontSize: 13,
						resize: 'vertical'
					}}
				/>
			</div>

			<div style={{ marginBottom: 16 }}>
				<label style={{ display: 'block', marginBottom: 6, fontSize: 13, fontWeight: 500 }}>Yêu cầu đầu vào</label>
				<textarea
					name="requirements"
					value={formData.requirements}
					onChange={handleChange}
					rows={2}
					placeholder="VD: Không yêu cầu kiến thức trước"
					style={{ 
						width: '100%', 
						padding: '8px 12px', 
						borderRadius: 6, 
						border: '1px solid #d1d5db',
						fontSize: 13,
						resize: 'vertical'
					}}
				/>
			</div>

			<div style={{ marginBottom: 20 }}>
				<label style={{ display: 'block', marginBottom: 6, fontSize: 13, fontWeight: 500 }}>Mục tiêu đầu ra</label>
				<textarea
					name="objectives"
					value={formData.objectives}
					onChange={handleChange}
					rows={2}
					placeholder="VD: Giao tiếp cơ bản, TOEIC 450+"
					style={{ 
						width: '100%', 
						padding: '8px 12px', 
						borderRadius: 6, 
						border: '1px solid #d1d5db',
						fontSize: 13,
						resize: 'vertical'
					}}
				/>
			</div>

			<div style={{ display: 'flex', gap: 12 }}>
				<button
					type="submit"
					disabled={loading}
					style={{ 
						padding: '10px 20px', 
						borderRadius: 8, 
						background: loading ? '#9ca3af' : '#10b981',
						color: '#fff', 
						border: 'none',
						cursor: loading ? 'not-allowed' : 'pointer',
						fontWeight: 600,
						fontSize: 14
					}}
				>
					{loading ? '⏳ Đang lưu...' : (initialData ? '💾 Cập nhật' : '➕ Tạo mới')}
				</button>
				<button
					type="button"
					onClick={onCancel}
					style={{ 
						padding: '10px 20px', 
						borderRadius: 8, 
						background: '#fff',
						color: '#374151',
						border: '1px solid #d1d5db',
						cursor: 'pointer',
						fontWeight: 600,
						fontSize: 14
					}}
				>
					✖ Hủy
				</button>
			</div>
		</form>
	);
}
