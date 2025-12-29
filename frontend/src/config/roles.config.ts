/**
 * Role-based Configuration System
 *
 * This file defines the sidebar navigation and features for each user role.
 * You can easily modify these configurations to add, remove, or update navigation items.
 */

import {
  IconDashboard,
  IconUsers,
  IconBook,
  IconCalendar,
  IconClipboardList,
  IconMessages,
  IconSettings,
  IconHelp,
  IconUserCircle,
  IconChartBar,
  IconSchool,
  IconClipboardCheck,
  IconFileText,
  IconBuildingBank,
  IconReportAnalytics,
  IconTrophy,
  IconNotes,
  IconBell,
  type Icon,
} from "@tabler/icons-react";

// ==================== TYPE DEFINITIONS ====================

export interface NavItem {
  title: string;
  url: string;
  icon?: Icon;
  badge?: string | number;
  items?: {
    title: string;
    url: string;
  }[];
}

export interface RoleConfig {
  companyName: string;
  companyLogo: Icon;
  navMain: NavItem[];
  navSecondary: NavItem[];
  navDocuments?: {
    name: string;
    url: string;
    icon: Icon;
  }[];
}

export type UserRole = "admin" | "teacher" | "student";

// ==================== ADMIN CONFIGURATION ====================

export const adminConfig: RoleConfig = {
  companyName: "College Admin",
  companyLogo: IconSchool,

  navMain: [
    {
      title: "Chat",
      url: "/admin/chat",
      icon: IconDashboard,
    },
    {
      title: "Departments",
      url: "/admin/departments",
      icon: IconBuildingBank,
      items: [
        { title: "All Departments", url: "/admin/departments" },
        { title: "Add Department", url: "/admin/departments/add" },
      ],
    },
    {
      title: "Students",
      url: "/admin/students",
      icon: IconUsers,

      items: [
        { title: "All Students", url: "/admin/students" },
        { title: "Add Student", url: "/admin/students/add" },
        { title: "Enrollments", url: "/admin/students/enrollments" },
      ],
    },
    {
      title: "Teachers",
      url: "/admin/teachers",
      icon: IconUserCircle,
      items: [
        { title: "All Teachers", url: "/admin/teachers" },
        { title: "Add Teacher", url: "/admin/teachers/add" },
        { title: "Assignments", url: "/admin/teachers/assignments" },
      ],
    },
    {
      title: "Courses",
      url: "/admin/courses",
      icon: IconBook,
      items: [
        { title: "All Courses", url: "/admin/courses" },
        { title: "Add Course", url: "/admin/courses/add" },
        { title: "Course Materials", url: "/admin/courses/materials" },
      ],
    },
    {
      title: "Enrollment",
      url: "/admin/enrollments",
      icon: IconCalendar,
    },
    {
      title: "Timetable",
      url: "/admin/timetable",
      icon: IconCalendar,
    },
    {
      title: "Attendance",
      url: "/admin/attendance",
      icon: IconClipboardCheck,
    },
  ],

  navSecondary: [
    {
      title: "Profile",
      url: "/admin/profile",
      icon: IconUserCircle,
    },
    {
      title: "Settings",
      url: "/admin/settings",
      icon: IconSettings,
    },
  ],
};

// ==================== TEACHER CONFIGURATION ====================

export const teacherConfig: RoleConfig = {
  companyName: "Teacher Portal",
  companyLogo: IconSchool,

  navMain: [
    {
      title: "Dashboard",
      url: "/teacher/dashboard",
      icon: IconDashboard,
    },
    {
      title: "My Courses",
      url: "/teacher/courses",
      icon: IconBook,
      badge: "6",
      items: [
        { title: "Active Courses", url: "/teacher/courses" },
        { title: "Course Materials", url: "/teacher/courses/materials" },
        { title: "Assignments", url: "/teacher/courses/assignments" },
      ],
    },
    {
      title: "Students",
      url: "/teacher/students",
      icon: IconUsers,
      items: [
        { title: "All Students", url: "/teacher/students" },
        { title: "Performance", url: "/teacher/students/performance" },
      ],
    },
    {
      title: "Attendance",
      url: "/teacher/attendance",
      icon: IconClipboardCheck,
      items: [
        { title: "Mark Attendance", url: "/teacher/attendance/mark" },
        { title: "Attendance History", url: "/teacher/attendance/history" },
        { title: "Reports", url: "/teacher/attendance/reports" },
      ],
    },
    {
      title: "Grades",
      url: "/teacher/grades",
      icon: IconTrophy,
      items: [
        { title: "Grade Book", url: "/teacher/grades" },
        { title: "Submit Grades", url: "/teacher/grades/submit" },
      ],
    },
    {
      title: "Schedule",
      url: "/teacher/schedule",
      icon: IconCalendar,
    },
    {
      title: "Messages",
      url: "/teacher/messages",
      icon: IconMessages,
      badge: 3,
    },
  ],

  navSecondary: [
    {
      title: "Notifications",
      url: "/teacher/notifications",
      icon: IconBell,
    },
    {
      title: "Profile",
      url: "/teacher/profile",
      icon: IconUserCircle,
    },
    {
      title: "Settings",
      url: "/teacher/settings",
      icon: IconSettings,
    },
    {
      title: "Help",
      url: "/teacher/help",
      icon: IconHelp,
    },
  ],

  navDocuments: [
    {
      name: "Grade Reports",
      url: "/teacher/reports/grades",
      icon: IconReportAnalytics,
    },
    {
      name: "Class Materials",
      url: "/teacher/materials",
      icon: IconNotes,
    },
    {
      name: "Attendance Sheets",
      url: "/teacher/reports/attendance",
      icon: IconFileText,
    },
  ],
};

// ==================== STUDENT CONFIGURATION ====================

export const studentConfig: RoleConfig = {
  companyName: "Student Portal",
  companyLogo: IconSchool,

  navMain: [
    {
      title: "Dashboard",
      url: "/student/dashboard",
      icon: IconDashboard,
    },
    {
      title: "My Courses",
      url: "/student/courses",
      icon: IconBook,
      badge: "5",
      items: [
        { title: "All Courses", url: "/student/courses" },
        { title: "Course Materials", url: "/student/courses/materials" },
        { title: "Assignments", url: "/student/courses/assignments" },
      ],
    },
    {
      title: "Schedule",
      url: "/student/schedule",
      icon: IconCalendar,
      items: [
        { title: "My Timetable", url: "/student/schedule" },
        { title: "Upcoming Classes", url: "/student/schedule/upcoming" },
      ],
    },
    {
      title: "Attendance",
      url: "/student/attendance",
      icon: IconClipboardList,
      items: [
        { title: "View Attendance", url: "/student/attendance" },
        { title: "Attendance History", url: "/student/attendance/history" },
      ],
    },
    {
      title: "Grades",
      url: "/student/grades",
      icon: IconTrophy,
      items: [
        { title: "Current Grades", url: "/student/grades" },
        { title: "Grade History", url: "/student/grades/history" },
        { title: "GPA Calculator", url: "/student/grades/calculator" },
      ],
    },
    {
      title: "Messages",
      url: "/student/messages",
      icon: IconMessages,
      badge: 2,
    },
  ],

  navSecondary: [
    {
      title: "Notifications",
      url: "/student/notifications",
      icon: IconBell,
      badge: 4,
    },
    {
      title: "Profile",
      url: "/student/profiles",
      icon: IconUserCircle,
    },
    {
      title: "Settings",
      url: "/student/settings",
      icon: IconSettings,
    },
    {
      title: "Help",
      url: "/student/help",
      icon: IconHelp,
    },
  ],

  navDocuments: [
    {
      name: "Course Materials",
      url: "/student/materials",
      icon: IconNotes,
    },
    {
      name: "Transcripts",
      url: "/student/transcripts",
      icon: IconFileText,
    },
    {
      name: "Certificates",
      url: "/student/certificates",
      icon: IconTrophy,
    },
  ],
};

// ==================== HELPER FUNCTIONS ====================

/**
 * Get role configuration by role name
 */
export const getRoleConfig = (role: UserRole): RoleConfig => {
  // Normalize role to lowercase for comparison
  const normalizedRole = role?.toLowerCase();

  const configs: Record<string, RoleConfig> = {
    admin: adminConfig,
    teacher: teacherConfig,
    instructor: teacherConfig, // Treat instructor as teacher
    student: studentConfig,
  };

  return configs[normalizedRole] || studentConfig;
};

/**
 * Get dashboard configuration with user info
 */
export interface DashboardConfig extends RoleConfig {
  user: {
    name: string;
    email: string;
    avatar: string;
  };
}

export const getDashboardConfig = (
  role: UserRole,
  user: DashboardConfig["user"]
): DashboardConfig => {
  return {
    ...getRoleConfig(role),
    user,
  };
};
