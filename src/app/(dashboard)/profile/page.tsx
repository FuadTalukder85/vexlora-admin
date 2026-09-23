"use client";

import React, { useState } from "react";
import { User, ShieldCheck, AlertTriangle } from "lucide-react";
import { useAdminSettingsData } from "@/hooks/useAdminSettings";
import { ProfileSkeleton } from "./components/ProfileSkeleton";
import { AdminProfileTab } from "./components/AdminProfileTab";
import { AdminSecurityTab } from "./components/AdminSecurityTab";
import { AdminDangerZoneTab } from "./components/AdminDangerZoneTab";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/utils";

import { useAdminStore } from "@/stores/useAdminStore";

type AdminProfileTabKey = "profile" | "security" | "danger";

export default function AdminProfilePage() {
  const [activeTab, setActiveTab] = useState<AdminProfileTabKey>("profile");
  const { user: storeUser } = useAdminStore();

  const {
    user,
    sessions,
    isLoading,
    updateProfile,
    isUpdatingProfile,
    uploadAvatar,
    removeAvatar,
    changePassword,
    revokeSession,
    revokeOtherSessions,
  } = useAdminSettingsData();

  if (isLoading || !user) {
    return <ProfileSkeleton />;
  }

  const customRoleName =
    user.assignedRoles?.[0] ||
    user.userRoles?.[0]?.role?.name ||
    storeUser?.assignedRoles?.[0] ||
    storeUser?.userRoles?.[0]?.role?.name;

  const tabs: { id: AdminProfileTabKey; label: string; icon: React.ReactNode }[] = [
    { id: "profile", label: "Admin Profile", icon: <User className="w-4 h-4" /> },
    { id: "security", label: "Security & Sessions", icon: <ShieldCheck className="w-4 h-4" /> },
    { id: "danger", label: "Account / Danger Zone", icon: <AlertTriangle className="w-4 h-4" /> },
  ];

  return (
    <div className="space-y-6 w-full pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-primary tracking-tight">Admin Profile</h1>
          <p className="text-xs text-secondary mt-1">
            Manage your administrative credentials, multi-factor security, and active authenticated sessions.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {user.isSuperAdmin ? (
            <Badge variant="success" className="font-bold">SUPER ADMIN</Badge>
          ) : (
            <>
              <Badge variant="neutral" className="text-xs font-semibold">
                Platform Admin
              </Badge>
              {customRoleName && (
                <Badge variant="primary" className="text-xs font-bold uppercase bg-primary text-white">
                  Role: {customRoleName}
                </Badge>
              )}
            </>
          )}
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 border-b border-border no-scrollbar w-full">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-150 cursor-pointer",
              activeTab === tab.id
                ? "bg-primary text-white shadow-xs"
                : "text-secondary hover:text-primary hover:bg-muted/70"
            )}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab Panels */}
      <div className="w-full">
        {activeTab === "profile" && (
          <AdminProfileTab
            user={user}
            onUpdateProfile={updateProfile}
            onUploadAvatar={uploadAvatar}
            onRemoveAvatar={removeAvatar}
            isUpdating={isUpdatingProfile}
          />
        )}

        {activeTab === "security" && (
          <AdminSecurityTab
            sessions={sessions}
            onChangePassword={changePassword}
            onRevokeSession={revokeSession}
            onRevokeOtherSessions={revokeOtherSessions}
          />
        )}

        {activeTab === "danger" && <AdminDangerZoneTab user={user} />}
      </div>
    </div>
  );
}
