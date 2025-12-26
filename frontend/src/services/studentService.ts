import { useApiClient } from "./api";

export interface Student {
  

  name: string;
  email: string;
  password: string;
  studentId: string;
  department: string;
  semester: number;
  batch: string;
  phoneNumber?: string;
  address?: string;
  dateOfBirth?: string;
  createdAt?: string;
  updatedAt?: string;
  user?: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
}

export interface StudentUpdate {
  department?: string;
  semester?: number;
  batch?: string;
  phoneNumber?: string;
  address?: string;
  dateOfBirth?: string;
}

// Hook-based service
export const useStudentService = () => {
  const apiClient = useApiClient();

  return {
    getAll: async (skip = 0, limit = 100): Promise<Student[]> =>
      apiClient.get(`/students?skip=${skip}&limit=${limit}`),

    getById: async (id: string): Promise<Student> =>
      apiClient.get(`/students/${id}`),

    create: async (data: Partial<Student>): Promise<Student> =>
      apiClient.post("/students", data),

    update: async (id: string, data: StudentUpdate): Promise<Student> =>
      apiClient.put(`/students/${id}`, data),

    delete: async (id: string): Promise<void> =>
      apiClient.delete(`/students/${id}`),
  };
};
