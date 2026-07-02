"use client";
import { useMyBookings } from "@/lib/hooks/useBookings";
import { useStartSession, useEndSession } from "@/lib/hooks/useSession";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/axios";
import Navbar from "@/app/components/shared/Navbar";
import Avatar from "@/app/components/shared/Avatar";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import useAuthStore from "@/lib/store/authStore";
import { StatsCardSkeleton, CardSkeleton } from "@/app/components/shared/LoadingSkeleton";
import { PageError } from "@/app/components/shared/PageError";
import { toast } from "sonner";
import usePageTitle from "@/lib/hooks/usePageTitle";
import {
  Calendar,
  CheckCircle,
  Clock,
  Camera,
  User,
  UserPlus,
  Play,
  StopCircle,
  MessageSquare,
  XCircle,
  Star,
} from "lucide-react";

const statusStyles = {
  confirmed: "bg-blue-500/10 text-blue-400",
  completed: "bg-green-500/10 text-green-400",
  cancelled: "bg-red-500/10 text-red-400",
  no_show: "bg-yellow-500/10 text-yellow-400",
  refunded: "bg-purple-500/10 text-purple-400",
};

export default function MentorDashboard() {
  usePageTitle("Mentor Dashboard");
  const router = useRouter();
  const { user, updateUser } = useAuthStore();
  const fileInputRef = useRef(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const {
    data: profileData,
    isLoading: profileLoading,
    isError: profileError,
  } = useQuery({
    queryKey: ["mentorProfile"],
    queryFn: () => api.get("/api/mentors/profile/me").then((r) => r.data),
    retry: false,
  });

  const { data, isLoading, isError, error, refetch } = useMyBookings();
  const { mutate: startSession } = useStartSession();
  const { mutate: endSession } = useEndSession();

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

  const noProfile = !profileLoading && !profileData?.data;

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

  if (isLoading || profileLoading)
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="px-4 py-12 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="h-8 rounded bg-white/[0.06] w-64 animate-pulse mb-8" />
          <div className="grid gap-6 mb-12 sm:grid-cols-3">
            <StatsCardSkeleton />
            <StatsCardSkeleton />
            <StatsCardSkeleton />
          </div>
          <CardSkeleton />
          <CardSkeleton />
        </div>
      </div>
    );

  const bookings = data?.data || [];
  const now = new Date();

  const confirmed = bookings.filter((b) => b.status === "confirmed");
  const upcoming = confirmed.filter((b) => new Date(b.startTime) >= now);
  const completed = bookings.filter((b) => b.status === "completed");

  const handleStartSession = (bookingId) => {
    startSession(bookingId, {
      onSuccess: (res) => {
        if (res?.data?._id) {
          router.push(`/session/${res.data._id}`);
        }
      },
      onError: (err) => toast.error(err?.response?.data?.message || "Cannot start session"),
    });
  };

  return (
    <main className="min-h-screen bg-background">
      <Navbar />

      <div className="px-4 py-12 mx-auto max-w-7xl sm:px-6 lg:px-8">
        {noProfile && (
          <div className="p-6 mb-8 border shadow-lg rounded-2xl bg-primary border-white/5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-background/20">
                  <UserPlus className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-white">
                    Complete Your Mentor Profile
                  </h2>
                  <p className="text-sm text-white/70">
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

        <div className="flex items-center justify-between mb-10">
          <div>
            <Link
              href="/mentors"
              className="inline-flex items-center gap-1 mb-2 text-xs transition text-white/40 hover:text-primary"
            >
              ← Browse Mentors
            </Link>
            <h1 className="text-4xl font-semibold text-foreground">Mentor Dashboard</h1>
            <p className="mt-2 text-muted">Manage your mentoring sessions</p>
          </div>
          <div className="relative flex-shrink-0">
            <Avatar src={user?.photo} name={user?.name} size="lg" />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadingPhoto}
              className="absolute bottom-0 right-0 p-1.5 btn-primary rounded-full disabled:opacity-50"
              aria-label="Upload photo"
            >
              <Camera className="w-4 h-4" />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handlePhotoChange}
              className="hidden"
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-3 mb-8">
          <Link
            href="/bookings"
            className="px-4 py-2 text-sm font-medium transition rounded-full bg-surface text-primary border border-white/5 hover:bg-white/[0.06]"
          >
            All Bookings
          </Link>
          <Link
            href="/mentor/availability"
            className="px-4 py-2 text-sm font-medium transition rounded-full bg-surface text-primary border border-white/5 hover:bg-white/[0.06]"
          >
            Set Availability
          </Link>
        </div>

        <div className="grid gap-6 mb-12 sm:grid-cols-3">
          <div className="p-6 card">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-white/[0.06]">
                <Calendar className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-white/60">Upcoming Sessions</p>
                <p className="text-3xl font-bold text-primary">{upcoming.length}</p>
              </div>
            </div>
          </div>
          <div className="p-6 card">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-white/[0.06]">
                <CheckCircle className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-white/60">Completed</p>
                <p className="text-3xl font-bold text-primary">{completed.length}</p>
              </div>
            </div>
          </div>
          <div className="p-6 card">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-white/[0.06]">
                <MessageSquare className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-white/60">Total Sessions</p>
                <p className="text-3xl font-bold text-primary">{bookings.length}</p>
              </div>
            </div>
          </div>
        </div>

        {upcoming.length > 0 && (
          <section className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold text-primary">Upcoming Sessions</h2>
              <span className="px-4 py-1 text-sm border rounded-full bg-surface text-primary border-white/5">
                {upcoming.length} upcoming
              </span>
            </div>

            <div className="space-y-4">
              {upcoming.map((booking) => {
                const session = booking.session;
                const isLive = session?.status === "live";
                const isScheduled = session?.status === "scheduled";
                const startTime = new Date(booking.startTime);
                const canStart = isScheduled && startTime <= new Date(now.getTime() + 15 * 60 * 1000);

                return (
                  <div
                    key={booking._id}
                    className="flex items-center justify-between p-6 card transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-white/40" />
                        <p className="font-medium text-primary">
                          {booking.menteeId?.name || "Unknown"}
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
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-full ${statusStyles[booking.status] || "bg-white/5 text-white/60"}`}>
                        <Clock className="w-3 h-3" />
                        Confirmed
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {isLive && (
                        <button
                          onClick={() => router.push(`/session/${session._id}`)}
                          className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium btn-primary rounded-full"
                        >
                          <MessageSquare className="w-4 h-4" />
                          Join Session
                        </button>
                      )}
                      {canStart && (
                        <button
                          onClick={() => handleStartSession(booking._id)}
                          className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium btn-primary rounded-full"
                        >
                          <Play className="w-4 h-4" />
                          Start Session
                        </button>
                      )}
                      {isScheduled && !canStart && (
                        <div className="text-sm text-white/40 px-2">
                          <Clock className="inline w-4 h-4 mr-1" />
                          {(() => {
                            const ms = startTime.getTime() - now.getTime();
                            const m = Math.floor(ms / 60000);
                            const h = Math.floor(m / 60);
                            return h > 0 ? `${h}h ${m % 60}m` : `${m}m`;
                          })()}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {completed.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold text-primary">Completed Sessions</h2>
              <span className="px-4 py-1 text-sm border rounded-full bg-surface text-primary border-white/5">
                {completed.length} completed
              </span>
            </div>

            <div className="space-y-4">
              {completed.map((booking) => (
                <div
                  key={booking._id}
                  className="flex items-center justify-between p-6 card"
                >
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-white/40" />
                      <p className="font-medium text-primary">
                        {booking.menteeId?.name || "Unknown"}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-white/40" />
                      <p className="text-sm text-white/60">
                        {new Date(booking.startTime).toLocaleDateString("en-US", {
                          weekday: "long",
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </p>
                    </div>
                  </div>
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-full ${statusStyles[booking.status]}`}>
                    <CheckCircle className="w-3 h-3" />
                    Completed
                  </span>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
