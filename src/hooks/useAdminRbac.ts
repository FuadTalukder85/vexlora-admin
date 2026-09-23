"use client";

import { useState, useCallback, useEffect } from "react";
import { apiClient } from "@/lib/api-client";
import { AppRole, Permission, CreateRolePayload, UpdateRolePayload } from "@/types/rbac";

export function useAdminRbac() {
  const [roles, setRoles] = useState<AppRole[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRoles = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await apiClient.get("/rbac/admin/roles");
      const data = res.data?.data || [];
      setRoles(data);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to load admin roles";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchPermissions = useCallback(async () => {
    try {
      const res = await apiClient.get("/rbac/admin/permissions");
      const data = res.data?.data || [];
      setPermissions(data);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to load permissions";
      setError(message);
    }
  }, []);

  const seedPermissions = useCallback(async () => {
    try {
      setIsSaving(true);
      setError(null);
      await apiClient.post("/rbac/admin/seed");
      await fetchPermissions();
      await fetchRoles();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to seed permissions";
      setError(message);
      throw new Error(message);
    } finally {
      setIsSaving(false);
    }
  }, [fetchPermissions, fetchRoles]);

  const createRole = useCallback(async (payload: CreateRolePayload) => {
    try {
      setIsSaving(true);
      setError(null);
      const res = await apiClient.post("/rbac/admin/roles", payload);
      await fetchRoles();
      return res.data?.data;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to create role";
      setError(message);
      throw new Error(message);
    } finally {
      setIsSaving(false);
    }
  }, [fetchRoles]);

  const updateRole = useCallback(async (id: string, payload: UpdateRolePayload) => {
    try {
      setIsSaving(true);
      setError(null);
      const res = await apiClient.patch(`/rbac/admin/roles/${id}`, payload);
      await fetchRoles();
      return res.data?.data;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to update role";
      setError(message);
      throw new Error(message);
    } finally {
      setIsSaving(false);
    }
  }, [fetchRoles]);

  const deleteRole = useCallback(async (id: string) => {
    try {
      setIsSaving(true);
      setError(null);
      await apiClient.delete(`/rbac/admin/roles/${id}`);
      await fetchRoles();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to delete role";
      setError(message);
      throw new Error(message);
    } finally {
      setIsSaving(false);
    }
  }, [fetchRoles]);

  const assignRoleToUser = useCallback(async (userId: string, roleId: string) => {
    try {
      setIsSaving(true);
      setError(null);
      const res = await apiClient.post("/rbac/admin/roles/assign", {
        userId,
        roleId,
      });
      return res.data?.data;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to assign role to user";
      setError(message);
      throw new Error(message);
    } finally {
      setIsSaving(false);
    }
  }, []);

  const removeRoleFromUser = useCallback(async (roleId: string, userId: string) => {
    try {
      setIsSaving(true);
      setError(null);
      await apiClient.delete(`/rbac/admin/roles/${roleId}/user/${userId}`);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to remove role from user";
      setError(message);
      throw new Error(message);
    } finally {
      setIsSaving(false);
    }
  }, []);

  const getRoleById = useCallback(async (id: string): Promise<AppRole | null> => {
    try {
      const res = await apiClient.get(`/rbac/admin/roles/${id}`);
      return res.data?.data || null;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to fetch role details";
      setError(message);
      return null;
    }
  }, []);

  useEffect(() => {
    fetchRoles();
    fetchPermissions();
  }, [fetchRoles, fetchPermissions]);

  return {
    roles,
    permissions,
    isLoading,
    isSaving,
    error,
    fetchRoles,
    fetchPermissions,
    getRoleById,
    seedPermissions,
    createRole,
    updateRole,
    deleteRole,
    assignRoleToUser,
    removeRoleFromUser,
  };
}
