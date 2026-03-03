"use client";

import { useEffect } from "react";
import { useAuth } from "@/lib/auth/context";
import { useRouter } from "next/navigation";
import { Spinner } from "@/components/ui/spinner";
import { ProtectedRoute } from "@/lib/auth/protected-route";

export default function DashboardPage() {
  const { user, profile, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    if (!user) {
      router.push("/auth");
      return;
    }

    // Route based on role
    if (profile) {
      switch (profile.role) {
        case "agent":
          router.push("/agent");
          break;
        case "admin":
        case "super_admin":
          router.push("/admin");
          break;
        case "sales":
          router.push("/sales");
          break;
        default:
          router.push("/auth");
      }
    }
  }, [user, profile, loading, router]);

  return (
    <ProtectedRoute>
      <div className="flex items-center justify-center min-h-screen">
        <Spinner />
      </div>
    </ProtectedRoute>
  );
}
