// src/components/student/OngoingStudentsPanel.jsx
import { useEffect, useState } from "react";
import { searchStudents, finishSchedule } from "../../api/studentApi";
import StudentSearchBar from "./StudentSearchBar";

export default function OngoingStudentsPanel({ onGlobalMessage, onRefreshAll, refreshToken, showEditButton }) {
  const [keyword, setKeyword] = useState("");
  const [filterStatus, setFilterStatus] = useState("ACTIVE");
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [localMessage, setLocalMessage] = useState("");

  const showMessage = (msg) => {
    setLocalMessage(msg);
    if (onGlobalMessage) onGlobalMessage(msg);
  };

  const loadStudents = async (statusToUse = "ACTIVE") => {
    try {
      const data = await searchStudents({ status: statusToUse, keyword: keyword.trim() });

      if (!data || !data.success) {
        showMessage((data && data.message) || "Lỗi server khi tải danh sách học viên.");
        return;
      }

      setStudents(data.students || []);
      setLocalMessage("");
    } catch (err) {
      console.error(err);
      showMessage("Lỗi kết nối khi tải học viên đang học.");
    }
  };

  useEffect(() => {
    loadStudents(filterStatus || "ACTIVE");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshToken]);

  const handleSearch = async () => {
    await loadStudents(filterStatus);
  };

  const handleViewProgress = (st) => {
    setSelectedStudent(st);
  };

  const handleMarkCompleted = async (st) => {
    if (!window.confirm(`Chuyển "${st.full_name}" sang trạng thái ĐÃ HỌC?`)) {
      return;
    }

    try {
      // Sử dụng endpoint kết thúc lịch để chuyển trạng thái (POST /api/schedules/finish)
      await finishSchedule({ studentId: st.id });

      showMessage(
        `Đã chuyển "${st.full_name}" sang trạng thái COMPLETED – Đã học.`
      );
  setSelectedStudent(null);
  await loadStudents(filterStatus);
      if (onRefreshAll) onRefreshAll();
    } catch (err) {
      console.error(err);
      showMessage("Lỗi kết nối khi cập nhật trạng thái học viên.");
    }
  };

  return (
    <section className="card mb-8">
      <h3 className="card-heading">
        <span role="img" aria-label="student">🧑‍🎓</span>
        Học viên đang học & quá trình học hiện tại
      </h3>
      <p className="text-sm text-gray-600 mb-3 leading-relaxed">
        Use case: <b>Học viên đang học</b> – nhân viên tìm kiếm học viên đã được xếp lớp (<b>status = ACTIVE</b>),
        xem thông tin cơ bản và các buổi học sắp tới. Khi kết thúc khoá có thể chuyển trạng thái sang <b>COMPLETED</b>.
      </p>

      {localMessage && (
        <div className="alert-warn mb-3">{localMessage}</div>
      )}

      {/* Search line */}
      <StudentSearchBar
        keyword={keyword}
        setKeyword={setKeyword}
        status={filterStatus}
        setStatus={setFilterStatus}
        onSearch={handleSearch}
      />

      {/* Table ACTIVE students */}
      <div className="overflow-x-auto rounded-lg border border-gray-200 mb-3">
        <table className="table">
          <thead>
            <tr>
              <th>STT</th>
              <th>Họ tên</th>
              <th>SĐT</th>
              <th>Email</th>
              <th>Level</th>
              <th>Trạng thái</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {students.length === 0 ? (
              <tr>
                <td className="px-3 py-4 text-sm text-gray-500" colSpan={7}>Chưa có học viên nào đang học phù hợp.</td>
              </tr>
            ) : (
              students.map((st, idx) => (
                <tr key={st.id} className="hover:bg-gray-50">
                  <td className="px-3 py-2 text-sm">{idx + 1}</td>
                  <td className="px-3 py-2 text-sm font-medium text-gray-800">{st.full_name}</td>
                  <td className="px-3 py-2 text-sm text-gray-600">{st.phone}</td>
                  <td className="px-3 py-2 text-sm text-gray-600">{st.email}</td>
                  <td className="px-3 py-2 text-sm">{st.level}</td>
                  <td className="px-3 py-2 text-sm"><span className="badge">{st.status}</span></td>
                  <td className="px-3 py-2 space-x-2">
                    <button type="button" onClick={() => handleViewProgress(st)} className="btn-primary text-xs">Xem quá trình</button>
                    {showEditButton && (
                      <button onClick={() => handleMarkCompleted(st)} className="btn-success text-xs">Kết thúc khoá</button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Placeholder progress box */}
      {selectedStudent && (
        <div className="mt-4 rounded-xl border border-dashed border-gray-300 bg-gray-50 p-4">
          <p className="font-semibold mb-2">Quá trình học hiện tại của: {selectedStudent.full_name} ({selectedStudent.phone})</p>
          <p className="text-sm text-gray-600 mb-2">Phần lịch buổi học đang là placeholder. Sau này sẽ hiển thị:</p>
          <ul className="list-disc ml-5 text-sm text-gray-600 space-y-1">
            <li>Lớp học hiện tham gia</li>
            <li>Các buổi học sắp tới</li>
            <li>Thống kê tham gia / vắng mặt</li>
          </ul>
          <p className="text-xs italic text-gray-500 mt-3">Đang ở giai đoạn tạo khung use case.</p>
          <button type="button" onClick={() => handleMarkCompleted(selectedStudent)} className="btn-success mt-4 text-xs font-semibold">✅ Chuyển sang COMPLETED</button>
        </div>
      )}
    </section>
  );
}

// Inline style constants removed in favor of Tailwind utility classes.
