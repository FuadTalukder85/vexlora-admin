"use client";

import React, { useState } from "react";
import { UserCheck, UserX, Edit, Search } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { PaginateTable, ColumnDef } from "@/components/ui/PaginateTable";
import { TableActions, TableActionButton } from "@/components/ui/TableActions";
import { formatDate } from "@/lib/utils";
import { User } from "@/types/auth";
import { UsersSkeleton } from "./UsersSkeleton";
import { toast } from "sonner";

const mockUsers: User[] = [
  {
    id: "u-1",
    name: "Alexander Vance",
    email: "admin@vexlora.com",
    role: "SUPER_ADMIN",
    status: "ACTIVE",
    createdAt: "2025-12-01T00:00:00Z",
  },
  {
    id: "u-2",
    name: "Marcus Aurelius",
    email: "marcus@apexgaming.io",
    role: "VENDOR",
    status: "ACTIVE",
    createdAt: "2026-01-10T00:00:00Z",
  },
  {
    id: "u-3",
    name: "Clara Oswald",
    email: "clara.o@example.com",
    role: "CUSTOMER",
    status: "ACTIVE",
    createdAt: "2026-03-15T00:00:00Z",
  },
  {
    id: "u-4",
    name: "Suspicious User",
    email: "bot992@tempmail.org",
    role: "CUSTOMER",
    status: "BLOCKED",
    createdAt: "2026-08-20T00:00:00Z",
  },
];

export const UserTable: React.FC = () => {
  const [users, setUsers] = useState<User[]>(mockUsers);
  const [activeTab, setActiveTab] = useState<string>("ALL");
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading] = useState(false);

  const handleToggleBlock = (user: User) => {
    const newStatus = user.status === "BLOCKED" ? "ACTIVE" : "BLOCKED";
    setUsers((prev) =>
      prev.map((u) => (u.id === user.id ? { ...u, status: newStatus } : u))
    );
    toast.success(`User ${user.email} is now ${newStatus}`);
  };

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTab =
      activeTab === "ALL" ||
      u.role === activeTab ||
      (activeTab === "BLOCKED" && u.status === "BLOCKED");
    return matchesSearch && matchesTab;
  });

  const columns: ColumnDef<User>[] = [
    {
      header: "SL",
      cell: (_, idx) => (
        <span className="font-semibold text-slate-500 text-xs">{idx + 1}</span>
      ),
    },
    {
      header: "User Details",
      cell: (u) => (
        <div>
          <p className="font-bold text-primary">{u.name}</p>
          <p className="text-[11px] text-secondary">{u.email}</p>
        </div>
      ),
    },
    {
      header: "Role",
      cell: (u) => (
        <Badge
          variant={
            u.role === "SUPER_ADMIN" || u.role === "ADMIN"
              ? "primary"
              : u.role === "VENDOR"
              ? "warning"
              : "neutral"
          }
        >
          {u.role}
        </Badge>
      ),
    },
    {
      header: "Status",
      cell: (u) =>
        u.status === "ACTIVE" ? (
          <Badge variant="success">Active</Badge>
        ) : (
          <Badge variant="danger">Blocked</Badge>
        ),
    },
    {
      header: "Registered",
      cell: (u) => <span className="text-primary">{formatDate(u.createdAt || "")}</span>,
    },
    {
      header: "Actions",
      align: "right",
      cell: (u) => (
        <TableActions>
          <TableActionButton onClick={() => toast.info(`Editing permissions for ${u.name}`)} title="Edit Role">
            <Edit className="w-4 h-4" />
          </TableActionButton>
          {u.status === "BLOCKED" ? (
            <TableActionButton
              hoverVariant="emerald"
              onClick={() => handleToggleBlock(u)}
              title="Unblock User"
            >
              <UserCheck className="w-4 h-4 text-emerald-600" />
            </TableActionButton>
          ) : (
            <TableActionButton
              hoverVariant="danger"
              onClick={() => handleToggleBlock(u)}
              title="Block User"
            >
              <UserX className="w-4 h-4 text-rose-600" />
            </TableActionButton>
          )}
        </TableActions>
      ),
    },
  ];

  if (isLoading) {
    return <UsersSkeleton />;
  }

  return (
    <div className="flex-1 flex flex-col min-h-0 w-full space-y-4">
      <PaginateTable
        data={filteredUsers}
        columns={columns}
        keyExtractor={(u) => u.id}
        defaultPageSize={20}
        className="flex-1 min-h-0"
        headerContent={
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            {/* Status Tabs */}
            <div className="border-b border-slate-200/80 pb-2 flex items-center gap-6 overflow-x-auto">
              {["ALL", "ADMIN", "VENDOR", "CUSTOMER", "BLOCKED"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`text-xs font-bold transition-all border-b-2 pb-1.5 whitespace-nowrap cursor-pointer ${
                    activeTab === tab
                      ? "border-primary text-primary"
                      : "border-transparent text-slate-500 hover:text-slate-800"
                  }`}
                >
                  {tab === "ALL" ? "All Users" : tab.charAt(0) + tab.slice(1).toLowerCase()}
                </button>
              ))}
            </div>

            {/* Search Input */}
            <div className="relative w-full max-w-md">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search user name or email..."
                className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-primary transition-all"
              />
            </div>
          </div>
        }
      />
    </div>
  );
};
