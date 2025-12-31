import { useApiClient } from "./api";

export interface Course {
  id: string;
  courseCode: string;
  courseName: string;
  credits: number;
  departmentId: string;
  semester: number;
  description?: string;
  syllabus?: string;
  maxStudents?: number;
  isActive: boolean;
  teacherId?: string;
  createdAt: string;
  updatedAt: string;
  teacher?: {
    id: string;
    teacherId: string;
    department: string;
    user?: {
      id: string;
      name: string;
      email: string;
    };
  };
  department?: {
    id: string;
    departmentName: string;
    departmentCode: string;
  };
  enrollments?: Array<{
    id: string;
    studentId: string;
    courseId: string;
  }>;
}

// Hook-based service
export const useCourseService = () => {
  const apiClient = useApiClient();

  return {
    getAll: async (): Promise<Course[]> => apiClient.get("/courses"),

    getById: async (id: string): Promise<Course> =>
      apiClient.get(`/courses/${id}`),

    getTeacherCourses: async (teacherId: string): Promise<Course[]> =>
      apiClient.get(`/teachers/${teacherId}/courses`),

    create: async (data: Partial<Course>): Promise<Course> =>
      apiClient.post("/courses", data),

    update: async (id: string, data: Partial<Course>): Promise<Course> =>
      apiClient.put(`/courses/${id}`, data),

    delete: async (id: string): Promise<void> =>
      apiClient.delete(`/courses/${id}`),
  };
};
