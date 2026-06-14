"use client";

import { useMutation } from "@tanstack/react-query";
import { ApiError } from "@/app/api/api-callers/client";
import { parseApiErrorMessage } from "@/lib/api-error";

interface ResetPasswordPayload {
  token: string;
  password: string;
}

interface ResetPasswordResponse {
  message: string;
}

export const useResetPassword = () => {
  return useMutation<ResetPasswordResponse, ApiError, ResetPasswordPayload>({
    mutationFn: async (payload) => {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new ApiError(
          parseApiErrorMessage(data),
          response.status,
          data,
        );
      }

      return data as ResetPasswordResponse;
    },
  });
};
