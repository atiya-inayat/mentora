"use client";
import { useState } from "react";
import { useMentor } from "@/lib/hooks/useMentors";
import { useCreateBooking } from "@/lib/hooks/useBookings";
import { useParams } from "next/navigation";
import useAuthStore from "@/lib/store/authStore";
import Navbar from "@/app/components/shared/Navbar";
import { Star, Calendar, DollarSign, Code, User, ArrowLeft } from "lucide-react";
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
      alert("Please select a date and time");
      return;
    }

    const selectedDate = new Date(scheduledAt);
    const now = new Date();

    if (selectedDate <= now) {
      alert("Please choose a future time");
      return;
    }

    createBooking(
      { mentorId: id, scheduledAt },
      { onSuccess: () => setBooked(true) }
    );

    setScheduledAt("");
  };

  if (!mentor) {
    return (
      <main className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center min-h-[60vh]">
          <p className="text-primary/60">Mentor not found</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background">
      <Navbar />

      <div className="px-4 py-12 mx-auto max-w-4xl sm:px-6 lg:px-8">
        <Link
          href="/mentors"
          className="inline-flex items-center gap-2 mb-8 text-sm font-medium transition text-primary/60 hover:text-primary"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to mentors
        </Link>

        <div className="p-8 border shadow-lg rounded-3xl bg-surface border-primary/20">
          <div className="flex flex-col gap-8 md:flex-row md:items-start">
            <div className="flex-shrink-0">
              <div className="flex items-center justify-center w-24 h-24 rounded-2xl bg-primary">
                <User className="w-12 h-12 text-background" />
              </div>
            </div>

            <div className="flex-1">
              <h1 className="text-3xl font-semibold text-primary font-fugaz">
                {mentor.userId?.name}
              </h1>

              <p className="mt-4 leading-7 text-primary/70">{mentor.bio}</p>

              <div className="flex flex-wrap items-center gap-4 mt-6">
                <div className="flex items-center gap-1.5 px-3 py-1.5 border rounded-full bg-background border-primary/20">
                  <DollarSign className="w-4 h-4 text-primary" />
                  <span className="font-medium text-primary">
                    {mentor.hourlyRate}/hr
                  </span>
                </div>

                <div className="flex items-center gap-1.5 px-3 py-1.5 border rounded-full bg-background border-primary/20">
                  <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                  <span className="text-sm text-primary">
                    {mentor.averageRating || "No ratings"}
                  </span>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mt-5">
                {mentor.skills?.map((skill, i) => (
                  <span
                    key={i}
                    className="flex items-center gap-1 px-3 py-1 text-sm border rounded-full border-primary/20 bg-background text-primary/80"
                  >
                    <Code className="w-3 h-3" />
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {user?.role === "mentee" && (
          <div className="p-8 mt-8 border shadow-lg rounded-3xl bg-surface border-primary/20">
            {booked ? (
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10">
                  <Calendar className="w-8 h-8 text-primary" />
                </div>
                <h2 className="mt-4 text-2xl font-semibold text-primary">
                  Session Request Sent!
                </h2>
                <p className="mt-2 text-primary/70">
                  Your booking request has been submitted. The mentor will
                  respond shortly.
                </p>
              </div>
            ) : (
              <>
                <h2 className="mb-6 text-2xl font-semibold text-primary">
                  Book a Session
                </h2>

                <div className="space-y-4">
                  <div>
                    <label className="block mb-2 text-sm font-medium text-primary/80">
                      Select Date & Time
                    </label>
                    <input
                      type="datetime-local"
                      value={scheduledAt}
                      onChange={(e) => setScheduledAt(e.target.value)}
                      className="w-full px-4 py-3 border rounded-xl outline-none bg-background border-primary/20 focus:border-primary focus:ring-1 focus:ring-primary text-primary"
                    />
                  </div>

                  <button
                    onClick={handleBooking}
                    disabled={isPending}
                    className="w-full py-3 font-medium transition-all rounded-xl bg-primary text-background hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isPending ? "Booking..." : "Book Session"}
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
