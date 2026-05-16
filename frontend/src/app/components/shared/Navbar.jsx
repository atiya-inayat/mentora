"use client";

import useAuthStore from "@/lib/store/authStore";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback } from "react";

const Navbar = () => {
  const router = useRouter();
  const { user, logout, isLoading } = useAuthStore();

  // Handle logout with redirect
  const handleLogout = useCallback(async () => {
    await logout();
    router.push("/login");
  }, [logout, router]);

  // Show loading state while hydrating
  if (isLoading) {
    return (
      <nav className="sticky top-0 z-50 flex flex-row items-center justify-around w-full border border-s-violet-50 bg-slate-100">
        <div className="p-3">Loading...</div>
      </nav>
    );
  }

  return (
    <nav className="sticky top-0 z-50 flex flex-row items-center justify-around w-full border border-s-violet-50 bg-slate-100 ">
      <div className="flex flex-row justify-center ">
        <div className="flex flex-row justify-between w-full gap-3 ">
          <Link className="p-3 font-mono text-3xl font-extrabold" href="/">
            Mentora
          </Link>
        </div>
      </div>

      <div></div>

      <div className="flex gap-5 ">
        <Link href="/mentors">Browse Mentors</Link>

        {/* Guest - show login/register */}
        {!user && (
          <>
            <Link href="/login">Login</Link>
            <Link href="/register">Register</Link>
          </>
        )}

        {/* Mentee */}
        {user?.role === "mentee" && (
          <>
            <Link href="/my-bookings">My Bookings</Link>
          </>
        )}

        {/* Mentor */}
        {user?.role === "mentor" && (
          <>
            <Link href="/my-sessions">My Sessions</Link>
            <Link href="/mentor/dashboard">Dashboard</Link>
          </>
        )}

        {/* Admin */}
        {user?.role === "admin" && <Link href="/admin/dashboard">Admin Panel</Link>}
      </div>

      <div>
        {/* Auth actions */}
        {user && (
          <button 
            onClick={handleLogout}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
          >
            Logout
          </button>
        )}
      </div>
    </nav>
  );
};

export default Navbar;