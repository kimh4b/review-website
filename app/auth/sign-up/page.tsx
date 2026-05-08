"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { SignUpPage } from "@/components/auth/SignUpPage";

export default function SignUpPageRoute() {
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
    <SignUpPage
      onLoginClick={() => router.push("/auth/sign-in")}
      onBack={() => router.push("/")}
    />
  );
}