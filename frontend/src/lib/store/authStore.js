import { create } from "zustand";
import { persist } from "zustand/middleware";

// create a store
const useAuthStore = create(
  // wrap with persist plugin
  persist(
    //  set = function to update state
    (set) => ({
      // initial state
      user: null,
      token: null,

      // action = function that calls set
      setAuth: (user, token) =>
        // updates state

        set({ user, token }),
      // another action
      logout: () => {
        localStorage.removeItem("token");
        set({ user: null, token: null });
      },
    }),
    {
      name: "auth-storage", // localStorage key name
    },
  ),
);

export default useAuthStore;
