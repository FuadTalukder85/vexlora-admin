export type PayoutStatus = "UNPAID" | "PROCESSING" | "PAID" | "FAILED";

export interface PayoutVendor {
  id: string;
  storeName: string;
  storeSlug?: string;
  storeLogo?: string | null;
  bankAccountName?: string | null;
  bankAccountNumber?: string | null;
  bankName?: string | null;
  stripeAccountId?: string | null;
}

export interface PayoutSubOrderInfo {
  id: string;
  orderId: string;
  subtotal: number | string;
  commissionAmount: number | string;
  vendorEarning: number | string;
  status: string;
  payoutStatus: PayoutStatus;
  deliveredAt?: string | null;
  order?: {
    id: string;
    orderNumber: string;
    paymentStatus: string;
    createdAt: string;
  };
}

export interface PayoutSubOrderJoin {
  payoutId: string;
  subOrderId: string;
  createdAt?: string;
  subOrder: PayoutSubOrderInfo;
}

export interface PayoutRecord {
  id: string;
  vendorId: string;
  amount: number | string;
  status: PayoutStatus;
  stripeTransferId?: string | null;
  processedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  vendor: PayoutVendor;
  subOrders: PayoutSubOrderJoin[];
}

export interface PayoutRequest {
  id: string;
  vendorId: string;
  vendorName: string;
  amount: number;
  status: PayoutStatus;
  bankName: string;
  bankAccountNumber: string;
  bankAccountName: string;
  stripeAccountId?: string | null;
  stripeTransferId?: string | null;
  requestedAt: string;
  processedAt?: string | null;
  subOrdersCount: number;
  subOrders: PayoutSubOrderJoin[];
  vendor: PayoutVendor;
}

export interface AdminPayoutStatistics {
  totalPlatformVolume: number;
  totalCommissionEarned: number;
  totalVendorEarnings: number;
  totalPaidOut: number;
  pendingPayoutsAmount: number;
  pendingPayoutsCount: number;
  paidPayoutsCount: number;
  failedPayoutsCount: number;
}

export interface AdminPayoutQueryParams {
  page?: number;
  limit?: number;
  searchTerm?: string;
  status?: string;
  vendorId?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface UpdatePayoutStatusPayload {
  status: PayoutStatus;
  stripeTransferId?: string | null;
}

export interface CreatePayoutAdminPayload {
  vendorId: string;
  subOrderIds: string[];
  status?: PayoutStatus;
  stripeTransferId?: string | null;
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
