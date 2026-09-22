"use client";

import React, { useState } from "react";
import { Lock, Smartphone, Laptop } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { SessionInfo } from "@/hooks/useAdminSettings";
import { toast } from "sonner";

interface AdminSecurityTabProps {
  sessions: SessionInfo[];
  onChangePassword: (data: { currentPassword: string; newPassword: string; revokeOtherSessions?: boolean }) => Promise<any>;
  onRevokeSession: (id: string) => Promise<any>;
  onRevokeOtherSessions: () => Promise<any>;
}

export const AdminSecurityTab: React.FC<AdminSecurityTabProps> = ({
  sessions,
  onChangePassword,
  onRevokeSession,
  onRevokeOtherSessions,
}) => {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [revokeOtherOnPassChange, setRevokeOtherOnPassChange] = useState(true);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword) {
      toast.error("Current password is required");
      return;
    }
    if (newPassword.length < 6) {
      toast.error("New password must be at least 6 characters");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    try {
      setIsChangingPassword(true);
      await onChangePassword({
        currentPassword,
        newPassword,
        revokeOtherSessions: revokeOtherOnPassChange,
      });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      toast.success("Password changed successfully!");
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to change password. Please check your current password.");
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleRevoke = async (sessionId: string) => {
    try {
      await onRevokeSession(sessionId);
      toast.success("Session revoked successfully");
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to revoke session");
    }
  };

  const handleRevokeOthers = async () => {
    try {
      await onRevokeOtherSessions();
      toast.success("All other active sessions revoked");
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to revoke sessions");
    }
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleChangePassword} className="space-y-6">
        <Card title="Change Admin Password" subtitle="Enforce a robust password with at least 6 characters">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input
              label="Current Password *"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
            <Input
              label="New Password *"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
            <Input
              label="Confirm New Password *"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>

          <div className="flex items-center gap-2 pt-1">
            <input
              id="revokeOthersAdmin"
              type="checkbox"
              checked={revokeOtherOnPassChange}
              onChange={(e) => setRevokeOtherOnPassChange(e.target.checked)}
              className="rounded border-border text-primary focus:ring-primary h-4 w-4 cursor-pointer"
            />
            <label htmlFor="revokeOthersAdmin" className="text-xs text-primary font-medium cursor-pointer">
              Revoke all other active sessions upon password change
            </label>
          </div>

          <div className="flex justify-end pt-2">
            <Button type="submit" variant="primary" size="md" isLoading={isChangingPassword}>
              <Lock className="w-4 h-4" />
              Update Password
            </Button>
          </div>
        </Card>
      </form>

      {/* Active Sessions */}
      <Card
        title="Active Admin Sessions"
        subtitle="Devices and IPs currently authenticated with administrative rights"
        action={
          sessions.length > 1 && (
            <Button type="button" variant="outline" size="sm" onClick={handleRevokeOthers}>
              Revoke All Other Sessions
            </Button>
          )
        }
      >
        <div className="divide-y divide-border">
          {sessions.map((session) => (
            <div key={session.id} className="py-3.5 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-muted text-primary">
                  {session.userAgent?.toLowerCase().includes("mobile") ? (
                    <Smartphone className="w-5 h-5" />
                  ) : (
                    <Laptop className="w-5 h-5" />
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-primary">
                      {session.userAgent || "Unknown Browser / Device"}
                    </span>
                    {session.isCurrent && <Badge variant="success">Current Session</Badge>}
                  </div>
                  <p className="text-[11px] text-secondary mt-0.5">
                    IP: {session.ipAddress || "Unknown"} &bull; Signed in:{" "}
                    {new Date(session.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {!session.isCurrent && (
                <Button type="button" variant="danger" size="sm" onClick={() => handleRevoke(session.id)}>
                  Revoke
                </Button>
              )}
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};
