"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  X,
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
  Bell,
  KeyRound,
  ShieldCheck,
  Flame,
  ArrowRight,
  Compass,
} from "lucide-react";
import { useAdminStore } from "@/stores/useAdminStore";
import { cn } from "@/lib/utils";

export interface NavSearchItem {
  label: string;
  href: string;
  icon: React.ElementType;
  badge?: string;
  description: string;
  keywords: string[];
  permission?: string;
  anyPermissions?: string[];
}

export const ADMIN_NAV_SEARCH_ITEMS: NavSearchItem[] = [
  {
    label: "Dashboard",
    href: "/",
    icon: LayoutDashboard,
    description: "Marketplace command center, live analytics & GMV KPIs",
    keywords: ["dashboard", "home", "analytics", "command center", "overview", "gmv", "kpi"],
  },
  {
    label: "Categories",
    href: "/categories",
    icon: Layers,
    badge: "Admin",
    permission: "category:read",
    description: "Catalog taxonomy, category hierarchy & commission rates",
    keywords: ["categories", "category", "add category", "manage categories", "taxonomy", "commission"],
  },
  {
    label: "Products",
    href: "/products",
    icon: Package,
    permission: "product:read",
    description: "Catalog management, product inventory & vendor items",
    keywords: ["products", "product", "catalog", "items", "inventory", "moderation", "listings"],
  },
  {
    label: "Flash Deals",
    href: "/deals",
    icon: Flame,
    badge: "Deals",
    permission: "product:read",
    description: "Time-limited promotional campaigns & flash sale events",
    keywords: ["flash deals", "deals", "promotions", "discounts", "sales", "campaigns"],
  },
  {
    label: "Vendors",
    href: "/vendors",
    icon: Store,
    permission: "vendor-approval:read",
    description: "Seller approvals, store verification & vendor management",
    keywords: ["vendors", "vendor", "vendor approvals", "approvals", "sellers", "stores", "merchants", "onboarding"],
  },
  {
    label: "Orders",
    href: "/orders",
    icon: ShoppingCart,
    permission: "order:read",
    description: "Platform marketplace customer orders & fulfillment",
    keywords: ["orders", "order", "sales", "transactions", "purchases", "shipping", "deliveries"],
  },
  {
    label: "Payouts & Finance",
    href: "/payouts",
    icon: DollarSign,
    permission: "payout:read",
    description: "Vendor settlements, escrow balances & payout requests",
    keywords: ["payouts", "payout", "finance", "settlements", "withdrawals", "escrow", "balances", "money"],
  },
  {
    label: "Coupons & Promos",
    href: "/coupons",
    icon: Tag,
    permission: "coupon:read",
    description: "Discount vouchers, promotional codes & campaign rules",
    keywords: ["coupons", "coupon", "promos", "promotions", "discounts", "vouchers", "codes"],
  },
  {
    label: "Users Directory",
    href: "/users",
    icon: Users,
    permission: "user:read",
    description: "Customer accounts, platform users & directory profiles",
    keywords: ["users", "user", "customers", "accounts", "directory", "profiles", "members"],
  },
  {
    label: "Roles & Permissions",
    href: "/roles",
    icon: KeyRound,
    permission: "admin-management:read",
    description: "Role-based access control (RBAC) & permission matrix",
    keywords: ["roles", "role", "permissions", "rbac", "security", "access control", "staff"],
  },
  {
    label: "Fraud & Audit",
    href: "/fraud",
    icon: ShieldAlert,
    anyPermissions: ["user:read", "admin-management:read"],
    description: "Risk detection, audit trails & security fraud logs",
    keywords: ["fraud", "audit", "security", "risk", "logs", "audit log", "alerts", "suspicious"],
  },
  {
    label: "Notifications",
    href: "/notifications",
    icon: Bell,
    permission: "notification:read",
    description: "System announcements, alerts & platform activity",
    keywords: ["notifications", "notification", "alerts", "inbox", "announcements", "messages"],
  },
  {
    label: "Platform Settings",
    href: "/settings",
    icon: Settings,
    permission: "global-setting:read",
    description: "Global system parameters, commissions & preferences",
    keywords: ["settings", "platform settings", "configuration", "preferences", "config", "system"],
  },
  {
    label: "Admin Profile",
    href: "/profile",
    icon: ShieldCheck,
    description: "Administrator profile details & personal security",
    keywords: ["profile", "account", "my profile", "admin profile", "password", "security"],
  },
];

interface AdminMenuSearchProps {
  className?: string;
  placeholder?: string;
}

export const AdminMenuSearch: React.FC<AdminMenuSearchProps> = ({
  className,
  placeholder = "Search categories, vendors, products, transactions...",
}) => {
  const router = useRouter();
  const { hasPermission, hasAnyPermission, isSuperAdmin } = useAdminStore();

  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Filter routes based on active user's permissions
  const accessibleItems = useMemo(() => {
    return ADMIN_NAV_SEARCH_ITEMS.filter((item) => {
      if (isSuperAdmin) return true;
      if (!item.permission && !item.anyPermissions) return true;
      if (item.permission && hasPermission(item.permission)) return true;
      if (item.anyPermissions && hasAnyPermission(item.anyPermissions)) return true;
      return false;
    });
  }, [hasPermission, hasAnyPermission, isSuperAdmin]);

  // Match accessible items against search query
  const filteredSuggestions = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) {
      // When empty and opened, show top common navigation items
      return accessibleItems.slice(0, 5);
    }

    return accessibleItems.filter((item) => {
      const matchLabel = item.label.toLowerCase().includes(q);
      const matchHref = item.href.toLowerCase().includes(q);
      const matchDesc = item.description.toLowerCase().includes(q);
      const matchKeywords = item.keywords.some((kw) => kw.toLowerCase().includes(q));
      return matchLabel || matchHref || matchDesc || matchKeywords;
    });
  }, [query, accessibleItems]);

  // Reset selected index when filtered list changes
  useEffect(() => {
    setSelectedIndex(0);
  }, [filteredSuggestions]);

  // Handle clicking outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (item: NavSearchItem) => {
    setIsOpen(false);
    setQuery("");
    inputRef.current?.blur();
    router.push(item.href);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen && (e.key === "ArrowDown" || e.key === "Enter")) {
      setIsOpen(true);
      return;
    }

    if (!isOpen || filteredSuggestions.length === 0) {
      if (e.key === "Escape") {
        setIsOpen(false);
        inputRef.current?.blur();
      }
      return;
    }

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % filteredSuggestions.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + filteredSuggestions.length) % filteredSuggestions.length);
    } else if (e.key === "Enter") {
      e.preventDefault();
      const target = filteredSuggestions[selectedIndex];
      if (target) {
        handleSelect(target);
      }
    } else if (e.key === "Escape") {
      e.preventDefault();
      setIsOpen(false);
      inputRef.current?.blur();
    }
  };

  const isQueryTyped = query.trim().length > 0;

  return (
    <div ref={containerRef} className={cn("relative w-full", className)}>
      <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-secondary pointer-events-none z-10" />

      <input
        ref={inputRef}
        type="text"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setIsOpen(true);
        }}
        onFocus={() => setIsOpen(true)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className="w-full pl-10 pr-9 py-2 bg-muted/70 border border-transparent rounded-xl text-xs text-primary placeholder-secondary focus:outline-none focus:bg-white focus:border-border transition-all"
        aria-label="Search portal menu items and pages"
        aria-expanded={isOpen}
        aria-autocomplete="list"
        role="combobox"
      />

      {isQueryTyped && (
        <button
          type="button"
          onClick={() => {
            setQuery("");
            setIsOpen(true);
            inputRef.current?.focus();
          }}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-secondary hover:text-primary p-0.5 rounded-md hover:bg-muted transition-colors cursor-pointer"
          title="Clear search"
          aria-label="Clear search query"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      )}

      {/* Search Suggestions Dropdown */}
      {isOpen && (
        <div className="absolute left-0 right-0 top-full mt-2 bg-white rounded-2xl border border-border shadow-xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-1 duration-150">
          <div className="px-3.5 py-2 border-b border-border/60 bg-muted/30 flex items-center justify-between text-[11px] font-bold text-secondary uppercase tracking-wider">
            <span>{isQueryTyped ? "Matching Menu Items & Routes" : "Quick Menu Navigation"}</span>
            <span className="text-[10px] font-semibold text-secondary/80 lowercase">
              {filteredSuggestions.length} {filteredSuggestions.length === 1 ? "page" : "pages"}
            </span>
          </div>

          <div className="max-h-72 overflow-y-auto p-1.5 space-y-0.5" role="listbox">
            {filteredSuggestions.length > 0 ? (
              filteredSuggestions.map((item, index) => {
                const Icon = item.icon;
                const isSelected = index === selectedIndex;

                return (
                  <button
                    key={item.href + item.label}
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      handleSelect(item);
                    }}
                    onMouseEnter={() => setSelectedIndex(index)}
                    className={cn(
                      "w-full flex items-center gap-3 px-3 py-2 rounded-xl text-left transition-all cursor-pointer group",
                      isSelected
                        ? "bg-primary text-white shadow-xs"
                        : "text-primary hover:bg-muted/70"
                    )}
                  >
                    <div
                      className={cn(
                        "w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors",
                        isSelected
                          ? "bg-white/20 text-white"
                          : "bg-muted text-secondary group-hover:text-primary group-hover:bg-muted/80"
                      )}
                    >
                      <Icon className="w-4 h-4" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className={cn("text-xs font-bold truncate", isSelected ? "text-white" : "text-primary")}>
                          {item.label}
                        </span>
                        {item.badge && (
                          <span
                            className={cn(
                              "text-[9px] font-extrabold px-1.5 py-0.2 rounded-full uppercase",
                              isSelected
                                ? "bg-white/20 text-white"
                                : "bg-highlight/10 text-highlight"
                            )}
                          >
                            {item.badge}
                          </span>
                        )}
                        <span
                          className={cn(
                            "text-[10px] font-mono ml-auto shrink-0",
                            isSelected ? "text-white/70" : "text-secondary/70"
                          )}
                        >
                          {item.href}
                        </span>
                      </div>
                      <p
                        className={cn(
                          "text-[10px] truncate mt-0.5",
                          isSelected ? "text-white/80" : "text-secondary"
                        )}
                      >
                        {item.description}
                      </p>
                    </div>

                    <ArrowRight
                      className={cn(
                        "w-3.5 h-3.5 shrink-0 transition-transform group-hover:translate-x-0.5",
                        isSelected ? "text-white" : "text-secondary/60 group-hover:text-primary"
                      )}
                    />
                  </button>
                );
              })
            ) : (
              <div className="py-6 px-4 text-center space-y-1.5">
                <Compass className="w-6 h-6 mx-auto text-secondary/40" />
                <p className="text-xs font-semibold text-primary">
                  No menu items found for &ldquo;{query}&rdquo;
                </p>
                <p className="text-[10px] text-secondary">
                  Try searching for categories, vendors, products, orders, payouts, settings...
                </p>
              </div>
            )}
          </div>

          <div className="px-3 py-1.5 bg-muted/40 border-t border-border/50 flex items-center justify-between text-[10px] text-secondary">
            <span>Use ↑ ↓ to navigate</span>
            <span>Press Enter ↵ to open</span>
            <span>Esc to close</span>
          </div>
        </div>
      )}
    </div>
  );
};
