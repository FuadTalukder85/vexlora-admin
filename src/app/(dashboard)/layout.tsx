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
  } = useAdminStore();

  useEffect(() => {
    if (!isInitialChecking && !isAuthenticated) {
      router.push("/login");
    }
  }, [isInitialChecking, isAuthenticated, router]);

  return (
    <div className="min-h-screen bg-slate-50 flex">
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
