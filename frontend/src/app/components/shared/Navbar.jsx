"use client";

import { useQueryClient } from "@tanstack/react-query";
import useAuthStore from "@/lib/store/authStore";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { Menu, X, Settings } from "lucide-react";
import NotificationBell from "./NotificationBell";
import Avatar from "./Avatar";

const Navbar = () => {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const queryClient = useQueryClient();
  const dashboardUrl =
    user?.role === "mentor"
      ? "/mentor/dashboard"
      : user?.role === "admin"
        ? "/admin"
        : "/dashboard";

  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLogout = useCallback(async () => {
    await logout();
    queryClient.clear();
    router.push("/login");
    setOpen(false);
  }, [logout, queryClient, router]);

  if (!mounted) return null;

  return (
    <nav className="sticky top-0 z-50 w-full border-b glass-nav">
      <div className="flex items-center justify-between px-4 py-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
        {/* Logo */}
        <Link
          href={user ? dashboardUrl : "/"}
          className="text-2xl font-bold tracking-tight text-white font-fugaz"
        >
          Mentora
        </Link>

        {/* Desktop Links */}
        <div className="items-center hidden gap-6 text-sm font-medium md:flex text-white">
          <Link className="hover:text-surface" href="/mentors">
            Browse Mentors
          </Link>

          {!user && (
            <>
              <Link className="hover:text-surface" href="/login">
                Login
              </Link>

              <Link
                href="/register"
                className="px-4 py-2 rounded-full bg-surface/40 hover:opacity-80"
              >
                Register
              </Link>
            </>
          )}

          {user && (
            <>
              <Link className="hover:text-surface" href={dashboardUrl}>
                Dashboard
              </Link>
              <Link className="hover:text-surface" href="/my-bookings">
                My Bookings
              </Link>
              <Link className="hover:text-surface" href="/my-sessions">
                My Sessions
              </Link>
              <NotificationBell />
              <Link href="/settings" className="hover:text-surface" aria-label="Settings">
                <Settings className="w-5 h-5" />
              </Link>
              <Link href="/settings">
                <Avatar src={user?.photo} name={user?.name} size="sm" />
              </Link>
              <button
                onClick={handleLogout}
                className="px-4 py-2 rounded-full bg-background text-primary hover:opacity-90"
              >
                Logout
              </button>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button onClick={() => setOpen(!open)} className="md:hidden text-white">
          {open ? <X size={26} /> : <Menu size={26} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {open && (
        <div className="px-4 pb-4 md:hidden">
          <div className="flex flex-col gap-4 p-4 rounded-xl bg-primary/90 text-white">
            <Link onClick={() => setOpen(false)} href="/mentors">
              Browse Mentors
            </Link>

            {!user && (
              <>
                <Link onClick={() => setOpen(false)} href="/login">
                  Login
                </Link>

                <Link
                  onClick={() => setOpen(false)}
                  href="/register"
                  className="px-4 py-2 text-center rounded-full bg-surface/40"
                >
                  Register
                </Link>
              </>
            )}

            {user && (
              <>
                <Link
                  onClick={() => setOpen(false)}
                  href="/my-bookings"
                  className="px-4 py-2 text-center rounded-full bg-surface/40"
                >
                  My Bookings
                </Link>
                <Link
                  onClick={() => setOpen(false)}
                  href="/my-sessions"
                  className="px-4 py-2 text-center rounded-full bg-surface/40"
                >
                  My Sessions
                </Link>
                <Link
                  onClick={() => setOpen(false)}
                  href="/settings"
                  className="px-4 py-2 text-center rounded-full bg-surface/40"
                >
                  Settings
                </Link>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 text-left rounded-full bg-background text-primary"
                >
                  Logout
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
