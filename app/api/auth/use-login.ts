"use client";

import { useMutation } from "@tanstack/react-query";
import { postClient } from "@/app/api/api-callers/client";

interface LoginPayload {
  email: string;
  password: string;
}

interface LoginResponse {
  access_token: string;
  user: {
    id: string;
    email: string;
    role: string;
  };
}

interface LoginError {
  message: string;
  error: string;
  statusCode: number;
}

export const useLogin = () => {
  return useMutation<LoginResponse, LoginError, LoginPayload>({
    mutationFn: async (credentials: LoginPayload) => {
      return await postClient<LoginResponse>({
        url: "/api/auth/login",
        body: credentials,
      });
    },
  });
};
