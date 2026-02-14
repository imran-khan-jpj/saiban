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

export function AppProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load user from localStorage on mount
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error("Failed to parse stored user:", error);
        localStorage.removeItem("user");
      }
    }
    setIsLoaded(true);
  }, []);

  // Save user to localStorage whenever it changes
  useEffect(() => {
    if (isLoaded) {
      if (user) {
        localStorage.setItem("user", JSON.stringify(user));
      } else {
        localStorage.removeItem("user");
      }
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
