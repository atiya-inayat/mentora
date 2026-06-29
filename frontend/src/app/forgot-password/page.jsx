"use client";

import { useState } from "react";
import api from "@/lib/axios";
import Link from "next/link";
import { Mail, ArrowLeft, CheckCircle } from "lucide-react";
import usePageTitle from "@/lib/hooks/usePageTitle";

export default function ForgotPasswordPage() {
  usePageTitle("Forgot Password");
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("idle");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("loading");
    try {
      const res = await api.post("/api/auth/forgot", { email });
      setStatus("success");
      setMessage(res.data.message || "Check your email for the reset link.");
    } catch (err) {
      setStatus("error");
      setMessage(err?.response?.data?.message || "Something went wrong");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen px-4 bg-background">
      <div className="w-full max-w-md p-6 glass-card rounded-2xl">
        <div className="mb-6 text-center">
          <h1 className="text-3xl font-semibold tracking-tight text-primary font-poppins">
            Mentora
          </h1>
          <p className="mt-1 text-sm text-white/60">Reset your password</p>
        </div>

        {status === "success" ? (
          <div className="text-center">
            <CheckCircle className="w-12 h-12 mx-auto text-primary mb-4" />
            <p className="text-sm text-white/70 mb-6">{message}</p>
            <Link
              href="/login"
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium btn-primary rounded-full"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block mb-1 text-sm font-medium text-white/70">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="w-full pl-10 pr-4 py-2.5 text-sm border rounded-lg outline-none glass-input"
                />
              </div>
            </div>

            {status === "error" && <p className="text-xs text-red-500 text-center">{message}</p>}

            <button
              type="submit"
              disabled={status === "loading"}
              className="w-full py-2.5 text-sm font-medium text-white transition btn-primary rounded-xl"
            >
              {status === "loading" ? "Sending..." : "Send Reset Link"}
            </button>

            <p className="text-sm text-center text-white/60">
              Remember your password?{" "}
              <Link href="/login" className="font-medium text-primary hover:underline">
                Login
              </Link>
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
