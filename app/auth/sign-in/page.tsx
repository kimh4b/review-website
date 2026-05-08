"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { LoginPage } from "@/components/auth/LoginPage";

export default function SignInPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    if (!loading) {
      if (user) router.push("/dashboard");
      else setChecking(false);
    }
  }, [user, loading]);

  if (loading || checking) return null;

  return (
    <LoginPage
      onSignUpClick={() => router.push("/auth/sign-up")}
      onBack={() => router.push("/")}
    />
  );
}