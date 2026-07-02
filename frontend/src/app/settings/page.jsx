"use client";

import { useState, useRef } from "react";
import api from "@/lib/axios";
import useAuthStore from "@/lib/store/authStore";
import Navbar from "@/app/components/shared/Navbar";
import Avatar from "@/app/components/shared/Avatar";
import usePageTitle from "@/lib/hooks/usePageTitle";
import { Camera, CheckCircle } from "lucide-react";

export default function SettingsPage() {
  usePageTitle("Settings");
  const { user, updateUser } = useAuthStore();
  const fileInputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handlePhotoChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setError("Photo must be under 5MB");
      return;
    }

    setUploading(true);
    setError("");
    setSuccess(false);

    try {
      const formData = new FormData();
      formData.append("photo", file);
      const res = await api.post("/api/users/photo", formData);
      if (res.data.success) {
        updateUser({ photo: res.data.photo });
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      }
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to upload photo");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      <div className="px-4 py-12 mx-auto max-w-2xl sm:px-6 lg:px-8">
        <h1 className="mb-2 text-3xl font-semibold text-foreground">Settings</h1>
        <p className="mb-8 text-muted">Manage your account settings</p>

        <div className="p-8 card">
          <h2 className="mb-6 text-xl font-semibold text-foreground">Profile Photo</h2>

          <div className="flex flex-col items-center gap-6 sm:flex-row">
            <div className="relative">
              <Avatar src={user?.photo} name={user?.name} size="xl" />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="absolute bottom-0 right-0 p-2 btn-primary rounded-full disabled:opacity-50"
                aria-label="Upload photo"
              >
                <Camera className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1">
              <p className="text-sm text-white/70">
                Upload a profile photo so mentors and mentees can recognize you.
              </p>
              <p className="mt-1 text-xs text-white/40">JPEG, PNG, or WebP. Max 5MB.</p>

              <div className="flex items-center gap-3 mt-4">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="px-5 py-2.5 text-sm font-medium rounded-xl bg-primary text-white hover:opacity-90 disabled:opacity-50"
                >
                  {uploading ? "Uploading..." : "Choose Photo"}
                </button>

                {success && (
                  <span className="flex items-center gap-1 text-sm text-success">
                    <CheckCircle className="w-4 h-4" />
                    Saved
                  </span>
                )}
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handlePhotoChange}
                className="hidden"
              />

              {error && <p className="mt-3 text-sm text-red-500">{error}</p>}
            </div>
          </div>
        </div>

        <div className="p-8 mt-6 card rounded-3xl">
          <h2 className="mb-4 text-xl font-semibold text-primary">Account Info</h2>
          <div className="space-y-4">
            <div>
              <label className="block mb-1 text-sm font-medium text-white/70">Name</label>
              <p className="px-4 py-3 text-sm border rounded-xl bg-background border-white/5 text-primary">
                {user?.name || "—"}
              </p>
            </div>
            <div>
              <label className="block mb-1 text-sm font-medium text-white/70">Email</label>
              <p className="px-4 py-3 text-sm border rounded-xl bg-background border-white/5 text-primary">
                {user?.email || "—"}
              </p>
            </div>
            <div>
              <label className="block mb-1 text-sm font-medium text-white/70">Role</label>
              <p className="px-4 py-3 text-sm border rounded-xl bg-background border-white/5 text-primary capitalize">
                {user?.role || "—"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
