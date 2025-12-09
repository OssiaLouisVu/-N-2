// frontend/src/components/instructor/ActiveInstructorsPanel.jsx
import { useState, useEffect } from "react";
import { searchActiveInstructors, updateInstructor, getInstructorClasses } from "../../api/instructorApi";

export default function ActiveInstructorsPanel({
  onGlobalMessage,
  onRefreshAll,
  refreshToken,
}) {
  const [searchKeyword, setSearchKeyword] = useState("");
  const [activeInstructors, setActiveInstructors] = useState([]);
  const [selectedInstructor, setSelectedInstructor] = useState(null);
  const [instructorClasses, setInstructorClasses] = useState([]);
  const [localMessage, setLocalMessage] = useState("");

  useEffect(() => {
    loadActiveInstructors();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshToken]);

  const showMessage = (msg) => {
    setLocalMessage(msg);
    if (onGlobalMessage) onGlobalMessage(msg);
  };

  const loadActiveInstructors = async () => {
    try {
      const data = await searchActiveInstructors(searchKeyword.trim());
      if (!data || !data.success) {
        setLocalMessage((data && data.message) || "Lỗi server khi tải giảng viên đang dạy.");
        return;
      }
      setActiveInstructors(data.instructors || []);
    } catch (err) {
      console.error(err);
      setLocalMessage("Lỗi kết nối khi tải giảng viên đang dạy.");
    }
  };

  const handleSearch = async () => {
    await loadActiveInstructors();
  };

  const handleViewClasses = async (instructor) => {
    try {
      setSelectedInstructor(instructor);
      const data = await getInstructorClasses(instructor.id, "ACTIVE");
      if (data && data.success) {
        setInstructorClasses(data.classes || []);
      } else {
        showMessage("Không thể tải danh sách lớp.");
      }
    } catch (err) {
      console.error(err);
      showMessage("Lỗi kết nối khi tải danh sách lớp.");
    }
  };

  const handleSetOnLeave = async (instructor) => {
    if (!window.confirm(`Đặt giảng viên "${instructor.full_name}" nghỉ phép?`)) return;

    try {
      const data = await updateInstructor(instructor.id, { status: "ON_LEAVE" });
      if (!data || !data.success) {
        showMessage((data && data.message) || "Lỗi server khi cập nhật trạng thái.");
        return;
      }

      showMessage(`Đã đặt "${instructor.full_name}" nghỉ phép.`);
      await loadActiveInstructors();
      if (onRefreshAll) onRefreshAll();
    } catch (err) {
      console.error(err);
      showMessage("Lỗi kết nối khi cập nhật trạng thái.");
    }
  };

  const handleSetInactive = async (instructor) => {
    if (!window.confirm(`Đặt giảng viên "${instructor.full_name}" không hoạt động?`)) return;

    try {
      const data = await updateInstructor(instructor.id, { status: "INACTIVE" });
      if (!data || !data.success) {
        showMessage((data && data.message) || "Lỗi server khi cập nhật trạng thái.");
        return;
      }

      showMessage(`Đã đặt "${instructor.full_name}" không hoạt động.`);
      await loadActiveInstructors();
      if (onRefreshAll) onRefreshAll();
    } catch (err) {
      console.error(err);
      showMessage("Lỗi kết nối khi cập nhật trạng thái.");
    }
  };

  return (
    <div style={{ marginBottom: 40 }}>
      {/* HEADER */}
      <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 16 }}>
        ✅ Giảng viên đang dạy (ACTIVE)
      </h3>

      {/* LOCAL MESSAGE */}
      {localMessage && (
        <div
          style={{
            marginBottom: 16,
            padding: "10px 14px",
            borderRadius: 8,
            backgroundColor: "#e6f4ff",
            borderLeft: "4px solid #1677ff",
            color: "#0050b3",
            fontSize: 14,
          }}
        >
          {localMessage}
        </div>
      )}

      {/* SEARCH */}
      <div style={{ marginBottom: 16, display: "flex", gap: 8 }}>
        <input
          type="text"
          value={searchKeyword}
          onChange={(e) => setSearchKeyword(e.target.value)}
          placeholder="Tìm theo tên, SĐT, email..."
          style={{
            flex: 1,
            padding: "8px 12px",
            borderRadius: 8,
            border: "1px solid #d1d5db",
          }}
        />
        <button
          onClick={handleSearch}
          style={{
            padding: "8px 20px",
            borderRadius: 8,
            border: "none",
            backgroundColor: "#10b981",
            color: "#fff",
            cursor: "pointer",
            fontWeight: 600,
          }}
        >
          Tìm
        </button>
      </div>

      {/* LIST */}
      {activeInstructors.length === 0 ? (
        <p style={{ color: "#999", fontStyle: "italic" }}>
          Chưa có giảng viên nào đang dạy.
        </p>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              backgroundColor: "#fff",
              borderRadius: 8,
              overflow: "hidden",
            }}
          >
            <thead>
              <tr style={{ backgroundColor: "#f3f4f6" }}>
                <th style={{ padding: "12px", textAlign: "left", fontWeight: 600 }}>ID</th>
                <th style={{ padding: "12px", textAlign: "left", fontWeight: 600 }}>Họ tên</th>
                <th style={{ padding: "12px", textAlign: "left", fontWeight: 600 }}>Email</th>
                <th style={{ padding: "12px", textAlign: "left", fontWeight: 600 }}>SĐT</th>
                <th style={{ padding: "12px", textAlign: "left", fontWeight: 600 }}>Chuyên môn</th>
                <th style={{ padding: "12px", textAlign: "left", fontWeight: 600 }}>Số lớp đang dạy</th>
                <th style={{ padding: "12px", textAlign: "center", fontWeight: 600 }}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {activeInstructors.map((ins) => (
                <tr key={ins.id} style={{ borderTop: "1px solid #e5e7eb" }}>
                  <td style={{ padding: "12px" }}>{ins.id}</td>
                  <td style={{ padding: "12px", fontWeight: 500 }}>{ins.full_name}</td>
                  <td style={{ padding: "12px" }}>{ins.email}</td>
                  <td style={{ padding: "12px" }}>{ins.phone || "N/A"}</td>
                  <td style={{ padding: "12px" }}>{ins.specialization || "N/A"}</td>
                  <td style={{ padding: "12px", textAlign: "center" }}>
                    <span
                      style={{
                        backgroundColor: "#10b981",
                        color: "#fff",
                        padding: "4px 12px",
                        borderRadius: 12,
                        fontSize: 13,
                        fontWeight: 600,
                      }}
                    >
                      {ins.active_classes_count || 0}
                    </span>
                  </td>
                  <td style={{ padding: "12px", textAlign: "center" }}>
                    <button
                      onClick={() => handleViewClasses(ins)}
                      style={{
                        padding: "6px 12px",
                        borderRadius: 6,
                        border: "1px solid #5865f2",
                        backgroundColor: "#fff",
                        color: "#5865f2",
                        cursor: "pointer",
                        marginRight: 4,
                        fontSize: 13,
                      }}
                    >
                      Xem lớp
                    </button>
                    <button
                      onClick={() => handleSetOnLeave(ins)}
                      style={{
                        padding: "6px 12px",
                        borderRadius: 6,
                        border: "1px solid #f59e0b",
                        backgroundColor: "#fff",
                        color: "#f59e0b",
                        cursor: "pointer",
                        marginRight: 4,
                        fontSize: 13,
                      }}
                    >
                      Nghỉ phép
                    </button>
                    <button
                      onClick={() => handleSetInactive(ins)}
                      style={{
                        padding: "6px 12px",
                        borderRadius: 6,
                        border: "1px solid #ef4444",
                        backgroundColor: "#fff",
                        color: "#ef4444",
                        cursor: "pointer",
                        fontSize: 13,
                      }}
                    >
                      Ngừng hoạt động
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* MODAL XEM LỚP */}
      {selectedInstructor && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(0,0,0,0.5)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1000,
          }}
          onClick={() => setSelectedInstructor(null)}
        >
          <div
            style={{
              backgroundColor: "#fff",
              padding: 24,
              borderRadius: 12,
              maxWidth: 800,
              width: "90%",
              maxHeight: "80vh",
              overflowY: "auto",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ marginBottom: 16 }}>
              Lớp đang dạy - {selectedInstructor.full_name}
            </h3>

            {instructorClasses.length === 0 ? (
              <p style={{ color: "#999", fontStyle: "italic" }}>
                Chưa có lớp nào.
              </p>
            ) : (
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ backgroundColor: "#f3f4f6" }}>
                    <th style={{ padding: "10px", textAlign: "left" }}>Tên lớp</th>
                    <th style={{ padding: "10px", textAlign: "left" }}>Mã lớp</th>
                    <th style={{ padding: "10px", textAlign: "left" }}>Vai trò</th>
                    <th style={{ padding: "10px", textAlign: "left" }}>Số HV</th>
                    <th style={{ padding: "10px", textAlign: "left" }}>Bắt đầu</th>
                  </tr>
                </thead>
                <tbody>
                  {instructorClasses.map((cls) => (
                    <tr key={cls.id} style={{ borderTop: "1px solid #e5e7eb" }}>
                      <td style={{ padding: "10px" }}>{cls.name}</td>
                      <td style={{ padding: "10px" }}>{cls.code}</td>
                      <td style={{ padding: "10px" }}>
                        {cls.role === "MAIN" ? "Chính" : "Phụ"}
                      </td>
                      <td style={{ padding: "10px" }}>{cls.student_count}</td>
                      <td style={{ padding: "10px" }}>
                        {cls.start_date ? new Date(cls.start_date).toLocaleDateString("vi-VN") : "N/A"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            <button
              onClick={() => setSelectedInstructor(null)}
              style={{
                marginTop: 16,
                padding: "8px 16px",
                borderRadius: 8,
                border: "none",
                backgroundColor: "#6b7280",
                color: "#fff",
                cursor: "pointer",
              }}
            >
              Đóng
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
