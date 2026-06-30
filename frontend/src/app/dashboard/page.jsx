"use client";
import { useMyBookings } from "@/lib/hooks/useBookings";
import Navbar from "../components/shared/Navbar";
import Avatar from "../components/shared/Avatar";
import useAuthStore from "@/lib/store/authStore";
import api from "@/lib/axios";
import {
  ProfileSkeleton,
  StatsCardSkeleton,
  CardSkeleton,
} from "../components/shared/LoadingSkeleton";
import { PageError } from "../components/shared/PageError";
import usePageTitle from "@/lib/hooks/usePageTitle";
import { toast } from "sonner";
import { useState, useRef } from "react";
import Link from "next/link";
import {
  Calendar,
  BookOpen,
  CheckCircle,
  Clock,
  Mail,
  Camera,
  User,
  CreditCard,
  MessageSquare,
  Star,
  AlertCircle,
} from "lucide-react";

const statusLabels = {
  upcoming: { label: "Upcoming", style: "bg-blue-500/10 text-blue-400" },
  ready_to_start: { label: "Ready", style: "bg-green-500/10 text-green-400" },
  active: { label: "Active", style: "glass-badge" },
  expired: { label: "Expired", style: "bg-red-500/10 text-red-400" },
  completed: { label: "Completed", style: "bg-white/5 text-gray-400" },
};

export default function MenteeDashboard() {
  usePageTitle("Dashboard");
  const { user, updateUser } = useAuthStore();
  const { data, isLoading, isError, error, refetch } = useMyBookings();
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const fileInputRef = useRef(null);

  const handlePhotoChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Photo must be under 5MB");
      return;
    }
    setUploadingPhoto(true);
    try {
      const formData = new FormData();
      formData.append("photo", file);
      const res = await api.post("/api/users/photo", formData);
      if (res.data.success) {
        updateUser({ photo: res.data.photo });
        toast.success("Photo updated");
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to upload photo");
    } finally {
      setUploadingPhoto(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  if (isError) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <PageError
          message={error?.response?.data?.message || "Failed to load dashboard"}
          onRetry={refetch}
        />
      </div>
    );
  }

  if (isLoading)
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="px-4 py-12 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-[320px_1fr]">
            <ProfileSkeleton />
            <div className="space-y-8">
              <div className="h-8 rounded bg-white/[0.06] w-48 animate-pulse" />
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
    active: bookings.filter((b) => b.status === "payment_held" || b.status === "completed").length,
  };

  return (
    <main className="min-h-screen bg-background">
      <Navbar />

      <div className="px-4 py-12 mx-auto max-w-7xl sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[320px_1fr]">
          <aside>
            <div className="p-6 card">
              <div className="flex flex-col items-center text-center">
                <div className="relative">
                  <Avatar src={user?.photo} name={user?.name} size="lg" />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadingPhoto}
                    className="absolute bottom-0 right-0 p-1.5 btn-primary rounded-full disabled:opacity-50"
                    aria-label="Upload photo"
                  >
                    <Camera className="w-3.5 h-3.5" />
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoChange}
                    className="hidden"
                  />
                </div>
                <h2 className="mt-4 text-2xl font-semibold text-foreground">
                  {user?.name || "Mentee"}
                </h2>
                <p className="mt-1 text-sm capitalize text-muted">{user?.role || "mentee"}</p>
              </div>

              <div className="mt-6 space-y-3">
                <div className="flex items-center gap-3 p-3 rounded-xl bg-background">
                  <Mail className="w-4 h-4 text-muted" />
                  <span className="text-sm text-muted-foreground">{user?.email || "No email"}</span>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-xl bg-background">
                  <BookOpen className="w-4 h-4 text-muted" />
                  <span className="text-sm text-muted-foreground">
                    {bookings.length} session{bookings.length !== 1 ? "s" : ""}
                  </span>
                </div>
              </div>
            </div>
          </aside>

          <div className="space-y-8">
            <div>
              <Link
                href="/mentors"
                className="inline-flex items-center gap-1 mb-2 text-xs transition text-white/40 hover:text-primary"
              >
                ← Browse Mentors
              </Link>
              <h1 className="text-3xl font-semibold text-foreground">My Sessions</h1>
              <p className="mt-1 text-muted">Track your mentoring sessions and requests</p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                href="/my-bookings"
                className="px-4 py-2 text-sm font-medium transition rounded-full bg-surface text-primary border border-white/5 hover:bg-white/[0.06]"
              >
                All Bookings
              </Link>
              <Link
                href="/my-sessions"
                className="px-4 py-2 text-sm font-medium transition rounded-full bg-surface text-primary border border-white/5 hover:bg-white/[0.06]"
              >
                Active Sessions
              </Link>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="p-4 glass-card rounded-2xl">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-background">
                    <Clock className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-white/60">Pending</p>
                    <p className="text-2xl font-bold text-primary">{statusCounts.pending}</p>
                  </div>
                </div>
              </div>
              <div className="p-4 glass-card rounded-2xl">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-background">
                    <CheckCircle className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-white/60">Accepted</p>
                    <p className="text-2xl font-bold text-primary">{statusCounts.accepted}</p>
                  </div>
                </div>
              </div>
              <div className="p-4 glass-card rounded-2xl">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-background">
                    <Calendar className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-white/60">Completed</p>
                    <p className="text-2xl font-bold text-primary">{statusCounts.completed}</p>
                  </div>
                </div>
              </div>
            </div>

            <section>
              <h2 className="mb-4 text-xl font-semibold text-primary">All Bookings</h2>

              {bookings.length === 0 ? (
                <div className="p-12 text-center glass-card rounded-2xl">
                  <p className="text-white/40">No bookings yet</p>
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
                        className="flex items-center justify-between p-5 glass-card rounded-2xl transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl"
                      >
                        <div className="space-y-1.5">
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4 text-white/40" />
                            <p className="font-medium text-primary">
                              {booking.mentorId?.name || "Unknown"}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-white/40" />
                            <p className="text-sm text-white/60">
                              {new Date(booking.scheduledAt).toLocaleDateString("en-US", {
                                weekday: "long",
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                              })}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          {isAccepted && (
                            <Link
                              href={`/payment/${booking._id}`}
                              className="inline-flex items-center gap-1.5 px-4 py-1.5 text-sm font-medium btn-primary rounded-full"
                            >
                              <CreditCard className="w-4 h-4" />
                              Pay Now
                            </Link>
                          )}

                          {isPaymentHeld && ts === "active" && (
                            <Link
                              href={`/session/${booking._id}`}
                              className="inline-flex items-center gap-1.5 px-4 py-1.5 text-sm font-medium rounded-full bg-white/[0.06] text-primary hover:bg-white/[0.10]"
                            >
                              <MessageSquare className="w-4 h-4" />
                              Chat
                            </Link>
                          )}

                          {isCompleted && !booking.reviewed && (
                            <Link
                              href={`/review/${booking._id}`}
                              className="inline-flex items-center gap-1.5 px-4 py-1.5 text-sm font-medium rounded-full bg-white/[0.06] text-primary hover:bg-white/[0.10]"
                            >
                              <Star className="w-4 h-4" />
                              Review
                            </Link>
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

                          {ts && statusInfo ? (
                            <span
                              className={`inline-flex items-center gap-1 px-3 py-1 text-xs font-medium rounded-full ${statusInfo.style}`}
                            >
                              {ts === "expired" && <AlertCircle className="w-3 h-3" />}
                              {statusInfo.label}
                            </span>
                          ) : (
                            <span
                              className={`px-4 py-1.5 text-sm font-medium rounded-full capitalize bg-white/[0.06] text-primary`}
                            >
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
