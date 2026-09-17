"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Layers,
  Package,
  Store,
  ShoppingCart,
  DollarSign,
  Tag,
  Users,
  ShieldAlert,
  Settings,
  ChevronRight,
  LogOut,
  ShieldCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAdminStore } from "@/stores/useAdminStore";
import { Badge } from "@/components/ui/Badge";

const navItems = [
  { label: "Dashboard", href: "/", icon: LayoutDashboard },
  { label: "Categories", href: "/categories", icon: Layers, badge: "Admin" },
  { label: "Products", href: "/products", icon: Package },
  { label: "Vendors", href: "/vendors", icon: Store },
  { label: "Orders", href: "/orders", icon: ShoppingCart },
  { label: "Payouts & Finance", href: "/payouts", icon: DollarSign },
  { label: "Coupons & Promos", href: "/coupons", icon: Tag },
  { label: "Users & RBAC", href: "/users", icon: Users },
  { label: "Fraud & Audit", href: "/fraud", icon: ShieldAlert },
  { label: "Settings", href: "/settings", icon: Settings },
];

export const AdminSidebar: React.FC = () => {
  const pathname = usePathname();
  const { user, isSidebarOpen, logout } = useAdminStore();

  return (
    <aside
      className={cn(
        "fixed top-0 left-0 bottom-0 z-40 bg-white border-r border-slate-200/80 transition-all duration-300 flex flex-col justify-between w-64",
        !isSidebarOpen && "-translate-x-full lg:translate-x-0 lg:w-20"
      )}
    >
      {/* Top Header & Brand */}
      <div>
        <div className="h-16 px-6 border-b border-slate-100 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-primary text-white flex items-center justify-center font-bold text-xl shadow-md group-hover:bg-primary/90 transition-colors">
              V<span className="text-highlight">.</span>
            </div>
            {isSidebarOpen && (
              <div className="flex flex-col">
                <span className="font-extrabold text-primary text-lg tracking-tight leading-none">
                  Vexlora
                </span>
                <span className="text-[10px] font-semibold text-secondary tracking-widest uppercase mt-0.5">
                  Admin Portal
                </span>
              </div>
            )}
          </Link>
        </div>

        {/* Admin Profile Quick Card */}
        {isSidebarOpen && (
          <div className="mx-4 my-4 p-3 rounded-xl bg-slate-50 border border-slate-200/60 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-primary truncate">
                {user?.name || "Platform Admin"}
              </p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <Badge variant="primary" className="text-[9px] px-1.5 py-0 font-bold">
                  {user?.role || "SUPER_ADMIN"}
                </Badge>
              </div>
            </div>
          </div>
        )}

        {/* Navigation Menu */}
        <nav className="px-3 py-2 space-y-1 overflow-y-auto max-h-[calc(100vh-250px)]">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all group relative",
                  isActive
                    ? "bg-primary text-white font-semibold shadow-sm"
                    : "text-primary hover:bg-slate-100 hover:text-primary"
                )}
              >
                <Icon
                  className={cn(
                    "w-5 h-5 transition-transform group-hover:scale-110 shrink-0",
                    isActive ? "text-white" : "text-secondary group-hover:text-primary"
                  )}
                />
                {isSidebarOpen && <span>{item.label}</span>}
                {isActive && isSidebarOpen && (
                  <ChevronRight className="w-4 h-4 ml-auto text-white/70" />
                )}
                {item.badge && isSidebarOpen && !isActive && (
                  <span className="ml-auto text-[9px] font-black uppercase px-1.5 py-0.5 rounded-full bg-highlight/10 text-highlight">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Bottom Actions / Sign out link */}
      <div className="p-4 border-t border-slate-100">
        <button
          onClick={() => {
            logout();
            window.location.href = "/login";
          }}
          className={cn(
            "w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-rose-600 hover:bg-rose-50 transition-all cursor-pointer",
            !isSidebarOpen && "justify-center"
          )}
        >
          <LogOut className="w-5 h-5 shrink-0" />
          {isSidebarOpen && <span>Sign Out</span>}
        </button>
      </div>
    </aside>
  );
};
