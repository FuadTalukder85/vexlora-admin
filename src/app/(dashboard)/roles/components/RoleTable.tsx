"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Shield, KeyRound, Trash2, Edit2, Search, Users } from "lucide-react";
import { AppRole } from "@/types/rbac";
import { Badge } from "@/components/ui/Badge";
import { PaginateTable, ColumnDef } from "@/components/ui/PaginateTable";
import { TableActions, TableActionButton } from "@/components/ui/TableActions";
import { ConfirmationModal } from "@/components/ui/ConfirmationModal";
import { formatDate } from "@/lib/utils";
import { RolesSkeleton } from "./RolesSkeleton";

interface RoleTableProps {
  roles: AppRole[];
  isLoading: boolean;
  canManage: boolean;
  onDeleteRole: (roleId: string) => Promise<void>;
}

export const RoleTable: React.FC<RoleTableProps> = ({
  roles,
  isLoading,
  canManage,
  onDeleteRole,
}) => {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [deletingRoleId, setDeletingRoleId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleConfirmDelete = async () => {
    if (!deletingRoleId) return;
    try {
      setIsDeleting(true);
      await onDeleteRole(deletingRoleId);
      setDeletingRoleId(null);
    } catch {
      // Error handled by hook
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredRoles = roles.filter(
    (r) =>
      r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.slug.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (r.description && r.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const columns: ColumnDef<AppRole>[] = [
    {
      header: "SL",
      cell: (_, idx) => (
        <span className="font-semibold text-secondary text-xs">{idx + 1}</span>
      ),
    },
    {
      header: "Role Details",
      cell: (role) => (
        <div>
          <div className="flex items-center gap-2">
            <p className="font-bold text-primary">{role.name}</p>
            {role.isSystemRole && (
              <Badge variant="primary" className="text-[9px] px-1.5 py-0">
                System
              </Badge>
            )}
          </div>
          <p className="text-[11px] font-mono text-secondary">{role.slug}</p>
          {role.description && (
            <p className="text-[11px] text-secondary line-clamp-1 max-w-sm mt-0.5">
              {role.description}
            </p>
          )}
        </div>
      ),
    },
    {
      header: "Scope",
      cell: (role) => (
        <Badge variant="neutral" className="text-[10px]">
          {role.scope}
        </Badge>
      ),
    },
    {
      header: "Permissions",
      cell: (role) => {
        const count = role.rolePermissions?.length || 0;
        return (
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5">
              <KeyRound className="w-3.5 h-3.5 text-primary" />
              <span className="text-xs font-bold text-primary">{count}</span>
            </div>
            <span className="text-[11px] text-secondary">permissions</span>
          </div>
        );
      },
    },
    {
      header: "Assigned Users",
      cell: (role) => {
        const count = role._count?.userRoles || 0;
        return (
          <div className="flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5 text-secondary" />
            <span className="text-xs font-semibold text-primary">{count} users</span>
          </div>
        );
      },
    },
    {
      header: "Created",
      cell: (role) => (
        <span className="text-xs text-secondary">{formatDate(role.createdAt || "")}</span>
      ),
    },
    {
      header: "Actions",
      align: "right",
      cell: (role) => (
        <TableActions>
          <TableActionButton
            onClick={() => router.push(`/roles/${role.id}`)}
            title="Manage Role & Permissions"
          >
            <Edit2 className="w-4 h-4 text-primary" />
          </TableActionButton>

          {canManage && !role.isSystemRole && (
            <TableActionButton
              hoverVariant="danger"
              onClick={() => setDeletingRoleId(role.id)}
              title="Delete Role"
            >
              <Trash2 className="w-4 h-4 text-highlight" />
            </TableActionButton>
          )}
        </TableActions>
      ),
    },
  ];

  if (isLoading && roles.length === 0) {
    return <RolesSkeleton />;
  }

  return (
    <div className="flex-1 flex flex-col min-h-0 w-full space-y-4">
      <PaginateTable
        data={filteredRoles}
        columns={columns}
        keyExtractor={(r) => r.id}
        defaultPageSize={15}
        className="flex-1 min-h-0"
        headerContent={
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="relative w-full max-w-md">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-secondary" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search roles by name, slug, or description..."
                className="w-full pl-10 pr-4 py-2 bg-muted/40 border border-border rounded-xl text-xs text-primary focus:outline-none focus:border-primary transition-all"
              />
            </div>
          </div>
        }
      />

      {/* Delete Role Confirmation Modal */}
      <ConfirmationModal
        isOpen={!!deletingRoleId}
        onClose={() => setDeletingRoleId(null)}
        onConfirm={handleConfirmDelete}
        title="Delete Role"
        description="Are you sure you want to delete this role? Any platform administrator assigned to this role will lose its delegated permissions."
        confirmText="Delete Role"
        variant="danger"
        isLoading={isDeleting}
      />
    </div>
  );
};
