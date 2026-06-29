"use client";
import { useMyBookings } from "@/lib/hooks/useBookings";
import { useStartSession } from "@/lib/hooks/useSession";
import useAuthStore from "@/lib/store/authStore";
import Navbar from "@/app/components/shared/Navbar";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Spinner, CardSkeleton } from "@/app/components/shared/LoadingSkeleton";
import { Calendar, User, MessageSquare, Play, AlertCircle, Clock } from "lucide-react";
import usePageTitle from "@/lib/hooks/usePageTitle";
import { toast } from "sonner";

const statusLabels = {
  upcoming: { label: "Upcoming", style: "bg-blue-500/10 text-blue-400" },
  ready_to_start: { label: "Ready to Start", style: "bg-green-500/10 text-green-400" },
  active: { label: "Active", style: "glass-badge" },
  expired: { label: "Expired", style: "bg-red-500/10 text-red-400" },
  completed: { label: "Completed", style: "bg-white/5 text-gray-400" },
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
  const sessions = bookings.filter((b) => b.status === "payment_held" || b.status === "completed");
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
        <h1 className="mb-2 text-3xl font-semibold text-primary font-fugaz">My Sessions</h1>
        <p className="mb-8 text-white/60">
          {isMentor
            ? "Manage your active and completed mentoring sessions"
            : "View your upcoming and past mentoring sessions"}
        </p>

        {sessions.length === 0 ? (
          <div className="p-12 text-center glass-card rounded-2xl">
            <p className="text-white/40">No sessions yet. Book a mentor to get started!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {sessions.map((booking) => {
              const otherParty = isMentor ? booking.menteeId : booking.mentorId;
              let ts = booking.timeStatus;
              if (ts === "ready_to_start") {
                const now = Date.now();
                const scheduled = new Date(booking.scheduledAt).getTime();
                if (now > scheduled + 15 * 60 * 1000) ts = "expired";
              }
              const statusInfo = statusLabels[ts] || statusLabels.upcoming;

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
                      <span
                        className={`inline-flex items-center gap-1 px-3 py-1 text-xs font-medium rounded-full ${statusInfo.style}`}
                      >
                        {ts === "expired" && <AlertCircle className="w-3 h-3" />}
                        {ts === "ready_to_start" && <Play className="w-3 h-3" />}
                        {statusInfo.label}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {ts === "upcoming" && (
                        <div className="text-sm text-white/40 px-2">
                          <Clock className="inline w-4 h-4 mr-1" />
                          {(() => {
                            const ms = new Date(booking.scheduledAt) - new Date();
                            const m = Math.floor(ms / 60000);
                            const h = Math.floor(m / 60);
                            return `${h > 0 ? `${h}h ` : ""}${m % 60}m`;
                          })()}
                        </div>
                      )}
                      {isMentor && (ts === "ready_to_start" || ts === "active") && (
                        <button
                          onClick={() => handleStart(booking)}
                          className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium btn-primary rounded-full"
                        >
                          <Play className="w-4 h-4" />
                          {ts === "active" ? "Join Session" : "Start Session"}
                        </button>
                      )}
                      {ts === "active" && (
                        <Link
                          href={`/session/${booking._id}`}
                          className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-full bg-white/[0.06] text-primary hover:bg-white/[0.10]"
                        >
                          <MessageSquare className="w-4 h-4" />
                          Chat
                        </Link>
                      )}
                      {ts === "expired" && (
                        <span className="px-4 py-2 text-sm text-red-500">Session Expired</span>
                      )}
                      {ts === "completed" && (
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
