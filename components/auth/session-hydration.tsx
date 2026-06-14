"use client";

import { useEffect, type ReactNode } from "react";

import { useMe } from "@/app/api/auth/use-me";
import { useApp } from "@/providers/app-provider";
import { mapApiUserToAppUser } from "@/lib/user";

interface SessionHydrationProps {
  children: ReactNode;
}

export function SessionHydration({ children }: SessionHydrationProps) {
  const { setUser } = useApp();
  const { data, isError, error } = useMe();

  useEffect(() => {
    if (data?.user) {
      setUser(mapApiUserToAppUser(data.user));
    }
  }, [data, setUser]);

  useEffect(() => {
    if (isError && error?.isUnauthorized) {
      setUser(null);
      window.location.href = "/login";
    }
  }, [isError, error, setUser]);

  return <>{children}</>;
}
