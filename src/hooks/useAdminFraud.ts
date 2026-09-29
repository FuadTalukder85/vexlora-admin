import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";

export interface FraudAlertStats {
  flaggedCount: number;
  highRiskUsersCount: number;
  highRiskSellersCount: number;
  flaggedReviewsCount: number;
}

export const fetchAdminFraudAlerts = async (): Promise<FraudAlertStats> => {
  try {
    const [usersRes, sellersRes, reviewsRes] = await Promise.allSettled([
      apiClient.get("/fraud-profiles", { params: { limit: 100 } }),
      apiClient.get("/seller-fraud-profiles", { params: { limit: 100 } }),
      apiClient.get("/review-fraud-logs", { params: { limit: 100 } }),
    ]);

    const userProfiles: any[] =
      usersRes.status === "fulfilled"
        ? usersRes.value.data?.data || usersRes.value.data || []
        : [];
    const sellers: any[] =
      sellersRes.status === "fulfilled"
        ? sellersRes.value.data?.data || sellersRes.value.data || []
        : [];
    const reviews: any[] =
      reviewsRes.status === "fulfilled"
        ? reviewsRes.value.data?.data || reviewsRes.value.data || []
        : [];

    const highRiskUsersCount = Array.isArray(userProfiles)
      ? userProfiles.filter(
          (p: any) => p.riskLevel === "HIGH" || p.riskLevel === "CRITICAL"
        ).length
      : 0;

    const highRiskSellersCount = Array.isArray(sellers)
      ? sellers.filter(
          (s: any) => s.riskLevel === "HIGH" || s.riskLevel === "CRITICAL"
        ).length
      : 0;

    const flaggedReviewsCount = Array.isArray(reviews)
      ? reviews.filter(
          (r: any) => r.status === "FLAGGED" || r.status === "REMOVED"
        ).length
      : 0;

    const flaggedCount =
      highRiskUsersCount + highRiskSellersCount + flaggedReviewsCount;

    return {
      flaggedCount,
      highRiskUsersCount,
      highRiskSellersCount,
      flaggedReviewsCount,
    };
  } catch (error) {
    return {
      flaggedCount: 0,
      highRiskUsersCount: 0,
      highRiskSellersCount: 0,
      flaggedReviewsCount: 0,
    };
  }
};

export const useAdminFraudAlerts = () => {
  return useQuery<FraudAlertStats>({
    queryKey: ["admin-fraud-alerts"],
    queryFn: fetchAdminFraudAlerts,
    staleTime: 30 * 1000,
  });
};
