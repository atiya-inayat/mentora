"use client";
import { useMyBookings } from "@/lib/hooks/useBookings";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/axios";

export default function MentorDashboard() {
  const { data, isLoading } = useMyBookings();
  const queryClient = useQueryClient();

  const { mutate: acceptBooking } = useMutation({
    mutationFn: (bookingId) => api.put(`/bookings/${bookingId}/accept`),
    onSuccess: () => queryClient.invalidateQueries(["bookings"]),
  });

  if (isLoading) return <div>Loading...</div>;

  const bookings = data?.data || [];
  const pending = bookings.filter((b) => b.status === "pending");
  const accepted = bookings.filter((b) => b.status === "accepted");

  return (
    <div>
      <h1>Mentor Dashboard</h1>

      <section>
        <h2>Pending Requests ({pending.length})</h2>
        {pending.map((booking) => (
          <div key={booking._id}>
            <p>From: {booking.menteeId?.name}</p>
            <p>Date: {new Date(booking.scheduledAt).toLocaleDateString()}</p>
            <button onClick={() => acceptBooking(booking._id)}>Accept</button>
          </div>
        ))}
      </section>

      <section>
        <h2>Accepted Sessions ({accepted.length})</h2>
        {accepted.map((booking) => (
          <div key={booking._id}>
            <p>With: {booking.menteeId?.name}</p>
            <p>Date: {new Date(booking.scheduledAt).toLocaleDateString()}</p>
            <p>Status: {booking.status}</p>
          </div>
        ))}
      </section>
    </div>
  );
}
