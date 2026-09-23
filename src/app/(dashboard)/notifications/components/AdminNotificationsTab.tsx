"use client";

import React, { useState } from "react";
import { Bell, Check, Trash2, Send } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { ConfirmationModal } from "@/components/ui/ConfirmationModal";
import { AdminNotification } from "@/hooks/useAdminSettings";
import { BroadcastAnnouncementModal } from "./BroadcastAnnouncementModal";
import { cn } from "@/lib/utils";

interface AdminNotificationsTabProps {
  notifications: AdminNotification[];
  onBroadcast: (data: { target: "ALL" | "VENDORS" | "CUSTOMERS"; title: string; message: string; type: string }) => Promise<any>;
  onMarkAllRead: () => Promise<any>;
  onClearAll: () => Promise<any>;
}

export const AdminNotificationsTab: React.FC<AdminNotificationsTabProps> = ({
  notifications,
  onBroadcast,
  onMarkAllRead,
  onClearAll,
}) => {
  const [isBroadcastModalOpen, setIsBroadcastModalOpen] = useState(false);
  const [isClearModalOpen, setIsClearModalOpen] = useState(false);
  const [isClearing, setIsClearing] = useState(false);

  const handleConfirmClearAll = async () => {
    setIsClearing(true);
    try {
      await onClearAll();
      setIsClearModalOpen(false);
    } finally {
      setIsClearing(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card
        title="Marketplace Broadcast Center"
        subtitle="Send urgent platform announcements and notifications to vendors or customers"
        action={
          <Button type="button" variant="primary" size="sm" onClick={() => setIsBroadcastModalOpen(true)}>
            <Send className="w-3.5 h-3.5" />
            New Broadcast Announcement
          </Button>
        }
      >
        <p className="text-xs text-secondary leading-relaxed">
          Broadcasted announcements will immediately appear in target dashboard notification feeds and push to active
          websockets.
        </p>
      </Card>

      <Card
        title="Admin System Notifications"
        subtitle="Recent security alerts, vendor applications, and financial triggers"
        action={
          <div className="flex items-center gap-2">
            <Button type="button" variant="outline" size="sm" onClick={() => onMarkAllRead()}>
              <Check className="w-3.5 h-3.5" />
              Mark All Read
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={notifications.length === 0}
              onClick={() => setIsClearModalOpen(true)}
            >
              <Trash2 className="w-3.5 h-3.5" />
              Clear All
            </Button>
          </div>
        }
      >
        {notifications.length > 0 ? (
          <div className="divide-y divide-border">
            {notifications.map((n) => (
              <div key={n.id} className="py-3 flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div
                    className={cn(
                      "w-2 h-2 rounded-full mt-1.5 shrink-0",
                      n.isRead ? "bg-border" : "bg-highlight"
                    )}
                  />
                  <div>
                    {n.title && <h4 className="text-xs font-bold text-primary">{n.title}</h4>}
                    <p className="text-xs text-secondary mt-0.5">{n.message}</p>
                    <span className="text-[10px] text-secondary/80 mt-1 block">
                      {new Date(n.createdAt).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-10 text-center flex flex-col items-center justify-center">
            <Bell className="w-10 h-10 text-secondary mb-2" />
            <p className="text-sm font-semibold text-primary">No notifications</p>
            <p className="text-xs text-secondary mt-0.5">All administrative alerts have been cleared.</p>
          </div>
        )}
      </Card>

      <BroadcastAnnouncementModal
        isOpen={isBroadcastModalOpen}
        onClose={() => setIsBroadcastModalOpen(false)}
        onBroadcast={onBroadcast}
      />

      {/* Clear All Notifications Confirmation Modal */}
      <ConfirmationModal
        isOpen={isClearModalOpen}
        onClose={() => {
          if (!isClearing) setIsClearModalOpen(false);
        }}
        onConfirm={handleConfirmClearAll}
        title="Clear All Notifications"
        confirmText="Clear Notifications"
        variant="danger"
        isLoading={isClearing}
        description="Are you sure you want to permanently clear all notifications from your administrative feed? This action cannot be undone."
      />
    </div>
  );
};
