"use client";
import { useMyBookings } from "@/lib/hooks/useBookings";
import { useJoinSession } from "@/lib/hooks/useSession";
import useAuthStore from "@/lib/store/authStore";
import Navbar from "@/app/components/shared/Navbar";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Spinner, CardSkeleton } from "@/app/components/shared/LoadingSkeleton";
import { Calendar, User, MessageSquare, Clock, CheckCircle } from "lucide-react";
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
  const { mutate: joinSession, isPending: joining } = useJoinSession();

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

  const handleJoin = (bookingId) => {
    joinSession(bookingId, {
      onSuccess: (res) => {
        if (res?.data?._id) router.push(`/session/${res.data._id}`);
      },
      onError: (err) => toast.error(err?.response?.data?.message || "Cannot join session"),
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
              const startTime = new Date(booking.startTime);
              const nowTime = new Date().getTime();
              const joinWindow = new Date(startTime.getTime() - 15 * 60 * 1000);
              const canJoin = nowTime >= joinWindow.getTime();
              const isLive = session?.status === "live";
              const isWaiting = session?.status === "waiting";
              const hasSession = !!session;
              const msToStart = startTime.getTime() - nowTime;
              const totalMins = Math.max(0, Math.ceil(msToStart / 60000));

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
                      {(isLive || isWaiting) && hasSession && (
                        <Link
                          href={`/session/${session._id}`}
                          className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium btn-primary rounded-full"
                        >
                          Join Session
                        </Link>
                      )}
                      {!hasSession && canJoin && (
                        <button
                          onClick={() => handleJoin(booking._id)}
                          disabled={joining}
                          className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium btn-primary rounded-full disabled:opacity-50"
                        >
                          Join Session
                        </button>
                      )}
                      {!hasSession && !canJoin && (
                        <div className="flex flex-col items-end gap-1">
                          <span className="text-xs text-white/40">
                            Can join in {Math.floor(totalMins / 60) > 0 ? `${Math.floor(totalMins / 60)}h ` : ""}{totalMins % 60}m
                          </span>
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
