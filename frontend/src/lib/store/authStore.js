/**
 * Production-Ready Auth Store
 * 
 * Zustand store for authentication state management
 * 
 * IMPORTANT:
 * - NO token storage in this store
 * - NO localStorage/sessionStorage for tokens
 * - Tokens are handled entirely by httpOnly cookies
 * 
 * This store only manages:
 * - User data (from /me endpoint)
 * - Loading state (for hydration)
 * - Auth actions (login, logout, register)
 */

import { create } from "zustand";
import api from "@/lib/axios";

const useAuthStore = create((set, get) => ({
  // ==================== STATE ====================
  
  /** @type {Object|null} Current user data */
  user: null,
  
  /** @type {boolean} Loading state during hydration */
  isLoading: true,
  
  /** @type {boolean} Auth check completed */
  isInitialized: false,

  // ==================== ACTIONS ====================

  /**
   * Hydrate auth state from backend
   * Called on app initialization to check if user has valid session
   * 
   * Flow:
   * 1. Call /api/auth/me with cookies
   * 2. If valid -> set user data
   * 3. If invalid -> set user to null
   * 4. Always set isLoading to false
   */
  hydrate: async () => {
    // Prevent multiple hydration calls
    if (get().isInitialized) return;

    try {
      const response = await api.get("/api/auth/me");
      
      if (response.data.success) {
        set({ 
          user: response.data.user, 
          isLoading: false,
          isInitialized: true,
        });
      } else {
        set({ 
          user: null, 
          isLoading: false,
          isInitialized: true,
        });
      }
    } catch (error) {
      // Token expired or invalid - user not logged in
      set({ 
        user: null, 
        isLoading: false,
        isInitialized: true,
      });
    }
  },

  /**
   * Login user
   * @param {Object} credentials - { email, password }
   * @returns {Promise<Object>} Response data
   */
  login: async (credentials) => {
    const response = await api.post("/api/auth/login", credentials);
    
    if (response.data.success) {
      set({ user: response.data.user });
    }
    
    return response.data;
  },

  /**
   * Register new user
   * @param {Object} data - { name, email, password, role }
   * @returns {Promise<Object>} Response data
   */
  register: async (data) => {
    const response = await api.post("/api/auth/register", data);
    
    if (response.data.success) {
      set({ user: response.data.user });
    }
    
    return response.data;
  },

  /**
   * Logout user
   * - Calls backend to clear cookies
   * - Clears local state
   * - Redirect happens in the component
   */
  logout: async () => {
    try {
      // Call logout endpoint to clear cookies on backend
      await api.post("/api/auth/logout");
    } catch (error) {
      // Even if backend call fails, clear local state
      console.error("Logout error:", error);
    } finally {
      // Always clear local state
      set({ user: null });
    }
  },

  /**
   * Update user data in state
   * Useful for profile updates
   * @param {Object} userData - Updated user data
   */
  updateUser: (userData) => {
    set((state) => ({
      user: state.user ? { ...state.user, ...userData } : null,
    }));
  },

  // ==================== SELECTORS ====================

  /**
   * Check if user is authenticated
   */
  isAuthenticated: () => {
    const { user, isInitialized } = get();
    return isInitialized && user !== null;
  },

  /**
   * Check if user has specific role
   * @param {string} role - Role to check
   */
  hasRole: (role) => {
    const { user } = get();
    return user?.role === role;
  },

  /**
   * Get user role
   */
  getRole: () => {
    const { user } = get();
    return user?.role || null;
  },
}));

export default useAuthStore;