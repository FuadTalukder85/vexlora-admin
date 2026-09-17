import { create } from "zustand";
import axios from "axios";
import { User } from "@/types/auth";
import { apiClient, AUTH_BASE_URL } from "@/lib/api-client";

interface AdminState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isInitialChecking: boolean;
  isSidebarOpen: boolean;
  error: string | null;

  // Actions
  setUser: (user: User | null) => void;
  toggleSidebar: () => void;
  setSidebarOpen: (isOpen: boolean) => void;
  fetchProfile: () => Promise<User | null>;
  login: (email: string, password: string) => Promise<{ user: User; token: string }>;
  logout: () => Promise<void>;
  initAuth: () => Promise<void>;
}

export const useAdminStore = create<AdminState>((set, get) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,
  isInitialChecking: true,
  isSidebarOpen: true,
  error: null,

  setUser: (user) => set({ user, isAuthenticated: !!user }),
  toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
  setSidebarOpen: (isOpen) => set({ isSidebarOpen: isOpen }),

  fetchProfile: async () => {
    set({ isLoading: true, error: null });
    try {
      if (typeof window !== "undefined") {
        const token =
          localStorage.getItem("vexlora_admin_token") ||
          localStorage.getItem("vexlora_token") ||
          localStorage.getItem("admin_token");
        if (token) {
          apiClient.defaults.headers.common["Authorization"] = `Bearer ${token}`;
        }
      }

      const res = await apiClient.get("/users/me");
      const userData = res.data?.data || res.data?.user || res.data;

      if (!userData || !userData.id) {
        throw new Error("Unable to retrieve user profile.");
      }

      // Strict Admin Role Enforcement from Database
      const role = userData.role;
      const isAdmin = role === "ADMIN" || role === "SUPER_ADMIN";

      if (!isAdmin) {
        throw new Error("Access denied. Admin or Super Admin role is required.");
      }

      const userObj: User = {
        id: userData.id,
        name: userData.name || "Administrator",
        email: userData.email,
        role: role,
        status: userData.status || "ACTIVE",
        avatar: userData.image || userData.avatar,
        createdAt: userData.createdAt,
      };

      if (typeof window !== "undefined") {
        localStorage.setItem("vexlora_admin_user", JSON.stringify(userObj));
        localStorage.setItem("admin_user", JSON.stringify(userObj));
      }

      set({
        user: userObj,
        isAuthenticated: true,
        isInitialChecking: false,
        isLoading: false,
        error: null,
      });

      return userObj;
    } catch (err: unknown) {
      if (typeof window !== "undefined") {
        localStorage.removeItem("vexlora_admin_token");
        localStorage.removeItem("vexlora_admin_user");
        localStorage.removeItem("admin_token");
        localStorage.removeItem("admin_user");
      }
      delete apiClient.defaults.headers.common["Authorization"];

      set({
        user: null,
        token: null,
        isAuthenticated: false,
        isInitialChecking: false,
        isLoading: false,
      });
      return null;
    }
  },

  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      // 1. Real authentication request to Better-Auth backend
      const res = await axios.post(
        `${AUTH_BASE_URL}/sign-in/email`,
        { email, password },
        { withCredentials: true }
      );

      const token =
        res.data?.token ||
        res.data?.session?.token ||
        res.data?.sessionToken ||
        res.data?.data?.token;

      if (token && typeof window !== "undefined") {
        localStorage.setItem("vexlora_admin_token", token);
        localStorage.setItem("vexlora_token", token);
        localStorage.setItem("admin_token", token);
        apiClient.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      }

      // 2. Fetch authenticated profile from database & verify admin role
      const user = await get().fetchProfile();

      if (!user) {
        throw new Error(
          get().error || "Failed to authenticate administrator account."
        );
      }

      if (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN") {
        await get().logout();
        throw new Error(
          "Access denied. Only registered Admin and Super Admin accounts are permitted."
        );
      }

      set({ isLoading: false, error: null, token });
      return { user, token: token || "" };
    } catch (err: unknown) {
      set({ isLoading: false });
      let message = "Invalid email or password.";
      if (axios.isAxiosError(err)) {
        message = err.response?.data?.message || err.response?.data?.error || err.message || message;
      } else if (err instanceof Error) {
        message = err.message;
      }
      set({ error: message });
      throw new Error(message);
    }
  },

  logout: async () => {
    set({ isLoading: true });
    try {
      await axios.post(`${AUTH_BASE_URL}/sign-out`, {}, { withCredentials: true }).catch(() => {});
    } catch {
      // continue cleanup
    } finally {
      if (typeof window !== "undefined") {
        localStorage.removeItem("vexlora_admin_token");
        localStorage.removeItem("vexlora_admin_user");
        localStorage.removeItem("admin_token");
        localStorage.removeItem("admin_user");
        localStorage.removeItem("vexlora_token");
      }
      delete apiClient.defaults.headers.common["Authorization"];
      set({
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      });
    }
  },

  initAuth: async () => {
    if (typeof window !== "undefined") {
      const token =
        localStorage.getItem("vexlora_admin_token") ||
        localStorage.getItem("vexlora_token") ||
        localStorage.getItem("admin_token");

      if (token) {
        apiClient.defaults.headers.common["Authorization"] = `Bearer ${token}`;
        await get().fetchProfile();
        return;
      }
    }
    set({ isInitialChecking: false });
  },
}));
