import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { User } from "@/types/auth";

export interface PlatformSetting {
  id: string;
  platformName: string;
  supportEmail: string;
  supportPhone?: string | null;
  currency: string;
  defaultCommissionRate: number;
  minPayoutAmount: number;
  escrowHoldDays: number;
  allowVendorRegistration: boolean;
  maintenanceMode: boolean;
  emailNotifications: boolean;
  systemAlerts: boolean;
  updatedAt: string;
  createdAt: string;
}

export interface StripePlatformBalance {
  available: number;
  pending: number;
  currency: string;
}

export interface SessionInfo {
  id: string;
  ipAddress?: string | null;
  userAgent?: string | null;
  createdAt: string;
  expiresAt: string;
  isCurrent: boolean;
}

export interface AdminNotification {
  id: string;
  type: string;
  title?: string | null;
  message: string;
  link?: string | null;
  isRead: boolean;
  createdAt: string;
}

export const useAdminSettingsData = () => {
  const queryClient = useQueryClient();

  // 1. Current admin profile
  const userQuery = useQuery<User & { phone?: string | null; image?: string | null; isSuperAdmin?: boolean }>({
    queryKey: ["admin-user-me"],
    queryFn: async () => {
      const res = await apiClient.get("/users/me");
      return res.data?.data || res.data;
    },
  });

  // 2. Platform settings
  const platformSettingsQuery = useQuery<PlatformSetting>({
    queryKey: ["admin-platform-settings"],
    queryFn: async () => {
      const res = await apiClient.get("/platform-settings");
      return res.data?.data || res.data;
    },
  });

  // 3. Stripe platform balance
  const stripeBalanceQuery = useQuery<StripePlatformBalance>({
    queryKey: ["admin-stripe-balance"],
    queryFn: async () => {
      try {
        const res = await apiClient.get("/payouts/admin/stripe/balance");
        return res.data?.data || null;
      } catch {
        return null;
      }
    },
  });

  // 4. Active Sessions
  const sessionsQuery = useQuery<SessionInfo[]>({
    queryKey: ["admin-sessions"],
    queryFn: async () => {
      const res = await apiClient.get("/users/me/sessions");
      return res.data?.data || [];
    },
  });

  // 5. Notifications
  const notificationsQuery = useQuery<AdminNotification[]>({
    queryKey: ["admin-notifications"],
    queryFn: async () => {
      const res = await apiClient.get("/notifications/my-notifications?limit=20");
      return res.data?.data || [];
    },
  });

  const unreadCountQuery = useQuery<number>({
    queryKey: ["admin-unread-count"],
    queryFn: async () => {
      const res = await apiClient.get("/notifications/unread-count");
      return res.data?.data?.count ?? 0;
    },
  });

  // 6. Mutations
  const updateProfileMutation = useMutation({
    mutationFn: async (payload: { name?: string; phone?: string | null }) => {
      const res = await apiClient.patch("/users/me", payload);
      return res.data?.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-user-me"] });
    },
  });

  const uploadAvatarMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("image", file);
      const res = await apiClient.post("/users/me/avatar", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return res.data?.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-user-me"] });
    },
  });

  const removeAvatarMutation = useMutation({
    mutationFn: async () => {
      const res = await apiClient.delete("/users/me/avatar");
      return res.data?.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-user-me"] });
    },
  });

  const updatePlatformSettingsMutation = useMutation({
    mutationFn: async (payload: Partial<PlatformSetting>) => {
      const res = await apiClient.patch("/platform-settings", payload);
      return res.data?.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-platform-settings"] });
    },
  });

  const changePasswordMutation = useMutation({
    mutationFn: async (payload: { currentPassword: string; newPassword: string; revokeOtherSessions?: boolean }) => {
      const res = await apiClient.post("/users/change-password", payload);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-sessions"] });
    },
  });

  const revokeSessionMutation = useMutation({
    mutationFn: async (sessionId: string) => {
      const res = await apiClient.delete(`/users/me/sessions/${sessionId}`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-sessions"] });
    },
  });

  const revokeOtherSessionsMutation = useMutation({
    mutationFn: async () => {
      const res = await apiClient.delete("/users/me/sessions/other");
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-sessions"] });
    },
  });

  const broadcastNotificationMutation = useMutation({
    mutationFn: async (payload: { target: "ALL" | "VENDORS" | "CUSTOMERS"; title: string; message: string; type: string }) => {
      const res = await apiClient.post("/notifications/broadcast", payload);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-notifications"] });
    },
  });

  const markAllNotificationsReadMutation = useMutation({
    mutationFn: async () => {
      const res = await apiClient.patch("/notifications/mark-all-as-read");
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-notifications"] });
      queryClient.invalidateQueries({ queryKey: ["admin-unread-count"] });
    },
  });

  const clearAllNotificationsMutation = useMutation({
    mutationFn: async () => {
      const res = await apiClient.delete("/notifications/clear-all");
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-notifications"] });
      queryClient.invalidateQueries({ queryKey: ["admin-unread-count"] });
    },
  });

  return {
    user: userQuery.data,
    platformSettings: platformSettingsQuery.data,
    stripeBalance: stripeBalanceQuery.data,
    sessions: sessionsQuery.data || [],
    notifications: notificationsQuery.data || [],
    unreadCount: unreadCountQuery.data || 0,
    isLoading: userQuery.isLoading || platformSettingsQuery.isLoading,
    updateProfile: updateProfileMutation.mutateAsync,
    isUpdatingProfile: updateProfileMutation.isPending,
    uploadAvatar: uploadAvatarMutation.mutateAsync,
    removeAvatar: removeAvatarMutation.mutateAsync,
    updatePlatformSettings: updatePlatformSettingsMutation.mutateAsync,
    isUpdatingPlatformSettings: updatePlatformSettingsMutation.isPending,
    changePassword: changePasswordMutation.mutateAsync,
    revokeSession: revokeSessionMutation.mutateAsync,
    revokeOtherSessions: revokeOtherSessionsMutation.mutateAsync,
    broadcastNotification: broadcastNotificationMutation.mutateAsync,
    isBroadcasting: broadcastNotificationMutation.isPending,
    markAllNotificationsRead: markAllNotificationsReadMutation.mutateAsync,
    clearAllNotifications: clearAllNotificationsMutation.mutateAsync,
  };
};
