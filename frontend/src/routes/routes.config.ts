/**
 * Example Routes Configuration
 *
 * This file shows how to set up routes for all the role-based pages and features.
 * Integrate these routes into your main routing system (React Router, etc.)
 */

import { lazy } from "react";

// ==================== ADMIN ROUTES ====================

// Admin Dashboard & Features
const AdminDashboard = lazy(() => import("@/pages/admin/AdminDashboard"));
const DepartmentsPage = lazy(() => import("@/features/admin/DepartmentsPage"));
const AdminStudentsPage = lazy(() => import("@/features/admin/StudentsPage"));
const AnalyticsPage = lazy(() => import("@/features/admin/AnalyticsPage"));

export const adminRoutes = [
  {
    path: "/admin/dashboard",
    element: AdminDashboard,
    title: "Dashboard",
  },
  {
    path: "/admin/departments",
    element: DepartmentsPage,
    title: "Departments",
  },
  {
    path: "/admin/students",
    element: AdminStudentsPage,
    title: "Students",
  },
  {
    path: "/admin/analytics",
    element: AnalyticsPage,
    title: "Analytics",
  },
  // Add more admin routes here:
  // {
  //   path: "/admin/teachers",
  //   element: TeachersPage,
  //   title: "Teachers",
  // },
  // {
  //   path: "/admin/courses",
  //   element: CoursesPage,
  //   title: "Courses",
  // },
  // {
  //   path: "/admin/schedules",
  //   element: SchedulesPage,
  //   title: "Schedules",
  // },
];

// ==================== TEACHER ROUTES ====================

// Teacher Dashboard & Features
const TeacherDashboard = lazy(() => import("@/pages/teacher/TeacherDashboard"));
const TeacherCoursesPage = lazy(() => import("@/features/teacher/CoursesPage"));
const TeacherAttendancePage = lazy(
  () => import("@/features/teacher/AttendancePage")
);

export const teacherRoutes = [
  {
    path: "/teacher/dashboard",
    element: TeacherDashboard,
    title: "Dashboard",
  },
  {
    path: "/teacher/courses",
    element: TeacherCoursesPage,
    title: "My Courses",
  },
  {
    path: "/teacher/attendance",
    element: TeacherAttendancePage,
    title: "Attendance",
  },
  // Add more teacher routes here:
  // {
  //   path: "/teacher/students",
  //   element: TeacherStudentsPage,
  //   title: "Students",
  // },
  // {
  //   path: "/teacher/grades",
  //   element: TeacherGradesPage,
  //   title: "Grades",
  // },
  // {
  //   path: "/teacher/schedule",
  //   element: TeacherSchedulePage,
  //   title: "Schedule",
  // },
];

// ==================== STUDENT ROUTES ====================

// Student Dashboard & Features
const StudentDashboard = lazy(() => import("@/pages/student/StudentDashboard"));
const StudentCoursesPage = lazy(() => import("@/features/student/CoursesPage"));
const StudentGradesPage = lazy(() => import("@/features/student/GradesPage"));

export const studentRoutes = [
  {
    path: "/student/dashboard",
    element: StudentDashboard,
    title: "Dashboard",
  },
  {
    path: "/student/courses",
    element: StudentCoursesPage,
    title: "My Courses",
  },
  {
    path: "/student/grades",
    element: StudentGradesPage,
    title: "Grades",
  },
  // Add more student routes here:
  // {
  //   path: "/student/schedule",
  //   element: StudentSchedulePage,
  //   title: "Schedule",
  // },
  // {
  //   path: "/student/attendance",
  //   element: StudentAttendancePage,
  //   title: "Attendance",
  // },
  // {
  //   path: "/student/profile",
  //   element: StudentProfilePage,
  //   title: "Profile",
  // },
];

// ==================== ALL ROUTES ====================

export const allRoutes = [...adminRoutes, ...teacherRoutes, ...studentRoutes];

// ==================== ROUTE HELPER FUNCTIONS ====================

/**
 * Get routes based on user role
 */
export const getRoutesByRole = (role: "admin" | "teacher" | "student") => {
  switch (role) {
    case "admin":
      return adminRoutes;
    case "teacher":
      return teacherRoutes;
    case "student":
      return studentRoutes;
    default:
      return [];
  }
};

/**
 * Get default dashboard path by role
 */
export const getDefaultDashboard = (role: "admin" | "teacher" | "student") => {
  switch (role) {
    case "admin":
      return "/admin/dashboard";
    case "teacher":
      return "/teacher/dashboard";
    case "student":
      return "/student/dashboard";
    default:
      return "/";
  }
};

/**
 * Check if user has access to a route
 */
export const hasRouteAccess = (
  route: string,
  userRole: "admin" | "teacher" | "student"
) => {
  const roleRoutes = getRoutesByRole(userRole);
  return roleRoutes.some((r) => route.startsWith(r.path));
};
