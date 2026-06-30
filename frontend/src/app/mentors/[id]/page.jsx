"use client";
import { useState } from "react";
import { useMentor } from "@/lib/hooks/useMentors";
import { useCreateBooking } from "@/lib/hooks/useBookings";
import { useParams } from "next/navigation";
import useAuthStore from "@/lib/store/authStore";
import Navbar from "@/app/components/shared/Navbar";
import Avatar from "@/app/components/shared/Avatar";
import { Star, Calendar, DollarSign, Code, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

export default function MentorProfilePage() {
  const { id } = useParams();
  const { user } = useAuthStore();
  const { data, isLoading } = useMentor(id);
  const { mutate: createBooking, isPending } = useCreateBooking();

  const [scheduledAt, setScheduledAt] = useState("");
  const [booked, setBooked] = useState(false);

  if (isLoading)
    return (
      <div className="flex items-center justify-center min-h-screen bg-background text-primary">
        Loading...
      </div>
    );

  const mentor = data?.data;

  const handleBooking = () => {
    if (!scheduledAt) {
      toast.error("Please select a date and time");
      return;
    }

    const selectedDate = new Date(scheduledAt);
    const now = new Date();

    if (selectedDate <= now) {
      toast.error("Please choose a future time");
      return;
    }

    createBooking({ mentorId: id, scheduledAt }, { onSuccess: () => setBooked(true) });

    setScheduledAt("");
  };

  if (!mentor) {
    return (
      <main className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center min-h-[60vh]">
          <p className="text-white/40">Mentor not found</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background">
      <Navbar />

      <div className="px-4 py-12 mx-auto max-w-3xl sm:px-6 lg:px-8">
        <Link
          href="/mentors"
          className="inline-flex items-center gap-2 mb-8 text-sm font-medium transition text-white/40 hover:text-primary"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to mentors
        </Link>

        <div className="card overflow-hidden">
          <div className="relative aspect-[4/3] md:aspect-[16/9] bg-surface">
            {mentor.userId?.photo ? (
              <img
                src={mentor.userId.photo.startsWith("http")
                  ? mentor.userId.photo
                  : `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}${mentor.userId.photo}`
                }
                alt={mentor.userId?.name}
                className="absolute inset-0 w-full h-full object-contain bg-background"
              />
            ) : (
              <div className="flex items-center justify-center w-full h-full">
                <div className="w-24 h-24 rounded-full bg-white/5 flex items-center justify-center">
                  <span className="text-5xl text-white/20 font-semibold">
                    {mentor.userId?.name?.charAt(0) || "?"}
                  </span>
                </div>
              </div>
            )}
          </div>

          <div className="p-6 md:p-8">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <h1 className="text-2xl font-semibold text-foreground md:text-3xl">
                  {mentor.userId?.name}
                </h1>

                <div className="flex flex-wrap items-center gap-3 mt-3">
                  <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-background border border-white/5">
                    <DollarSign className="w-4 h-4 text-primary" />
                    <span className="text-sm font-medium text-primary">${mentor.hourlyRate}/hr</span>
                  </div>

                  <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-background border border-white/5">
                    <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                    <span className="text-sm text-primary">
                      {mentor.averageRating ? mentor.averageRating.toFixed(1) : "New"}
                    </span>
                  </div>
                </div>
              </div>

              {user?.role === "mentee" && (
                <div className="shrink-0">
                  {booked ? (
                    <div className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-full bg-green-500/10 text-green-400 border border-green-500/20">
                      <Calendar className="w-4 h-4" />
                      Request Sent
                    </div>
                  ) : (
                    <button
                      onClick={handleBooking}
                      disabled={isPending || !scheduledAt}
                      className="px-6 py-2.5 text-sm font-medium rounded-full bg-primary text-white hover:opacity-90 disabled:opacity-50 transition-opacity"
                    >
                      {isPending ? "Booking..." : "Book Session"}
                    </button>
                  )}
                </div>
              )}
            </div>

            <p className="mt-5 leading-7 text-white/60">{mentor.bio}</p>

            <div className="flex flex-wrap gap-2 mt-5">
              {mentor.skills?.map((skill, i) => (
                <span
                  key={i}
                  className="flex items-center gap-1 px-3 py-1 text-sm rounded-full border border-white/5 bg-background text-white/70"
                >
                  <Code className="w-3 h-3" />
                  {skill}
                </span>
              ))}
            </div>

            {user?.role === "mentee" && !booked && (
              <div className="mt-6 pt-6 border-t border-white/5">
                <label className="block mb-2 text-sm font-medium text-white/70">
                  Select Date & Time
                </label>
                <input
                  type="datetime-local"
                  value={scheduledAt}
                  onChange={(e) => setScheduledAt(e.target.value)}
                  className="w-full px-4 py-3 border rounded-xl outline-none glass-input text-primary"
                />
              </div>
            )}
          </div>
        </div>

        {user?.role === "mentee" && booked && (
          <div className="p-8 mt-8 text-center glass-card rounded-3xl">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/[0.06]">
              <Calendar className="w-8 h-8 text-primary" />
            </div>
            <h2 className="mt-4 text-2xl font-semibold text-primary">Session Request Sent!</h2>
            <p className="mt-2 text-white/60">
              Your booking request has been submitted. The mentor will respond shortly.
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
