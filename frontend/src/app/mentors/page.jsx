"use client";

import { useMentors } from "@/lib/hooks/useMentors";
import MentorCard from "@/app/components/mentor/MentorCard";

const MentorPage = () => {
  const { data, isLoading, error } = useMentors();

  if (isLoading) {
    return <div>Loading mentors...</div>;
  }

  if (error || !data?.data) {
    return <div>Failed to load mentors</div>;
  }

  return (
    <div>
      <h1>Find a Mentor</h1>
      <div>
        {data?.data?.map((mentor) => (
          <MentorCard key={mentor._id} mentor={mentor} />
        ))}
      </div>
    </div>
  );
};

export default MentorPage;
