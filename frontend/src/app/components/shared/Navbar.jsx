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
    <nav className="sticky top-0 z-50 w-full nav-blur">
      <div className="flex items-center justify-between px-4 py-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
        <Link
          href={user ? dashboardUrl : "/"}
          className="text-xl font-bold tracking-tight text-foreground"
        >
          Mentora
        </Link>

        <div className="items-center hidden gap-6 text-sm font-medium md:flex text-muted-foreground">
          <Link className="hover:text-foreground transition-colors" href="/mentors">
            Browse Mentors
          </Link>

          {!user && (
            <>
              <Link className="hover:text-foreground transition-colors" href="/login">
                Login
              </Link>
              <Link
                href="/register"
                className="px-4 py-2 rounded-lg bg-surface text-foreground hover:bg-surface-raised transition-colors border border-border"
              >
                Register
              </Link>
            </>
          )}

          {user && (
            <>
              <Link className="hover:text-foreground transition-colors" href={dashboardUrl}>
                Dashboard
              </Link>
              <Link className="hover:text-foreground transition-colors" href="/bookings">
                My Bookings
              </Link>
              <Link className="hover:text-foreground transition-colors" href="/my-sessions">
                My Sessions
              </Link>
              <NotificationBell />
              <Link href="/settings" className="hover:text-foreground transition-colors" aria-label="Settings">
                <Settings className="w-5 h-5" />
              </Link>
              <Link href="/settings">
                <Avatar src={user?.photo} name={user?.name} size="sm" />
              </Link>
              <button
                onClick={handleLogout}
                className="px-4 py-2 rounded-lg bg-surface text-foreground hover:bg-surface-raised transition-colors border border-border text-sm"
              >
                Logout
              </button>
            </>
          )}
        </div>

        <button onClick={() => setOpen(!open)} className="md:hidden text-foreground">
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {open && (
        <div className="px-4 pb-4 md:hidden border-t border-border">
          <div className="flex flex-col gap-2 p-4 mt-2 card">
            <Link onClick={() => setOpen(false)} href="/mentors" className="py-2 text-sm text-muted-foreground hover:text-foreground">
              Browse Mentors
            </Link>
            {!user && (
              <>
                <Link onClick={() => setOpen(false)} href="/login" className="py-2 text-sm text-muted-foreground hover:text-foreground">
                  Login
                </Link>
                <Link onClick={() => setOpen(false)} href="/register" className="btn-primary text-center py-2 rounded-lg text-sm">
                  Register
                </Link>
              </>
            )}
            {user && (
              <>
                <Link onClick={() => setOpen(false)} href="/bookings" className="py-2 text-sm text-muted-foreground hover:text-foreground">
                  My Bookings
                </Link>
                <Link onClick={() => setOpen(false)} href="/my-sessions" className="py-2 text-sm text-muted-foreground hover:text-foreground">
                  My Sessions
                </Link>
                <Link onClick={() => setOpen(false)} href="/settings" className="py-2 text-sm text-muted-foreground hover:text-foreground">
                  Settings
                </Link>
                <button onClick={handleLogout} className="py-2 text-left text-sm text-muted-foreground hover:text-foreground">
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
