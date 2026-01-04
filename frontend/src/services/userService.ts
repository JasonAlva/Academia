import { useApiClient } from "./api";

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface UserUpdate {
  name?: string;
  email?: string;
  password?: string;
}

// Hook-based user service
export const useUserService = () => {
  const apiClient = useApiClient();

  return {
    // Get current user profile
    getProfile: async (): Promise<User> => apiClient.get("/users/me"),

    // Get user by ID
    getById: async (id: string): Promise<User> => apiClient.get(`/users/${id}`),

    // Update user profile
    updateProfile: async (data: UserUpdate): Promise<User> =>
      apiClient.put("/users/me", data),

    // Update user by ID (admin only)
    updateById: async (id: string, data: UserUpdate): Promise<User> =>
      apiClient.put(`/users/${id}`, data),

    // Delete user
    deleteById: async (id: string): Promise<void> =>
      apiClient.delete(`/users/${id}`),

    // Get all users (admin only)
    getAll: async (): Promise<User[]> => apiClient.get("/users"),
  };
};
