"use client";
import { useMyBookings } from "@/lib/hooks/useBookings";
import Navbar from "../components/shared/Navbar";

export default function MenteeDashboard() {
  const { data, isLoading } = useMyBookings();

  if (isLoading) return <div>Loading...</div>;

  const bookings = data?.data || []; // "If data exists, then access .data" OR "If bookings data exists, use it. Otherwise use empty array."

  return (
    <div>
      <Navbar />
      <h1>My Bookings</h1>
      {bookings.length === 0 && <p>No bookings yet</p>}
      {bookings.map((booking) => (
        <div key={booking._id}>
          <p>Mentor: {booking.mentorId?.name}</p>
          <p>Status: {booking.status}</p>
          {/* Converts date into readable format.  */}
          <p>Date: {new Date(booking.scheduledAt).toLocaleDateString()}</p>
        </div>
      ))}
    </div>
  );
}
