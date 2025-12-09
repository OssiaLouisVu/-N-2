import React, { useEffect, useState } from 'react';
import { getCourse, getCourseHistory, getLessons, getMaterials } from '../../api/courseApi';

export default function CourseDetail({ courseId, onDone = () => {} }) {
	const [course, setCourse] = useState(null);
	const [tab, setTab] = useState('info'); // info | lessons | materials | history
	const [lessons, setLessons] = useState([]);
	const [editingLesson, setEditingLesson] = useState(null); // null | lesson object | { for new }
	const [lessonForm, setLessonForm] = useState({ title: '', description: '', lesson_number: '' });
	const [lessonFormError, setLessonFormError] = useState('');
	const [materials, setMaterials] = useState([]);
	const [addingMaterial, setAddingMaterial] = useState(false);
	const [materialForm, setMaterialForm] = useState({ title: '', url: '' });
	const [materialFormError, setMaterialFormError] = useState('');
	const [history, setHistory] = useState([]);
	const [loading, setLoading] = useState(false);

	async function load() {
		setLoading(true);
		try {
			const res = await getCourse(courseId);
			if (res.success) setCourse(res.course);
		} catch (err) {
			console.error('Load course failed', err);
		} finally {
			setLoading(false);
		}
	}

	async function loadLessons() {
		try {
			const res = await getLessons(courseId);
			if (res.success) setLessons(res.lessons);
		} catch (err) {
			console.error('Load lessons failed', err);
		}
	}

	function startAddLesson() {
		setEditingLesson({});
		setLessonForm({ title: '', description: '', lesson_number: lessons.length + 1 });
		setLessonFormError('');
	}

	function startEditLesson(lesson) {
		setEditingLesson(lesson);
		setLessonForm({
			title: lesson.title,
			description: lesson.description,
			lesson_number: lesson.lesson_number,
		});
		setLessonFormError('');
	}

	function cancelLessonEdit() {
		setEditingLesson(null);
		setLessonFormError('');
	}

	async function handleLessonFormSubmit(e) {
		e.preventDefault();
		setLessonFormError('');
		const { title, description, lesson_number } = lessonForm;
		if (!title || !lesson_number) {
			setLessonFormError('Vui lòng nhập đủ thông tin.');
			return;
		}
		try {
			if (editingLesson && editingLesson.id) {
				// Edit
				const res = await window.courseApi.updateLesson(editingLesson.id, { title, description, lesson_number });
				if (res.success) {
					await loadLessons();
					setEditingLesson(null);
				} else {
					setLessonFormError(res.message || 'Lỗi khi cập nhật bài học.');
				}
			} else {
				// Add
				const res = await window.courseApi.createLesson(courseId, { title, description, lesson_number });
				if (res.success) {
					await loadLessons();
					setEditingLesson(null);
				} else {
					setLessonFormError(res.message || 'Lỗi khi thêm bài học.');
				}
			}
		} catch (err) {
			setLessonFormError('Lỗi kết nối server.');
		}
	}

	async function handleDeleteLesson(id) {
		if (!window.confirm('Xoá bài học này?')) return;
		try {
			const res = await window.courseApi.deleteLesson(id);
			if (res.success) {
				await loadLessons();
			} else {
				alert(res.message || 'Lỗi khi xoá bài học.');
			}
		} catch (err) {
			alert('Lỗi kết nối server.');
		}
	}

	async function loadMaterials() {
		try {
			const res = await getMaterials(courseId);
			if (res.success) setMaterials(res.materials);
		} catch (err) {
			console.error('Load materials failed', err);
		}
	}

	function startAddMaterial() {
		setAddingMaterial(true);
		setMaterialForm({ title: '', url: '' });
		setMaterialFormError('');
	}

	function cancelAddMaterial() {
		setAddingMaterial(false);
		setMaterialFormError('');
	}

	async function handleMaterialFormSubmit(e) {
		e.preventDefault();
		setMaterialFormError('');
		const { title, url } = materialForm;
		if (!title || !url) {
			setMaterialFormError('Vui lòng nhập đủ thông tin.');
			return;
		}
		try {
			const res = await window.courseApi.createMaterial(courseId, { title, url, type: 'url' });
			if (res.success) {
				await loadMaterials();
				setAddingMaterial(false);
			} else {
				setMaterialFormError(res.message || 'Lỗi khi thêm tài liệu.');
			}
		} catch (err) {
			setMaterialFormError('Lỗi kết nối server.');
		}
	}

	async function handleDeleteMaterial(id) {
		if (!window.confirm('Xoá tài liệu này?')) return;
		try {
			const res = await window.courseApi.deleteMaterial(id);
			if (res.success) {
				await loadMaterials();
			} else {
				alert(res.message || 'Lỗi khi xoá tài liệu.');
			}
		} catch (err) {
			alert('Lỗi kết nối server.');
		}
	}

	async function loadHistory() {
		try {
			const res = await getCourseHistory(courseId);
			if (res.success) setHistory(res.history);
		} catch (err) {
			console.error('Load history failed', err);
		}
	}

	useEffect(() => {
		load();
	}, [courseId]);

	useEffect(() => {
		if (tab === 'lessons') loadLessons();
		if (tab === 'materials') loadMaterials();
		if (tab === 'history') loadHistory();
	}, [tab]);

	if (loading) return <div>Đang tải...</div>;
	if (!course) return <div>Không tìm thấy khóa học</div>;

	return (
		<div style={{ 
			border: '1px solid #e5e7eb', 
			padding: 20, 
			borderRadius: 12, 
			background: '#fff',
			boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
		}}>
			<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
				<h3 style={{ fontSize: 18, fontWeight: 600 }}>
					📚 {course.name}
				</h3>
				<button 
					onClick={onDone}
					style={{ 
						padding: '6px 12px', 
						borderRadius: 6, 
						background: '#f3f4f6',
						border: '1px solid #d1d5db',
						cursor: 'pointer',
						fontSize: 13
					}}
				>
					✖ Đóng
				</button>
			</div>

			<div style={{ marginBottom: 12, fontSize: 13, color: '#6b7280' }}>
				<strong>Mã:</strong> {course.course_code} | 
				<strong> Level:</strong> {course.level} | 
				<strong> Học phí:</strong> {course.tuition_fee ? `${Number(course.tuition_fee).toLocaleString('vi-VN')} đ` : '-'}
			</div>

			{/* Tabs */}
			<div style={{ display: 'flex', gap: 8, marginBottom: 16, borderBottom: '2px solid #f3f4f6' }}>
				{['info', 'lessons', 'materials', 'history'].map((t) => (
					<button
						key={t}
						onClick={() => setTab(t)}
						style={{
							padding: '10px 16px',
							border: 'none',
							background: 'transparent',
							cursor: 'pointer',
							fontWeight: tab === t ? 600 : 400,
							fontSize: 14,
							color: tab === t ? '#3b82f6' : '#6b7280',
							borderBottom: tab === t ? '2px solid #3b82f6' : '2px solid transparent',
							marginBottom: '-2px'
						}}
					>
						{t === 'info' && '📋 Thông tin'}
						{t === 'lessons' && '📚 Bài học'}
						{t === 'materials' && '📁 Tài liệu'}
						{t === 'history' && '🕐 Lịch sử'}
					</button>
				))}
			</div>

			{/* Tab Content */}
			{tab === 'info' && (
				<div style={{ fontSize: 14, lineHeight: 1.8 }}>
					<div style={{ marginBottom: 16 }}>
						<strong>Mô tả ngắn:</strong>
						<p style={{ margin: '8px 0', color: '#374151' }}>{course.short_description || 'Chưa có'}</p>
					</div>
					<div style={{ marginBottom: 16 }}>
						<strong>Mô tả chi tiết:</strong>
						<p style={{ margin: '8px 0', color: '#374151' }}>{course.detailed_description || 'Chưa có'}</p>
					</div>
					<div style={{ marginBottom: 16 }}>
						<strong>Yêu cầu đầu vào:</strong>
						<p style={{ margin: '8px 0', color: '#374151' }}>{course.requirements || 'Chưa có'}</p>
					</div>
					<div style={{ marginBottom: 16 }}>
						<strong>Mục tiêu đầu ra:</strong>
						<p style={{ margin: '8px 0', color: '#374151' }}>{course.objectives || 'Chưa có'}</p>
					</div>
					<div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
						<div>
							<strong>Thời lượng:</strong> {course.duration_weeks} tuần
						</div>
						<div>
							<strong>Buổi/tuần:</strong> {course.sessions_per_week}
						</div>
						<div>
							<strong>Giờ/buổi:</strong> {course.hours_per_session}
						</div>
					</div>
				</div>
			)}

			{tab === 'lessons' && (
				<div>
					<div style={{ marginBottom: 16 }}>
						<button onClick={startAddLesson} style={{ padding: '6px 12px', borderRadius: 6, background: '#3b82f6', color: '#fff', border: 'none', fontSize: 13, cursor: 'pointer' }}>
							➕ Thêm bài học
						</button>
					</div>
					{editingLesson && (
						<form onSubmit={handleLessonFormSubmit} style={{ background: '#f1f5f9', padding: 16, borderRadius: 8, marginBottom: 16 }}>
							<div style={{ marginBottom: 8 }}>
								<label>
									Số thứ tự:
									<input type="number" min="1" value={lessonForm.lesson_number} onChange={e => setLessonForm(f => ({ ...f, lesson_number: e.target.value }))} style={{ marginLeft: 8, width: 60 }} />
								</label>
							</div>
							<div style={{ marginBottom: 8 }}>
								<label>
									Tiêu đề:
									<input type="text" value={lessonForm.title} onChange={e => setLessonForm(f => ({ ...f, title: e.target.value }))} style={{ marginLeft: 8, width: 200 }} />
								</label>
							</div>
							<div style={{ marginBottom: 8 }}>
								<label>
									Mô tả:
									<input type="text" value={lessonForm.description} onChange={e => setLessonForm(f => ({ ...f, description: e.target.value }))} style={{ marginLeft: 8, width: 300 }} />
								</label>
							</div>
							{lessonFormError && <div style={{ color: 'red', marginBottom: 8 }}>{lessonFormError}</div>}
							<button type="submit" style={{ padding: '6px 12px', borderRadius: 6, background: '#10b981', color: '#fff', border: 'none', fontSize: 13, cursor: 'pointer', marginRight: 8 }}>
								{editingLesson && editingLesson.id ? 'Lưu' : 'Thêm'}
							</button>
							<button type="button" onClick={cancelLessonEdit} style={{ padding: '6px 12px', borderRadius: 6, background: '#f87171', color: '#fff', border: 'none', fontSize: 13, cursor: 'pointer' }}>
								Huỷ
							</button>
						</form>
					)}
					{lessons.length === 0 ? (
						<div style={{ textAlign: 'center', padding: 40, color: '#6b7280' }}>
							Chưa có bài học nào. Thêm bài học mới để bắt đầu.
						</div>
					) : (
						<div>
							{lessons.map((l) => (
								<div key={l.id} style={{ 
									padding: 12, 
									background: '#f9fafb', 
									borderRadius: 8, 
									marginBottom: 8,
									fontSize: 13,
									display: 'flex',
									justifyContent: 'space-between',
									alignItems: 'center'
								}}>
									<div>
										<strong>Bài {l.lesson_number}:</strong> {l.title}
										<div style={{ color: '#6b7280', marginTop: 4 }}>{l.description}</div>
									</div>
									<div>
										<button onClick={() => startEditLesson(l)} style={{ marginRight: 8, padding: '4px 10px', borderRadius: 6, background: '#fbbf24', color: '#fff', border: 'none', fontSize: 13, cursor: 'pointer' }}>Sửa</button>
										<button onClick={() => handleDeleteLesson(l.id)} style={{ padding: '4px 10px', borderRadius: 6, background: '#ef4444', color: '#fff', border: 'none', fontSize: 13, cursor: 'pointer' }}>Xoá</button>
									</div>
								</div>
							))}
						</div>
					)}
				</div>
			)}

			{tab === 'materials' && (
				<div>
					<div style={{ marginBottom: 16 }}>
						<button onClick={startAddMaterial} style={{ padding: '6px 12px', borderRadius: 6, background: '#3b82f6', color: '#fff', border: 'none', fontSize: 13, cursor: 'pointer' }}>
							➕ Thêm tài liệu (URL)
						</button>
					</div>
					{addingMaterial && (
						<form onSubmit={handleMaterialFormSubmit} style={{ background: '#f1f5f9', padding: 16, borderRadius: 8, marginBottom: 16 }}>
							<div style={{ marginBottom: 8 }}>
								<label>
									Tiêu đề:
									<input type="text" value={materialForm.title} onChange={e => setMaterialForm(f => ({ ...f, title: e.target.value }))} style={{ marginLeft: 8, width: 200 }} />
								</label>
							</div>
							<div style={{ marginBottom: 8 }}>
								<label>
									URL:
									<input type="text" value={materialForm.url} onChange={e => setMaterialForm(f => ({ ...f, url: e.target.value }))} style={{ marginLeft: 8, width: 300 }} />
								</label>
							</div>
							{materialFormError && <div style={{ color: 'red', marginBottom: 8 }}>{materialFormError}</div>}
							<button type="submit" style={{ padding: '6px 12px', borderRadius: 6, background: '#10b981', color: '#fff', border: 'none', fontSize: 13, cursor: 'pointer', marginRight: 8 }}>
								Thêm
							</button>
							<button type="button" onClick={cancelAddMaterial} style={{ padding: '6px 12px', borderRadius: 6, background: '#f87171', color: '#fff', border: 'none', fontSize: 13, cursor: 'pointer' }}>
								Huỷ
							</button>
						</form>
					)}
					{materials.length === 0 ? (
						<div style={{ textAlign: 'center', padding: 40, color: '#6b7280' }}>
							Chưa có tài liệu nào.
						</div>
					) : (
						<div>
							{materials.map((m) => (
								<div key={m.id} style={{ 
									padding: 12, 
									background: '#f9fafb', 
									borderRadius: 8, 
									marginBottom: 8,
									fontSize: 13,
									display: 'flex',
									justifyContent: 'space-between',
									alignItems: 'center'
								}}>
									<div>
										<strong>{m.title}</strong>
										<div style={{ color: '#6b7280', marginTop: 4 }}>
											{m.type} | {m.url ? <a href={m.url} target="_blank" rel="noopener noreferrer">{m.url}</a> : m.file_path}
										</div>
									</div>
									<div>
										<button onClick={() => handleDeleteMaterial(m.id)} style={{ padding: '4px 10px', borderRadius: 6, background: '#ef4444', color: '#fff', border: 'none', fontSize: 13, cursor: 'pointer' }}>Xoá</button>
									</div>
								</div>
							))}
						</div>
					)}
				</div>
			)}

			{tab === 'history' && (
				<div>
					{history.length === 0 ? (
						<div style={{ textAlign: 'center', padding: 40, color: '#6b7280' }}>
							Chưa có lịch sử chỉnh sửa.
						</div>
					) : (
						<div>
							{history.map((h) => (
								<div key={h.id} style={{ 
									padding: 12, 
									background: '#f9fafb', 
									borderRadius: 8, 
									marginBottom: 8,
									fontSize: 13
								}}>
									<div>
										<strong>{h.changed_by_name || 'Unknown'}</strong> - {h.action}
									</div>
									{h.field_changed && (
										<div style={{ color: '#6b7280', marginTop: 4 }}>
											{h.field_changed}: {h.old_value} → {h.new_value}
										</div>
									)}
									<div style={{ color: '#9ca3af', fontSize: 12, marginTop: 4 }}>
										{new Date(h.changed_at).toLocaleString('vi-VN')}
									</div>
								</div>
							))}
						</div>
					)}
				</div>
			)}
		</div>
	);
}
