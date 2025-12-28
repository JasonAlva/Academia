import { useApiClient } from "./api";

// Type Definitions
export interface AttendanceRecord {
  id: string;
  studentId: string;
  sessionId: string;
  courseId: string;
  status: "PRESENT" | "ABSENT" | "LATE" | "EXCUSED";
  remarks?: string;
  markedAt: string;
  markedById: string;
  updatedAt: string;
  student?: any;
  course?: any;
  markedBy?: any;
  session?: {
    id: string;
    courseId: string;
    date: string;
    startTime: string;
    endTime: string;
    topic?: string;
    status: string;
  };
}

export interface ClassSession {
  id: string;
  courseId: string;
  date: string;
  startTime: string;
  endTime: string;
  topic?: string;
  status: "SCHEDULED" | "COMPLETED" | "CANCELLED";
}

export interface CourseAttendanceSummary {
  courseId: string;
  courseCode: string;
  courseName: string;
  credits: number;
  semester: number;
  teacher?: {
    name: string;
    email: string;
  };
  department?: {
    name: string;
    code: string;
  };
  totalSessions: number;
  attendedSessions: number;
  absentSessions: number;
  lateCount: number;
  excusedCount: number;
  attendancePercentage: number;
  status: "EXCELLENT" | "GOOD" | "WARNING" | "CRITICAL";
}

export interface StudentAttendanceDetails {
  studentId: string;
  studentIdNumber: string;
  name: string;
  department: string;
  semester: number;
  batch: string;
  courses: CourseAttendanceSummary[];
  overallAttendancePercentage: number;
}

export interface AttendanceStatistics {
  totalCourses: number;
  totalSessions: number;
  totalAttended: number;
  totalAbsent: number;
  overallPercentage: number;
  excellentCourses: number; // >=90%
  goodCourses: number; // 75-89%
  warningCourses: number; // 60-74%
  criticalCourses: number; // <60%
}

/**
 * Service for managing student attendance
 */
export const useStudentAttendanceService = () => {
  const apiClient = useApiClient();

  return {
    /**
     * Get attendance records for a specific student
     */
    getStudentAttendance: async (
      studentId: string,
      courseId?: string
    ): Promise<AttendanceRecord[]> => {
      const url = courseId
        ? `/attendance/student/${studentId}?course_id=${courseId}`
        : `/attendance/student/${studentId}`;
      return apiClient.get(url);
    },

    /**
     * Get attendance summary for all enrolled courses
     */
    getStudentAttendanceSummary: async (
      studentId: string
    ): Promise<CourseAttendanceSummary[]> => {
      try {
        // Get all attendance records for the student
        const records = await apiClient.get(`/attendance/student/${studentId}`);

        // Group by course and calculate statistics
        const courseMap = new Map<string, any>();

        for (const record of records) {
          if (!courseMap.has(record.sessionId)) {
            // Initialize course data - you'll need to fetch course details
            courseMap.set(record.sessionId, {
              totalSessions: 0,
              attendedSessions: 0,
              absentSessions: 0,
              lateCount: 0,
              excusedCount: 0,
            });
          }

          const courseData = courseMap.get(record.sessionId);
          courseData.totalSessions++;

          switch (record.status) {
            case "PRESENT":
              courseData.attendedSessions++;
              break;
            case "ABSENT":
              courseData.absentSessions++;
              break;
            case "LATE":
              courseData.lateCount++;
              courseData.attendedSessions++; // Count late as attended
              break;
            case "EXCUSED":
              courseData.excusedCount++;
              break;
          }
        }

        // Convert to array format (simplified - you may need to enhance this)
        return Array.from(courseMap.entries()).map(([courseId, data]) => {
          const percentage =
            data.totalSessions > 0
              ? (data.attendedSessions / data.totalSessions) * 100
              : 0;

          return {
            courseId,
            courseCode: "N/A",
            courseName: "N/A",
            credits: 0,
            semester: 0,
            ...data,
            attendancePercentage: percentage,
            status:
              percentage >= 90
                ? "EXCELLENT"
                : percentage >= 75
                ? "GOOD"
                : percentage >= 60
                ? "WARNING"
                : "CRITICAL",
          } as CourseAttendanceSummary;
        });
      } catch (error) {
        console.error("Error fetching attendance summary:", error);
        return [];
      }
    },

    /**
     * Get class sessions for a course
     */
    getCourseSessions: async (
      courseId: string,
      date?: string
    ): Promise<ClassSession[]> => {
      const url = date
        ? `/attendance/sessions/course/${courseId}?date=${date}`
        : `/attendance/sessions/course/${courseId}`;
      return apiClient.get(url);
    },

    /**
     * Get specific attendance record details
     */
    getAttendanceRecord: async (
      attendanceId: string
    ): Promise<AttendanceRecord> => {
      return apiClient.get(`/attendance/${attendanceId}`);
    },

    /**
     * Calculate attendance statistics
     */
    calculateStatistics: (
      courses: CourseAttendanceSummary[]
    ): AttendanceStatistics => {
      const stats: AttendanceStatistics = {
        totalCourses: courses.length,
        totalSessions: 0,
        totalAttended: 0,
        totalAbsent: 0,
        overallPercentage: 0,
        excellentCourses: 0,
        goodCourses: 0,
        warningCourses: 0,
        criticalCourses: 0,
      };

      courses.forEach((course) => {
        stats.totalSessions += course.totalSessions;
        stats.totalAttended += course.attendedSessions;
        stats.totalAbsent += course.absentSessions;

        if (course.attendancePercentage >= 90) stats.excellentCourses++;
        else if (course.attendancePercentage >= 75) stats.goodCourses++;
        else if (course.attendancePercentage >= 60) stats.warningCourses++;
        else stats.criticalCourses++;
      });

      stats.overallPercentage =
        stats.totalSessions > 0
          ? (stats.totalAttended / stats.totalSessions) * 100
          : 0;

      return stats;
    },

    /**
     * Get attendance status color
     */
    getStatusColor: (percentage: number): string => {
      if (percentage >= 90) return "green";
      if (percentage >= 75) return "blue";
      if (percentage >= 60) return "yellow";
      return "red";
    },

    /**
     * Get attendance status badge variant
     */
    getStatusVariant: (
      status: string
    ): "default" | "secondary" | "destructive" | "outline" => {
      switch (status) {
        case "EXCELLENT":
          return "default";
        case "GOOD":
          return "secondary";
        case "WARNING":
          return "outline";
        case "CRITICAL":
          return "destructive";
        default:
          return "outline";
      }
    },
  };
};
