"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Shield, CheckCircle2, RefreshCw } from "lucide-react";
import { AdminPermissionGuard } from "@/components/auth/AdminPermissionGuard";
import { useAdminRbac } from "@/hooks/useAdminRbac";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { DualPanePermissionMatrix } from "../components/DualPanePermissionMatrix";
import { ModuleScope } from "@/types/rbac";

export default function CreateRolePage() {
  const router = useRouter();
  const { permissions, createRole, isSaving } = useAdminRbac();

  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [scope, setScope] = useState<ModuleScope>("ADMIN");
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const [formError, setFormError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setFormError("Role name is required");
      return;
    }

    try {
      const generatedSlug =
        slug.trim() ||
        name
          .toLowerCase()
          .trim()
          .replace(/[^\w\s-]/g, "")
          .replace(/[\s_-]+/g, "-");

      await createRole({
        name: name.trim(),
        slug: generatedSlug,
        description: description.trim() || undefined,
        scope,
        permissions: selectedPermissions,
      });

      router.push("/roles");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to create role";
      setFormError(msg);
    }
  };

  return (
    <AdminPermissionGuard requiredPermission="admin-management:create">
      <div className="space-y-6 w-full">
        {/* Navigation & Header */}
        <div className="flex items-center justify-between">
          <Link href="/roles">
            <Button variant="outline" size="sm" className="gap-2 cursor-pointer">
              <ArrowLeft className="w-4 h-4" />
              Back to Roles
            </Button>
          </Link>
        </div>

        <div className="flex items-center gap-3 border-b border-border pb-4">
          <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-primary">Create New Role</h1>
            <p className="text-xs text-secondary">
              Define administrative role credentials and assign granular system permissions.
            </p>
          </div>
        </div>

        {formError && (
          <div className="p-4 bg-highlight/10 border border-highlight/20 text-highlight text-xs rounded-xl">
            {formError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6 w-full">
          {/* Basic Info Section */}
          <div className="bg-white p-5 rounded-2xl border border-border space-y-4 shadow-xs w-full">
            <h2 className="text-xs font-bold text-primary uppercase tracking-wider">
              Role Details
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input
                label="Role Name"
                placeholder="e.g. Catalog Maintainer"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />

              <Input
                label="Role Slug"
                placeholder="e.g. catalog-maintainer"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
              />

              <div>
                <label className="block text-xs font-semibold text-primary mb-1">
                  Scope
                </label>
                <select
                  value={scope}
                  onChange={(e) => setScope(e.target.value as ModuleScope)}
                  className="w-full px-3 py-2 text-xs bg-muted/40 border border-border rounded-xl focus:outline-none focus:border-primary"
                >
                  <option value="ADMIN">ADMIN</option>
                  <option value="VENDOR">VENDOR</option>
                  <option value="BOTH">BOTH</option>
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
                placeholder="Describe role responsibilities and authority level..."
                rows={2}
                className="w-full px-3 py-2 text-xs bg-muted/40 border border-border rounded-xl focus:outline-none focus:border-primary"
              />
            </div>
          </div>

          {/* Two-Side Permissions Matrix Section */}
          <div className="bg-white p-5 rounded-2xl border border-border space-y-3 shadow-xs w-full">
            <div>
              <h2 className="text-xs font-bold text-primary uppercase tracking-wider">
                Assign Permissions
              </h2>
              <p className="text-[11px] text-secondary">
                Toggle permissions on the left to assign them to this role, or toggle on the right to remove.
              </p>
            </div>

            <DualPanePermissionMatrix
              permissions={permissions}
              selectedPermissions={selectedPermissions}
              onChange={setSelectedPermissions}
            />
          </div>

          {/* Save & Cancel Toolbar */}
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
              Create & Save Role
            </Button>
          </div>
        </form>
      </div>
    </AdminPermissionGuard>
  );
}
