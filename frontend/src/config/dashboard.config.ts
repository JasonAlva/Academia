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
  type Icon,
} from "@tabler/icons-react";

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

export interface DashboardConfig {
  user: {
    name: string;
    email: string;
    avatar: string;
  };
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

// Admin Dashboard Configuration
const adminConfig: Omit<DashboardConfig, "user"> = {
  companyName: "College Admin",
  companyLogo: IconSchool,
  navMain: [
    {
      title: "Dashboard",
      url: "/admin/dashboard",
      icon: IconDashboard,
    },
    {
      title: "Departments",
      url: "/admin/departments",
      icon: IconBook,
    },
    {
      title: "Students",
      url: "/admin/students",
      icon: IconUsers,
    },
    {
      title: "Teachers",
      url: "/admin/teachers",
      icon: IconUserCircle,
    },
    {
      title: "Courses",
      url: "/admin/courses",
      icon: IconBook,
    },
    {
      title: "Schedules",
      url: "/admin/schedules",
      icon: IconCalendar,
    },
    {
      title: "Analytics",
      url: "/admin/analytics",
      icon: IconChartBar,
    },
  ],
  navSecondary: [
    {
      title: "Settings",
      url: "/admin/settings",
      icon: IconSettings,
    },
    {
      title: "Help",
      url: "/admin/help",
      icon: IconHelp,
    },
  ],
  navDocuments: [
    {
      name: "Reports",
      url: "/admin/reports",
      icon: IconFileText,
    },
    {
      name: "Attendance Records",
      url: "/admin/attendance",
      icon: IconClipboardCheck,
    },
  ],
};

// Teacher Dashboard Configuration
const teacherConfig: Omit<DashboardConfig, "user"> = {
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
    },
    {
      title: "Students",
      url: "/teacher/students",
      icon: IconUsers,
    },
    {
      title: "Attendance",
      url: "/teacher/attendance",
      icon: IconClipboardCheck,
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
    },
  ],
  navSecondary: [
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
      url: "/teacher/reports",
      icon: IconFileText,
    },
    {
      name: "Class Materials",
      url: "/teacher/materials",
      icon: IconBook,
    },
  ],
};

// Student Dashboard Configuration
const studentConfig: Omit<DashboardConfig, "user"> = {
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
    },
    {
      title: "Schedule",
      url: "/student/schedule",
      icon: IconCalendar,
    },
    {
      title: "Attendance",
      url: "/student/attendance",
      icon: IconClipboardList,
    },
    {
      title: "Grades",
      url: "/student/grades",
      icon: IconClipboardCheck,
    },
    {
      title: "Messages",
      url: "/student/messages",
      icon: IconMessages,
    },
  ],
  navSecondary: [
    {
      title: "Profile",
      url: "/student/profile",
      icon: IconUserCircle,
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
      icon: IconBook,
    },
    {
      name: "Transcripts",
      url: "/student/transcripts",
      icon: IconFileText,
    },
  ],
};

/**
 * Get dashboard configuration based on user role
 */
export const getDashboardConfig = (
  role: UserRole,
  user: DashboardConfig["user"]
): DashboardConfig => {
  const configs = {
    admin: adminConfig,
    teacher: teacherConfig,
    student: studentConfig,
  };

  return {
    ...configs[role],
    user,
  };
};
