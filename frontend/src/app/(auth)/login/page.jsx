"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import useAuthStore from "@/lib/store/authStore";

// Validation Schema
const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email("Invalid email"),

  password: z.string().min(1, "Password is required"),
});

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Redirect URL
  const redirectTo = searchParams.get("redirect") || "/dashboard";

  // Auth Store
  const { login, isLoading } = useAuthStore();

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
  const onSubmit = async (data) => {
    try {
      const result = await login(data);

      if (result.success) {
        const roleRoutes = {
          admin: "/admin/dashboard",
          mentee: "/dashboard",
          mentor: "/mentor/dashboard",
        };

        router.push(roleRoutes[result.user?.role] || redirectTo);
      }
    } catch (error) {
      const message =
        error?.response?.data?.message || "Login failed. Please try again.";

      setError("root", { message });
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen px-4 bg-white">
      <div className="w-full max-w-md p-6 border rounded-lg shadow-sm bg-surface border-primary/20">
        {/* Header */}
        <div className="mb-6 text-center">
          <h1 className="text-3xl font-semibold tracking-tight text-primary font-poppins">
            Mentora
          </h1>

          <p className="mt-1 text-sm text-gray-600">Login to your account</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Email */}
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">
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
            <label className="block mb-1 text-sm font-medium text-gray-700">
              Password
            </label>

            <input
              {...register("password")}
              type="password"
              placeholder="Enter your password"
              className="w-full px-3 py-2 text-sm border rounded-md outline-none bg-background border-primary/20 focus:border-primary focus:ring-1 focus:ring-primary"
            />

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
        <p className="mt-5 text-sm text-center text-gray-600">
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
