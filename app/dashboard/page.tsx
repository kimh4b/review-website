"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { AdminDashboardLayout } from "@/components/admin/AdminDashboardLayout";

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) router.push("/auth/sign-in");
  }, [user, loading]);

  if (loading) return (
    <div className="h-screen flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!user) return null;

  if (user.role === "admin") return <AdminDashboardLayout />;

  return <DashboardLayout />;
}