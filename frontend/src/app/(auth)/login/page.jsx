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

// Validation Schema
const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email("Invalid email"),

  password: z.string().min(1, "Password is required"),
});

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [showPassword, setShowPassword] = useState(false);

  // Redirect URL
  const redirectTo = searchParams.get("redirect") || "/dashboard";

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

  // Submit Handler
  // const onSubmit = async (data) => {
  //   try {
  //     const result = await login(data);

  //     if (result.success) {
  //       const roleRoutes = {
  //         admin: "/admin/dashboard",
  //         mentee: "/dashboard",
  //         mentor: "/mentor/dashboard",
  //       };

  //       router.push(roleRoutes[result.user?.role] || redirectTo);
  //     }
  //   } catch (error) {
  //     const message =
  //       error?.response?.data?.message || "Login failed. Please try again.";

  //     setError("root", { message });
  //   }
  // };
  // const onSubmit = async (data) => {
  //   try {
  //     const result = await login(data);

  //     // 🔍 Quick debug check to see what your auth store actually outputs
  //     console.log("Login Store Result:", result);

  //     if (result.success) {
  //       const roleRoutes = {
  //         admin: "/admin/dashboard",
  //         mentee: "/dashboard",
  //         mentor: "/mentor/dashboard",
  //       };

  //       // 1. First, check if there is an explicit URL parameter redirect
  //       // 2. Second, try the user's role-based dashboard
  //       // 3. Fallback to a safe hardcoded path
  //       const targetDestination =
  //         searchParams.get("redirect") ||
  //         roleRoutes[result?.user?.role] ||
  //         roleRoutes[result?.data?.user?.role] || // Check if nested in .data
  //         "/dashboard";

  //       router.push(targetDestination);
  //       router.refresh(); // Forces Next.js to re-evaluate auth tokens/cookies
  //     }
  //   } catch (error) {
  //     const message =
  //       error?.response?.data?.message || "Login failed. Please try again.";
  //     setError("root", { message });
  //   }
  // };
  const onSubmit = async (data) => {
    try {
      const result = await login(data);

      if (result?.success) {
        queryClient.clear();

        const roleRoutes = {
          admin: "/admin/dashboard",
          mentee: "/dashboard",
          mentor: "/mentor/dashboard",
        };

        // 1. Determine where they are supposed to go
        const targetDestination =
          searchParams.get("redirect") ||
          roleRoutes[result.user?.role] ||
          "/dashboard";

        // 2. Give cross-origin cookies (Port 5000 -> Port 3000) a split second to save
        setTimeout(() => {
          window.location.href = targetDestination;
        }, 300);
      }
    } catch (error) {
      const message =
        error?.response?.data?.message || "Login failed. Please try again.";
      setError("root", { message });
    }
  };
  return (
    <div className="flex items-center justify-center min-h-screen px-4 bg-background">
      <div className="w-full max-w-md p-6 border rounded-lg shadow-sm bg-surface border-primary/20">
        {/* Back to Home */}
        <Link href="/" className="inline-flex items-center gap-1 mb-4 text-xs transition text-primary/60 hover:text-primary">
          ← Back to Home
        </Link>

        {/* Header */}
        <div className="mb-6 text-center">
          <h1 className="text-3xl font-semibold tracking-tight text-primary font-poppins">
            Mentora
          </h1>

          <p className="mt-1 text-sm text-primary/70">Login to your account</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Email */}
          <div>
            <label className="block mb-1 text-sm font-medium text-primary/80">
              Email
            </label>

            <input
              {...register("email")}
              type="email"
              placeholder="Enter your email"
              className="w-full px-3 py-2 text-sm border rounded-md outline-none bg-background border-primary/20 focus:border-primary focus:ring-1 focus:ring-primary"
            />

            {errors.email && (
              <p className="mt-1 text-xs text-red-500">
                {errors.email.message}
              </p>
            )}
          </div>

          {/* Password */}
          <div>
            <label className="block mb-1 text-sm font-medium text-primary/80">
              Password
            </label>

            <div className="relative">
              <input
                {...register("password")}
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                className="w-full px-3 py-2 pr-10 text-sm border rounded-md outline-none bg-background border-primary/20 focus:border-primary focus:ring-1 focus:ring-primary"
              />

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-primary/60 hover:text-primary"
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>

            {errors.password && (
              <p className="mt-1 text-xs text-red-500">
                {errors.password.message}
              </p>
            )}
          </div>

          {/* Root Error */}
          {errors.root && (
            <div className="p-2 border border-red-200 rounded-md bg-red-50">
              <p className="text-xs text-red-600">{errors.root.message}</p>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2.5 text-sm font-medium text-white transition-colors rounded-md bg-primary hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "Logging in..." : "Login"}
          </button>
        </form>

        {/* Footer */}
        <p className="mt-5 text-sm text-center text-primary/70">
          Don&apos;t have an account?{" "}
          <Link
            href="/register"
            className="font-medium text-primary hover:underline"
          >
            Register
          </Link>
        </p>
      </div>
    </div>
  );
}
