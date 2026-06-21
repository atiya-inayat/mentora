"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/axios";
import Navbar from "@/app/components/shared/Navbar";
import { User, DollarSign, Code, CheckCircle } from "lucide-react";

export default function CreateMentorProfile() {
  const router = useRouter();
  const [form, setForm] = useState({
    bio: "",
    hourlyRate: "",
    skills: "",
  });
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.bio || !form.hourlyRate || !form.skills) {
      setError("All fields are required");
      return;
    }

    const skillsArray = form.skills
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    if (skillsArray.length === 0) {
      setError("Please enter at least one skill");
      return;
    }

    setIsPending(true);

    try {
      const res = await api.post("/api/mentors/profile", {
        bio: form.bio,
        hourlyRate: Number(form.hourlyRate),
        skills: skillsArray,
      });

      if (res.data.success) {
        setSuccess(true);
        setTimeout(() => router.push("/mentor/dashboard"), 2000);
      }
    } catch (err) {
      setError(
        err?.response?.data?.message || "Failed to create profile. Try again."
      );
    } finally {
      setIsPending(false);
    }
  };

  if (success) {
    return (
      <main className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center min-h-[80vh] px-4">
          <div className="p-12 text-center border shadow-lg rounded-3xl bg-surface border-primary/20 max-w-md w-full">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10">
              <CheckCircle className="w-8 h-8 text-primary" />
            </div>
            <h2 className="mt-4 text-2xl font-semibold text-primary">
              Profile Created!
            </h2>
            <p className="mt-2 text-primary/70">
              Redirecting to your dashboard...
            </p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background">
      <Navbar />

      <div className="flex items-center justify-center min-h-[80vh] px-4 py-12">
        <div className="w-full max-w-lg p-8 border shadow-lg rounded-3xl bg-surface border-primary/20">
          <div className="mb-8 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary">
              <User className="w-8 h-8 text-background" />
            </div>
            <h1 className="mt-4 text-3xl font-semibold text-primary font-fugaz">
              Complete Your Profile
            </h1>
            <p className="mt-2 text-primary/70">
              Set up your mentor profile to start receiving bookings
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block mb-2 text-sm font-medium text-primary/80">
                Bio
              </label>
              <textarea
                value={form.bio}
                onChange={(e) => setForm({ ...form, bio: e.target.value })}
                placeholder="Tell mentees about your experience..."
                rows={4}
                className="w-full px-4 py-3 text-sm border rounded-xl outline-none bg-background border-primary/20 focus:border-primary focus:ring-1 focus:ring-primary text-primary placeholder:text-primary/50 resize-none"
              />
            </div>

            <div>
              <label className="block mb-2 text-sm font-medium text-primary/80">
                Hourly Rate ($)
              </label>
              <div className="relative">
                <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-primary/50" />
                <input
                  type="number"
                  value={form.hourlyRate}
                  onChange={(e) => setForm({ ...form, hourlyRate: e.target.value })}
                  placeholder="50"
                  min="1"
                  className="w-full px-4 py-3 pl-11 text-sm border rounded-xl outline-none bg-background border-primary/20 focus:border-primary focus:ring-1 focus:ring-primary text-primary placeholder:text-primary/50"
                />
              </div>
            </div>

            <div>
              <label className="block mb-2 text-sm font-medium text-primary/80">
                Skills
              </label>
              <div className="relative">
                <Code className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-primary/50" />
                <input
                  type="text"
                  value={form.skills}
                  onChange={(e) => setForm({ ...form, skills: e.target.value })}
                  placeholder="React, Node.js, Python"
                  className="w-full px-4 py-3 pl-11 text-sm border rounded-xl outline-none bg-background border-primary/20 focus:border-primary focus:ring-1 focus:ring-primary text-primary placeholder:text-primary/50"
                />
              </div>
              <p className="mt-1.5 text-xs text-primary/50">
                Separate skills with commas
              </p>
            </div>

            {error && (
              <div className="p-3 text-sm text-center rounded-xl bg-red-50 text-red-600">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isPending}
              className="w-full py-3 font-medium transition-all rounded-xl bg-primary text-background hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isPending ? "Creating..." : "Create Profile"}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
