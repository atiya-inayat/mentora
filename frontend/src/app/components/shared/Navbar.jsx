"use client";

import useAuthStore from "@/lib/store/authStore";
import Link from "next/link";
import React from "react";

const Navbar = () => {
  const { user, logout } = useAuthStore();

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
        <Link href="/browse-mentors">Browse Mentors</Link>

        <div>
          {/* Guest */}
          {!user && (
            <>
              <Link href="/login">Login</Link>
              <Link href="/register">Register</Link>
            </>
          )}
        </div>

        <div>
          {/* Mentee */}
          {user?.role === "mentee" && (
            <>
              <Link href="/my-bookings">My Bookings</Link>
            </>
          )}
        </div>

        <div>
          {/* Mentor */}
          {user?.role === "mentor" && (
            <>
              <Link href="/my-sessions">My Sessions</Link>
              <Link href="/dashboard">Dashboard</Link>
            </>
          )}
        </div>

        <div>
          {/* Admin */}
          {user?.role === "admin" && <Link href="/admin">Admin Panel</Link>}
        </div>
      </div>

      <div>
        {/* Auth actions */}
        {user && <button onClick={logout}>Logout</button>}
      </div>
    </nav>
  );
};

export default Navbar;
