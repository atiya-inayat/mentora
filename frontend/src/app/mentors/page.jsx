"use client";

import { useState, useMemo } from "react";
import { useMentors } from "@/lib/hooks/useMentors";
import MentorCard from "@/app/components/mentor/MentorCard";
import Navbar from "@/app/components/shared/Navbar";
import useAuthStore from "@/lib/store/authStore";
import Link from "next/link";
import { CardSkeleton } from "@/app/components/shared/LoadingSkeleton";
import { Search, SlidersHorizontal, X } from "lucide-react";
import usePageTitle from "@/lib/hooks/usePageTitle";

const SKILL_OPTIONS = [
  "JavaScript",
  "React",
  "Node.js",
  "Python",
  "TypeScript",
  "Java",
  "Go",
  "Rust",
  "DevOps",
  "Machine Learning",
  "UI/UX",
  "Data Science",
  "Mobile",
  "Blockchain",
  "Cloud",
];

const MentorPage = () => {
  usePageTitle("Browse Mentors");
  const { user } = useAuthStore();
  const [search, setSearch] = useState("");
  const [skill, setSkill] = useState("");
  const [maxRate, setMaxRate] = useState("");
  const [minRating, setMinRating] = useState("");
  const [page, setPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);

  const filters = useMemo(
    () => ({
      search: search || undefined,
      skill: skill || undefined,
      maxRate: maxRate || undefined,
      minRating: minRating || undefined,
      page,
    }),
    [search, skill, maxRate, minRating, page],
  );

  const { data, isLoading, error } = useMentors(filters);
  const backUrl = user ? (user.role === "mentor" ? "/mentor/dashboard" : "/dashboard") : "/";

  const clearFilters = () => {
    setSearch("");
    setSkill("");
    setMaxRate("");
    setMinRating("");
    setPage(1);
  };

  const hasActiveFilters = search || skill || maxRate || minRating;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="px-4 py-12 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="h-8 rounded bg-white/[0.06] w-48 animate-pulse mb-8" />
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background text-primary">
        Failed to load mentors
      </div>
    );
  }

  const mentors = data?.data || [];
  const totalPages = data?.pages || 1;

  return (
    <main className="min-h-screen bg-background">
      <Navbar />

      <div className="px-4 pt-8 mx-auto max-w-7xl sm:px-6 lg:px-8">
        <Link
          href={backUrl}
          className="inline-flex items-center gap-1 mb-2 text-xs transition text-white/40 hover:text-primary"
        >
          ← Back
        </Link>
      </div>

      <section className="px-6 pt-8 pb-10 text-center">
        <h1 className="text-4xl font-semibold md:text-5xl text-foreground">
          Find a Mentor
        </h1>
        <p className="max-w-2xl mx-auto mt-4 text-muted">
          Connect with industry experts who can guide your career growth
        </p>
      </section>

      {/* Search & Filters */}
      <section className="px-6 pb-8 mx-auto max-w-7xl">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
            <input
              type="text"
              placeholder="Search mentors by skill or keyword..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full pl-10 pr-4 py-2.5 text-sm border rounded-full outline-none bg-surface border-white/5 focus:border-primary focus:ring-1 focus:ring-primary"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-full border transition ${
              showFilters || hasActiveFilters
                ? "bg-primary text-white border-primary"
                : "bg-surface text-primary border-white/5 hover:bg-white/[0.06]"
            }`}
          >
            <SlidersHorizontal className="w-4 h-4" />
            Filters
            {hasActiveFilters && (
              <span className="flex items-center justify-center w-5 h-5 text-xs rounded-full bg-white/[0.06]">
                {(search ? 1 : 0) + (skill ? 1 : 0) + (maxRate ? 1 : 0) + (minRating ? 1 : 0)}
              </span>
            )}
          </button>
        </div>

        {showFilters && (
          <div className="flex flex-wrap items-end gap-4 p-4 mt-4 border rounded-2xl bg-surface border-white/5">
            <div>
              <label className="block mb-1 text-xs text-white/40">Skill</label>
              <select
                value={skill}
                onChange={(e) => {
                  setSkill(e.target.value);
                  setPage(1);
                }}
                className="px-3 py-2 text-sm border rounded-lg outline-none bg-background border-white/5 focus:border-primary"
              >
                <option value="">All skills</option>
                {SKILL_OPTIONS.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block mb-1 text-xs text-white/40">Max rate ($/hr)</label>
              <input
                type="number"
                min="0"
                placeholder="Any"
                value={maxRate}
                onChange={(e) => {
                  setMaxRate(e.target.value);
                  setPage(1);
                }}
                className="w-28 px-3 py-2 text-sm border rounded-lg outline-none bg-background border-white/5 focus:border-primary"
              />
            </div>
            <div>
              <label className="block mb-1 text-xs text-white/40">Min rating</label>
              <select
                value={minRating}
                onChange={(e) => {
                  setMinRating(e.target.value);
                  setPage(1);
                }}
                className="px-3 py-2 text-sm border rounded-lg outline-none bg-background border-white/5 focus:border-primary"
              >
                <option value="">Any rating</option>
                <option value="4">4+ stars</option>
                <option value="3">3+ stars</option>
                <option value="2">2+ stars</option>
              </select>
            </div>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="inline-flex items-center gap-1 px-3 py-2 text-sm transition rounded-lg text-white/40 hover:text-primary"
              >
                <X className="w-4 h-4" />
                Clear
              </button>
            )}
          </div>
        )}
      </section>

      {/* Results */}
      <section className="px-6 pb-8 mx-auto max-w-7xl">
        {mentors.length === 0 ? (
          <div className="p-12 text-center glass-card rounded-2xl">
            <p className="text-white/40">No mentors match your filters</p>
            {hasActiveFilters && (
              <button onClick={clearFilters} className="mt-3 text-sm text-primary hover:underline">
                Clear filters
              </button>
            )}
          </div>
        ) : (
          <>
            <p className="mb-4 text-sm text-white/40">
              {data?.total || mentors.length} mentor
              {(data?.total || mentors.length) !== 1 ? "s" : ""} found
            </p>
            <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
              {mentors.map((mentor) => (
                <MentorCard key={mentor._id} mentor={mentor} />
              ))}
            </div>
          </>
        )}
      </section>

      {/* Pagination */}
      {totalPages > 1 && (
        <section className="px-6 pb-20 mx-auto max-w-7xl">
          <div className="flex items-center justify-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="px-4 py-2 text-sm font-medium transition rounded-full bg-surface text-primary border border-white/5 hover:bg-white/[0.06] disabled:opacity-30 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
              const start = Math.max(1, page - 2);
              const p = start + i;
              if (p > totalPages) return null;
              return (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`w-10 h-10 text-sm font-medium rounded-full transition ${
                    p === page
                      ? "bg-primary text-white"
                      : "bg-surface text-primary border border-white/5 hover:bg-white/[0.06]"
                  }`}
                >
                  {p}
                </button>
              );
            })}
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="px-4 py-2 text-sm font-medium transition rounded-full bg-surface text-primary border border-white/5 hover:bg-white/[0.06] disabled:opacity-30 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </section>
      )}
    </main>
  );
};

export default MentorPage;
