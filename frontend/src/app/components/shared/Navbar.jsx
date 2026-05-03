"use client";

import useAuthStore from "@/lib/store/authStore";
import Link from "next/link";
import React from "react";

const Navbar = () => {
  const { user, logout } = useAuthStore();

  return (
    <nav>
      <div>
        <Link href="/">Mentora</Link>

        <Link href="/browse-mentors">Browse Mentors</Link>
      </div>

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

      <div>
        {/* Auth actions */}
        {user && <button onClick={logout}>Logout</button>}
      </div>
    </nav>
  );
};

export default Navbar;
