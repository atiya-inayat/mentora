"use client";

import { useMentors } from "@/lib/hooks/useMentors";
import MentorCard from "@/app/components/mentor/MentorCard";

const MentorPage = () => {
  const { data, isLoading, error } = useMentors();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background text-primary">
        Loading mentors...
      </div>
    );
  }

  if (error || !data?.data) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background text-primary">
        Failed to load mentors
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <section className="px-6 py-16 text-center">
        <h1 className="text-4xl font-semibold md:text-5xl text-primary font-fugaz">
          Find a Mentor
        </h1>

        <p className="max-w-2xl mx-auto mt-4 text-primary/70">
          Connect with industry experts who can guide your career growth
        </p>
      </section>

      {/* Grid Section */}
      <section className="px-6 pb-20 mx-auto max-w-7xl">
        <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {data?.data?.map((mentor) => (
            <MentorCard key={mentor._id} mentor={mentor} />
          ))}
        </div>
      </section>
    </main>
  );
};

export default MentorPage;
