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
  };
};
