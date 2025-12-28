import { useApiClient } from "./api";

export interface Teacher {
  id: string;
  userId: string;
  teacherId: string;
  department: string;
  designation: string;
  specialization?: string;
  phoneNumber?: string;
  officeRoom?: string;
  officeHours?: string;
  joiningDate?: string;
  createdAt: string;
  updatedAt: string;
  user?: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
}

export interface TeacherUpdate {
  department: string;
  designation: string;
  specialization?: string;
  phoneNumber?: string;
  officeRoom?: string;
  officeHours?: string;
  joiningDate?: string;
  user?: {
    name: string;
    email: string;
  };
}

// Hook-based teacher service
export const useTeacherService = () => {
  const apiClient = useApiClient();

  return {
    getAll: async (skip = 0, limit = 100): Promise<Teacher[]> =>
      apiClient.get(`/teachers?skip=${skip}&limit=${limit}`),

    getById: async (id: string): Promise<Teacher> =>
      apiClient.get(`/teachers/${id}`),

    create: async (data: Partial<Teacher>): Promise<Teacher> =>
      apiClient.post("/teachers", data),

    update: async (id: string, data: TeacherUpdate): Promise<Teacher> =>
      apiClient.put(`/teachers/${id}`, data),

    delete: async (id: string): Promise<void> =>
      apiClient.delete(`/teachers/${id}`),
  };
};
