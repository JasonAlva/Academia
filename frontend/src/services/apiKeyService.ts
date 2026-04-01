import { useApiClient } from "./api";

export interface ApiKeyStatus {
  has_key: boolean;
  hint?: string;
}

export const useApiKeyService = () => {
  const api = useApiClient();

  return {
    /** Check whether a key is saved (returns masked hint, never raw key) */
    getStatus: (): Promise<ApiKeyStatus> => api.get("/settings/api-key"),

    /** Save or replace the user's personal Google API key */
    saveKey: (apiKey: string): Promise<ApiKeyStatus> =>
      api.post("/settings/api-key", { api_key: apiKey }),

    /** Remove the stored key */
    deleteKey: (): Promise<ApiKeyStatus> => api.delete("/settings/api-key"),
  };
};
