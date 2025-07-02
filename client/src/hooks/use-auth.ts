import { useQuery } from "@tanstack/react-query";

interface User {
  id: number;
  username: string;
  role: string;
}

export function useAuth() {
  const { data, isLoading, error, refetch } = useQuery<{ user: User } | null>({
    queryKey: ["/api/auth/me"],
    queryFn: async () => {
      const response = await fetch("/api/auth/me", {
        credentials: "include",
      });
      
      if (response.status === 401) {
        return null;
      }
      
      if (!response.ok) {
        throw new Error("Failed to fetch user");
      }
      
      return response.json();
    },
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  return {
    user: data?.user || null,
    isLoggedIn: !!data?.user,
    isLoading,
    error,
    refetch,
  };
}
