"use client";

import { useEffect } from "react";
import useAuthStore from "@/lib/store/authStore";

/**
 * Auth Provider Component
 *
 * Wraps the application to provide authentication state hydration
 *
 * How it works:
 * 1. On mount, calls hydrate() to check session
 * 2. hydrate() calls /api/auth/me with cookies
 * 3. If valid, sets user in Zustand store
 * 4. Components can then use useAuthStore() to get user
 *
 * This runs once on app initialization
 */
export default function AuthProvider({ children }) {
  const { hydrate, isInitialized } = useAuthStore();

  useEffect(() => {
    // Only hydrate once
    if (!isInitialized) {
      hydrate();
    }
  }, [hydrate, isInitialized]);

  // Render children - auth state is now available
  return children;
}
