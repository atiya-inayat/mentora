"use client";
import { useMyBookings } from "@/lib/hooks/useBookings";
import { useStartSession } from "@/lib/hooks/useSession";
import useAuthStore from "@/lib/store/authStore";
import Navbar from "@/app/components/shared/Navbar";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Spinner, CardSkeleton } from "@/app/components/shared/LoadingSkeleton";
import { Calendar, User, MessageSquare, Play, AlertCircle, Clock, CheckCircle } from "lucide-react";
import usePageTitle from "@/lib/hooks/usePageTitle";
import { toast } from "sonner";

const statusStyles = {
  confirmed: "bg-blue-500/10 text-blue-400",
  completed: "bg-green-500/10 text-green-400",
  cancelled: "bg-red-500/10 text-red-400",
};

export default function MySessionsPage() {
  usePageTitle("My Sessions");
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
  const sessions = bookings.filter((b) => b.status === "confirmed" || b.status === "completed");
  const isMentor = user?.role === "mentor";

  const handleStart = (bookingId) => {
    startSession(bookingId, {
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
        <h1 className="mb-2 text-3xl font-semibold text-foreground">My Sessions</h1>
        <p className="mb-8 text-muted">
          {isMentor
            ? "Manage your active and completed mentoring sessions"
            : "View your upcoming and past mentoring sessions"}
        </p>

        {sessions.length === 0 ? (
          <div className="p-12 text-center card rounded-2xl">
            <p className="text-white/40">No sessions yet. Book a mentor to get started!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {sessions.map((booking) => {
              const otherParty = isMentor ? booking.menteeId : booking.mentorId;
              const session = booking.session;
              const isLive = session?.status === "live";
              const isScheduled = session?.status === "scheduled";
              const startTime = new Date(booking.startTime);
              const now = new Date();
              const canStart = isMentor && isScheduled && startTime <= new Date(now.getTime() + 15 * 60 * 1000);

              return (
                <div
                  key={booking._id}
                  className="p-6 card rounded-2xl"
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
                          {startTime.toLocaleDateString("en-US", {
                            weekday: "long",
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-full ${statusStyles[booking.status] || "bg-white/5 text-white/60"}`}>
                        {booking.status === "confirmed" && <Clock className="w-3 h-3" />}
                        {booking.status === "completed" && <CheckCircle className="w-3 h-3" />}
                        {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {isLive && (
                        <Link
                          href={`/session/${session._id}`}
                          className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium btn-primary rounded-full"
                        >
                          <MessageSquare className="w-4 h-4" />
                          Join Session
                        </Link>
                      )}
                      {canStart && (
                        <button
                          onClick={() => handleStart(booking._id)}
                          className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium btn-primary rounded-full"
                        >
                          <Play className="w-4 h-4" />
                          Start Session
                        </button>
                      )}
                      {isScheduled && !isMentor && (
                        <span className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-full bg-green-500/10 text-green-400 border border-green-500/20">
                          <CheckCircle className="w-4 h-4" />
                          Paid
                        </span>
                      )}
                      {isScheduled && isMentor && !canStart && (
                        <div className="text-sm text-white/40 px-2">
                          <Clock className="inline w-4 h-4 mr-1" />
                          {(() => {
                            const ms = startTime.getTime() - now.getTime();
                            const m = Math.floor(ms / 60000);
                            const h = Math.floor(m / 60);
                            return `${h > 0 ? `${h}h ` : ""}${m % 60}m`;
                          })()}
                        </div>
                      )}
                      {booking.status === "completed" && (
                        <span className="px-4 py-2 text-sm text-gray-500">Session Ended</span>
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
