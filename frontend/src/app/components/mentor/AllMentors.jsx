"use client";

import { useMentors } from "@/lib/hooks/useMentors";
import MentorCard from "./MentorCard";

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
        <p className="text-primary/60">No mentors available yet</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
      {data?.data?.map((mentor) => (
        <MentorCard key={mentor._id} mentor={mentor} />
      ))}
    </div>
  );
}
