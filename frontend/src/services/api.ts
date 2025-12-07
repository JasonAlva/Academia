

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api";

export const useApiClient = () => {
  const token = localStorage.getItem("token");

  const request = async (endpoint: string, options: RequestInit = {}) => {
    const headers = {
      "Content-Type": "application/json",
      Authorization: token ? `Bearer ${token}` : "",
      ...options.headers,
    };

    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers,
    });
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return response.json();
  };

  return {
    get: (endpoint: string) => request(endpoint),
    post: (endpoint: string, data: any) =>
      request(endpoint, { method: "POST", body: JSON.stringify(data) }),
    put: (endpoint: string, data: any) =>
      request(endpoint, { method: "PUT", body: JSON.stringify(data) }),
    delete: (endpoint: string) => request(endpoint, { method: "DELETE" }),
  };
};
