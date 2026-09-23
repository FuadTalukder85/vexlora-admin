"use client";

import React from "react";
import Link from "next/link";
import { ShieldAlert, ArrowLeft } from "lucide-react";
import { useAdminStore } from "@/stores/useAdminStore";
import { Button } from "@/components/ui/Button";

interface AdminPermissionGuardProps {
  requiredPermission?: string;
  requiredPermissions?: string[];
  requireAll?: boolean;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export const AdminPermissionGuard: React.FC<AdminPermissionGuardProps> = ({
  requiredPermission,
  requiredPermissions = [],
  requireAll = false,
  children,
  fallback,
}) => {
  const { hasPermission, hasAnyPermission, hasAllPermissions, isInitialChecking } = useAdminStore();

  if (isInitialChecking) {
    return null;
  }

  let isAuthorized = true;

  if (requiredPermission) {
    isAuthorized = hasPermission(requiredPermission);
  } else if (requiredPermissions.length > 0) {
    isAuthorized = requireAll
      ? hasAllPermissions(requiredPermissions)
      : hasAnyPermission(requiredPermissions);
  }

  if (isAuthorized) {
    return <>{children}</>;
  }

  if (fallback) {
    return <>{fallback}</>;
  }

  return (
    <div className="min-h-[50vh] flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white border border-border rounded-2xl p-8 text-center shadow-sm space-y-4">
        <div className="w-14 h-14 rounded-2xl bg-highlight/10 text-highlight flex items-center justify-center mx-auto">
          <ShieldAlert className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <h2 className="text-xl font-bold text-primary">Access Restricted</h2>
          <p className="text-sm text-secondary">
            Your administrator account does not possess the required permissions to view or perform actions on this section.
          </p>
          {requiredPermission && (
            <p className="text-xs font-mono bg-muted text-secondary px-2.5 py-1 rounded inline-block">
              Required: {requiredPermission}
            </p>
          )}
        </div>

        <div className="pt-2">
          <Link href="/">
            <Button variant="outline" className="gap-2 w-full">
              <ArrowLeft className="w-4 h-4" />
              Return to Dashboard
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};
