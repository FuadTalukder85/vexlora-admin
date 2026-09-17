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
      let token: string | null = null;
      if (typeof window !== "undefined") {
        token = localStorage.getItem("vexlora_admin_token");
        if (token) {
          apiClient.defaults.headers.common["Authorization"] = `Bearer ${token}`;
        }
      }

      // If no admin token exists in localStorage or document.cookie, fail fast
      const hasAdminCookie =
        typeof document !== "undefined" &&
        document.cookie.includes("vexlora_admin_token");

      if (!token && !hasAdminCookie) {
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          isInitialChecking: false,
          isLoading: false,
        });
        return null;
      }

      const res = await apiClient.get("/users/me", {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const userData = res.data?.data || res.data?.user || res.data;

      if (!userData || !userData.id) {
        throw new Error("Unable to retrieve user profile.");
      }

      // Strict Admin Role Enforcement: only ADMIN or SUPER_ADMIN
      const role = userData.role;
      const isAdmin = role === "ADMIN" || role === "SUPER_ADMIN";

      if (!isAdmin) {
        throw new Error("Access denied. Admin role required.");
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
      }

      set({
        user: userObj,
        token: token || null,
        isAuthenticated: true,
        isInitialChecking: false,
        isLoading: false,
        error: null,
      });

      return userObj;
    } catch {
      if (typeof window !== "undefined") {
        localStorage.removeItem("vexlora_admin_token");
        localStorage.removeItem("vexlora_admin_user");
      }
      if (typeof document !== "undefined") {
        document.cookie = "vexlora_admin_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax";
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
      const res = await axios.post(
        `${AUTH_BASE_URL}/sign-in/email`,
        { email, password }
      );

      const token =
        res.data?.token ||
        res.data?.session?.token ||
        res.data?.sessionToken ||
        res.data?.data?.token;

      if (token && typeof window !== "undefined") {
        localStorage.setItem("vexlora_admin_token", token);
        apiClient.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      }

      if (typeof document !== "undefined") {
        const cookieVal = token || "authenticated";
        document.cookie = `vexlora_admin_token=${cookieVal}; path=/; max-age=86400; SameSite=Lax`;
      }

      // Verify profile & admin role
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

      set({ isLoading: false, error: null, token: token || null });
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
      if (typeof window !== "undefined") {
        localStorage.removeItem("vexlora_admin_token");
        localStorage.removeItem("vexlora_admin_user");
      }
      if (typeof document !== "undefined") {
        document.cookie = "vexlora_admin_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax";
      }
      delete apiClient.defaults.headers.common["Authorization"];
    } finally {
      set({
        user: null,
        token: null,
        isAuthenticated: false,
        isInitialChecking: false,
        isLoading: false,
        error: null,
      });
    }
  },

  initAuth: async () => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("vexlora_admin_token");
      if (token) {
        apiClient.defaults.headers.common["Authorization"] = `Bearer ${token}`;
        await get().fetchProfile();
        return;
      }
    }
    set({ isInitialChecking: false });
  },
}));
