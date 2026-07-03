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
  MessageSquare,
  Star,
  XCircle,
} from "lucide-react";

const statusStyles = {
  confirmed: "bg-blue-500/10 text-blue-400",
  completed: "bg-green-500/10 text-green-400",
  cancelled: "bg-red-500/10 text-red-400",
  no_show: "bg-yellow-500/10 text-yellow-400",
  refunded: "bg-purple-500/10 text-purple-400",
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
  const now = new Date();

  const confirmed = bookings.filter((b) => b.status === "confirmed");
  const upcoming = confirmed.filter((b) => new Date(b.startTime) > now);
  const completed = bookings.filter((b) => b.status === "completed");
  const cancelled = bookings.filter((b) => b.status === "cancelled");

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
                <p className="mt-1 text-sm capitalize text-muted">
                  {user?.role || "mentee"}
                </p>
              </div>

              <div className="mt-6 space-y-3">
                <div className="flex items-center gap-3 p-3 rounded-xl bg-background">
                  <Mail className="w-4 h-4 text-muted" />
                  <span className="text-sm text-muted-foreground">
                    {user?.email || "No email"}
                  </span>
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
                className="inline-flex items-center gap-1 mb-2 text-xs transition text-muted hover:text-foreground"
              >
                Browse Mentors
              </Link>
              <h1 className="text-3xl font-semibold text-foreground">
                Welcome back, {user?.name}
              </h1>
              <p className="mt-1 text-muted">Track your mentoring sessions</p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                href="/bookings"
                className="px-4 py-2 text-sm font-medium transition rounded-full bg-surface text-primary border border-white/5 hover:bg-white/[0.06]"
              >
                All Bookings
              </Link>
              <Link
                href="/mentors"
                className="px-4 py-2 text-sm font-medium transition rounded-full bg-surface text-primary border border-white/5 hover:bg-white/[0.06]"
              >
                Find a Mentor
              </Link>
            </div>

            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
              <div className="p-4 card">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-background">
                    <Calendar className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-muted">Upcoming</p>
                    <p className="text-2xl font-bold text-foreground">
                      {upcoming.length}
                    </p>
                  </div>
                </div>
              </div>
              <div className="p-4 card">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-background">
                    <CheckCircle className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-muted">Completed</p>
                    <p className="text-2xl font-bold text-foreground">
                      {completed.length}
                    </p>
                  </div>
                </div>
              </div>
              <div className="p-4 card">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-background">
                    <BookOpen className="w-5 h-5 text-muted" />
                  </div>
                  <div>
                    <p className="text-xs text-muted">Total</p>
                    <p className="text-2xl font-bold text-foreground">
                      {bookings.length}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <section>
              <h2 className="mb-4 text-xl font-semibold text-primary">
                Upcoming Sessions
              </h2>

              {upcoming.length === 0 ? (
                <div className="p-12 text-center card">
                  <p className="text-white/40">No upcoming sessions</p>
                  {!user?.role === "mentor" && (
                    <Link
                      href="/mentors"
                      className="inline-block mt-4 px-5 py-2.5 text-sm font-medium btn-primary rounded-full"
                    >
                      Browse Mentors
                    </Link>
                  )}
                </div>
              ) : (
                <div className="space-y-3">
                  {upcoming.map((booking) => {
                    const session = booking.session;
                    const isLive = session?.status === "live";
                    const isScheduled = session?.status === "scheduled";
                    const startTime = new Date(booking.startTime);
                    const showJoin =
                      isLive ||
                      (isScheduled &&
                        startTime <= new Date(now.getTime() + 15 * 60 * 1000));

                    return (
                      <div
                        key={booking._id}
                        className="flex items-center justify-between p-5 card transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl"
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
                        </div>

                        <div className="flex items-center gap-2">
                          {showJoin && session && (
                            <Link
                              href={`/session/${session._id}`}
                              className="inline-flex items-center gap-1.5 px-4 py-1.5 text-sm font-medium btn-primary rounded-full"
                            >
                              <MessageSquare className="w-4 h-4" />
                              Join Session
                            </Link>
                          )}
                          {!showJoin && (
                            <span className="inline-flex items-center gap-1.5 px-4 py-1.5 text-sm font-medium rounded-full bg-green-500/10 text-green-400 border border-green-500/20">
                              <CheckCircle className="w-4 h-4" />
                              Paid
                            </span>
                          )}
                          <span
                            className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-full ${statusStyles[booking.status] || "bg-white/5 text-white/60"}`}
                          >
                            <Clock className="w-3 h-3" />
                            {booking.status.charAt(0).toUpperCase() +
                              booking.status.slice(1)}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>

            {completed.length > 0 && (
              <section>
                <h2 className="mb-4 text-xl font-semibold text-primary">
                  Completed Sessions
                </h2>
                <div className="space-y-3">
                  {completed.map((booking) => (
                    <div
                      key={booking._id}
                      className="flex items-center justify-between p-5 card"
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
                            {new Date(booking.startTime).toLocaleDateString(
                              "en-US",
                              {
                                weekday: "long",
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              },
                            )}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span
                          className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-full ${statusStyles[booking.status]}`}
                        >
                          <CheckCircle className="w-3 h-3" />
                          Completed
                        </span>
                        {!booking.reviewed && (
                          <Link
                            href={`/review/${booking._id}`}
                            className="inline-flex items-center gap-1.5 px-4 py-1.5 text-sm font-medium rounded-full bg-white/[0.06] text-primary hover:bg-white/[0.10]"
                          >
                            <Star className="w-4 h-4" />
                            Review
                          </Link>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {cancelled.length > 0 && (
              <section>
                <h2 className="mb-4 text-xl font-semibold text-primary">
                  Cancelled
                </h2>
                <div className="space-y-3">
                  {cancelled.map((booking) => (
                    <div
                      key={booking._id}
                      className="flex items-center justify-between p-5 card"
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
                            {new Date(booking.startTime).toLocaleDateString(
                              "en-US",
                              {
                                weekday: "long",
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                              },
                            )}
                          </p>
                        </div>
                      </div>
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-full ${statusStyles[booking.status]}`}
                      >
                        <XCircle className="w-3 h-3" />
                        Cancelled
                      </span>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
