"use client";

import { useMutation } from "@tanstack/react-query";
import { ApiError } from "@/app/api/api-callers/client";
import { parseApiErrorMessage } from "@/lib/api-error";

interface RegisterPayload {
  name: string;
  email: string;
  password: string;
}

interface RegisterResponse {
  user: {
    id: string;
    email: string;
    name: string;
    role: string;
  };
}

export const useRegister = () => {
  return useMutation<RegisterResponse, ApiError, RegisterPayload>({
    mutationFn: async (credentials: RegisterPayload) => {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(credentials),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new ApiError(
          parseApiErrorMessage(data),
          response.status,
          data,
        );
      }

      return data as RegisterResponse;
    },
  });
};
