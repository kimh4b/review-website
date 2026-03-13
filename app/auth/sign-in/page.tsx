"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { LoginPage } from "@/components/auth/LoginPage";

export default function SignInPage() {
  const { user } = useAuth();
  const router = useRouter();

  // If already logged in, go straight to dashboard
  useEffect(() => {
    if (user) router.push("/dashboard");
  }, [user]);

  return (
    <LoginPage
      onSignUpClick={() => router.push("/auth/sign-up")}
      onBack={() => router.push("/")}
    />
  )
}