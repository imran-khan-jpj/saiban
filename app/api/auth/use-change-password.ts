"use client";

import { useMutation } from "@tanstack/react-query";
import { ApiError } from "@/app/api/api-callers/client";
import { parseApiErrorMessage } from "@/lib/api-error";

interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
}

interface ChangePasswordResponse {
  message: string;
}

export const useChangePassword = () => {
  return useMutation<ChangePasswordResponse, ApiError, ChangePasswordPayload>({
    mutationFn: async (payload) => {
      const response = await fetch("/api/auth/change-password", {
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

      return data as ChangePasswordResponse;
    },
  });
};
