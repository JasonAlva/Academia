import { Routes, Route, Navigate } from "react-router-dom";

import { useAuth } from "@/auth/AuthContext";
import ProtectedRoute from "@/auth/ProtectedRoutes";

import AuthForm from "@/pages/auth/AuthForm";

import ChatPage from "@/features/chat/ChatPage";

import UnauthorizedPage from "../pages/errors/Unauthorized.tsx";

// Import Dashboard Pages
import StudentDashboard from "@/pages/student/StudentDashboard";
import TeacherDashboard from "@/pages/teacher/TeacherDashboard";
import AdminDashboard from "@/pages/admin/AdminDashboard";

// Import Admin Feature Pages
import DepartmentsPage from "@/features/admin/DepartmentsPage";
import AdminStudentsPage from "@/features/admin/StudentsPage";
import AnalyticsPage from "@/features/admin/AnalyticsPage";

// Import Teacher Feature Pages
import TeacherCoursesPage from "@/features/teacher/CoursesPage";
import TeacherAttendancePage from "@/features/teacher/AttendancePage";

// Import Student Feature Pages
import StudentCoursesPage from "@/features/student/CoursesPage";
import StudentGradesPage from "@/features/student/GradesPage";
import DashboardRoutes from "@/layout/DashboardRoutes.tsx";

// ----------------------
// Login Page
// ----------------------
function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
      <div className="w-full max-w-md">
        <AuthForm />
      </div>
    </div>
  );
}

// ----------------------
// Role-Based Dashboard Redirect
// ----------------------
function RoleDashboard() {
  const { user } = useAuth();

  if (!user) return <Navigate to="/login" replace />;

  const role = user.role?.toLowerCase();

  if (role === "student") return <Navigate to="/student/dashboard" replace />;
  if (role === "teacher") return <Navigate to="/teacher/dashboard" replace />;
  if (role === "admin") return <Navigate to="/admin/dashboard" replace />;

  return <Navigate to="/login" replace />;
}

export default function AppRoutes() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/unauthorized" element={<UnauthorizedPage />} />

      {/* Default redirect for / */}
      <Route path="/" element={<RoleDashboard />} />

      {/* Dashboard Layout with Protected Child Routes */}
      <Route element={<DashboardRoutes />}>
        {/* STUDENT ROUTES */}
        <Route
          path="/student/dashboard"
          element={
            <ProtectedRoute allowed={["student"]}>
              <StudentDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/courses"
          element={
            <ProtectedRoute allowed={["student"]}>
              <StudentCoursesPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/grades"
          element={
            <ProtectedRoute allowed={["student"]}>
              <StudentGradesPage />
            </ProtectedRoute>
          }
        />

        {/* TEACHER ROUTES */}
        <Route
          path="/teacher/dashboard"
          element={
            <ProtectedRoute allowed={["teacher"]}>
              <TeacherDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/teacher/courses"
          element={
            <ProtectedRoute allowed={["teacher"]}>
              <TeacherCoursesPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/teacher/attendance"
          element={
            <ProtectedRoute allowed={["teacher"]}>
              <TeacherAttendancePage />
            </ProtectedRoute>
          }
        />

        {/* ADMIN ROUTES */}
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute allowed={["admin"]}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/departments"
          element={
            <ProtectedRoute allowed={["admin"]}>
              <DepartmentsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/students"
          element={
            <ProtectedRoute allowed={["admin"]}>
              <AdminStudentsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/analytics"
          element={
            <ProtectedRoute allowed={["admin"]}>
              <AnalyticsPage />
            </ProtectedRoute>
          }
        />
      </Route>

      {/* Catch-all redirect */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
