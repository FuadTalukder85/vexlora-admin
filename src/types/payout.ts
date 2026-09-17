export interface PayoutRequest {
  id: string;
  vendorId: string;
  vendorName: string;
  amount: number;
  status: "PENDING" | "PROCESSING" | "PAID" | "REJECTED";
  bankName: string;
  bankAccountNumber: string;
  bankAccountName: string;
  period: string;
  requestedAt: string;
  processedAt?: string;
  notes?: string;
}

export interface Coupon {
  id: string;
  code: string;
  description?: string;
  discountType: "PERCENTAGE" | "FIXED";
  discountValue: number;
  minOrderAmount?: number;
  maxDiscount?: number;
  usageLimit?: number;
  usageCount: number;
  startDate: string;
  endDate: string;
  isActive: boolean;
}

export interface FraudLog {
  id: string;
  entityType: "USER" | "SELLER" | "REVIEW" | "ORDER";
  entityId: string;
  riskScore: number;
  riskLevel: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  flagReason: string;
  status: "INVESTIGATING" | "RESOLVED" | "BLOCKED" | "DISMISSED";
  detectedAt: string;
}
