"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import api from "@/lib/axios";
import Link from "next/link";
import { Eye, EyeOff, CheckCircle, ArrowLeft } from "lucide-react";
import usePageTitle from "@/lib/hooks/usePageTitle";

export default function ResetPasswordPage() {
  usePageTitle("Reset Password");
  const { token } = useParams();
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [status, setStatus] = useState("idle");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    if (password !== confirmPassword) {
      setStatus("error");
      setMessage("Passwords do not match");
      return;
    }

    setStatus("loading");
    try {
      const res = await api.post("/api/auth/reset", { token, password });
      setStatus("success");
      setMessage("Password has been reset successfully!");
    } catch (err) {
      setStatus("error");
      setMessage(err?.response?.data?.message || "Failed to reset password");
    }
  };

  if (status === "success") {
    return (
      <div className="flex items-center justify-center min-h-screen px-4 bg-background">
        <div className="w-full max-w-md p-6 glass-card rounded-2xl text-center">
          <CheckCircle className="w-12 h-12 mx-auto text-primary mb-4" />
          <h2 className="text-xl font-semibold text-primary mb-2">Password Reset!</h2>
          <p className="text-sm text-white/60 mb-6">Your password has been reset successfully.</p>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium btn-primary rounded-full"
          >
            <ArrowLeft className="w-4 h-4" />
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen px-4 bg-background">
      <div className="w-full max-w-md p-6 glass-card rounded-2xl">
        <div className="mb-6 text-center">
          <h1 className="text-3xl font-semibold tracking-tight text-primary font-poppins">
            Mentora
          </h1>
          <p className="mt-1 text-sm text-white/60">Enter your new password</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block mb-1 text-sm font-medium text-white/70">New Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter new password"
                className="w-full px-3 py-2 pr-10 text-sm border rounded-lg outline-none glass-input"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute -translate-y-1/2 right-3 top-1/2 text-white/40 hover:text-primary"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block mb-1 text-sm font-medium text-white/70">
              Confirm Password
            </label>
            <input
              type="password"
              required
              minLength={8}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm new password"
              className="w-full px-3 py-2 text-sm border rounded-lg outline-none glass-input"
            />
          </div>

          {status === "error" && <p className="text-xs text-red-500 text-center">{message}</p>}

          <button
            type="submit"
            disabled={status === "loading"}
            className="w-full py-2.5 text-sm font-medium text-white transition btn-primary rounded-xl"
          >
            {status === "loading" ? "Resetting..." : "Reset Password"}
          </button>
        </form>
      </div>
    </div>
  );
}
