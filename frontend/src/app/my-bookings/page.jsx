"use client";
import { useMyBookings } from "@/lib/hooks/useBookings";
import { useStartSession } from "@/lib/hooks/useSession";
import useAuthStore from "@/lib/store/authStore";
import Navbar from "@/app/components/shared/Navbar";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Spinner, CardSkeleton } from "@/app/components/shared/LoadingSkeleton";
import {
  Calendar, User, Clock, CheckCircle, CreditCard, MessageSquare, Play, Star, AlertCircle,
} from "lucide-react";

const statusLabels = {
  upcoming: { label: "Upcoming", style: "bg-blue-100 text-blue-600" },
  ready_to_start: { label: "Ready to Start", style: "bg-green-100 text-green-600" },
  active: { label: "Active", style: "bg-primary/10 text-primary" },
  expired: { label: "Expired", style: "bg-red-100 text-red-600" },
  completed: { label: "Completed", style: "bg-gray-100 text-gray-500" },
};

export default function MyBookingsPage() {
  const { user } = useAuthStore();
  const router = useRouter();
  const { data, isLoading } = useMyBookings();
  const { mutate: startSession } = useStartSession();

  if (isLoading)
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="px-4 py-12 mx-auto max-w-4xl sm:px-6 lg:px-8">
          <div className="h-8 rounded bg-primary/10 w-48 animate-pulse mb-8" />
          <CardSkeleton />
          <CardSkeleton />
        </div>
      </div>
    );

  const bookings = data?.data || [];
  const isMentor = user?.role === "mentor";

  const handleStart = (booking) => {
    const ts = booking.timeStatus;
    if (ts === "expired" || ts === "completed") return;
    startSession(booking._id, {
      onSuccess: (res) => {
        if (res?.data?._id) router.push(`/session/${res.data._id}`);
      },
      onError: (err) => alert(err?.response?.data?.message || "Cannot start session"),
    });
  };

  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      <div className="px-4 py-12 mx-auto max-w-4xl sm:px-6 lg:px-8">
        <Link href={isMentor ? "/mentor/dashboard" : "/dashboard"} className="inline-flex items-center gap-1 mb-2 text-xs transition text-primary/60 hover:text-primary">
          ← Back to Dashboard
        </Link>
        <h1 className="mb-2 text-3xl font-semibold text-primary font-fugaz">
          {isMentor ? "All Requests" : "My Bookings"}
        </h1>
        <p className="mb-8 text-primary/70">
          {isMentor ? "Manage session requests from mentees" : "Track your booked mentoring sessions"}
        </p>

        {bookings.length === 0 ? (
          <div className="p-12 text-center border shadow-lg rounded-2xl bg-surface border-primary/20">
            <p className="text-primary/60">No bookings yet</p>
            {!isMentor && (
              <Link href="/mentors" className="inline-block mt-4 px-5 py-2.5 text-sm font-medium rounded-full bg-primary text-background hover:opacity-90">
                Browse Mentors
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {bookings.map((booking) => {
              const otherParty = isMentor ? booking.menteeId : booking.mentorId;
              const isAccepted = booking.status === "accepted";
              const isPaymentHeld = booking.status === "payment_held";
              const isCompleted = booking.status === "completed";
              const isPending = booking.status === "pending";
              const ts = booking.timeStatus;
              const statusInfo = statusLabels[ts];

              return (
                <div key={booking._id} className="p-6 border shadow-lg rounded-2xl bg-surface border-primary/20">
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-primary/60" />
                        <p className="font-medium text-primary">{otherParty?.name || "Unknown"}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-primary/60" />
                        <p className="text-sm text-primary/70">
                          {new Date(booking.scheduledAt).toLocaleDateString("en-US", {
                            weekday: "long", year: "numeric", month: "long", day: "numeric",
                            hour: "2-digit", minute: "2-digit",
                          })}
                        </p>
                      </div>
                      {ts && statusInfo ? (
                        <span className={`inline-flex items-center gap-1 px-3 py-1 text-xs font-medium rounded-full ${statusInfo.style}`}>
                          {ts === "expired" && <AlertCircle className="w-3 h-3" />}
                          {statusInfo.label}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-3 py-1 text-xs font-medium rounded-full bg-primary/10 text-primary">
                          {booking.status}
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      {isMentor && isPaymentHeld && (ts === "ready_to_start" || ts === "active") && (
                        <button
                          onClick={() => handleStart(booking)}
                          className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-full bg-primary text-background hover:opacity-90"
                        >
                          <Play className="w-4 h-4" />
                          Start Session
                        </button>
                      )}

                      {!isMentor && isAccepted && (
                        <Link href={`/payment/${booking._id}`} className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-full bg-primary text-background hover:opacity-90">
                          <CreditCard className="w-4 h-4" />
                          Pay Now
                        </Link>
                      )}

                      {isPaymentHeld && ts === "active" && (
                        <Link href={`/session/${booking._id}`} className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-full bg-primary/10 text-primary hover:bg-primary/20">
                          <MessageSquare className="w-4 h-4" />
                          Chat
                        </Link>
                      )}

                      {isPaymentHeld && ts === "expired" && (
                        <span className="px-4 py-2 text-sm text-red-500">Expired</span>
                      )}

                      {isPaymentHeld && ts === "upcoming" && (
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

                      {isCompleted && !isMentor && !booking.reviewed && (
                        <Link href={`/review/${booking._id}`} className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-full bg-primary/10 text-primary hover:bg-primary/20">
                          <Star className="w-4 h-4" />
                          Review
                        </Link>
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
