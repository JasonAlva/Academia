import { Routes, Route, Navigate } from "react-router-dom";

import { useAuth } from "@/auth/AuthContext";
import ProtectedRoute from "@/auth/ProtectedRoutes";

import AuthForm from "@/pages/auth/AuthForm";

import ChatPage from "@/features/chat/ChatPage.tsx";

import UnauthorizedPage from "../pages/errors/Unauthorized.tsx";

// Import Dashboard Pages
import StudentDashboard from "@/pages/student/StudentDashboard";
import TeacherDashboard from "@/pages/teacher/TeacherDashboard";
import AdminDashboard from "@/pages/admin/AdminDashboard";

// Import Admin Feature Pages
import AdminDepartmentsPage from "@/features/admin/DepartmentsPage";
import AdminStudentsPage from "@/features/admin/StudentsPage";
import AnalyticsPage from "@/features/admin/AnalyticsPage";
import AdminCoursePage from "@/features/admin/CoursePage";
import AdminAttendancePage from "@/features/admin/AttendancePage";

// Import Teacher Feature Pages
import TeacherCoursesPage from "@/features/teacher/CoursesPage";
import TeacherAttendancePage from "@/features/teacher/AttendancePage";

// Import Student Feature Pages
import StudentCoursesPage from "@/features/student/CoursesPage";
import StudentGradesPage from "@/features/student/GradesPage";
import DashboardRoutes from "@/layout/DashboardRoutes.tsx";
import TimeTablesPage from "@/features/timetable/TimeTablesPage.tsx";
import TeachersPage from "@/features/admin/TeachersPage.tsx";

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

  if (role === "student") return <Navigate to="/student/chat" replace />;
  if (role === "teacher") return <Navigate to="/teacher/chat" replace />;
  if (role === "admin") return <Navigate to="/admin/chat" replace />;

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
          path="/student/chat"
          element={
            <ProtectedRoute allowed={["student"]}>
              <ChatPage />
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
          path="/teacher/chat"
          element={
            <ProtectedRoute allowed={["teacher"]}>
              <ChatPage />
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
          path="/admin/chat"
          element={
            <ProtectedRoute allowed={["admin"]}>
              <ChatPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/departments"
          element={
            <ProtectedRoute allowed={["admin"]}>
              <AdminDepartmentsPage />
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
          path="/admin/teachers"
          element={
            <ProtectedRoute allowed={["admin"]}>
              <TeachersPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/timetable"
          element={
            <ProtectedRoute allowed={["admin"]}>
              <TimeTablesPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/courses"
          element={
            <ProtectedRoute allowed={["admin"]}>
              <AdminCoursePage />
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
        <Route
          path="/admin/attendance"
          element={
            <ProtectedRoute allowed={["admin"]}>
              <AdminAttendancePage />
            </ProtectedRoute>
          }
        />
      </Route>

      {/* Catch-all redirect */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
