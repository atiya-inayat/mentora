"use client";

import { useMentors } from "@/lib/hooks/useMentors";
import LandingMentorCard from "./LandingMentorCard";

export default function AllMentors() {
  const { data, isLoading, error } = useMentors();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-lg animate-pulse text-primary">Loading mentors...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-20 text-center">
        <p className="text-lg text-red-500">Failed to load mentors...</p>
      </div>
    );
  }

  if (!data?.data || data.data.length === 0) {
    return (
      <div className="py-20 text-center">
        <p className="text-white/40">No mentors available yet</p>
      </div>
    );
  }

  const mentors = data.data;

  return (
    <div className="relative overflow-hidden">
      <div className="flex gap-6 marquee-track">
        {[...mentors, ...mentors].map((mentor, i) => (
          <div key={`${mentor._id}-${i}`} className="shrink-0 w-[340px]">
            <LandingMentorCard mentor={mentor} />
          </div>
        ))}
      </div>
    </div>
  );
}
