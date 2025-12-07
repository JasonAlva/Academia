import { useApiClient } from "./api";

export interface Department {
  id: string;
  name: string;
  code: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DepartmentCreate {
  name: string;
  code: string;
  description?: string;
}

export interface DepartmentUpdate {
  name?: string;
  code?: string;
  description?: string;
}

// Hook-based service
export const useDepartmentService = () => {
  const apiClient = useApiClient();

  return {
    getAll: async (): Promise<Department[]> => apiClient.get("/departments"),

    getById: async (id: string): Promise<Department> =>
      apiClient.get(`/departments/${id}`),

    create: async (data: DepartmentCreate): Promise<Department> =>
      apiClient.post("/departments", data),

    update: async (id: string, data: DepartmentUpdate): Promise<Department> =>
      apiClient.put(`/departments/${id}`, data),

    delete: async (id: string): Promise<void> =>
      apiClient.delete(`/departments/${id}`),
  };
};
