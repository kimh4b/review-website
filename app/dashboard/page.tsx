"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { AdminDashboardLayout } from "@/components/admin/AdminDashboardLayout";

export default function DashboardPage() {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!user) router.push("/auth/sign-in");
  }, [user]);

  if (!user) return null;

  // Show admin or user dashboard based on role
  if (user.role === "admin") return <AdminDashboardLayout />;
  
  return <DashboardLayout />;
}