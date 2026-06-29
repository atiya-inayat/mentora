"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import useAuthStore from "@/lib/store/authStore";
import { Eye, EyeOff } from "lucide-react";
import usePageTitle from "@/lib/hooks/usePageTitle";

// Validation Schema
const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email("Invalid email"),

  password: z.string().min(1, "Password is required"),
});

export default function LoginPage() {
  usePageTitle("Login");
  const searchParams = useSearchParams();
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);

  // Auth Store
  const { login, isLoading } = useAuthStore();
  const queryClient = useQueryClient();

  // Form Setup
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data) => {
    try {
      const result = await login(data);

      if (result?.success) {
        queryClient.clear();

        const roleRoutes = {
          admin: "/admin",
          mentee: "/dashboard",
          mentor: "/mentor/dashboard",
        };

        const targetDestination =
          searchParams.get("redirect") || roleRoutes[result.user?.role] || "/dashboard";

        setTimeout(() => {
          router.push(targetDestination);
        }, 300);
      }
    } catch (error) {
      const message = error?.response?.data?.message || "Login failed. Please try again.";
      setError("root", { message });
    }
  };
  return (
    <div className="flex items-center justify-center min-h-screen px-4 bg-background">
      <div className="w-full max-w-md p-6 glass-card rounded-2xl">
        {/* Header */}
        <div className="mb-6 text-center">
          <h1 className="text-3xl font-semibold tracking-tight text-primary font-poppins">
            Mentora
          </h1>

          <p className="mt-1 text-sm text-white/60">Login to your account</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Email */}
          <div>
            <label className="block mb-1 text-sm font-medium text-white/70">Email</label>

            <input
              {...register("email")}
              type="email"
              placeholder="Enter your email"
              className="w-full px-3 py-2 text-sm border rounded-lg outline-none glass-input"
            />

            {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>}
          </div>

          {/* Password */}
          <div>
            <label className="block mb-1 text-sm font-medium text-white/70">Password</label>

            <div className="relative">
              <input
                {...register("password")}
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
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

            {errors.password && (
              <p className="mt-1 text-xs text-red-500">{errors.password.message}</p>
            )}
          </div>

          {/* Root Error */}
          {errors.root && (
            <div className="p-2 border border-red-200 rounded-lg bg-red-50">
              <p className="text-xs text-red-600">{errors.root.message}</p>
            </div>
          )}

          {/* Forgot Password */}
          <div className="text-right">
            <Link href="/forgot-password" className="text-xs text-white/40 hover:text-primary">
              Forgot password?
            </Link>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2.5 text-sm font-medium text-white transition-colors btn-primary rounded-xl"
          >
            {isLoading ? "Logging in..." : "Login"}
          </button>
        </form>

        {/* Footer */}
        <p className="mt-5 text-sm text-center text-white/60">
          Don&apos;t have an account?{" "}
          <Link href="/register" className="font-medium text-primary hover:underline">
            Register
          </Link>
        </p>
      </div>
    </div>
  );
}
