"use client";

import { useRouter } from "next/navigation";
import { SignUpPage } from "@/components/auth/SignUpPage";

export default function SignUpPageRoute() {
  const router = useRouter();

  return (
    <SignUpPage
      onLoginClick={() => router.push("/auth/sign-in")}
      onBack={() => router.back()}
    />
  );
}