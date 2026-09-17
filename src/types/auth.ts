export interface User {
  id: string;
  name: string;
  email: string;
  role: "SUPER_ADMIN" | "ADMIN" | "VENDOR" | "CUSTOMER";
  avatar?: string;
  status: "ACTIVE" | "BLOCKED" | "PENDING";
  createdAt?: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}
