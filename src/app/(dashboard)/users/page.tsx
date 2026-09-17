import React, { Suspense } from "react";
import { UserTable } from "./components/UserTable";

export default function AdminUsersPage() {
  return (
    <div className="flex-1 flex flex-col min-h-0 h-[calc(100vh-5.5rem)] space-y-4">
      <div className="shrink-0">
        <h1 className="text-2xl font-extrabold text-primary tracking-tight">Users & Role Permissions (RBAC)</h1>
        <p className="text-xs text-secondary mt-1">
          Manage platform administrator roles, merchant accounts, customer statuses, and security clearance.
        </p>
      </div>

      <Suspense fallback={<div className="p-8 text-center text-xs text-secondary">Loading users...</div>}>
        <UserTable />
      </Suspense>
    </div>
  );
}
