export interface User {
  id: string;
  name: string;
  email: string;
  role: "SUPER_ADMIN" | "ADMIN" | "VENDOR" | "CUSTOMER";
  avatar?: string;
  status: "ACTIVE" | "BLOCKED" | "PENDING";
  createdAt?: string;
  isSuperAdmin?: boolean;
  permissions?: string[];
  assignedRoles?: string[];
  userRoles?: Array<{
    id: string;
    roleId: string;
    role: {
      id: string;
      name: string;
      slug: string;
    };
  }>;
}

export interface AuthResponse {
  user: User;
  token: string;
}

