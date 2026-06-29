"use client";
import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/axios";
import Link from "next/link";
import Navbar from "@/app/components/shared/Navbar";
import Avatar from "@/app/components/shared/Avatar";
import useAuthStore from "@/lib/store/authStore";
import { Camera, DollarSign, Code, CheckCircle } from "lucide-react";

export default function CreateMentorProfile() {
  const router = useRouter();
  const { user, updateUser } = useAuthStore();
  const fileInputRef = useRef(null);
  const [form, setForm] = useState({
    bio: "",
    hourlyRate: "",
    skills: "",
  });
  const [photoPreview, setPhotoPreview] = useState(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handlePhotoChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setError("Photo must be under 5MB");
      return;
    }

    setPhotoPreview(URL.createObjectURL(file));
    setUploadingPhoto(true);

    try {
      const formData = new FormData();
      formData.append("photo", file);
      const res = await api.post("/api/users/photo", formData);
      if (res.data.success) {
        updateUser({ photo: res.data.photo });
      }
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to upload photo");
      setPhotoPreview(null);
    } finally {
      setUploadingPhoto(false);
    }
  };

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
      setError(err?.response?.data?.message || "Failed to create profile. Try again.");
    } finally {
      setIsPending(false);
    }
  };

  if (success) {
    return (
      <main className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center min-h-[80vh] px-4">
          <div className="p-12 text-center glass-card rounded-3xl max-w-md w-full">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/[0.06]">
              <CheckCircle className="w-8 h-8 text-primary" />
            </div>
            <h2 className="mt-4 text-2xl font-semibold text-primary">Profile Created!</h2>
            <p className="mt-2 text-white/60">Redirecting to your dashboard...</p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background">
      <Navbar />

      <div className="flex items-center justify-center min-h-[80vh] px-4 py-12">
        <div className="w-full max-w-lg p-8 glass-card rounded-3xl">
          <Link
            href="/mentor/dashboard"
            className="inline-flex items-center gap-1 mb-4 text-xs transition text-white/40 hover:text-primary"
          >
            ← Back to Dashboard
          </Link>
          <div className="mb-8 text-center">
            <div className="relative inline-block">
              <Avatar src={user?.photo || photoPreview} name={user?.name} size="md" />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingPhoto}
                className="absolute bottom-0 right-0 p-1.5 btn-primary rounded-full disabled:opacity-50"
                aria-label="Upload photo"
              >
                <Camera className="w-4 h-4" />
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handlePhotoChange}
                className="hidden"
              />
            </div>
            <h1 className="mt-4 text-3xl font-semibold text-primary font-fugaz">
              Complete Your Profile
            </h1>
            <p className="mt-2 text-white/60">
              Set up your mentor profile to start receiving bookings
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block mb-2 text-sm font-medium text-white/70">Bio</label>
              <textarea
                value={form.bio}
                onChange={(e) => setForm({ ...form, bio: e.target.value })}
                placeholder="Tell mentees about your experience..."
                rows={4}
                className="w-full px-4 py-3 text-sm border rounded-xl outline-none glass-input text-primary placeholder:text-white/40 resize-none"
              />
            </div>

            <div>
              <label className="block mb-2 text-sm font-medium text-white/70">
                Hourly Rate ($)
              </label>
              <div className="relative">
                <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                <input
                  type="number"
                  value={form.hourlyRate}
                  onChange={(e) => setForm({ ...form, hourlyRate: e.target.value })}
                  placeholder="50"
                  min="1"
                  className="w-full px-4 py-3 pl-11 text-sm border rounded-xl outline-none glass-input text-primary placeholder:text-white/40"
                />
              </div>
            </div>

            <div>
              <label className="block mb-2 text-sm font-medium text-white/70">Skills</label>
              <div className="relative">
                <Code className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                <input
                  type="text"
                  value={form.skills}
                  onChange={(e) => setForm({ ...form, skills: e.target.value })}
                  placeholder="React, Node.js, Python"
                  className="w-full px-4 py-3 pl-11 text-sm border rounded-xl outline-none glass-input text-primary placeholder:text-white/40"
                />
              </div>
              <p className="mt-1.5 text-xs text-white/40">Separate skills with commas</p>
            </div>

            {error && (
              <div className="p-3 text-sm text-center rounded-xl bg-red-50 text-red-600">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isPending}
              className="w-full py-3 font-medium transition-all btn-primary rounded-xl"
            >
              {isPending ? "Creating..." : "Create Profile"}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
