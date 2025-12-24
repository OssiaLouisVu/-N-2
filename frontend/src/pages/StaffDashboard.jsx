import { useState } from "react";
import { useNavigate } from "react-router-dom";

// Các component quản lý Học viên
import AddStudentPanel from "../components/student/AddStudentPanel.jsx";
import OngoingStudentsPanel from "../components/student/OngoingStudentsPanel.jsx";
import CompletedStudentsPanel from "../components/student/CompletedStudentsPanel.jsx";

// Component quản lý Lớp (Mới)
import ClassManagementPanel from "../components/class/ClassManagementPanel";

// Component quản lý Khóa học
import CourseManagementPanel from "../components/course/CourseManagementPanel";

// Component quản lý Giảng viên (MỚI)
import InstructorManagementPanel from "../components/instructor/InstructorManagementPanel";

function StaffDashboard() {
  const navigate = useNavigate();

  // --- STATE QUẢN LÝ HIỂN THỊ ---
  const [showStudentSection, setShowStudentSection] = useState(true);
  const [showClassSection, setShowClassSection] = useState(false);
  const [showCourseSection, setShowCourseSection] = useState(false);
  const [showInstructorSection, setShowInstructorSection] = useState(false); // State mới cho Giảng viên

  const [globalMessage, setGlobalMessage] = useState("");
  const [refreshToken, setRefreshToken] = useState(0);

  const handleLogout = () => {
    localStorage.removeItem("currentUser");
    navigate("/login");
  };

  const handleRefreshAllStudents = () => {
    setRefreshToken((t) => t + 1);
  };

  // Hàm chuyển đổi hiển thị thông minh (Tắt cái này bật cái kia cho đỡ rối)
  const toggleSection = (sectionName) => {
    // Reset all
    setShowStudentSection(false);
    setShowClassSection(false);
    setShowCourseSection(false);
    setShowInstructorSection(false);

    // Bật cái được chọn
    if (sectionName === 'student') setShowStudentSection(true);
    if (sectionName === 'class') setShowClassSection(true);
    if (sectionName === 'course') setShowCourseSection(true);
    if (sectionName === 'instructor') setShowInstructorSection(true);
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
          position: "fixed",
          top: 16,
          right: 24,
          padding: "8px 18px",
          borderRadius: 999,
          border: "1px solid #ff4d4f",
          backgroundColor: "#fff",
          color: "#ff4d4f",
          cursor: "pointer",
          fontWeight: 500,
          zIndex: 20,
        }}
      >
        Đăng xuất
      </button>

      {/* HEADER */}
      <div style={{ maxWidth: 900 }}>
        <h1 style={{ fontSize: 32, fontWeight: 700, marginBottom: 8 }}>
          Dashboard nhân viên trung tâm 
        </h1>
       
      </div>

      {/* KHU CHỨC NĂNG (MENU) */}
      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 12, display: "flex", alignItems: "center", gap: 8 }}>
          <span role="img" aria-label="pin">📌</span> Chức năng
        </h2>

        <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
          
          {/* 1. Nút Quản lý học viên */}
          <button
            onClick={() => toggleSection('student')}
            style={{
              padding: "12px 24px",
              borderRadius: 999,
              border: "none",
              cursor: "pointer",
              fontWeight: 600,
              fontSize: 15,
              boxShadow: showStudentSection ? "0 10px 20px rgba(88, 101, 242, 0.25)" : "0 4px 10px rgba(0,0,0,0.08)",
              background: showStudentSection ? "linear-gradient(135deg, #5865f2, #7b5cff)" : "#f2f3ff",
              color: showStudentSection ? "#fff" : "#333",
              transition: "all 0.25s",
            }}
          >
            Quản lý học viên
          </button>

          {/* 2. Nút Quản lý lớp */}
          <button
            onClick={() => toggleSection('class')}
            style={{
              padding: "12px 24px",
              borderRadius: 999,
              border: "none",
              cursor: "pointer",
              fontWeight: 600,
              fontSize: 15,
              boxShadow: showClassSection ? "0 10px 20px rgba(40, 167, 69, 0.18)" : "0 4px 10px rgba(0,0,0,0.04)",
              background: showClassSection ? "linear-gradient(135deg,#28a745,#5cd67a)" : "#f2f3ff",
              color: showClassSection ? "#fff" : "#333",
              transition: "all 0.25s",
            }}
          >
            Quản lý lớp 
          </button>

          {/* 3. Nút Quản lý khóa học */}
          <button
            onClick={() => toggleSection('course')}
            style={{
              padding: "12px 24px",
              borderRadius: 999,
              border: "none",
              cursor: "pointer",
              fontWeight: 600,
              fontSize: 15,
              boxShadow: showCourseSection ? "0 10px 20px rgba(255, 159, 64, 0.18)" : "0 4px 10px rgba(0,0,0,0.04)",
              background: showCourseSection ? "linear-gradient(135deg,#ff9f40,#ffb84d)" : "#f2f3ff",
              color: showCourseSection ? "#fff" : "#333",
              transition: "all 0.25s",
            }}
          >
            Quản lý khóa học
          </button>

          {/* 4. Nút Quản lý Giảng viên (MỚI) */}
          <button
            onClick={() => toggleSection('instructor')}
            style={{
              padding: "12px 24px",
              borderRadius: 999,
              border: "none",
              cursor: "pointer",
              fontWeight: 600,
              fontSize: 15,
              boxShadow: showInstructorSection ? "0 10px 20px rgba(234, 179, 8, 0.2)" : "0 4px 10px rgba(0,0,0,0.04)",
              background: showInstructorSection ? "linear-gradient(135deg, #eab308, #ca8a04)" : "#f2f3ff",
              color: showInstructorSection ? "#fff" : "#333",
              transition: "all 0.25s",
            }}
          >
            Quản lý giảng viên
          </button>

        </div>
      </section>

      {/* --- SECTION 1: HỌC VIÊN --- */}
      {showStudentSection && (
        <section id="student-section" style={{ marginTop: 24, maxWidth: 1100 }}>
          <div style={{ borderRadius: 24, backgroundColor: "#ffffff", boxShadow: "0 18px 40px rgba(15, 23, 42, 0.08)", padding: 28, border: "1px solid #eef0ff", marginBottom: 32 }}>
            <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 8 }}>Quản lý học viên</h2>
            

            {globalMessage && (
              <div style={{ marginBottom: 20, padding: "10px 14px", borderRadius: 10, backgroundColor: "#e6f4ff", borderLeft: "4px solid #1677ff", color: "#0050b3", fontSize: 14 }}>
                {globalMessage}
              </div>
            )}

            <AddStudentPanel onGlobalMessage={setGlobalMessage} onRefreshAll={handleRefreshAllStudents} refreshToken={refreshToken} />
            <OngoingStudentsPanel onGlobalMessage={setGlobalMessage} onRefreshAll={handleRefreshAllStudents} refreshToken={refreshToken} showEditButton={true} />
            <CompletedStudentsPanel onGlobalMessage={setGlobalMessage} onRefreshAll={handleRefreshAllStudents} refreshToken={refreshToken} />
          </div>
        </section>
      )}

      {/* --- SECTION 2: QUẢN LÝ LỚP --- */}
      {showClassSection && (
        <section id="class-section" style={{ marginTop: 24, maxWidth: 1100 }}>
          <div style={{ borderRadius: 24, backgroundColor: "#ffffff", boxShadow: "0 18px 40px rgba(15, 23, 42, 0.08)", padding: 28, border: "1px solid #eef0ff", marginBottom: 32 }}>
            <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 8, color: '#28a745' }}>
              Quản lý Lớp học
            </h2>
            
            <ClassManagementPanel />
          </div>
        </section>
      )}

      {/* --- SECTION 3: KHÓA HỌC --- */}
      {showCourseSection && (
        <section id="course-section" style={{ marginTop: 24, maxWidth: 1100 }}>
          <div style={{ borderRadius: 24, backgroundColor: "#ffffff", boxShadow: "0 18px 40px rgba(15, 23, 42, 0.08)", padding: 28, border: "1px solid #fff5e6", marginBottom: 32 }}>
            <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 8 }}>📚 Quản lý khóa học</h2>
            
            <CourseManagementPanel refreshToken={refreshToken} />
          </div>
        </section>
      )}

      {/* --- SECTION 4: QUẢN LÝ GIẢNG VIÊN (MỚI) --- */}
      {showInstructorSection && (
        <section id="instructor-section" style={{ marginTop: 24, maxWidth: 1100 }}>
          <div style={{ borderRadius: 24, backgroundColor: "#ffffff", boxShadow: "0 18px 40px rgba(15, 23, 42, 0.08)", padding: 28, border: "1px solid #fef9c3", marginBottom: 32 }}>
            <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 8, color: '#ca8a04' }}>
              👨‍🏫  Quản lý giảng viên
            </h2>
            
            
            {/* Component hiển thị danh sách GV */}
            <InstructorManagementPanel />
            
          </div>
        </section>
      )}

    </div>
  );
}

export default StaffDashboard;