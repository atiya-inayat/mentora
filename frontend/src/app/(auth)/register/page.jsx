"use client";

import api from "@/lib/axios";
import useAuthStore from "@/lib/store/authStore";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { z } from "zod";

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
      const { user, token } = data;

      setAuth(user, token);

      document.cookie = `token=${token}; path=/; max-age=${7 * 24 * 60 * 60}`;

      localStorage.setItem("token", token);

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
    <div className="flex items-center justify-center min-h-screen px-4 bg-white">
      <div className="w-full max-w-md p-6 border rounded-lg shadow-sm bg-surface border-primary/20">
        {/* Header */}
        <div className="mb-6 text-center">
          <h1 className="text-3xl font-semibold tracking-tight text-primary font-poppins">
            Mentora
          </h1>

          <p className="mt-1 text-sm text-gray-600">
            Create your account and start your journey
          </p>
        </div>

        {/* Form */}
        <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
          {/* Role */}
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">
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
            <label className="block mb-1 text-sm font-medium text-gray-700">
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

          {/* Confirm Password */}
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">
              Confirm Password
            </label>

            <input
              {...register("confirmPassword")}
              type="password"
              placeholder="Confirm your password"
              className="w-full px-3 py-2 text-sm border rounded-md outline-none bg-background border-primary/20 focus:border-primary focus:ring-1 focus:ring-primary"
            />

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
        <p className="mt-5 text-sm text-center text-gray-600">
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
