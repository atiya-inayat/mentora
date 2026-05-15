"use client";

import { useMentors } from "@/lib/hooks/useMentors";
import MentorCard from "./MentorCard";

export default function AllMentors() {
  const { data, isLoading, error } = useMentors();

  if (isLoading) {
    return <p>Loading...</p>;
  }

  if (error) {
    return <p>Failed to load mentors...</p>;
  }

  return (
    <div>
      {data?.data?.map((mentor) => (
        <MentorCard key={mentor._id} mentor={mentor} />
      ))}
    </div>
  );
}
