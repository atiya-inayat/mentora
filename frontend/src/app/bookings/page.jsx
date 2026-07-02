"use client";
import { useMyBookings } from "@/lib/hooks/useBookings";
import useAuthStore from "@/lib/store/authStore";
import Navbar from "@/app/components/shared/Navbar";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CardSkeleton } from "@/app/components/shared/LoadingSkeleton";
import { Calendar, User, Clock, CheckCircle, XCircle, MessageSquare, Star, CreditCard } from "lucide-react";
import usePageTitle from "@/lib/hooks/usePageTitle";

const statusStyles = {
  confirmed: "bg-blue-500/10 text-blue-400",
  completed: "bg-green-500/10 text-green-400",
  cancelled: "bg-red-500/10 text-red-400",
  no_show: "bg-yellow-500/10 text-yellow-400",
  refunded: "bg-purple-500/10 text-purple-400",
};

export default function BookingsPage() {
  usePageTitle("My Bookings");
  const { user } = useAuthStore();
  const router = useRouter();
  const { data, isLoading } = useMyBookings();

  if (isLoading)
    return (
      <main className="min-h-screen bg-background">
        <Navbar />
        <div className="px-4 py-12 mx-auto max-w-4xl sm:px-6 lg:px-8">
          <CardSkeleton />
          <CardSkeleton />
        </div>
      </main>
    );

  const bookings = data?.data || [];
  const isMentor = user?.role === "mentor";

  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      <div className="px-4 py-12 mx-auto max-w-4xl sm:px-6 lg:px-8">
        <Link
          href={isMentor ? "/mentor/dashboard" : "/dashboard"}
          className="inline-flex items-center gap-1 mb-2 text-xs transition text-white/40 hover:text-primary"
        >
          ← Back to Dashboard
        </Link>
        <h1 className="mb-2 text-3xl font-semibold text-primary font-fugaz">
          {isMentor ? "All Bookings" : "My Bookings"}
        </h1>
        <p className="mb-8 text-white/60">
          {isMentor ? "Manage your sessions" : "Track your booked sessions"}
        </p>

        {bookings.length === 0 ? (
          <div className="p-12 text-center glass-card rounded-2xl">
            <p className="text-white/40">No bookings yet</p>
            {!isMentor && (
              <Link href="/mentors" className="inline-block mt-4 px-5 py-2.5 text-sm font-medium rounded-full bg-primary text-white hover:opacity-90">
                Browse Mentors
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {bookings.map((booking) => {
              const otherParty = isMentor ? booking.menteeId : booking.mentorId;
              const session = booking.session;
              const isLive = session?.status === "live";
              const isScheduled = session?.status === "scheduled";
              const isCompleted = booking.status === "completed";
              const showJoin = isLive || (isScheduled && new Date(booking.startTime) <= new Date(Date.now() + 15 * 60 * 1000));

              return (
                <div key={booking._id} className="p-6 glass-card rounded-2xl">
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-white/40" />
                        <p className="font-medium text-primary">{otherParty?.name || "Unknown"}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-white/40" />
                        <p className="text-sm text-white/60">
                          {new Date(booking.startTime).toLocaleDateString("en-US", {
                            weekday: "long", year: "numeric", month: "long", day: "numeric",
                            hour: "2-digit", minute: "2-digit",
                          })}
                        </p>
                      </div>

                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-full ${statusStyles[booking.status] || "bg-white/5 text-white/60"}`}>
                        {booking.status === "confirmed" && <Clock className="w-3 h-3" />}
                        {booking.status === "completed" && <CheckCircle className="w-3 h-3" />}
                        {booking.status === "cancelled" && <XCircle className="w-3 h-3" />}
                        {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      {isMentor && showJoin && (
                        <Link href={`/session/${session._id}`} className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-full bg-primary text-white hover:opacity-90">
                          <MessageSquare className="w-4 h-4" />
                          Join Session
                        </Link>
                      )}
                      {!isMentor && showJoin && (
                        <Link href={`/session/${session._id}`} className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-full bg-primary text-white hover:opacity-90">
                          <MessageSquare className="w-4 h-4" />
                          Join Session
                        </Link>
                      )}
                      {isCompleted && !isMentor && !booking.reviewed && (
                        <Link href={`/review/${booking._id}`} className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-full bg-white/[0.06] text-primary hover:bg-white/[0.10]">
                          <Star className="w-4 h-4" />
                          Review
                        </Link>
                      )}
                      {booking.status === "confirmed" && !isMentor && (
                        <div className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-full bg-green-500/10 text-green-400 border border-green-500/20">
                          <CreditCard className="w-4 h-4" />
                          Paid
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
