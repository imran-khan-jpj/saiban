"use client";

import { useMutation } from "@tanstack/react-query";
import { ApiError } from "@/app/api/api-callers/client";
import { parseApiErrorMessage } from "@/lib/api-error";

interface ForgotPasswordPayload {
  email: string;
}

interface ForgotPasswordResponse {
  message: string;
}

export const useForgotPassword = () => {
  return useMutation<ForgotPasswordResponse, ApiError, ForgotPasswordPayload>({
    mutationFn: async (payload) => {
      const response = await fetch("/api/auth/forgot-password", {
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

      return data as ForgotPasswordResponse;
    },
  });
};
