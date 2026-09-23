"use client";

import React, { useState, useEffect, useCallback, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Shield, CheckCircle2, RefreshCw } from "lucide-react";
import { AdminPermissionGuard } from "@/components/auth/AdminPermissionGuard";
import { useAdminRbac } from "@/hooks/useAdminRbac";
import { useAdminStore } from "@/stores/useAdminStore";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { DualPanePermissionMatrix } from "../components/DualPanePermissionMatrix";
import { RoleFormSkeleton } from "../components/RoleFormSkeleton";
import { AppRole, ModuleScope } from "@/types/rbac";

export default function EditRolePage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const roleId = resolvedParams.id;
  const router = useRouter();

  const { permissions, getRoleById, updateRole, isSaving } = useAdminRbac();
  const { isSuperAdmin, hasPermission } = useAdminStore();
  const canManage = isSuperAdmin || hasPermission("admin-management:update");

  const [role, setRole] = useState<AppRole | null>(null);
  const [isLoadingRole, setIsLoadingRole] = useState(true);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [scope, setScope] = useState<ModuleScope>("ADMIN");
  const [isActive, setIsActive] = useState(true);
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadRole() {
      setIsLoadingRole(true);
      try {
        const data = await getRoleById(roleId);
        if (data && isMounted) {
          setRole(data);
          setName(data.name);
          setDescription(data.description || "");
          setScope(data.scope);
          setIsActive(data.isActive);
          const activeKeys = data.rolePermissions?.map((rp) => rp.permission.key) || [];
          setSelectedPermissions(activeKeys);
        }
      } finally {
        if (isMounted) {
          setIsLoadingRole(false);
        }
      }
    }

    loadRole();

    return () => {
      isMounted = false;
    };
  }, [roleId, getRoleById]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setFormError("Role name is required");
      return;
    }

    try {
      await updateRole(roleId, {
        name: name.trim(),
        description: description.trim() || undefined,
        scope,
        isActive,
        permissions: selectedPermissions,
      });

      router.push("/roles");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to update role";
      setFormError(msg);
    }
  };

  if (isLoadingRole) {
    return (
      <AdminPermissionGuard requiredPermission="admin-management:read">
        <RoleFormSkeleton />
      </AdminPermissionGuard>
    );
  }

  if (!role) {
    return (
      <div className="p-12 bg-white rounded-2xl border border-border text-center space-y-4 max-w-md mx-auto mt-10">
        <Shield className="w-12 h-12 text-highlight mx-auto" />
        <h2 className="text-lg font-bold text-primary">Role Not Found</h2>
        <p className="text-xs text-secondary">
          The requested administrative role does not exist or has been removed.
        </p>
        <Link href="/roles">
          <Button variant="outline" size="sm" className="gap-2">
            <ArrowLeft className="w-4 h-4" /> Back to Roles
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <AdminPermissionGuard requiredPermission="admin-management:read">
      <div className="space-y-6 w-full">
        {/* Navigation Bar */}
        <div className="flex items-center justify-between">
          <Link href="/roles">
            <Button variant="outline" size="sm" className="gap-2 cursor-pointer">
              <ArrowLeft className="w-4 h-4" />
              Back to Roles
            </Button>
          </Link>
        </div>

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-primary">{role.name}</h1>
                {role.isSystemRole && (
                  <Badge variant="primary" className="text-[9px] px-1.5 py-0">
                    System Role
                  </Badge>
                )}
              </div>
              <p className="text-xs font-mono text-secondary mt-0.5">{role.slug}</p>
            </div>
          </div>

          <Badge variant="neutral" className="text-xs font-semibold">
            {role._count?.userRoles || 0} Users Assigned
          </Badge>
        </div>

        {formError && (
          <div className="p-4 bg-highlight/10 border border-highlight/20 text-highlight text-xs rounded-xl">
            {formError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6 w-full">
          {/* Role Details */}
          <div className="bg-white p-5 rounded-2xl border border-border space-y-4 shadow-xs w-full">
            <h2 className="text-xs font-bold text-primary uppercase tracking-wider">
              Role Details
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input
                label="Role Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={!canManage || role.isSystemRole}
                required
              />

              <div>
                <label className="block text-xs font-semibold text-primary mb-1">
                  Scope
                </label>
                <select
                  value={scope}
                  onChange={(e) => setScope(e.target.value as ModuleScope)}
                  disabled={!canManage || role.isSystemRole}
                  className="w-full px-3 py-2 text-xs bg-muted/40 border border-border rounded-xl focus:outline-none focus:border-primary"
                >
                  <option value="ADMIN">ADMIN</option>
                  <option value="VENDOR">VENDOR</option>
                  <option value="BOTH">BOTH</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-primary mb-1">
                  Status
                </label>
                <select
                  value={isActive ? "ACTIVE" : "INACTIVE"}
                  onChange={(e) => setIsActive(e.target.value === "ACTIVE")}
                  disabled={!canManage}
                  className="w-full px-3 py-2 text-xs bg-muted/40 border border-border rounded-xl focus:outline-none focus:border-primary"
                >
                  <option value="ACTIVE">Active</option>
                  <option value="INACTIVE">Inactive</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-primary mb-1">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={!canManage}
                placeholder="Describe role responsibilities..."
                rows={2}
                className="w-full px-3 py-2 text-xs bg-muted/40 border border-border rounded-xl focus:outline-none focus:border-primary"
              />
            </div>
          </div>

          {/* Manage Permissions - Two-Side / Transfer List Table */}
          <div className="bg-white p-5 rounded-2xl border border-border space-y-3 shadow-xs w-full">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xs font-bold text-primary uppercase tracking-wider">
                  Manage Permissions
                </h2>
                <p className="text-[11px] text-secondary">
                  Toggle permissions on the left to assign them, or toggle on the right to remove.
                </p>
              </div>
            </div>

            <DualPanePermissionMatrix
              permissions={permissions}
              selectedPermissions={selectedPermissions}
              onChange={setSelectedPermissions}
              readOnly={!canManage}
            />
          </div>

          {/* Save Toolbar */}
          {canManage && (
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
              <Link href="/roles">
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </Link>
              <Button type="submit" disabled={isSaving} className="gap-2 cursor-pointer">
                {isSaving ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <CheckCircle2 className="w-4 h-4" />
                )}
                Save Permissions
              </Button>
            </div>
          )}
        </form>
      </div>
    </AdminPermissionGuard>
  );
}
