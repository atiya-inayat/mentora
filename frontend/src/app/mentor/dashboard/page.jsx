"use client";
import { useMyBookings } from "@/lib/hooks/useBookings";
import { useStartSession, useEndSession } from "@/lib/hooks/useSession";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/axios";
import Navbar from "@/app/components/shared/Navbar";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Calendar, CheckCircle, Clock, User, UserPlus, Play, StopCircle, MessageSquare, AlertCircle,
} from "lucide-react";

const statusLabels = {
  upcoming: { label: "Upcoming", style: "bg-blue-100 text-blue-600" },
  ready_to_start: { label: "Ready to Start", style: "bg-green-100 text-green-600" },
  active: { label: "Active", style: "bg-primary/10 text-primary" },
  expired: { label: "Expired", style: "bg-red-100 text-red-600" },
  completed: { label: "Completed", style: "bg-gray-100 text-gray-500" },
};

export default function MentorDashboard() {
  const router = useRouter();
  const { data: profileData, isLoading: profileLoading } = useQuery({
    queryKey: ["mentorProfile"],
    queryFn: () => api.get("/api/mentors/profile/me").then((r) => r.data),
    retry: false,
  });

  const { data, isLoading } = useMyBookings();
  const { mutate: startSession } = useStartSession();
  const { mutate: endSession } = useEndSession();
  const queryClient = useQueryClient();

  const { mutate: acceptBooking } = useMutation({
    mutationFn: (bookingId) => api.put(`/api/bookings/${bookingId}/accept`),
    onSuccess: () => queryClient.invalidateQueries(["bookings"]),
  });

  const noProfile = !profileLoading && !profileData?.data;

  if (isLoading || profileLoading)
    return (
      <div className="flex items-center justify-center min-h-screen bg-background text-primary">
        Loading...
      </div>
    );

  const bookings = data?.data || [];
  const pending = bookings.filter((b) => b.status === "pending");
  const accepted = bookings.filter((b) => b.status === "accepted");
  const paid = bookings.filter((b) => b.status === "payment_held");
  const completed = bookings.filter((b) => b.status === "completed");

  const handleStartOrChat = (booking) => {
    const ts = booking.timeStatus;
    if (ts === "expired" || ts === "completed") return;
    startSession(booking._id, {
      onSuccess: (res) => {
        if (res?.data?._id) {
          router.push(`/session/${res.data._id}`);
        }
      },
      onError: (err) => {
        alert(err?.response?.data?.message || "Cannot start session");
      },
    });
  };

  return (
    <main className="min-h-screen bg-background">
      <Navbar />

      <div className="px-4 py-12 mx-auto max-w-7xl sm:px-6 lg:px-8">
        {noProfile && (
          <div className="p-6 mb-8 border shadow-lg rounded-2xl bg-primary border-primary/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-background/20">
                  <UserPlus className="w-6 h-6 text-background" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-background">
                    Complete Your Mentor Profile
                  </h2>
                  <p className="text-sm text-background/70">
                    Set up your bio, skills, and rate to start receiving bookings
                  </p>
                </div>
              </div>
              <Link
                href="/mentor/profile/new"
                className="px-5 py-2.5 text-sm font-medium transition-all rounded-full bg-background text-primary hover:opacity-90"
              >
                Create Profile
              </Link>
            </div>
          </div>
        )}

        <div className="mb-10">
          <h1 className="text-4xl font-semibold text-primary font-fugaz">
            Mentor Dashboard
          </h1>
          <p className="mt-2 text-primary/70">
            Manage your mentoring sessions and requests
          </p>
        </div>

        <div className="flex flex-wrap gap-3 mb-8">
          <Link
            href="/my-bookings"
            className="px-4 py-2 text-sm font-medium transition rounded-full bg-surface text-primary border border-primary/20 hover:bg-primary/10"
          >
            All Requests
          </Link>
          <Link
            href="/my-sessions"
            className="px-4 py-2 text-sm font-medium transition rounded-full bg-surface text-primary border border-primary/20 hover:bg-primary/10"
          >
            My Sessions
          </Link>
        </div>

        <div className="grid gap-6 mb-12 sm:grid-cols-3">
          <div className="p-6 border shadow-lg rounded-2xl bg-surface border-primary/20">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-background">
                <Clock className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-primary/70">Pending Requests</p>
                <p className="text-3xl font-bold text-primary">{pending.length}</p>
              </div>
            </div>
          </div>
          <div className="p-6 border shadow-lg rounded-2xl bg-surface border-primary/20">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-background">
                <CheckCircle className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-primary/70">Accepted Sessions</p>
                <p className="text-3xl font-bold text-primary">{accepted.length}</p>
              </div>
            </div>
          </div>
          <div className="p-6 border shadow-lg rounded-2xl bg-surface border-primary/20">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-background">
                <Play className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-primary/70">Active / Completed</p>
                <p className="text-3xl font-bold text-primary">{paid.length + completed.length}</p>
              </div>
            </div>
          </div>
        </div>

        <section className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold text-primary">Pending Requests</h2>
            <span className="px-4 py-1 text-sm border rounded-full bg-surface text-primary border-primary/20">
              {pending.length} pending
            </span>
          </div>

          {pending.length === 0 ? (
            <div className="p-12 text-center border shadow-lg rounded-2xl bg-surface border-primary/20">
              <p className="text-primary/60">No pending requests</p>
            </div>
          ) : (
            <div className="space-y-4">
              {pending.map((booking) => (
                <div key={booking._id} className="flex items-center justify-between p-6 border shadow-lg rounded-2xl bg-surface border-primary/20 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-primary/60" />
                      <p className="font-medium text-primary">{booking.menteeId?.name || "Unknown"}</p>
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
                  <button
                    onClick={() => acceptBooking(booking._id)}
                    className="px-5 py-2.5 font-medium transition-all rounded-full bg-primary text-background hover:opacity-90"
                  >
                    Accept
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>

        {paid.length > 0 && (
          <section className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold text-primary">Active Sessions</h2>
              <span className="px-4 py-1 text-sm border rounded-full bg-surface text-primary border-primary/20">
                {paid.length} ready
              </span>
            </div>

            <div className="space-y-4">
              {paid.map((booking) => {
                const ts = booking.timeStatus;
                const statusInfo = statusLabels[ts] || statusLabels.upcoming;

                return (
                  <div key={booking._id} className="flex items-center justify-between p-6 border shadow-lg rounded-2xl bg-surface border-primary/20">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-primary/60" />
                        <p className="font-medium text-primary">{booking.menteeId?.name || "Unknown"}</p>
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
                      <span className={`inline-flex items-center gap-1 px-3 py-1 text-xs font-medium rounded-full ${statusInfo.style}`}>
                        {ts === "expired" && <AlertCircle className="w-3 h-3" />}
                        {ts === "ready_to_start" && <Play className="w-3 h-3" />}
                        {ts === "active" && <MessageSquare className="w-3 h-3" />}
                        {statusInfo.label}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {ts === "upcoming" && (
                        <div className="text-sm text-primary/50 px-2">
                          <Clock className="inline w-4 h-4 mr-1" />
                          Starts{" "}
                          {(() => {
                            const ms = new Date(booking.scheduledAt) - new Date();
                            const m = Math.floor(ms / 60000);
                            const h = Math.floor(m / 60);
                            return h > 0 ? `${h}h ${m % 60}m` : `${m}m`;
                          })()}
                        </div>
                      )}
                      {(ts === "ready_to_start" || ts === "active") && (
                        <button
                          onClick={() => handleStartOrChat(booking)}
                          className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-full bg-primary text-background hover:opacity-90"
                        >
                          <Play className="w-4 h-4" />
                          Start Session
                        </button>
                      )}
                      {ts === "expired" && (
                        <span className="px-4 py-2 text-sm text-red-500">Expired</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold text-primary">Accepted Sessions</h2>
            <span className="px-4 py-1 text-sm border rounded-full bg-surface text-primary border-primary/20">
              {accepted.length} waiting for payment
            </span>
          </div>

          {accepted.length === 0 ? (
            <div className="p-12 text-center border shadow-lg rounded-2xl bg-surface border-primary/20">
              <p className="text-primary/60">No accepted sessions yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {accepted.map((booking) => (
                <div key={booking._id} className="flex items-center justify-between p-6 border shadow-lg rounded-2xl bg-surface border-primary/20">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-primary/60" />
                      <p className="font-medium text-primary">{booking.menteeId?.name || "Unknown"}</p>
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
                  <span className="px-4 py-1.5 text-sm font-medium rounded-full bg-primary/10 text-primary">
                    Awaiting payment
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
