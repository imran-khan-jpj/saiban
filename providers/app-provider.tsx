"use client";

import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from "react";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar: string;
}

interface AppContextType {
  user: User | null;
  setUser: (user: User | null) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const USER_STORAGE_KEY = "user";

const normalizeUser = (raw: unknown): User | null => {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;

  const id =
    typeof r.id === "string"
      ? r.id
      : typeof r._id === "string"
        ? r._id
        : "";
  const email = typeof r.email === "string" ? r.email : "";
  if (!id || !email) return null;

  const role = typeof r.role === "string" ? r.role : "user";
  const name =
    typeof r.name === "string" && r.name.length > 0
      ? r.name
      : email.split("@")[0];
  const rawAvatar = typeof r.avatar === "string" ? r.avatar : "";
  // Discard known-broken legacy placeholder so the AvatarFallback can render.
  const avatar = rawAvatar === "/avatars/shadcn.jpg" ? "" : rawAvatar;

  return { id, name, email, role, avatar };
};

export function AppProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") {
      setIsLoaded(true);
      return;
    }

    const stored = localStorage.getItem(USER_STORAGE_KEY);
    if (stored) {
      try {
        const parsed = normalizeUser(JSON.parse(stored));
        if (parsed) setUser(parsed);
      } catch (error) {
        console.error("Failed to parse stored user:", error);
        localStorage.removeItem(USER_STORAGE_KEY);
      }
    }
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (!isLoaded) return;
    if (typeof window === "undefined") return;
    if (user) {
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(USER_STORAGE_KEY);
    }
  }, [user, isLoaded]);

  return (
    <AppContext.Provider value={{ user, setUser }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
}
