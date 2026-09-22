"use client";

import React from "react";
import { LogOut, Key } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { User } from "@/types/auth";
import { useAdminStore } from "@/stores/useAdminStore";

interface AdminDangerZoneTabProps {
  user: User;
}

export const AdminDangerZoneTab: React.FC<AdminDangerZoneTabProps> = ({ user }) => {
  const { logout } = useAdminStore();

  return (
    <div className="space-y-6">
      <Card
        title="Account Identity Keys"
        subtitle="System user reference identifiers locked to administrative schema"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input label="Admin User ID" value={user.id} disabled />
          <Input label="Admin Email" value={user.email} disabled />
        </div>
      </Card>

      <Card
        title="Session Termination"
        subtitle="Safely terminate your current authenticated administrative session"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold text-primary">Sign Out of Admin Portal</p>
            <p className="text-[11px] text-secondary mt-0.5">
              Terminates your cookie session and clears local administrative tokens.
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            size="md"
            onClick={() => {
              logout();
              window.location.href = "/login";
            }}
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </Button>
        </div>
      </Card>
    </div>
  );
};
