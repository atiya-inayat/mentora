"use client";

import { useState } from "react";
import api from "@/lib/axios";
import useAuthStore from "@/lib/store/authStore";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Eye, EyeOff } from "lucide-react";

// Validation Schema
const registerSchema = z
  .object({
    name: z.string().trim().min(1, "Name is required"),

    email: z.string().trim().toLowerCase().email("Invalid email"),

    password: z
      .string()
      .min(8, "Minimum 8 characters")
      .regex(/[0-9]/, "Must include at least one number")
      .regex(/[^A-Za-z0-9]/, "Must include at least one special character"),

    confirmPassword: z.string().min(8, "Minimum 8 characters"),

    role: z
      .string()
      .min(1, "Must select role")
      .refine((val) => ["mentor", "mentee"].includes(val), {
        message: "Invalid role",
      }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export default function RegisterPage() {
  const router = useRouter();
  const { setAuth } = useAuthStore();
  const queryClient = useQueryClient();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      role: "",
    },
  });

  const { mutate, isPending, error } = useMutation({
    mutationFn: async (data) => {
      const res = await api.post("/api/auth/register", data);
      return res.data;
    },

    onSuccess: (data) => {
      queryClient.clear();

      const { user } = data;

      setAuth(user);

      const role = user?.role;

      const routes = {
        admin: "/admin/dashboard",
        mentor: "/mentor/dashboard",
        mentee: "/dashboard",
      };

      router.push(routes[role] ?? "/unauthorized");
    },
  });

  const onSubmit = (data) => {
    const { confirmPassword, ...rest } = data;
    mutate(rest);
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

          <p className="mt-1 text-sm text-primary/70">
            Create your account and start your journey
          </p>
        </div>

        {/* Form */}
        <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
          {/* Role */}
          <div>
            <label className="block mb-1 text-sm font-medium text-primary/80">
              Role
            </label>

            <select
              {...register("role")}
              className="w-full px-3 py-2 text-sm border rounded-md outline-none bg-background border-primary/20 focus:border-primary focus:ring-1 focus:ring-primary"
            >
              <option value="" disabled>
                Select role
              </option>

              <option value="mentor">Mentor</option>
              <option value="mentee">Mentee</option>
            </select>

            {errors.role && (
              <p className="mt-1 text-xs text-red-500">{errors.role.message}</p>
            )}
          </div>

          {/* Name */}
          <div>
            <label className="block mb-1 text-sm font-medium text-primary/80">
              Name
            </label>

            <input
              {...register("name")}
              type="text"
              placeholder="Enter your name"
              className="w-full px-3 py-2 text-sm border rounded-md outline-none bg-background border-primary/20 focus:border-primary focus:ring-1 focus:ring-primary"
            />

            {errors.name && (
              <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>
            )}
          </div>

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

          {/* Confirm Password */}
          <div>
            <label className="block mb-1 text-sm font-medium text-primary/80">
              Confirm Password
            </label>

            <div className="relative">
              <input
                {...register("confirmPassword")}
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirm your password"
                className="w-full px-3 py-2 pr-10 text-sm border rounded-md outline-none bg-background border-primary/20 focus:border-primary focus:ring-1 focus:ring-primary"
              />

              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-primary/60 hover:text-primary"
              >
                {showConfirmPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>

            {errors.confirmPassword && (
              <p className="mt-1 text-xs text-red-500">
                {errors.confirmPassword.message}
              </p>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isPending}
            className="w-full py-2.5 text-sm font-medium text-white transition-colors rounded-md bg-primary hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isPending ? "Registering..." : "Create Account"}
          </button>

          {/* API Error */}
          {error && (
            <p className="text-xs text-center text-red-500">
              {error?.response?.data?.message || "Registration failed"}
            </p>
          )}
        </form>

        {/* Footer */}
        <p className="mt-5 text-sm text-center text-primary/70">
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-medium text-primary hover:underline"
          >
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}
