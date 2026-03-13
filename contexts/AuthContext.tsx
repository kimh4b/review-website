"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface User {
  id: string;
  email: string;
  fullName: string;
  restaurantName: string;
  plan: "Basic" | "Pro" | "Enterprise";
  role: "user" | "admin";  // <-- added
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (data: SignUpData) => Promise<void>;
  logout: () => void;
}

interface SignUpData {
  fullName: string;
  email: string;
  password: string;
  restaurantName: string;
  plan?: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [lastActivity, setLastActivity] = useState(Date.now());

  // Idle timeout (30 minutes)
  useEffect(() => {
    if (!user) return;

    const handleActivity = () => setLastActivity(Date.now());

    window.addEventListener("mousemove", handleActivity);
    window.addEventListener("keydown", handleActivity);
    window.addEventListener("click", handleActivity);

    const interval = setInterval(() => {
      const idleTime = Date.now() - lastActivity;
      const thirtyMinutes = 30 * 60 * 1000;
      if (idleTime > thirtyMinutes) logout();
    }, 60000);

    return () => {
      window.removeEventListener("mousemove", handleActivity);
      window.removeEventListener("keydown", handleActivity);
      window.removeEventListener("click", handleActivity);
      clearInterval(interval);
    };
  }, [user, lastActivity]);

  // 👑 Hardcoded admin account
  const adminAccount = {
    email: "admin@gmail.com",
    password: "admin123", // demo only
  };

  const login = async (email: string, password: string) => {
    await new Promise(resolve => setTimeout(resolve, 500)); // simulate API

    // Check if admin
    if (email === adminAccount.email && password === adminAccount.password) {
      setUser({
        id: "0",
        email,
        fullName: "Admin",
        restaurantName: "Admin Restaurant",
        plan: "Enterprise",
        role: "admin",
      });
      return;
    }

    // Normal user login
    setUser({
      id: "1",
      email,
      fullName: "John Doe",
      restaurantName: "The Golden Spoon",
      plan: "Pro",
      role: "user",
    });
  };

  const signup = async (data: SignUpData) => {
    await new Promise(resolve => setTimeout(resolve, 500));

    setUser({
      id: "1",
      email: data.email,
      fullName: data.fullName,
      restaurantName: data.restaurantName,
      plan: (data.plan as "Basic" | "Pro" | "Enterprise") || "Basic",
      role: "user",
    });
  };

  const logout = () => setUser(null);

  return (
    <AuthContext.Provider value={{ user, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
}
