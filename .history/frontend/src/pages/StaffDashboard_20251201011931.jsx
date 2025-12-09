// src/pages/StaffDashboard.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";

import AddStudentPanel from "../components/student/AddStudentPanel.jsx";
import OngoingStudentsPanel from "../components/student/OngoingStudentsPanel.jsx";
import CompletedStudentsPanel from "../components/student/CompletedStudentsPanel.jsx";
import ClassManagementPanel from "../components/class/ClassManagementPanel";

function StaffDashboard() {
  const navigate = useNavigate();

  // Bật/tắt khu "Quản lý học viên"
  const [showStudentSection, setShowStudentSection] = useState(true);
  // Bật/tắt khu "Quản lý lớp"
  const [showClassSection, setShowClassSection] = useState(false);

  // Message chung cho cả 3 panel (thông báo thành công / lỗi)
  const [globalMessage, setGlobalMessage] = useState("");

  // Flag để các panel có thể dùng để biết khi nào cần reload lại list
  const [refreshToken, setRefreshToken] = useState(0);

  const handleLogout = () => {
    localStorage.removeItem("currentUser");
    navigate("/login");
  };

  const handleToggleStudentSection = () => {
    setShowStudentSection((prev) => !prev);
  };

  // Hàm cho phép panel con gọi để reload cả 3 list
  const handleRefreshAllStudents = () => {
    // chỉ cần tăng token, các panel nếu có useEffect([...,[refreshToken]]) sẽ tự reload
    setRefreshToken((t) => t + 1);
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        padding: "32px 80px",
        background: "linear-gradient(180deg, #f5f7fb 0%, #ffffff 40%)",
        position: "relative",
      }}
    >
      {/* Nút Đăng xuất */}
      <button
        onClick={handleLogout}
        style={{
          return (
            <div
              style={{
                width: "100%",
                minHeight: "100vh",
                background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
                paddingTop: 0,
              }}
            >
              {/* HEADER (thống nhất style với Student & Teacher) */}
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
                  <button
                    onClick={handleLogout}
                    style={{
                      padding: "10px 24px",
                      background: "rgba(255,255,255,0.2)",
                      color: "white",
                      border: "2px solid white",
                      borderRadius: 6,
                      cursor: "pointer",
                      fontWeight: 600,
                      fontSize: 14,
                    }}
                    onMouseOver={(e) => {
                      e.target.style.background = "rgba(255,255,255,0.3)";
                    }}
                    onMouseOut={(e) => {
                      e.target.style.background = "rgba(255,255,255,0.2)";
                    }}
                  >
                    Đăng xuất
                  </button>
                </div>
              </div>

              {/* MAIN CONTENT WRAPPER */}
              <div style={{ display: "flex", justifyContent: "center", paddingBottom: 40 }}>
                <div style={{ width: 1050 }}>
                  {/* KHU CHỨC NĂNG */}
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
                      <span role="img" aria-label="pin">
                        📌
                      </span>
                      Chức năng
                    </h2>

                    <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
                      {/* Nút mở / ẩn khu Quản lý học viên */}
                      <button
                        onClick={handleToggleStudentSection}
                        style={{
                          padding: "12px 24px",
                          borderRadius: 8,
                          border: "none",
                          cursor: "pointer",
                          fontWeight: 600,
                          fontSize: 15,
                          boxShadow: showStudentSection
                            ? "0 4px 12px rgba(102,126,234,0.45)"
                            : "0 2px 6px rgba(0,0,0,0.08)",
                          background: showStudentSection
                            ? "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                            : "#ffffff",
                          color: showStudentSection ? "#fff" : "#333",
                          transition: "all 0.25s",
                          border: showStudentSection ? "none" : "1px solid #ddd",
                        }}
                        onMouseOver={(e) => {
                          if (!showStudentSection) e.target.style.background = "#f0f4ff";
                        }}
                        onMouseOut={(e) => {
                          if (!showStudentSection) e.target.style.background = "#ffffff";
                        }}
                      >
                        Quản lý học viên
                      </button>

                      {/* Nút mở / ẩn khu Quản lý lớp */}
                      <button
                        onClick={() => setShowClassSection((s) => !s)}
                        style={{
                          padding: "12px 24px",
                          borderRadius: 8,
                          border: "none",
                          cursor: "pointer",
                          fontWeight: 600,
                          fontSize: 15,
                          boxShadow: showClassSection
                            ? "0 4px 12px rgba(40,167,69,0.35)"
                            : "0 2px 6px rgba(0,0,0,0.08)",
                          background: showClassSection
                            ? "linear-gradient(135deg,#34d399,#059669)"
                            : "#ffffff",
                          color: showClassSection ? "#fff" : "#333",
                          transition: "all 0.25s",
                          border: showClassSection ? "none" : "1px solid #ddd",
                        }}
                        onMouseOver={(e) => {
                          if (!showClassSection) e.target.style.background = "#ecfdf5";
                        }}
                        onMouseOut={(e) => {
                          if (!showClassSection) e.target.style.background = "#ffffff";
                        }}
                      >
                        Quản lý lớp
                      </button>
                    </div>
                  </section>

                  {/* KHU QUẢN LÝ HỌC VIÊN */}
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
                        <h2
                          style={{
                            fontSize: 22,
                            fontWeight: 700,
                            marginBottom: 8,
                            color: "#333",
                          }}
                        >
                          Quản lý học viên
                        </h2>
                        <p style={{ color: "#555", marginBottom: 16 }}>
                          Tiếp nhận học viên đăng ký mới, cấp tài khoản đăng nhập, tìm kiếm & cập nhật
                          thông tin, theo dõi học viên đang học và học viên đã hoàn thành.
                        </p>

                        {/* Thông báo chung (thành công / lỗi) */}
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

                  {/* KHU QUẢN LÝ LỚP */}
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
          <span role="img" aria-label="pin">
            📌
          </span>
          Chức năng
        </h2>

        <div style={{ display: "flex", gap: 16 }}>
          {/* Nút mở / ẩn khu Quản lý học viên */}
          <button
            onClick={handleToggleStudentSection}
            style={{
              padding: "12px 24px",
              borderRadius: 999,
              border: "none",
              cursor: "pointer",
              fontWeight: 600,
              fontSize: 15,
              boxShadow: showStudentSection
                ? "0 10px 20px rgba(88, 101, 242, 0.25)"
                : "0 4px 10px rgba(0,0,0,0.08)",
              background: showStudentSection
                ? "linear-gradient(135deg, #5865f2, #7b5cff)"
                : "#f2f3ff",
              color: showStudentSection ? "#fff" : "#333",
              transition: "all 0.25s",
            }}
          >
            Quản lý học viên
          </button>

          {/* Nút mở / ẩn khu Quản lý lớp */}
          <button
            onClick={() => setShowClassSection((s) => !s)}
            style={{
              padding: "12px 24px",
              borderRadius: 999,
              border: "none",
              cursor: "pointer",
              fontWeight: 600,
              fontSize: 15,
              boxShadow: showClassSection
                ? "0 10px 20px rgba(40, 167, 69, 0.18)"
                : "0 4px 10px rgba(0,0,0,0.04)",
              background: showClassSection ? "linear-gradient(135deg,#28a745,#5cd67a)" : "#f2f3ff",
              color: showClassSection ? "#fff" : "#333",
              transition: "all 0.25s",
            }}
          >
            Quản lý lớp
          </button>
        </div>
      </section>

      {/* KHU QUẢN LÝ HỌC VIÊN */}
      {showStudentSection && (
        <section id="student-section" style={{ marginTop: 24, maxWidth: 1100 }}>
          <div
            style={{
              borderRadius: 24,
              backgroundColor: "#ffffff",
              boxShadow: "0 18px 40px rgba(15, 23, 42, 0.08)",
              padding: 28,
              border: "1px solid #eef0ff",
              marginBottom: 32,
            }}
          >
            <h2
              style={{
                fontSize: 22,
                fontWeight: 700,
                marginBottom: 8,
              }}
            >
              Quản lý học viên
            </h2>
            <p style={{ color: "#555", marginBottom: 16 }}>
              Chức năng dành cho nhân viên trung tâm: tiếp nhận học viên đăng ký
              mới, cấp tài khoản đăng nhập, tìm kiếm và cập nhật thông tin học viên,
              theo dõi học viên đang học và các học viên đã hoàn thành khoá học.
            </p>

            {/* Thông báo chung (thành công / lỗi) */}
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

            {/* Học viên đăng ký mới (status = NEW) */}
            <AddStudentPanel
              onGlobalMessage={setGlobalMessage}
              onRefreshAll={handleRefreshAllStudents}
              refreshToken={refreshToken}
            />

            {/* Học viên đang học & quá trình học hiện tại (status = ACTIVE) */}
            <OngoingStudentsPanel
              onGlobalMessage={setGlobalMessage}
              onRefreshAll={handleRefreshAllStudents}
              refreshToken={refreshToken}
              showEditButton={true}
            />

            {/* Học viên đã học & kết quả quá trình học (status = COMPLETED) */}
            <CompletedStudentsPanel
              onGlobalMessage={setGlobalMessage}
              onRefreshAll={handleRefreshAllStudents}
              refreshToken={refreshToken}
            />
          </div>
        </section>
      )}

      {/* KHU QUẢN LÝ LỚP */}
      {showClassSection && (
        <section id="class-section" style={{ marginTop: 24, maxWidth: 1100 }}>
          <div
            style={{
              borderRadius: 24,
              backgroundColor: "#ffffff",
              boxShadow: "0 18px 40px rgba(15, 23, 42, 0.08)",
              padding: 28,
              border: "1px solid #eef0ff",
              marginBottom: 32,
            }}
          >
            <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 8 }}>Quản lý lớp</h2>
            <p style={{ color: "#555", marginBottom: 16 }}>
              Tạo, sửa, xoá lớp và gán học viên vào lớp. Sử dụng chức năng này sau khi đã áp migrations vào database.
            </p>

            <ClassManagementPanel refreshToken={refreshToken} />
          </div>
        </section>
      )}
    </div>
  );
}

export default StaffDashboard;
