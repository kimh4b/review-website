"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { createClient } from "@/lib/supabase/client";

interface User {
  id: string;
  email: string;
  fullName: string;
  restaurantName: string;
  role: "user" | "admin";
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (data: SignUpData) => Promise<void>;
  logout: () => void;
}

interface SignUpData {
  fullName: string;
  email: string;
  password: string;
  restaurantName: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const ADMIN_EMAIL = "admin@gmail.com";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) buildUser(session.user);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) buildUser(session.user);
      else setUser(null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const buildUser = (supabaseUser: any) => {
    const meta = supabaseUser.user_metadata || {};
    setUser({
      id: supabaseUser.id,
      email: supabaseUser.email,
      fullName: meta.fullName || "User",
      restaurantName: meta.restaurantName || "My Restaurant",
      role: supabaseUser.email === ADMIN_EMAIL ? "admin" : "user",
    });
  };

  const login = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw new Error(error.message);
  };

  const signup = async (data: SignUpData) => {
    const { error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: {
          fullName: data.fullName,
          restaurantName: data.restaurantName,
        }
      }
    });
    if (error) throw new Error(error.message);
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
}