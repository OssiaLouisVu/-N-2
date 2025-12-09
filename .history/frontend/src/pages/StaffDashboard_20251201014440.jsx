// src/pages/StaffDashboard.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";

import AddStudentPanel from "../components/student/AddStudentPanel.jsx";
import OngoingStudentsPanel from "../components/student/OngoingStudentsPanel.jsx";
import CompletedStudentsPanel from "../components/student/CompletedStudentsPanel.jsx";
import ClassManagementPanel from "../components/class/ClassManagementPanel";

function StaffDashboard() {
  const navigate = useNavigate();

  const [showStudentSection, setShowStudentSection] = useState(true);
  const [showClassSection, setShowClassSection] = useState(false);
  const [globalMessage, setGlobalMessage] = useState("");
  const [refreshToken, setRefreshToken] = useState(0);

  const handleLogout = () => {
    localStorage.removeItem("currentUser");
    navigate("/login");
  };
  const handleToggleStudentSection = () => setShowStudentSection((p) => !p);
  const handleRefreshAllStudents = () => setRefreshToken((t) => t + 1);

  return (
    <div
      style={{
        width: "100%",
        minHeight: "100vh",
        background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
        paddingTop: 0,
      }}
    >
      {/* HEADER */}
      <div
        style={{
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          color: "white",
          padding: "40px 20px",
          boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
          marginBottom: 30,
        }}
      >
        <div
          style={{
            maxWidth: 1050,
            margin: "0 auto",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div>
            <h1 style={{ margin: 0, fontSize: 32, fontWeight: 700 }}>
              🏢 Dashboard nhân viên trung tâm
            </h1>
            <p style={{ margin: "8px 0 0 0", fontSize: 16, opacity: 0.9 }}>
              Đây là màn hình làm việc của nhân viên lễ tân / CSKH.
            </p>
          </div>
          <button onClick={handleLogout} className="btn-white-outline px-6 py-2">Đăng xuất</button>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div style={{ display: "flex", justifyContent: "center", paddingBottom: 40 }}>
        <div style={{ width: 1050 }}>
          {/* FUNCTION SECTION */}
            <section style={{ marginBottom: 32 }}>
              <h2
                style={{
                  fontSize: 18,
                  fontWeight: 600,
                  marginBottom: 12,
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  color: "#333",
                }}
              >
                <span role="img" aria-label="pin">📌</span>
                Chức năng
              </h2>
              <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
                <button
                  onClick={handleToggleStudentSection}
                  className={showStudentSection ? 'btn-gradient-primary btn-active-glow' : 'btn-soft'}
                >Quản lý học viên</button>
                <button
                  onClick={() => setShowClassSection(s => !s)}
                  className={showClassSection ? 'btn-gradient-green btn-active-glow' : 'btn-soft'}
                >Quản lý lớp</button>
              </div>
            </section>

          {/* STUDENT MANAGEMENT */}
          {showStudentSection && (
            <section id="student-section" style={{ marginTop: 24 }}>
              <div
                style={{
                  borderRadius: 16,
                  backgroundColor: "#ffffff",
                  boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
                  padding: 24,
                  border: "1px solid #eef0ff",
                  marginBottom: 32,
                }}
              >
                <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 8, color: "#333" }}>
                  Quản lý học viên
                </h2>
                <p style={{ color: "#555", marginBottom: 16 }}>
                  Tiếp nhận học viên đăng ký mới, cấp tài khoản, tìm kiếm & cập nhật thông tin,
                  theo dõi học viên đang học và học viên đã hoàn thành.
                </p>
                {globalMessage && (
                  <div
                    style={{
                      marginBottom: 20,
                      padding: "10px 14px",
                      borderRadius: 10,
                      backgroundColor: "#e6f4ff",
                      borderLeft: "4px solid #1677ff",
                      color: "#0050b3",
                      fontSize: 14,
                    }}
                  >
                    {globalMessage}
                  </div>
                )}
                <AddStudentPanel
                  onGlobalMessage={setGlobalMessage}
                  onRefreshAll={handleRefreshAllStudents}
                  refreshToken={refreshToken}
                />
                <OngoingStudentsPanel
                  onGlobalMessage={setGlobalMessage}
                  onRefreshAll={handleRefreshAllStudents}
                  refreshToken={refreshToken}
                  showEditButton={true}
                />
                <CompletedStudentsPanel
                  onGlobalMessage={setGlobalMessage}
                  onRefreshAll={handleRefreshAllStudents}
                  refreshToken={refreshToken}
                />
              </div>
            </section>
          )}

          {/* CLASS MANAGEMENT */}
          {showClassSection && (
            <section id="class-section" style={{ marginTop: 24 }}>
              <div
                style={{
                  borderRadius: 16,
                  backgroundColor: "#ffffff",
                  boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
                  padding: 24,
                  border: "1px solid #eef0ff",
                  marginBottom: 32,
                }}
              >
                <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 8, color: "#333" }}>
                  Quản lý lớp
                </h2>
                <p style={{ color: "#555", marginBottom: 16 }}>
                  Tạo, sửa, xoá lớp và gán học viên vào lớp. Sử dụng sau khi đã áp migrations.
                </p>
                <ClassManagementPanel refreshToken={refreshToken} />
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}

export default StaffDashboard;
