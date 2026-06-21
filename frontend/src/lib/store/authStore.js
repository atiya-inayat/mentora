import { create } from "zustand";
import api from "@/lib/axios";

const useAuthStore = create((set, get) => ({
  user: null,

  // For login/register button loading
  isLoading: false,

  // For initial auth check
  isHydrating: true,

  isInitialized: false,

  hydrate: async () => {
    if (get().isInitialized) return;

    try {
      const response = await api.get("/api/auth/me");

      set({
        user: response.data.success ? response.data.user : null,
        isHydrating: false,
        isInitialized: true,
      });
    } catch (error) {
      set({
        user: null,
        isHydrating: false,
        isInitialized: true,
      });
    }
  },

  login: async (credentials) => {
    try {
      set({ isLoading: true });

      const response = await api.post("/api/auth/login", credentials);

      if (response.data.success) {
        set({ user: response.data.user });
      }

      return response.data;
    } catch (error) {
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  register: async (data) => {
    try {
      set({ isLoading: true });

      const response = await api.post("/api/auth/register", data);

      if (response.data.success) {
        set({ user: response.data.user });
      }

      return response.data;
    } finally {
      set({ isLoading: false });
    }
  },

  logout: async () => {
    try {
      await api.post("/api/auth/logout");
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      set({ user: null });
    }
  },

  updateUser: (userData) => {
    set((state) => ({
      user: state.user ? { ...state.user, ...userData } : null,
    }));
  },

  isAuthenticated: () => {
    const { user, isInitialized } = get();
    return isInitialized && user !== null;
  },

  hasRole: (role) => {
    return get().user?.role === role;
  },

  getRole: () => {
    return get().user?.role || null;
  },

  setAuth: (user) => {
    set({ user });
  },
}));

export default useAuthStore;
