import { useApiClient } from "./api";

export interface Enrollment {
  id: string;
  studentId: string;
  courseId: string;
  status?: string;
  grade?: string;
  gradePoints?: number;
  enrolledAt: string;
  student?: {
    id: string;
    studentId: string;
    department: string;
    semester: number;
    batch: string;
    user: {
      id: string;
      name: string;
      email: string;
    };
  };
  course?: {
    id: string;
    courseName: string;
    courseCode: string;
    credits: number;
    teacher?: {
      id: string;
      employeeId: string;
      user: {
        id: string;
        name: string;
        email: string;
      };
    };
    department?: {
      id: string;
      name: string;
      code: string;
    };
  };
}

export interface EnrollmentCreate {
  studentId: string;
  courseId: string;
}

export interface EnrollmentUpdate {
  status?: string;
  grade?: string;
  gradePoints?: number;
}

// Hook-based service
export const useEnrollmentService = () => {
  const apiClient = useApiClient();

  return {
    getAll: async (skip = 0, limit = 100): Promise<Enrollment[]> =>
      apiClient.get(`/enrollments?skip=${skip}&limit=${limit}`),

    getById: async (id: string): Promise<Enrollment> =>
      apiClient.get(`/enrollments/${id}`),

    create: async (data: EnrollmentCreate): Promise<Enrollment> =>
      apiClient.post("/enrollments", data),

    update: async (id: string, data: EnrollmentUpdate): Promise<Enrollment> =>
      apiClient.put(`/enrollments/${id}`, data),

    delete: async (id: string): Promise<void> =>
      apiClient.delete(`/enrollments/${id}`),

    getStudentEnrollments: async (studentId: string): Promise<Enrollment[]> =>
      apiClient.get(`/enrollments/student/${studentId}/courses`),
  };
};
