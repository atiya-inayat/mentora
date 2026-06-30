"use client";
import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useMyBookings } from "@/lib/hooks/useBookings";
import { useMutation } from "@tanstack/react-query";
import api from "@/lib/axios";
import Navbar from "@/app/components/shared/Navbar";
import { Star, CheckCircle } from "lucide-react";
import Link from "next/link";

export default function ReviewPage() {
  const { bookingId } = useParams();
  const router = useRouter();
  const { data: bookingsData } = useMyBookings();
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const booking = (bookingsData?.data || []).find((b) => b._id === bookingId);

  const { mutate: submitReview, isPending } = useMutation({
    mutationFn: async () => {
      const res = await api.post(`/api/reviews/${bookingId}`, {
        rating,
        comment,
      });
      return res.data;
    },
    onSuccess: () => setSubmitted(true),
  });

  if (!booking) {
    return (
      <main className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center min-h-[60vh] px-4">
          <p className="text-white/40">Loading...</p>
        </div>
      </main>
    );
  }

  if (submitted) {
    return (
      <main className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center min-h-[80vh] px-4">
          <div className="w-full max-w-md p-8 text-center card">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/[0.06]">
              <CheckCircle className="w-8 h-8 text-primary" />
            </div>
            <h2 className="mt-4 text-2xl font-semibold text-foreground">Review Submitted!</h2>
            <p className="mt-2 text-muted">Thank you for your feedback</p>
            <Link
              href="/my-bookings"
              className="inline-block mt-6 px-5 py-2.5 text-sm font-medium btn-primary rounded-full"
            >
              Back to Bookings
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background">
      <Navbar />

      <div className="px-4 py-12 mx-auto max-w-lg sm:px-6 lg:px-8">
        <Link
          href="/my-bookings"
          className="inline-flex items-center gap-1 mb-4 text-xs transition text-white/40 hover:text-primary"
        >
          ← Back to Bookings
        </Link>

        <div className="card p-8">
          <h1 className="mb-2 text-2xl font-semibold text-center text-foreground">
            Review Your Session
          </h1>
          <p className="mb-6 text-sm text-center text-muted">
            How was your session with {booking.mentorId?.name}?
          </p>

          <div className="flex justify-center gap-2 mb-6">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                onMouseEnter={() => setHover(star)}
                onMouseLeave={() => setHover(0)}
                className="transition-transform hover:scale-110"
              >
                <Star
                  className={`w-8 h-8 ${
                    star <= (hover || rating)
                      ? "fill-yellow-400 text-yellow-400"
                      : "text-primary/20"
                  }`}
                />
              </button>
            ))}
          </div>

          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Share your experience (optional)..."
            rows={4}
            className="w-full px-4 py-3 mb-6 text-sm border rounded-xl outline-none glass-input text-primary placeholder:text-white/40 resize-none"
          />

          <button
            onClick={() => submitReview()}
            disabled={rating === 0 || isPending}
            className="w-full py-3 font-medium transition-all btn-primary rounded-xl"
          >
            {isPending ? "Submitting..." : "Submit Review"}
          </button>
        </div>
      </div>
    </main>
  );
}
