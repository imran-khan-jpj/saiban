"use client";

import { useMutation } from "@tanstack/react-query";
import { ApiError } from "@/app/api/api-callers/client";
import { parseApiErrorMessage } from "@/lib/api-error";

interface UpdateProfilePayload {
  name: string;
}

interface UpdateProfileResponse {
  user: {
    id: string;
    email: string;
    name: string;
    role: string;
  };
}

export const useUpdateProfile = () => {
  return useMutation<UpdateProfileResponse, ApiError, UpdateProfilePayload>({
    mutationFn: async (payload) => {
      const response = await fetch("/api/auth/profile", {
        method: "PATCH",
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

      return data as UpdateProfileResponse;
    },
  });
};
