import "./App.css";
import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login.jsx";
import StudentDashboard from "./pages/StudentDashboard.jsx";
import TeacherDashboard from "./pages/TeacherDashboard.jsx";
import StaffDashboard from "./pages/StaffDashboard.jsx";
import AccountantDashboard from "./pages/AccountantDashboard.jsx";
import ManagerDashboard from "./pages/ManagerDashboard.jsx";






function App() {
  return (
    <div className="app-root">
      <Routes>
        {/* Mặc định chuyển về /login */}
        <Route path="/" element={<Navigate to="/login" />} />

        {/* Đăng nhập */}
        <Route path="/login" element={<Login />} />

        {/* Dashboard theo vai trò */}
        <Route path="/student/dashboard" element={<StudentDashboard />} />
        <Route path="/teacher/dashboard" element={<TeacherDashboard />} />
        <Route path="/staff/dashboard" element={<StaffDashboard />} />
        <Route path="/accountant/dashboard" element={<AccountantDashboard />} />
        <Route path="/manager/dashboard" element={<ManagerDashboard />} />
       
      

        {/* Không khớp route nào thì quay lại login */}
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </div>
  );
}

export default App;
