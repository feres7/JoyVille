import { apiRequest } from "@/lib/queryClient";

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface User {
  id: number;
  username: string;
  role: string;
}

export const authApi = {
  login: async (credentials: LoginCredentials): Promise<{ user: User }> => {
    const response = await apiRequest("POST", "/api/auth/login", credentials);
    return response.json();
  },

  logout: async (): Promise<void> => {
    await apiRequest("POST", "/api/auth/logout");
  },

  getCurrentUser: async (): Promise<{ user: User } | null> => {
    try {
      const response = await apiRequest("GET", "/api/auth/me");
      return response.json();
    } catch (error: any) {
      if (error.message.includes("401")) {
        return null;
      }
      throw error;
    }
  },
};
