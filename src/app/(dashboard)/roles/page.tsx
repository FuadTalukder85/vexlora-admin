"use client";

import React from "react";
import Link from "next/link";
import { Plus, RefreshCw } from "lucide-react";
import { AdminPermissionGuard } from "@/components/auth/AdminPermissionGuard";
import { useAdminRbac } from "@/hooks/useAdminRbac";
import { useAdminStore } from "@/stores/useAdminStore";
import { Button } from "@/components/ui/Button";
import { RoleStats } from "./components/RoleStats";
import { RoleTable } from "./components/RoleTable";

export default function RolesPage() {
  const {
    roles,
    permissions,
    isLoading,
    isSaving,
    error,
    seedPermissions,
    deleteRole,
  } = useAdminRbac();

  const { isSuperAdmin, hasPermission } = useAdminStore();
  const canManage = isSuperAdmin || hasPermission("admin-management:create");

  const categories = Array.from(new Set(permissions.map((p) => p.category)));

  return (
    <AdminPermissionGuard requiredPermission="admin-management:read">
      <div className="flex-1 flex flex-col min-h-0 h-[calc(100vh-5.5rem)] space-y-4">
        {/* Header section */}
        <div className="shrink-0 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-primary tracking-tight">
              Roles & Permissions
            </h1>
            <p className="text-sm text-secondary">
              Manage platform administrative roles and granular capability delegation.
            </p>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <Button
              variant="outline"
              onClick={() => seedPermissions()}
              disabled={isSaving}
              className="gap-2 cursor-pointer"
            >
              <RefreshCw className={`w-4 h-4 ${isSaving ? "animate-spin" : ""}`} />
              Sync System Permissions
            </Button>

            {canManage && (
              <Link href="/roles/create">
                <Button className="gap-2 cursor-pointer">
                  <Plus className="w-4 h-4" />
                  Create Role
                </Button>
              </Link>
            )}
          </div>
        </div>

        {error && (
          <div className="shrink-0 p-4 rounded-xl bg-highlight/10 border border-highlight/20 text-highlight text-sm">
            {error}
          </div>
        )}

        {/* Roles Stats */}
        <div className="shrink-0">
          <RoleStats
            totalRoles={roles.length}
            totalPermissions={permissions.length}
            totalCategories={categories.length}
          />
        </div>

        {/* Roles Table (Table Layout) */}
        <RoleTable
          roles={roles}
          isLoading={isLoading}
          canManage={canManage}
          onDeleteRole={deleteRole}
        />
      </div>
    </AdminPermissionGuard>
  );
}
