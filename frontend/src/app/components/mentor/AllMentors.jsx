"use client";

import { useMentors } from "@/lib/hooks/useMentors";
import LandingMentorCard from "./LandingMentorCard";

export default function AllMentors() {
  const { data, isLoading, error } = useMentors();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="flex gap-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="w-[340px] h-[200px] rounded-xl bg-surface animate-pulse"
            />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-20 text-center">
        <p className="text-sm text-muted">Failed to load mentors</p>
      </div>
    );
  }

  if (!data?.data || data.data.length === 0) {
    return (
      <div className="py-20 text-center">
        <p className="text-sm text-muted">No mentors available yet</p>
      </div>
    );
  }

  const mentors = data.data;

  return (
    <div className="relative overflow-hidden">
      <div className="flex gap-6 marquee-scroll">
        {[...mentors, ...mentors].map((mentor, i) => (
          <div
            key={`${mentor._id}-${i}`}
            className="shrink-0 w-[340px] h-[260px]"
          >
            <LandingMentorCard mentor={mentor} />
          </div>
        ))}
      </div>
    </div>
  );
}
