"use client";

import { useQuery } from "@tanstack/react-query";
import { ApiError } from "@/app/api/api-callers/client";
import { parseApiErrorMessage } from "@/lib/api-error";

interface MeResponse {
  user: {
    id: string;
    email: string;
    name: string;
    role: string;
  };
}

export const useMe = () => {
  return useQuery<MeResponse, ApiError>({
    queryKey: ["auth", "me"],
    queryFn: async () => {
      const response = await fetch("/api/auth/me", { cache: "no-store" });
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new ApiError(
          parseApiErrorMessage(data),
          response.status,
          data,
        );
      }

      return data as MeResponse;
    },
    retry: false,
    staleTime: 5 * 60 * 1000,
  });
};
