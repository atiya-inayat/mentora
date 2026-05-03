"use client";
import { useState } from "react";
import { useMentor } from "@/lib/hooks/useMentors";
import { useCreateBooking } from "@/lib/hooks/useBookings";
import { useParams } from "next/navigation";
import useAuthStore from "@/lib/store/authStore";

export default function MentorProfilePage() {
  const { id } = useParams();
  const { user } = useAuthStore();
  const { data, isLoading } = useMentor(id);
  const { mutate: createBooking, isPending } = useCreateBooking();

  const [scheduledAt, setScheduledAt] = useState("");

  if (isLoading) return <div>Loading...</div>;

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

    createBooking({
      mentorId: id,
      scheduledAt,
    });

    // optional: reset input after booking
    setScheduledAt("");
  };

  return (
    <div>
      <h1>{mentor?.userId?.name}</h1>
      <p>{mentor?.bio}</p>
      <p>${mentor?.hourlyRate}/hr</p>
      <p>Skills: {mentor?.skills?.join(", ")}</p>
      <p>Rating: {mentor?.averageRating}/5</p>

      {user?.role === "mentee" && (
        <div>
          <input
            type="datetime-local"
            value={scheduledAt}
            onChange={(e) => setScheduledAt(e.target.value)}
          />

          <button onClick={handleBooking} disabled={isPending}>
            {isPending ? "Booking..." : "Book Session"}
          </button>
        </div>
      )}
    </div>
  );
}
