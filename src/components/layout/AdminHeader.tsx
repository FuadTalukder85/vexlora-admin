"use client";

import React from "react";
import Link from "next/link";
import { Menu, Search, Bell, Plus, ShieldCheck } from "lucide-react";
import { useAdminStore } from "@/stores/useAdminStore";
import { AdminUserMenu } from "./AdminUserMenu";
import { Button } from "@/components/ui/Button";

export const AdminHeader: React.FC = () => {
  const { toggleSidebar } = useAdminStore();

  return (
    <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-border h-16 px-4 lg:px-8 flex items-center justify-between">
      {/* Left: Sidebar Toggle & Search Bar */}
      <div className="flex items-center gap-3 flex-1 max-w-xl">
        <button
          onClick={toggleSidebar}
          className="p-2 rounded-xl text-secondary hover:text-primary hover:bg-muted transition-colors focus:outline-none cursor-pointer"
          aria-label="Toggle Navigation Menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="relative w-full hidden sm:block">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-secondary" />
          <input
            type="text"
            placeholder="Search categories, vendors, products, transactions..."
            className="w-full pl-10 pr-4 py-2 bg-muted/70 border border-transparent rounded-xl text-xs text-primary placeholder-secondary focus:outline-none focus:bg-white focus:border-border transition-all"
          />
        </div>
      </div>

      {/* Right: Actions & User Dropdown */}
      <div className="flex items-center gap-3">
        <Link href="/categories">
          <Button variant="primary" size="sm" className="hidden sm:inline-flex">
            <Plus className="w-4 h-4" />
            Add Category
          </Button>
        </Link>

        {/* Notifications Icon */}
        <Link
          href="/notifications"
          className="relative p-2 rounded-xl text-secondary hover:text-primary hover:bg-muted transition-colors cursor-pointer"
          title="Notifications"
        >
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-highlight ring-2 ring-white"></span>
        </Link>

        <div className="h-6 w-[1px] bg-muted my-auto"></div>

        {/* Admin User Menu */}
        <AdminUserMenu />
      </div>
    </header>
  );
};
