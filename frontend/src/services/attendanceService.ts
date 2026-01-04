import { useApiClient } from "./api";

export interface StudentAttendance {
  studentId: string;
  studentName: string;
  studentIdNumber: string;
  department: string;
  semester: number;
  courses: CourseAttendance[];
}

export interface CourseAttendance {
  courseId: string;
  courseCode: string;
  courseName: string;
  totalClasses: number;
  attendedClasses: number;
  attendancePercentage: number;
  status: string;
}

export interface TeacherAttendance {
  teacherId: string;
  teacherName: string;
  teacherIdNumber: string;
  department: string;
  courses: TeacherCourseAttendance[];
}

export interface TeacherCourseAttendance {
  courseId: string;
  courseCode: string;
  courseName: string;
  totalClassesConducted: number;
  totalStudentsEnrolled: number;
  averageAttendancePercentage: number;
}

export interface ClassSessionCreate {
  courseId: string;
  scheduleId?: string;
  teacherId: string;
  date: string;
  startTime: string;
  endTime: string;
  room?: string;
  topic?: string;
  status: "SCHEDULED" | "CONDUCTED" | "CANCELLED" | "POSTPONED";
  notes?: string;
}

export interface StudentAttendanceInput {
  sessionId: string;
  studentId: string;
  status: "PRESENT" | "ABSENT" | "LATE" | "EXCUSED";
  remarks?: string;
}

export interface ClassSession {
  id: string;
  courseId: string;
  scheduleId?: string;
  teacherId: string;
  date: string;
  startTime: string;
  endTime: string;
  room?: string;
  topic?: string;
  status: string;
  notes?: string;
}

export interface Schedule {
  id: string;
  courseId: string;
  teacherId: string;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  room: string;
  building?: string;
  type: string;
  isActive: boolean;
}

export const useAttendanceService = () => {
  const api = useApiClient();

  return {
    // Get all students with their attendance records
    getAllStudentsAttendance: async (): Promise<StudentAttendance[]> => {
      return api.get("/attendance/statistics/students");
    },

    // Get attendance for a specific student
    getStudentAttendance: async (
      studentId: string
    ): Promise<StudentAttendance> => {
      return api.get(`/attendance/student/${studentId}`);
    },

    // Get all teachers with their course attendance stats
    getAllTeachersAttendance: async (): Promise<TeacherAttendance[]> => {
      return api.get("/attendance/statistics/teachers");
    },

    // Get attendance stats for a specific teacher
    getTeacherAttendance: async (
      teacherId: string
    ): Promise<TeacherAttendance> => {
      return api.get(`/attendance/teacher/${teacherId}`);
    },

    // Get detailed attendance records for a specific course
    getCourseAttendance: async (courseId: string) => {
      return api.get(`/attendance/course/${courseId}`);
    },

    // Get schedules for a course
    getCourseSchedules: async (courseId: string): Promise<Schedule[]> => {
      return api.get(`/schedules?courseId=${courseId}`);
    },

    // Create a class session
    createClassSession: async (
      session: ClassSessionCreate
    ): Promise<ClassSession> => {
      return api.post("/attendance/sessions", session);
    },

    // Mark bulk attendance for multiple students
    markBulkAttendance: async (
      attendanceList: StudentAttendanceInput[]
    ): Promise<any[]> => {
      return api.post("/attendance/bulk", attendanceList);
    },
  };
};
