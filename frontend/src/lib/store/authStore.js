import { create } from "zustand";
import { persist } from "zustand/middleware";

const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      token: null,

      setAuth: (user, token) => set({ user, token }),
      logout: () => {
        localStorage.removeItem("token");
        set({ user: null, token: null });
      },
    }),
    {
      name: "auth-storage", // localStorage key
    },
  ),
);

export default useAuthStore;
