"use client";

import React from "react";
import { Bell } from "lucide-react";
import { useAdminSettingsData } from "@/hooks/useAdminSettings";
import { NotificationSkeleton } from "./components/NotificationSkeleton";
import { AdminNotificationsTab } from "./components/AdminNotificationsTab";

export default function AdminNotificationsPage() {
  const {
    notifications,
    unreadCount,
    isLoading,
    broadcastNotification,
    markAllNotificationsRead,
    clearAllNotifications,
  } = useAdminSettingsData();

  if (isLoading) {
    return <NotificationSkeleton />;
  }

  return (
    <div className="space-y-6 w-full pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-primary tracking-tight">System Notifications & Broadcast</h1>
          <p className="text-xs text-secondary mt-1">
            Review security and operational alerts across the marketplace, or broadcast platform announcements.
          </p>
        </div>

        {unreadCount > 0 && (
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-highlight/10 text-highlight text-xs font-bold">
            <Bell className="w-3.5 h-3.5" />
            <span>{unreadCount} Unread Alerts</span>
          </div>
        )}
      </div>

      {/* Main Notifications Feed & Broadcast Card */}
      <div className="w-full">
        <AdminNotificationsTab
          notifications={notifications}
          onBroadcast={broadcastNotification}
          onMarkAllRead={markAllNotificationsRead}
          onClearAll={clearAllNotifications}
        />
      </div>
    </div>
  );
}
