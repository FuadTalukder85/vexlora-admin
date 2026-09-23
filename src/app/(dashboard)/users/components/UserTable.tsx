"use client";

import React, { useState, useEffect, useCallback } from "react";
import { UserCheck, UserX, KeyRound, Search, Shield, Check } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { ConfirmationModal } from "@/components/ui/ConfirmationModal";
import { PaginateTable, ColumnDef } from "@/components/ui/PaginateTable";
import { TableActions, TableActionButton } from "@/components/ui/TableActions";
import { formatDate } from "@/lib/utils";
import { User } from "@/types/auth";
import { UsersSkeleton } from "./UsersSkeleton";
import { useAdminRbac } from "@/hooks/useAdminRbac";
import { apiClient } from "@/lib/api-client";
import { toast } from "sonner";

export const UserTable: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [activeTab, setActiveTab] = useState<string>("ALL");
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [statusChangingUser, setStatusChangingUser] = useState<User | null>(null);

  // Role Assignment state
  const { roles, assignRoleToUser } = useAdminRbac();
  const [roleAssigningUser, setRoleAssigningUser] = useState<User | null>(null);
  const [selectedRoleId, setSelectedRoleId] = useState<string>("");
  const [selectedBaseRole, setSelectedBaseRole] = useState<string>("ADMIN");
  const [isAssigning, setIsAssigning] = useState(false);

  const fetchUsers = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await apiClient.get("/users");
      const data = res.data?.data || res.data?.users || res.data || [];
      if (Array.isArray(data)) {
        setUsers(data);
      }
    } catch {
      // Fallback
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleToggleBlock = (user: User) => {
    setStatusChangingUser(user);
  };

  const handleConfirmToggleBlock = async () => {
    if (!statusChangingUser) return;
    const newStatus = statusChangingUser.status === "BLOCKED" ? "ACTIVE" : "BLOCKED";
    try {
      await apiClient.patch(`/users/${statusChangingUser.id}`, { status: newStatus });
      setUsers((prev) =>
        prev.map((u) => (u.id === statusChangingUser.id ? { ...u, status: newStatus } : u))
      );
      toast.success(`User ${statusChangingUser.email} is now ${newStatus}`);
    } catch {
      toast.error("Failed to update user status");
    } finally {
      setStatusChangingUser(null);
    }
  };

  const handleOpenAssignRole = (user: User) => {
    setRoleAssigningUser(user);
    const existingRoleId = user.userRoles?.[0]?.roleId || "";
    setSelectedRoleId(existingRoleId);
    setSelectedBaseRole(
      user.role === "SUPER_ADMIN"
        ? "SUPER_ADMIN"
        : user.role === "CUSTOMER"
        ? "ADMIN"
        : user.role
    );
  };

  const handleConfirmAssignRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!roleAssigningUser || !selectedRoleId) return;

    try {
      setIsAssigning(true);
      if (selectedBaseRole && selectedBaseRole !== roleAssigningUser.role && roleAssigningUser.role !== "SUPER_ADMIN") {
        await apiClient.patch(`/users/${roleAssigningUser.id}`, { role: selectedBaseRole });
      }
      await assignRoleToUser(roleAssigningUser.id, selectedRoleId);
      toast.success(`Assigned role successfully to ${roleAssigningUser.name || roleAssigningUser.email}`);
      setRoleAssigningUser(null);
      await fetchUsers();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to assign role";
      toast.error(msg);
    } finally {
      setIsAssigning(false);
    }
  };

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      (u.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (u.email || "").toLowerCase().includes(searchTerm.toLowerCase());
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
        <span className="font-semibold text-secondary text-xs">{idx + 1}</span>
      ),
    },
    {
      header: "User Details",
      cell: (u) => (
        <div>
          <p className="font-bold text-primary">{u.name || "Unnamed User"}</p>
          <p className="text-[11px] text-secondary">{u.email}</p>
        </div>
      ),
    },
    {
      header: "Platform & Custom Role",
      cell: (u) => (
        <div className="flex items-center gap-1.5 flex-wrap">
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

          {u.userRoles && u.userRoles.length > 0 && (
            <div className="flex items-center gap-1 flex-wrap">
              {u.userRoles.map((ur) => (
                <Badge
                  key={ur.id || ur.roleId}
                  variant="neutral"
                  className="text-[10px] font-bold border-primary/30 text-primary bg-primary/[0.06] px-2 py-0.5"
                >
                  {ur.role?.name || "Custom Role"}
                </Badge>
              ))}
            </div>
          )}
        </div>
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
      cell: (u) => <span className="text-primary text-xs">{formatDate(u.createdAt || "")}</span>,
    },
    {
      header: "Actions",
      align: "right",
      cell: (u) => (
        <TableActions>
          <TableActionButton
            onClick={() => handleOpenAssignRole(u)}
            title="Assign Role & Permissions"
          >
            <KeyRound className="w-4 h-4 text-primary" />
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
              <UserX className="w-4 h-4 text-highlight" />
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
            <div className="border-b border-border pb-2 flex items-center gap-6 overflow-x-auto">
              {["ALL", "ADMIN", "VENDOR", "CUSTOMER", "BLOCKED"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`text-xs font-bold transition-all border-b-2 pb-1.5 whitespace-nowrap cursor-pointer ${
                    activeTab === tab
                      ? "border-primary text-primary"
                      : "border-transparent text-secondary hover:text-primary"
                  }`}
                >
                  {tab === "ALL" ? "All Users" : tab.charAt(0) + tab.slice(1).toLowerCase()}
                </button>
              ))}
            </div>

            {/* Search Input */}
            <div className="relative w-full max-w-md">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-secondary" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search user name or email..."
                className="w-full pl-10 pr-4 py-2 bg-white border border-border rounded-xl text-xs text-primary focus:outline-none focus:border-primary transition-all"
              />
            </div>
          </div>
        }
      />

      {/* Assign Custom Role Modal */}
      <Modal
        isOpen={!!roleAssigningUser}
        onClose={() => setRoleAssigningUser(null)}
        title={`Assign Role & Permissions: ${roleAssigningUser?.name || roleAssigningUser?.email}`}
        maxWidth="md"
      >
        {roleAssigningUser && (
          <form onSubmit={handleConfirmAssignRole} className="space-y-4">
            <div className="p-3.5 bg-muted/60 border border-border rounded-xl text-xs space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-bold text-primary">{roleAssigningUser.name || "Unnamed User"}</p>
                  <p className="text-[11px] text-secondary">{roleAssigningUser.email}</p>
                </div>
                <Badge
                  variant={
                    roleAssigningUser.role === "SUPER_ADMIN" || roleAssigningUser.role === "ADMIN"
                      ? "primary"
                      : roleAssigningUser.role === "VENDOR"
                      ? "warning"
                      : "neutral"
                  }
                >
                  Current: {roleAssigningUser.role}
                </Badge>
              </div>
            </div>

            {/* Platform Base Role Option (for promoting or changing user role) */}
            {roleAssigningUser.role !== "SUPER_ADMIN" && (
              <div>
                <label className="block text-xs font-bold text-primary mb-1">
                  Platform Base Access Level
                </label>
                <select
                  value={selectedBaseRole}
                  onChange={(e) => setSelectedBaseRole(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-muted/40 border border-border rounded-xl focus:outline-none focus:border-primary"
                >
                  <option value="ADMIN">ADMIN (Platform Administrator)</option>
                  <option value="VENDOR">VENDOR (Store Merchant)</option>
                  <option value="CUSTOMER">CUSTOMER (Shopper)</option>
                </select>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-primary mb-2">
                Select Custom RBAC Role (Delegated Capabilities)
              </label>
              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {roles.map((role) => {
                  const isSelected = selectedRoleId === role.id;
                  return (
                    <div
                      key={role.id}
                      onClick={() => setSelectedRoleId(role.id)}
                      className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                        isSelected
                          ? "border-primary bg-primary/5 text-primary shadow-sm"
                          : "border-border bg-white text-secondary hover:border-border/80"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                            isSelected ? "border-primary bg-primary text-white" : "border-border"
                          }`}
                        >
                          {isSelected && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="text-xs font-bold text-primary">{role.name}</p>
                            <Badge variant="neutral" className="text-[9px] px-1.5 py-0">
                              {role.scope}
                            </Badge>
                          </div>
                          <p className="text-[10px] text-secondary mt-0.5">
                            {role.rolePermissions?.length || 0} permissions &bull; {role.slug}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-border">
              <Button
                type="button"
                variant="outline"
                onClick={() => setRoleAssigningUser(null)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isAssigning || !selectedRoleId}
                className="gap-2 cursor-pointer"
              >
                <Shield className="w-4 h-4" />
                {isAssigning ? "Saving..." : "Apply & Save Role"}
              </Button>
            </div>
          </form>
        )}
      </Modal>

      {/* User Block / Unblock Confirmation Modal */}
      <ConfirmationModal
        isOpen={!!statusChangingUser}
        onClose={() => setStatusChangingUser(null)}
        onConfirm={handleConfirmToggleBlock}
        title={
          statusChangingUser?.status === "BLOCKED"
            ? "Unblock User Account"
            : "Block User Account"
        }
        confirmText={
          statusChangingUser?.status === "BLOCKED"
            ? "Unblock User"
            : "Block User"
        }
        variant={statusChangingUser?.status === "BLOCKED" ? "primary" : "danger"}
        description={
          statusChangingUser ? (
            <div className="space-y-2">
              <p>
                Are you sure you want to{" "}
                <span className="font-bold">
                  {statusChangingUser.status === "BLOCKED" ? "unblock" : "block"}
                </span>{" "}
                user{" "}
                <span className="font-bold text-primary">{statusChangingUser.name}</span> (
                <span className="text-secondary">{statusChangingUser.email}</span>)?
              </p>
              <p className="text-[11px] text-secondary">
                {statusChangingUser.status === "BLOCKED"
                  ? "The user will regain access to their account and platform features."
                  : "Blocked users will be immediately logged out and unable to access the store or customer services."}
              </p>
            </div>
          ) : undefined
        }
      />
    </div>
  );
};

