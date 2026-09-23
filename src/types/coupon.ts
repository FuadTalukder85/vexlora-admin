export type CouponScope = "platform" | "vendor";
export type DiscountType = "percentage" | "flat";

export interface CouponVendor {
  id: string;
  storeName: string;
  storeSlug?: string;
  storeLogo?: string | null;
}

export interface Coupon {
  id: string;
  code: string;
  scope: CouponScope;
  vendorId?: string | null;
  vendor?: CouponVendor | null;
  discountType: DiscountType;
  discountValue: number;
  minPurchase?: number | null;
  expiresAt?: string | null;
  usageLimit?: number | null;
  usedCount: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  _count?: {
    usageLogs: number;
  };
}

export interface CreateAdminCouponPayload {
  code: string;
  scope: CouponScope;
  vendorId?: string | null;
  discountType: DiscountType;
  discountValue: number;
  minPurchase?: number | null;
  expiresAt?: string | null;
  usageLimit?: number | null;
  isActive?: boolean;
}

export interface UpdateAdminCouponPayload {
  code?: string;
  scope?: CouponScope;
  vendorId?: string | null;
  discountType?: DiscountType;
  discountValue?: number;
  minPurchase?: number | null;
  expiresAt?: string | null;
  usageLimit?: number | null;
  isActive?: boolean;
}
