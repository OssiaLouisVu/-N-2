// frontend/src/components/instructor/InactiveInstructorsPanel.jsx
import { useState, useEffect } from "react";
import { searchInactiveInstructors, updateInstructor, deleteInstructor, getInstructorClasses } from "../../api/instructorApi";

export default function InactiveInstructorsPanel({
  onGlobalMessage,
  onRefreshAll,
  refreshToken,
}) {
  const [searchKeyword, setSearchKeyword] = useState("");
  const [inactiveInstructors, setInactiveInstructors] = useState([]);
  const [selectedInstructor, setSelectedInstructor] = useState(null);
  const [instructorClasses, setInstructorClasses] = useState([]);
  const [localMessage, setLocalMessage] = useState("");

  useEffect(() => {
    loadInactiveInstructors();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshToken]);

  const showMessage = (msg) => {
    setLocalMessage(msg);
    if (onGlobalMessage) onGlobalMessage(msg);
  };

  const loadInactiveInstructors = async () => {
    try {
      const data = await searchInactiveInstructors(searchKeyword.trim());
      if (!data || !data.success) {
        setLocalMessage((data && data.message) || "Lỗi server khi tải giảng viên không hoạt động.");
        return;
      }
      setInactiveInstructors(data.instructors || []);
    } catch (err) {
      console.error(err);
      setLocalMessage("Lỗi kết nối khi tải giảng viên không hoạt động.");
    }
  };

  const handleSearch = async () => {
    await loadInactiveInstructors();
  };

  const handleViewHistory = async (instructor) => {
    try {
      setSelectedInstructor(instructor);
      const data = await getInstructorClasses(instructor.id);
      if (data && data.success) {
        setInstructorClasses(data.classes || []);
      } else {
        showMessage("Không thể tải lịch sử lớp.");
      }
    } catch (err) {
      console.error(err);
      showMessage("Lỗi kết nối khi tải lịch sử lớp.");
    }
  };

  const handleReactivate = async (instructor) => {
    if (!window.confirm(`Kích hoạt lại giảng viên "${instructor.full_name}"?`)) return;

    try {
      const data = await updateInstructor(instructor.id, { status: "ACTIVE" });
      if (!data || !data.success) {
        showMessage((data && data.message) || "Lỗi server khi kích hoạt lại.");
        return;
      }

      showMessage(`Đã kích hoạt lại "${instructor.full_name}".`);
      await loadInactiveInstructors();
      if (onRefreshAll) onRefreshAll();
    } catch (err) {
      console.error(err);
      showMessage("Lỗi kết nối khi kích hoạt lại.");
    }
  };

  const handleDelete = async (instructor) => {
    if (!window.confirm(`XÓA VĨNH VIỄN giảng viên "${instructor.full_name}"?\nThao tác này không thể hoàn tác!`)) return;

    try {
      const data = await deleteInstructor(instructor.id);
      if (!data || !data.success) {
        showMessage((data && data.message) || "Lỗi server khi xóa giảng viên.");
        return;
      }

      showMessage(`Đã xóa "${instructor.full_name}".`);
      await loadInactiveInstructors();
      if (onRefreshAll) onRefreshAll();
    } catch (err) {
      console.error(err);
      showMessage("Lỗi kết nối khi xóa giảng viên.");
    }
  };

  return (
    <div style={{ marginBottom: 40 }}>
      {/* HEADER */}
      <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 16 }}>
        📋 Giảng viên không hoạt động (INACTIVE)
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
            backgroundColor: "#6b7280",
            color: "#fff",
            cursor: "pointer",
            fontWeight: 600,
          }}
        >
          Tìm
        </button>
      </div>

      {/* LIST */}
      {inactiveInstructors.length === 0 ? (
        <p style={{ color: "#999", fontStyle: "italic" }}>
          Chưa có giảng viên nào không hoạt động.
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
                <th style={{ padding: "12px", textAlign: "left", fontWeight: 600 }}>Ghi chú</th>
                <th style={{ padding: "12px", textAlign: "center", fontWeight: 600 }}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {inactiveInstructors.map((ins) => (
                <tr key={ins.id} style={{ borderTop: "1px solid #e5e7eb" }}>
                  <td style={{ padding: "12px" }}>{ins.id}</td>
                  <td style={{ padding: "12px", fontWeight: 500 }}>{ins.full_name}</td>
                  <td style={{ padding: "12px" }}>{ins.email}</td>
                  <td style={{ padding: "12px" }}>{ins.phone || "N/A"}</td>
                  <td style={{ padding: "12px" }}>{ins.specialization || "N/A"}</td>
                  <td style={{ padding: "12px", fontSize: 13, color: "#6b7280" }}>
                    {ins.note || ""}
                  </td>
                  <td style={{ padding: "12px", textAlign: "center" }}>
                    <button
                      onClick={() => handleViewHistory(ins)}
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
                      Lịch sử
                    </button>
                    <button
                      onClick={() => handleReactivate(ins)}
                      style={{
                        padding: "6px 12px",
                        borderRadius: 6,
                        border: "none",
                        backgroundColor: "#10b981",
                        color: "#fff",
                        cursor: "pointer",
                        marginRight: 4,
                        fontSize: 13,
                      }}
                    >
                      Kích hoạt lại
                    </button>
                    <button
                      onClick={() => handleDelete(ins)}
                      style={{
                        padding: "6px 12px",
                        borderRadius: 6,
                        border: "none",
                        backgroundColor: "#ef4444",
                        color: "#fff",
                        cursor: "pointer",
                        fontSize: 13,
                      }}
                    >
                      Xóa
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* MODAL XEM LỊCH SỬ */}
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
              Lịch sử giảng dạy - {selectedInstructor.full_name}
            </h3>

            {instructorClasses.length === 0 ? (
              <p style={{ color: "#999", fontStyle: "italic" }}>
                Chưa có lịch sử giảng dạy.
              </p>
            ) : (
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ backgroundColor: "#f3f4f6" }}>
                    <th style={{ padding: "10px", textAlign: "left" }}>Tên lớp</th>
                    <th style={{ padding: "10px", textAlign: "left" }}>Mã lớp</th>
                    <th style={{ padding: "10px", textAlign: "left" }}>Trạng thái</th>
                    <th style={{ padding: "10px", textAlign: "left" }}>Vai trò</th>
                    <th style={{ padding: "10px", textAlign: "left" }}>Số HV</th>
                    <th style={{ padding: "10px", textAlign: "left" }}>Ngày bắt đầu</th>
                  </tr>
                </thead>
                <tbody>
                  {instructorClasses.map((cls) => (
                    <tr key={cls.id} style={{ borderTop: "1px solid #e5e7eb" }}>
                      <td style={{ padding: "10px" }}>{cls.name}</td>
                      <td style={{ padding: "10px" }}>{cls.code}</td>
                      <td style={{ padding: "10px" }}>
                        <span
                          style={{
                            backgroundColor:
                              cls.status === "ACTIVE"
                                ? "#10b981"
                                : cls.status === "COMPLETED"
                                ? "#6b7280"
                                : "#f59e0b",
                            color: "#fff",
                            padding: "2px 8px",
                            borderRadius: 4,
                            fontSize: 12,
                          }}
                        >
                          {cls.status}
                        </span>
                      </td>
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
