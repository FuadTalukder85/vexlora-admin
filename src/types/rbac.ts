export type ModuleScope = "ADMIN" | "VENDOR" | "BOTH";

export interface Permission {
  id: string;
  key: string;
  name: string;
  description?: string | null;
  category: string;
  scope: ModuleScope;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface RolePermission {
  id: string;
  roleId: string;
  permissionId: string;
  assignedById?: string | null;
  permission: Permission;
}

export interface AppRole {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  scope: ModuleScope;
  isSystemRole: boolean;
  tenantId?: string | null;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
  rolePermissions?: RolePermission[];
  userRoles?: Array<{
    id: string;
    userId: string;
    user?: {
      id: string;
      name: string;
      email: string;
      role: string;
    };
  }>;
  _count?: {
    userRoles: number;
  };
}

export interface UserEffectivePermissions {
  userId: string;
  role: string;
  isOwner: boolean;
  isSuperAdmin?: boolean;
  tenantId?: string | null;
  permissions: string[];
  categories: string[];
}

export interface CreateRolePayload {
  name: string;
  slug: string;
  description?: string;
  scope?: ModuleScope;
  permissions?: string[];
}

export interface UpdateRolePayload {
  name?: string;
  description?: string;
  scope?: ModuleScope;
  isActive?: boolean;
  permissions?: string[];
}

export interface AssignUserRolePayload {
  userId: string;
  roleId: string;
  tenantId?: string;
}
