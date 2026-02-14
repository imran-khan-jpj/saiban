"use client";

import { useMutation } from "@tanstack/react-query";
import { postClient } from "@/app/api/api-callers/client";

interface RegisterPayload {
  name: string;
  email: string;
  password: string;
}

interface RegisterResponse {
  access_token: string;
  user: {
    id: string;
    email: string;
    name: string;
    role: string;
  };
}

export const useRegister = () => {
  return useMutation<RegisterResponse, Error, RegisterPayload>({
    mutationFn: async (credentials: RegisterPayload) => {
      return await postClient<RegisterResponse>({
        url: "/api/auth/register",
        body: credentials,
      });
    },
  });
};
