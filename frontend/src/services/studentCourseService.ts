import { useApiClient } from "./api";

// Type Definitions
export interface Department {
  id: string;
  name: string;
  code: string;
  description?: string;
  hodName?: string;
}

export interface Teacher {
  id: string;
  teacherId: string;
  department: string;
  designation: string;
  specialization?: string;
  user?: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
}

export interface Course {
  id: string;
  courseCode: string;
  courseName: string;
  credits: number;
  semester: number;
  description?: string;
  syllabus?: string;
  maxStudents?: number;
  isActive: boolean;
  departmentId: string;
  teacherId?: string;
  teacher?: Teacher;
  department?: Department;
}

export interface Enrollment {
  id: string;
  studentId: string;
  courseId: string;
  status: string;
  grade?: string;
  gradePoints?: number;
  enrolledAt: string;
  course: Course;
}

export interface StudentProfile {
  id: string;
  userId: string;
  studentId: string;
  department: string;
  semester: number;
  batch: string;
  phoneNumber?: string;
  address?: string;
  dateOfBirth?: string;
  user?: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
}

/**
 * Service for managing student courses and enrollments
 */
export const useStudentCourseService = () => {
  const apiClient = useApiClient();

  return {
    /**
     * Get student profile by user ID
     */
    getStudentByUserId: async (userId: string): Promise<StudentProfile> => {
      return apiClient.get(`/students/user/${userId}`);
    },

    /**
     * Get all enrolled courses for a student
     */
    getEnrolledCourses: async (studentId: string): Promise<Enrollment[]> => {
      return apiClient.get(`/enrollments/student/${studentId}/courses`);
    },

    /**
     * Get all available courses (not enrolled)
     */
    getAvailableCourses: async (): Promise<Course[]> => {
      return apiClient.get("/courses");
    },

    /**
     * Enroll in a course
     */
    enrollInCourse: async (
      studentId: string,
      courseId: string
    ): Promise<Enrollment> => {
      return apiClient.post("/enrollments", {
        studentId,
        courseId,
      });
    },

    /**
     * Drop/unenroll from a course
     */
    dropCourse: async (enrollmentId: string): Promise<void> => {
      return apiClient.delete(`/enrollments/${enrollmentId}`);
    },

    /**
     * Get a specific enrollment
     */
    getEnrollment: async (enrollmentId: string): Promise<Enrollment> => {
      return apiClient.get(`/enrollments/${enrollmentId}`);
    },

    /**
     * Update enrollment status or grade
     */
    updateEnrollment: async (
      enrollmentId: string,
      data: {
        status?: string;
        grade?: string;
        gradePoints?: number;
      }
    ): Promise<Enrollment> => {
      return apiClient.put(`/enrollments/${enrollmentId}`, data);
    },
  };
};

// Non-hook version for use outside of React components
export class StudentCourseService {
  private apiClient: ReturnType<typeof useApiClient>;

  constructor(apiClient: ReturnType<typeof useApiClient>) {
    this.apiClient = apiClient;
  }

  async getStudentByUserId(userId: string): Promise<StudentProfile> {
    return this.apiClient.get(`/students/user/${userId}`);
  }

  async getEnrolledCourses(studentId: string): Promise<Enrollment[]> {
    return this.apiClient.get(`/enrollments/student/${studentId}/courses`);
  }

  async getAvailableCourses(): Promise<Course[]> {
    return this.apiClient.get("/courses");
  }

  async enrollInCourse(
    studentId: string,
    courseId: string
  ): Promise<Enrollment> {
    return this.apiClient.post("/enrollments", {
      studentId,
      courseId,
    });
  }

  async dropCourse(enrollmentId: string): Promise<void> {
    return this.apiClient.delete(`/enrollments/${enrollmentId}`);
  }

  async getEnrollment(enrollmentId: string): Promise<Enrollment> {
    return this.apiClient.get(`/enrollments/${enrollmentId}`);
  }

  async updateEnrollment(
    enrollmentId: string,
    data: {
      status?: string;
      grade?: string;
      gradePoints?: number;
    }
  ): Promise<Enrollment> {
    return this.apiClient.put(`/enrollments/${enrollmentId}`, data);
  }
}
