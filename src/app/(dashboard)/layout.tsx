"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { AdminSidebar } from "@/components/layout/AdminSidebar";
import { AdminHeader } from "@/components/layout/AdminHeader";
import { useAdminStore } from "@/stores/useAdminStore";
import { cn } from "@/lib/utils";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const {
    isSidebarOpen,
    user,
    isAuthenticated,
    isInitialChecking,
    fetchProfile,
  } = useAdminStore();

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  useEffect(() => {
    if (!isInitialChecking) {
      const isAuthorized =
        isAuthenticated &&
        user &&
        (user.role === "ADMIN" || user.role === "SUPER_ADMIN") &&
        user.status !== "BLOCKED";

      if (!isAuthorized) {
        router.replace("/login");
      }
    }
  }, [isInitialChecking, isAuthenticated, user, router]);

  // Prevent any protected route UI from rendering before auth is verified
  if (
    isInitialChecking ||
    !isAuthenticated ||
    !user ||
    (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN") ||
    user.status === "BLOCKED"
  ) {
    return null;
  }

  return (
    <div className="min-h-screen bg-muted flex">
      {/* 1. Sidebar Navigation */}
      <AdminSidebar />

      {/* 2. Main Content Container */}
      <div
        className={cn(
          "flex-1 flex flex-col min-w-0 transition-all duration-300 min-h-screen",
          isSidebarOpen ? "lg:ml-64" : "lg:ml-20"
        )}
      >
        <AdminHeader />

        <main className="flex-1 p-4 lg:p-6 space-y-6 max-w-[1800px] w-full mx-auto overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
