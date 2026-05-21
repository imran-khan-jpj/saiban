"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useSyncExternalStore,
  type ReactNode,
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
// Native `storage` events only fire for cross-tab updates. We dispatch this
// custom event after our own writes so the same-tab subscriber re-snapshots.
const USER_STORAGE_EVENT = "saiban:user-storage";

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

function readStoredUser(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem(USER_STORAGE_KEY);
  } catch {
    return null;
  }
}

function writeStoredUser(value: string | null) {
  if (typeof window === "undefined") return;
  try {
    if (value === null) {
      window.localStorage.removeItem(USER_STORAGE_KEY);
    } else {
      window.localStorage.setItem(USER_STORAGE_KEY, value);
    }
  } catch {
    // localStorage may be unavailable (private mode, quota); ignore.
  }
  window.dispatchEvent(new Event(USER_STORAGE_EVENT));
}

function subscribeToUser(callback: () => void) {
  if (typeof window === "undefined") return () => {};
  window.addEventListener("storage", callback);
  window.addEventListener(USER_STORAGE_EVENT, callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener(USER_STORAGE_EVENT, callback);
  };
}

function getServerSnapshot(): string | null {
  return null;
}

export function AppProvider({ children }: { children: ReactNode }) {
  const stored = useSyncExternalStore(
    subscribeToUser,
    readStoredUser,
    getServerSnapshot,
  );

  const user = useMemo<User | null>(() => {
    if (!stored) return null;
    try {
      return normalizeUser(JSON.parse(stored));
    } catch {
      return null;
    }
  }, [stored]);

  const setUser = useCallback((next: User | null) => {
    writeStoredUser(next ? JSON.stringify(next) : null);
  }, []);

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
