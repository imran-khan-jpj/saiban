"use client";

import { useMutation } from "@tanstack/react-query";
import { ApiError } from "@/app/api/api-callers/client";
import { DEFAULTS } from "@/app/defaults";

interface LoginPayload {
  email: string;
  password: string;
}

interface LoginResponse {
  user: {
    id: string;
    email: string;
    role: string;
    name?: string;
  };
}

export const useLogin = () => {
  return useMutation<LoginResponse, ApiError, LoginPayload>({
    mutationFn: async (credentials: LoginPayload) => {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(credentials),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new ApiError(
          data?.message ?? data?.error ?? DEFAULTS.ERROR_MESSAGE,
          response.status,
          data,
        );
      }

      return data as LoginResponse;
    },
  });
};
