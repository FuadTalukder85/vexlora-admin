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
