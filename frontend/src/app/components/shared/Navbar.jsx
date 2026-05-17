"use client";

import useAuthStore from "@/lib/store/authStore";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

const Navbar = () => {
  const router = useRouter();

  const { user, logout } = useAuthStore();

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLogout = useCallback(async () => {
    await logout();
    router.push("/login");
  }, [logout, router]);

  // Prevent hydration mismatch
  if (!mounted) return null;

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-primary/70 border-primary/10">
      <div className="flex items-center justify-between px-6 py-4 mx-auto max-w-7xl">
        {/* Logo */}
        <Link
          href="/"
          className="text-2xl font-semibold tracking-tight text-background font-poppins"
        >
          Mentora
        </Link>

        {/* Nav Links */}
        <div className="flex items-center gap-6 text-sm font-medium text-background">
          <Link
            href="/mentors"
            className=" hover:text-surface hover:underline underline-offset-4"
          >
            Browse Mentors
          </Link>

          {/* Guest */}
          {!user && (
            <>
              <Link
                href="/login"
                className=" hover:text-surface hover:underline underline-offset-4"
              >
                Login
              </Link>

              <Link
                href="/register"
                className="px-4 py-2 rounded-md text-background bg-surface/40 hover:opacity-60"
              >
                Register
              </Link>
            </>
          )}

          {/* Mentee */}
          {user?.role === "mentee" && (
            <Link href="/my-bookings" className="hover:text-primary">
              My Bookings
            </Link>
          )}

          {/* Mentor */}
          {user?.role === "mentor" && (
            <>
              <Link href="/my-sessions" className="hover:text-primary">
                My Sessions
              </Link>

              <Link href="/mentor/dashboard" className="hover:text-primary">
                Dashboard
              </Link>
            </>
          )}

          {/* Admin */}
          {user?.role === "admin" && (
            <Link href="/admin/dashboard" className="hover:text-primary">
              Admin Panel
            </Link>
          )}

          {/* Logout */}
          {user && (
            <button
              onClick={handleLogout}
              className="px-4 py-2 text-white transition rounded-md bg-primary hover:opacity-90"
            >
              Logout
            </button>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
