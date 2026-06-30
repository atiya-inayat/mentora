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
import usePageTitle from "@/lib/hooks/usePageTitle";

// Validation Schema
const registerSchema = z
  .object({
    name: z.string().trim().min(1, "Name is required"),

    email: z.string().trim().toLowerCase().email("Invalid email"),

    password: z
      .string()
      .min(8, "Minimum 8 characters")
      .regex(/[A-Z]/, "Must include at least one uppercase letter")
      .regex(/[a-z]/, "Must include at least one lowercase letter")
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
  usePageTitle("Register");
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
        admin: "/admin",
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
      <div className="w-full max-w-md p-6 card">
        {/* Header */}
        <div className="mb-6 text-center">
          <h1 className="text-3xl font-semibold tracking-tight text-foreground">
            Mentora
          </h1>

          <p className="mt-1 text-sm text-muted">Create your account and start your journey</p>
        </div>

        {/* Form */}
        <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
          {/* Role */}
          <div>
            <label className="block mb-1 text-sm font-medium text-muted-foreground">Role</label>

            <select
              {...register("role")}
              className="w-full px-3 py-2 text-sm border rounded-lg outline-none input-field"
            >
              <option value="" disabled>
                Select role
              </option>

              <option value="mentor">Mentor</option>
              <option value="mentee">Mentee</option>
            </select>

            {errors.role && <p className="mt-1 text-xs text-red-500">{errors.role.message}</p>}
          </div>

          {/* Name */}
          <div>
            <label className="block mb-1 text-sm font-medium text-muted-foreground">Name</label>

            <input
                {...register("name")}
                type="text"
                placeholder="Enter your name"
                className="w-full px-3 py-2 text-sm border rounded-lg outline-none input-field"
              />

              {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>}
            </div>

            {/* Email */}
            <div>
              <label className="block mb-1 text-sm font-medium text-muted-foreground">Email</label>

              <input
                {...register("email")}
                type="email"
                placeholder="Enter your email"
                className="w-full px-3 py-2 text-sm border rounded-lg outline-none input-field"
            />

            {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>}
          </div>

          {/* Password */}
          <div>
            <label className="block mb-1 text-sm font-medium text-muted-foreground">Password</label>

            <div className="relative">
              <input
                {...register("password")}
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                className="w-full px-3 py-2 pr-10 text-sm border rounded-lg outline-none input-field"
              />

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute -translate-y-1/2 right-3 top-1/2 text-muted hover:text-primary"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {errors.password && (
              <p className="mt-1 text-xs text-red-500">{errors.password.message}</p>
            )}
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block mb-1 text-sm font-medium text-muted-foreground">
              Confirm Password
            </label>

            <div className="relative">
              <input
                {...register("confirmPassword")}
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirm your password"
                className="w-full px-3 py-2 pr-10 text-sm border rounded-lg outline-none input-field"
              />

              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute -translate-y-1/2 right-3 top-1/2 text-muted hover:text-primary"
                aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
              >
                {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {errors.confirmPassword && (
              <p className="mt-1 text-xs text-red-500">{errors.confirmPassword.message}</p>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isPending}
            className="w-full py-2.5 text-sm font-medium text-white transition-colors btn-primary rounded-xl"
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
        <p className="mt-5 text-sm text-center text-muted">
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-primary hover:underline">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}
