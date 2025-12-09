// frontend/src/components/student/CompletedStudentsPanel.jsx
import { useState } from "react";
import { searchStudents } from "../../api/studentApi";

export default function CompletedStudentsPanel() {
  const [keyword, setKeyword] = useState("");
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleSearch = async () => {
    setLoading(true);
    setMessage("");
    setSelectedStudent(null);

    try {
      const kw = keyword.trim();
      const data = await searchStudents({
        status: "COMPLETED",
        keyword: kw,
      });

      if (data.success) {
        const list = data.students || [];
        setStudents(list);
        if (list.length === 0) {
          setMessage("Không tìm thấy học viên đã học nào phù hợp.");
        }
      } else {
        setMessage(
          data.message || "Không lấy được danh sách học viên đã học."
        );
      }
    } catch (err) {
      console.error(err);
      setMessage("Lỗi kết nối khi tìm kiếm học viên đã học.");
    } finally {
      setLoading(false);
    }
  };

  // (phần cardStyle, tableStyle, thStyle, tdStyle và JSX còn lại giữ nguyên như bạn đang có)
}
