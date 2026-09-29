export type RiskLevel = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

export type ReviewFraudStatus = "CLEAN" | "FLAGGED" | "REMOVED" | "INVESTIGATING";

export interface UserSummary {
  id: string;
  name?: string | null;
  email?: string;
  role?: string;
  status?: string;
  phone?: string | null;
}

export interface VendorSummary {
  id: string;
  storeName: string;
  storeSlug: string;
  status: string;
  ratingAvg?: number | string | null;
}

export interface ProductSummary {
  id: string;
  title: string;
  slug: string;
  vendorId?: string;
}

export interface ReviewSummary {
  id: string;
  rating: number;
  comment?: string | null;
  createdAt: string;
  customer?: UserSummary;
}

export interface UserFraudProfile {
  id: string;
  userId: string;
  totalOrders: number;
  completedOrders: number;
  cancelledOrders: number;
  returnedOrders: number;
  failedPayments: number;
  totalRefunds: number;
  chargebacks: number;
  accountAgeDays: number;
  riskScore: number;
  riskLevel: RiskLevel;
  fraudTypes: string[];
  lastCalculatedAt?: string | null;
  updatedAt?: string;
  user?: UserSummary;
}

export interface SellerFraudProfile {
  id: string;
  vendorId: string;
  totalOrders: number;
  cancelledOrders: number;
  returnedOrders: number;
  complaints: number;
  refundRate: number | string;
  fakeProductReports: number;
  lateShipmentRate: number | string;
  customerRating: number | string;
  reviewAbuseCount: number;
  suspiciousOrders: number;
  riskScore: number;
  riskLevel: RiskLevel;
  flaggedAt?: string | null;
  updatedAt?: string;
  vendor?: VendorSummary;
}

export interface ReviewFraudLog {
  id: string;
  reviewId: string;
  reviewerId: string;
  productId: string;
  deviceId?: string | null;
  ipAddress?: string | null;
  reviewerAccountAgeDays?: number | null;
  hasVerifiedPurchase: boolean;
  sellerRelationshipFlag: boolean;
  suspicionScore: number;
  status: ReviewFraudStatus;
  createdAt: string;
  updatedAt?: string;
  review?: ReviewSummary;
  product?: ProductSummary;
}

export interface FraudAuditLog {
  id: string;
  targetUserId: string;
  triggerType: string;
  reasonSummary: string;
  metricsSnapshot: Record<string, unknown>;
  scoreAtEvent: number;
  action: string;
  createdAt: string;
  targetUser?: UserSummary;
}

export interface FraudStats {
  totalProfiles: number;
  highRiskProfiles: number;
  highRiskSellers: number;
  flaggedReviews: number;
  totalAuditLogs: number;
}
