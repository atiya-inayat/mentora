"use client";
import { useMyBookings } from "@/lib/hooks/useBookings";
import Navbar from "../components/shared/Navbar";
import useAuthStore from "@/lib/store/authStore";
import { Spinner, ProfileSkeleton, StatsCardSkeleton, CardSkeleton } from "../components/shared/LoadingSkeleton";
import Link from "next/link";
import {
  Calendar, BookOpen, CheckCircle, Clock, Mail, User, CreditCard, MessageSquare, Star, AlertCircle,
} from "lucide-react";

const statusLabels = {
  upcoming: { label: "Upcoming", style: "bg-blue-100 text-blue-600" },
  ready_to_start: { label: "Ready", style: "bg-green-100 text-green-600" },
  active: { label: "Active", style: "bg-primary/10 text-primary" },
  expired: { label: "Expired", style: "bg-red-100 text-red-600" },
  completed: { label: "Completed", style: "bg-gray-100 text-gray-500" },
};

export default function MenteeDashboard() {
  const { user } = useAuthStore();
  const { data, isLoading } = useMyBookings();

  if (isLoading)
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="px-4 py-12 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-[320px_1fr]">
            <ProfileSkeleton />
            <div className="space-y-8">
              <div className="h-8 rounded bg-primary/10 w-48 animate-pulse" />
              <div className="grid gap-4 sm:grid-cols-3">
                <StatsCardSkeleton />
                <StatsCardSkeleton />
                <StatsCardSkeleton />
              </div>
              <CardSkeleton />
              <CardSkeleton />
            </div>
          </div>
        </div>
      </div>
    );

  const bookings = data?.data || [];

  const statusCounts = {
    pending: bookings.filter((b) => b.status === "pending").length,
    accepted: bookings.filter((b) => b.status === "accepted").length,
    completed: bookings.filter((b) => b.status === "completed").length,
    active: bookings.filter(
      (b) => b.status === "payment_held" || b.status === "completed"
    ).length,
  };

  return (
    <main className="min-h-screen bg-background">
      <Navbar />

      <div className="px-4 py-12 mx-auto max-w-7xl sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[320px_1fr]">
          <aside>
            <div className="p-6 border shadow-lg rounded-2xl bg-surface border-primary/20">
              <div className="flex flex-col items-center text-center">
                <div className="flex items-center justify-center w-20 h-20 rounded-full bg-primary">
                  <User className="w-10 h-10 text-background" />
                </div>
                <h2 className="mt-4 text-2xl font-semibold text-primary font-fugaz">
                  {user?.name || "Mentee"}
                </h2>
                <p className="mt-1 text-sm capitalize text-primary/70">
                  {user?.role || "mentee"}
                </p>
              </div>

              <div className="mt-6 space-y-3">
                <div className="flex items-center gap-3 p-3 rounded-xl bg-background">
                  <Mail className="w-4 h-4 text-primary/60" />
                  <span className="text-sm text-primary/80">
                    {user?.email || "No email"}
                  </span>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-xl bg-background">
                  <BookOpen className="w-4 h-4 text-primary/60" />
                  <span className="text-sm text-primary/80">
                    {bookings.length} session{bookings.length !== 1 ? "s" : ""}
                  </span>
                </div>
              </div>
            </div>
          </aside>

          <div className="space-y-8">
            <div>
              <Link href="/mentors" className="inline-flex items-center gap-1 mb-2 text-xs transition text-primary/60 hover:text-primary">
                ← Browse Mentors
              </Link>
              <h1 className="text-3xl font-semibold text-primary font-fugaz">
                My Sessions
              </h1>
              <p className="mt-1 text-primary/70">
                Track your mentoring sessions and requests
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                href="/my-bookings"
                className="px-4 py-2 text-sm font-medium transition rounded-full bg-surface text-primary border border-primary/20 hover:bg-primary/10"
              >
                All Bookings
              </Link>
              <Link
                href="/my-sessions"
                className="px-4 py-2 text-sm font-medium transition rounded-full bg-surface text-primary border border-primary/20 hover:bg-primary/10"
              >
                Active Sessions
              </Link>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="p-4 border shadow-lg rounded-2xl bg-surface border-primary/20">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-background">
                    <Clock className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-primary/70">Pending</p>
                    <p className="text-2xl font-bold text-primary">{statusCounts.pending}</p>
                  </div>
                </div>
              </div>
              <div className="p-4 border shadow-lg rounded-2xl bg-surface border-primary/20">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-background">
                    <CheckCircle className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-primary/70">Accepted</p>
                    <p className="text-2xl font-bold text-primary">{statusCounts.accepted}</p>
                  </div>
                </div>
              </div>
              <div className="p-4 border shadow-lg rounded-2xl bg-surface border-primary/20">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-background">
                    <Calendar className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-primary/70">Completed</p>
                    <p className="text-2xl font-bold text-primary">{statusCounts.completed}</p>
                  </div>
                </div>
              </div>
            </div>

            <section>
              <h2 className="mb-4 text-xl font-semibold text-primary">All Bookings</h2>

              {bookings.length === 0 ? (
                <div className="p-12 text-center border shadow-lg rounded-2xl bg-surface border-primary/20">
                  <p className="text-primary/60">No bookings yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {bookings.map((booking) => {
                    const isAccepted = booking.status === "accepted";
                    const isPaymentHeld = booking.status === "payment_held";
                    const isCompleted = booking.status === "completed";
                    const ts = booking.timeStatus;
                    const statusInfo = statusLabels[ts];

                    return (
                      <div
                        key={booking._id}
                        className="flex items-center justify-between p-5 border shadow-lg rounded-2xl bg-surface border-primary/20 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl"
                      >
                        <div className="space-y-1.5">
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4 text-primary/60" />
                            <p className="font-medium text-primary">
                              {booking.mentorId?.name || "Unknown"}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-primary/60" />
                            <p className="text-sm text-primary/70">
                              {new Date(booking.scheduledAt).toLocaleDateString("en-US", {
                                weekday: "long", year: "numeric", month: "long", day: "numeric",
                              })}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          {isAccepted && (
                            <Link href={`/payment/${booking._id}`} className="inline-flex items-center gap-1.5 px-4 py-1.5 text-sm font-medium rounded-full bg-primary text-background hover:opacity-90">
                              <CreditCard className="w-4 h-4" />
                              Pay Now
                            </Link>
                          )}

                          {isPaymentHeld && ts === "active" && (
                            <Link href={`/session/${booking._id}`} className="inline-flex items-center gap-1.5 px-4 py-1.5 text-sm font-medium rounded-full bg-primary/10 text-primary hover:bg-primary/20">
                              <MessageSquare className="w-4 h-4" />
                              Chat
                            </Link>
                          )}

                          {isCompleted && !booking.reviewed && (
                            <Link href={`/review/${booking._id}`} className="inline-flex items-center gap-1.5 px-4 py-1.5 text-sm font-medium rounded-full bg-primary/10 text-primary hover:bg-primary/20">
                              <Star className="w-4 h-4" />
                              Review
                            </Link>
                          )}

                          {(isPaymentHeld && ts === "upcoming") && (
                            <div className="text-sm text-primary/50">
                              <Clock className="inline w-4 h-4 mr-1" />
                              {(() => {
                                const ms = new Date(booking.scheduledAt) - new Date();
                                const m = Math.floor(ms / 60000);
                                const h = Math.floor(m / 60);
                                return `${h > 0 ? `${h}h ` : ""}${m % 60}m`;
                              })()}
                            </div>
                          )}

                          {ts && statusInfo ? (
                            <span className={`inline-flex items-center gap-1 px-3 py-1 text-xs font-medium rounded-full ${statusInfo.style}`}>
                              {ts === "expired" && <AlertCircle className="w-3 h-3" />}
                              {statusInfo.label}
                            </span>
                          ) : (
                            <span className={`px-4 py-1.5 text-sm font-medium rounded-full capitalize bg-primary/10 text-primary`}>
                              {booking.status === "payment_held" ? "Paid" : booking.status}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>
          </div>
        </div>
      </div>
    </main>
  );
}
