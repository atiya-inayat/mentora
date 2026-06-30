"use client";
import { useMyBookings } from "@/lib/hooks/useBookings";
import { useStartSession } from "@/lib/hooks/useSession";
import useAuthStore from "@/lib/store/authStore";
import Navbar from "@/app/components/shared/Navbar";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Spinner, CardSkeleton } from "@/app/components/shared/LoadingSkeleton";
import {
  Calendar,
  User,
  Clock,
  CheckCircle,
  CreditCard,
  MessageSquare,
  Play,
  Star,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";
import usePageTitle from "@/lib/hooks/usePageTitle";

const statusLabels = {
  upcoming: { label: "Upcoming", style: "bg-blue-500/10 text-blue-400" },
  ready_to_start: { label: "Ready to Start", style: "bg-green-500/10 text-green-400" },
  active: { label: "Active", style: "glass-badge" },
  expired: { label: "Expired", style: "bg-red-500/10 text-red-400" },
  completed: { label: "Completed", style: "bg-white/5 text-gray-400" },
};

export default function MyBookingsPage() {
  usePageTitle("My Bookings");
  const { user } = useAuthStore();
  const router = useRouter();
  const { data, isLoading } = useMyBookings();
  const { mutate: startSession } = useStartSession();

  if (isLoading)
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="px-4 py-12 mx-auto max-w-4xl sm:px-6 lg:px-8">
          <div className="h-8 rounded bg-white/[0.06] w-48 animate-pulse mb-8" />
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
      onError: (err) => toast.error(err?.response?.data?.message || "Cannot start session"),
    });
  };

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
        <h1 className="mb-2 text-3xl font-semibold text-foreground">
          {isMentor ? "All Requests" : "My Bookings"}
        </h1>
        <p className="mb-8 text-muted">
          {isMentor
            ? "Manage session requests from mentees"
            : "Track your booked mentoring sessions"}
        </p>

        {bookings.length === 0 ? (
          <div className="p-12 text-center glass-card rounded-2xl">
            <p className="text-white/40">No bookings yet</p>
            {!isMentor && (
              <Link
                href="/mentors"
                className="inline-block mt-4 px-5 py-2.5 text-sm font-medium btn-primary rounded-full"
              >
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
                <div
                  key={booking._id}
                  className="p-6 glass-card rounded-2xl"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-white/40" />
                        <p className="font-medium text-primary">{otherParty?.name || "Unknown"}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-white/40" />
                        <p className="text-sm text-white/60">
                          {new Date(booking.scheduledAt).toLocaleDateString("en-US", {
                            weekday: "long",
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                      {ts && statusInfo ? (
                        <span
                          className={`inline-flex items-center gap-1 px-3 py-1 text-xs font-medium rounded-full ${statusInfo.style}`}
                        >
                          {ts === "expired" && <AlertCircle className="w-3 h-3" />}
                          {statusInfo.label}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-3 py-1 text-xs font-medium rounded-full glass-badge">
                          {booking.status}
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      {isMentor &&
                        isPaymentHeld &&
                        (ts === "ready_to_start" || ts === "active") && (
                          <button
                            onClick={() => handleStart(booking)}
                            className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium btn-primary rounded-full"
                          >
                            <Play className="w-4 h-4" />
                            Start Session
                          </button>
                        )}

                      {!isMentor && isAccepted && (
                        <Link
                          href={`/payment/${booking._id}`}
                          className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium btn-primary rounded-full"
                        >
                          <CreditCard className="w-4 h-4" />
                          Pay Now
                        </Link>
                      )}

                      {isPaymentHeld && ts === "active" && (
                        <Link
                          href={`/session/${booking._id}`}
                          className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-full glass-badge hover:bg-white/[0.10]"
                        >
                          <MessageSquare className="w-4 h-4" />
                          Chat
                        </Link>
                      )}

                      {isPaymentHeld && ts === "expired" && (
                        <span className="px-4 py-2 text-sm text-red-500">Expired</span>
                      )}

                      {isPaymentHeld && ts === "upcoming" && (
                        <div className="text-sm text-white/40">
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
                        <Link
                          href={`/review/${booking._id}`}
                          className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-full glass-badge hover:bg-white/[0.10]"
                        >
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
