"use client";
import { useState, useMemo, useEffect } from "react";
import { useMentor } from "@/lib/hooks/useMentors";
import { useAvailableSlots, useReserveSlot } from "@/lib/hooks/useSlots";
import { useCreateCheckout } from "@/lib/hooks/usePayments";
import { useParams } from "next/navigation";
import useAuthStore from "@/lib/store/authStore";
import Navbar from "@/app/components/shared/Navbar";
import { toast } from "sonner";
import Link from "next/link";
import {
  Star, DollarSign, Code, ArrowLeft, Calendar, Clock,
  MapPin, CheckCircle, Loader, AlertCircle,
} from "lucide-react";

const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

function groupSlotsByDate(slots) {
  const groups = {};
  for (const slot of slots) {
    const d = new Date(slot.startTime);
    const key = d.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" });
    const dateKey = d.toLocaleDateString("en-US", { year: "numeric", month: "2-digit", day: "2-digit" });
    if (!groups[key]) groups[key] = { label: key, dateKey, slots: [] };
    groups[key].slots.push(slot);
  }
  return Object.values(groups);
}

function formatTime(dateStr) {
  return new Date(dateStr).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
}

function isTodayOrFuture(dateStr) {
  const d = new Date(dateStr);
  d.setHours(0, 0, 0, 0);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return d >= today;
}

export default function MentorProfilePage() {
  const { id } = useParams();
  const { user } = useAuthStore();
  const { data, isLoading } = useMentor(id);
  const { mutate: reserveSlot, isPending: reserving } = useReserveSlot();
  const { mutate: createCheckout, isPending: checkingOut } = useCreateCheckout();

  const [selectedSlot, setSelectedSlot] = useState(null);
  const [notes, setNotes] = useState("");

  const { data: slotsData, isLoading: slotsLoading } = useAvailableSlots(id, 14);
  const availableSlots = slotsData?.data || [];
  const groupedSlots = useMemo(() => groupSlotsByDate(availableSlots), [availableSlots]);

  useEffect(() => {
    if (availableSlots.length === 0) {
      if (selectedSlot !== null) setSelectedSlot(null);
      return;
    }

    const stillAvailable = availableSlots.some((s) => s.startTime === selectedSlot?.startTime);
    if (!stillAvailable) {
      setSelectedSlot(availableSlots[0]);
    }
  }, [availableSlots]);

  if (isLoading)
    return (
      <div className="flex items-center justify-center min-h-screen bg-background text-primary">
        Loading...
      </div>
    );

  const mentor = data?.data;

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

  const availability = mentor.availability;
  const weeklySlots = availability?.slots || [];
  const timezone = availability?.timezone || "UTC";
  const nextSlot = mentor.nextAvailableSlot;
  const sessionDuration = mentor.sessionDurationMinutes || 60;

  const sortedWeeklySlots = [...weeklySlots].sort((a, b) => a.dayOfWeek - b.dayOfWeek || a.startTime.localeCompare(b.startTime));

  const handleSlotSelect = (slot) => {
    setSelectedSlot(selectedSlot?.startTime === slot.startTime ? null : slot);
  };

  const handleContinue = () => {
    if (!selectedSlot) return;
    reserveSlot(
      { mentorId: id, startTime: selectedSlot.startTime },
      {
        onSuccess: (res) => {
          const slotId = res.data._id;
          createCheckout(
            { slotId, notes },
            {
              onSuccess: (res) => { window.location.href = res.url; },
              onError: (err) => { toast.error(err?.response?.data?.message || "Failed to start checkout"); },
            }
          );
        },
        onError: (err) => { toast.error(err?.response?.data?.message || "Slot no longer available"); },
      }
    );
  };

  return (
    <main className="min-h-screen bg-background">
      <Navbar />

      <div className="px-4 py-12 mx-auto max-w-5xl sm:px-6 lg:px-8">
        <Link
          href="/mentors"
          className="inline-flex items-center gap-2 mb-8 text-sm font-medium transition text-white/40 hover:text-primary"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to mentors
        </Link>

        <div className="grid gap-8 lg:grid-cols-[1fr_400px]">
          {/* Left: Profile */}
          <div>
            <div className="glass-card rounded-3xl overflow-hidden">
              <div className="flex items-start gap-5 p-6 md:p-8">
                <div className="shrink-0 w-20 h-20 md:w-24 md:h-24 rounded-2xl overflow-hidden bg-surface shadow-lg">
                  {mentor.userId?.photo ? (
                    <img
                      src={mentor.userId.photo.startsWith("http") ? mentor.userId.photo : `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}${mentor.userId.photo}`}
                      alt={mentor.userId?.name}
                      className="w-full h-full object-cover object-center"
                    />
                  ) : (
                    <div className="flex items-center justify-center w-full h-full bg-white/5">
                      <span className="text-3xl text-white/20 font-semibold">
                        {mentor.userId?.name?.charAt(0) || "?"}
                      </span>
                    </div>
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <h1 className="text-2xl font-semibold text-primary md:text-3xl">
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

                  <p className="mt-5 leading-7 text-white/60">{mentor.bio}</p>

                  <div className="flex flex-wrap gap-2 mt-5">
                    {mentor.skills?.map((skill, i) => (
                      <span key={i} className="flex items-center gap-1 px-3 py-1 text-sm rounded-full border border-white/5 bg-background text-white/70">
                        <Code className="w-3 h-3" />
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

            {/* Availability Schedule */}
            <div className="p-6 mt-8 glass-card rounded-3xl">
              <h2 className="mb-6 text-xl font-semibold text-primary">Availability</h2>

              {sortedWeeklySlots.length === 0 ? (
                <div className="flex items-start gap-3 p-4 rounded-2xl bg-yellow-500/5 border border-yellow-500/10">
                  <AlertCircle className="w-5 h-5 mt-0.5 text-yellow-400 shrink-0" />
                  <p className="text-sm text-white/60">This mentor has not set their availability yet.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {nextSlot && (
                    <div className="p-4 rounded-2xl bg-green-500/10 border border-green-500/20">
                      <div className="flex items-center gap-2 text-green-400">
                        <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                        <span className="text-sm font-medium">Next Available</span>
                      </div>
                      <p className="mt-1 text-lg font-semibold text-green-300">
                        {nextSlot.formattedDate} &middot; {nextSlot.formattedTime}
                      </p>
                    </div>
                  )}

                  <div className="flex items-center gap-4 text-sm text-white/50">
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-4 h-4" />
                      <span>{sessionDuration} minutes</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-4 h-4" />
                      <span>{timezone}</span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {sortedWeeklySlots.map((slot, i) => (
                      <div key={i} className="flex items-center gap-4 p-3 rounded-xl bg-background">
                        <span className="w-24 text-sm font-medium text-primary shrink-0">
                          {DAY_NAMES[slot.dayOfWeek]}
                        </span>
                        <div className="flex items-center gap-2 text-sm text-white/60">
                          <Clock className="w-3.5 h-3.5" />
                          <span>
                            {new Date(`2000-01-01T${slot.startTime}`).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}
                            &ndash;
                            {new Date(`2000-01-01T${slot.endTime}`).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right: Booking */}
          <div>
            <div className="sticky top-24 glass-card rounded-3xl p-6">
              <h2 className="mb-1 text-xl font-semibold text-primary">Book a Session</h2>
              <p className="mb-6 text-sm text-white/50">
                Select an available time slot below
              </p>

              {!user ? (
                <div className="p-4 text-center rounded-2xl bg-background">
                  <p className="text-sm text-white/50">Please log in to book a session</p>
                  <Link href="/login" className="inline-block mt-3 px-5 py-2.5 text-sm font-medium btn-primary rounded-full">
                    Log In
                  </Link>
                </div>
              ) : user.role !== "mentee" ? (
                <div className="p-4 text-center rounded-2xl bg-background">
                  <p className="text-sm text-white/50">Only mentees can book sessions</p>
                </div>
              ) : sortedWeeklySlots.length === 0 ? (
                <div className="p-4 text-center rounded-2xl bg-background">
                  <p className="text-sm text-white/50">This mentor has not set their availability yet</p>
                </div>
              ) : (
                <>
                  {slotsLoading ? (
                    <div className="flex items-center justify-center py-12">
                      <Loader className="w-6 h-6 animate-spin text-white/40" />
                    </div>
                  ) : groupedSlots.length === 0 ? (
                    <div className="p-4 text-center rounded-2xl bg-background">
                      <Calendar className="w-8 h-8 mx-auto mb-2 text-white/20" />
                      <p className="text-sm text-white/50">No available slots in the next 14 days</p>
                    </div>
                  ) : (
                    <div className="space-y-6 max-h-[500px] overflow-y-auto pr-1">
                      {groupedSlots.map((group) => (
                        <div key={group.dateKey}>
                          <h3 className="mb-3 text-sm font-semibold text-white/70">{group.label}</h3>
                          <div className="flex flex-wrap gap-2">
                            {group.slots.map((slot) => {
                              const isSelected = selectedSlot?.startTime === slot.startTime;
                              return (
                                <button
                                  key={slot.startTime}
                                  onClick={() => handleSlotSelect(slot)}
                                  className={`inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-xl border transition-all ${
                                    isSelected
                                      ? "bg-primary text-white border-primary shadow-lg shadow-primary/20"
                                      : "bg-background text-white/70 border-white/5 hover:border-white/20 hover:bg-white/[0.04]"
                                  }`}
                                >
                                  <Clock className="w-3.5 h-3.5" />
                                  {formatTime(slot.startTime)}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {selectedSlot && (
                    <div className="mt-6 space-y-4">
                      <div className="p-3 rounded-xl bg-green-500/10 border border-green-500/20">
                        <div className="flex items-center gap-2 text-sm text-green-400">
                          <CheckCircle className="w-4 h-4" />
                          <span className="font-medium">Selected Slot</span>
                        </div>
                        <p className="mt-1 text-sm text-white/70">
                          {new Date(selectedSlot.startTime).toLocaleDateString("en-US", {
                            weekday: "long", month: "long", day: "numeric",
                          })}
                          {" at "}
                          {formatTime(selectedSlot.startTime)}
                          {" ("}${selectedSlot.price}{")"}
                        </p>
                      </div>

                      <div>
                        <label className="block mb-2 text-sm font-medium text-white/70">
                          What would you like to discuss? (optional)
                        </label>
                        <textarea
                          value={notes}
                          onChange={(e) => setNotes(e.target.value)}
                          placeholder="Share some context about what you'd like help with..."
                          rows={3}
                          className="w-full px-4 py-3 text-sm border rounded-xl outline-none glass-input text-primary placeholder:text-white/40 resize-none"
                        />
                      </div>

                      <button
                        onClick={handleContinue}
                        disabled={reserving || checkingOut}
                        className="w-full py-3 font-medium transition-all btn-primary rounded-xl disabled:opacity-50"
                      >
                        {reserving ? "Reserving slot..." : checkingOut ? "Redirecting to payment..." : "Continue to Payment"}
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
