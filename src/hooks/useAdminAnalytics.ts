import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { AdminDashboardOverview } from "@/types/analytics";

export const fetchAdminDashboardOverview = async (): Promise<AdminDashboardOverview> => {
  const res = await apiClient.get("/analytics/admin/overview");
  const data = res.data?.data || res.data || {};

  return {
    totalPlatformVolume: Number(data.totalPlatformVolume) || 0,
    totalCommissionEarned: Number(data.totalCommissionEarned) || 0,
    totalVendorEarnings: Number(data.totalVendorEarnings) || 0,
    totalOrdersCount: Number(data.totalOrdersCount) || 0,
    activeVendorsCount: Number(data.activeVendorsCount) || 0,
    pendingVendorsCount: Number(data.pendingVendorsCount) || 0,
    pendingPayoutsAmount: Number(data.pendingPayoutsAmount) || 0,
    pendingPayoutsCount: Number(data.pendingPayoutsCount) || 0,
    paidPayoutsCount: Number(data.paidPayoutsCount) || 0,
    totalPaidOut: Number(data.totalPaidOut) || 0,
    flaggedFraudCount: Number(data.flaggedFraudCount) || 0,
  };
};

export const useAdminDashboardOverview = () => {
  return useQuery<AdminDashboardOverview>({
    queryKey: ["admin-dashboard-overview"],
    queryFn: fetchAdminDashboardOverview,
    staleTime: 30 * 1000,
  });
};
