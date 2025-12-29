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

    if (!response.ok) {
      let errorMessage = `Request failed with status ${response.status}`;

      try {
        const errorData = await response.json();

        // Handle different error response formats
        if (errorData.detail) {
          if (typeof errorData.detail === "string") {
            errorMessage = errorData.detail;
          } else if (Array.isArray(errorData.detail)) {
            // FastAPI validation errors
            errorMessage = errorData.detail
              .map((err: any) => {
                const field = err.loc ? err.loc[err.loc.length - 1] : "field";
                return `${field}: ${err.msg}`;
              })
              .join(", ");
          } else if (typeof errorData.detail === "object") {
            errorMessage = JSON.stringify(errorData.detail);
          }
        } else if (errorData.message) {
          errorMessage = errorData.message;
        }
      } catch (e) {
        // If parsing JSON fails, use the status text
        errorMessage = response.statusText || errorMessage;
      }

      throw new Error(errorMessage);
    }

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
