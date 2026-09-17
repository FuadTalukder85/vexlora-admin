"use client";

import React, { useState } from "react";
import Link from "next/link";
import { User, Settings, LogOut, ChevronDown, Shield, ExternalLink } from "lucide-react";
import { useAdminStore } from "@/stores/useAdminStore";

export const AdminUserMenu: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, logout } = useAdminStore();

  if (!user) {
    return (
      <div className="flex items-center gap-2.5 p-1.5">
        <div className="w-9 h-9 rounded-full bg-slate-200 animate-pulse" />
      </div>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2.5 p-1.5 rounded-xl hover:bg-slate-100 transition-colors focus:outline-none cursor-pointer"
      >
        <div className="w-9 h-9 rounded-full bg-slate-200 overflow-hidden relative border border-slate-300">
          <div className="w-full h-full flex items-center justify-center bg-primary text-white font-bold text-sm">
            {user.name ? user.name.charAt(0).toUpperCase() : "A"}
          </div>
        </div>
        <div className="hidden sm:flex flex-col text-left">
          <span className="text-xs font-bold text-primary leading-tight">{user.name}</span>
          <span className="text-[10px] text-secondary">{user.email}</span>
        </div>
        <ChevronDown className="w-4 h-4 text-secondary hidden sm:block" />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-lg border border-slate-100 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
            <div className="px-4 py-2 border-b border-slate-100">
              <p className="text-xs font-bold text-primary">{user.name}</p>
              <p className="text-[11px] text-secondary truncate font-mono">{user.role}</p>
            </div>

            <div className="py-1">
              <Link
                href="/settings"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-2.5 px-4 py-2 text-xs text-primary hover:bg-slate-50 font-medium"
              >
                <Settings className="w-4 h-4 text-secondary" />
                Platform Settings
              </Link>
              <Link
                href="/users"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-2.5 px-4 py-2 text-xs text-primary hover:bg-slate-50 font-medium"
              >
                <Shield className="w-4 h-4 text-secondary" />
                RBAC & Staff Roles
              </Link>
              <a
                href="http://localhost:3000"
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2.5 px-4 py-2 text-xs text-primary hover:bg-slate-50 font-medium"
              >
                <ExternalLink className="w-4 h-4 text-secondary" />
                View Main Marketplace
              </a>
            </div>

            <div className="pt-1 border-t border-slate-100">
              <button
                onClick={() => {
                  setIsOpen(false);
                  logout();
                  if (typeof window !== "undefined") {
                    window.location.href = "/login";
                  }
                }}
                className="w-full flex items-center gap-2.5 px-4 py-2 text-xs text-rose-600 hover:bg-rose-50 font-medium text-left cursor-pointer"
              >
                <LogOut className="w-4 h-4 text-rose-500" />
                Sign Out
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
