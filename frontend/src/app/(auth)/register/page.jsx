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
import { Eye, EyeOff, Check, GraduationCap, BookOpen } from "lucide-react";
import usePageTitle from "@/lib/hooks/usePageTitle";

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
    role: z.string().min(1, "Select whether you're a Mentor or Mentee"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

const roles = [
  {
    value: "mentor",
    title: "Mentor",
    icon: GraduationCap,
    description: "Share your expertise, mentor others, and earn by hosting 1:1 sessions.",
  },
  {
    value: "mentee",
    title: "Mentee",
    icon: BookOpen,
    description: "Find experienced mentors, book sessions, and accelerate your learning.",
  },
];

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
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: { role: "" },
  });

  const selectedRole = watch("role");

  const { mutate, isPending, error } = useMutation({
    mutationFn: async (data) => {
      const res = await api.post("/api/auth/register", data);
      return res.data;
    },
    onSuccess: (data) => {
      queryClient.clear();
      const { user } = data;
      setAuth(user);
      const routes = {
        admin: "/admin",
        mentor: "/mentor/dashboard",
        mentee: "/dashboard",
      };
      router.push(routes[user?.role] ?? "/unauthorized");
    },
  });

  const onSubmit = (data) => {
    const { confirmPassword, ...rest } = data;
    mutate(rest);
  };

  return (
    <div className="flex items-center justify-center min-h-screen px-4 py-12 bg-background">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-semibold tracking-tight text-foreground">Mentora</h1>
          <p className="mt-2 text-muted">Create your account and start your journey</p>
        </div>

        <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
          {/* Role Cards */}
          <div>
            <p className="mb-3 text-sm font-medium text-muted-foreground">I want to join as a</p>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {roles.map((role) => {
                const isSelected = selectedRole === role.value;
                const Icon = role.icon;
                return (
                  <button
                    key={role.value}
                    type="button"
                    onClick={() => setValue("role", role.value, { shouldValidate: true })}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        setValue("role", role.value, { shouldValidate: true });
                      }
                    }}
                    role="radio"
                    aria-checked={isSelected}
                    tabIndex={0}
                    className={`relative p-5 text-left transition-all duration-200 rounded-2xl border-2 outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background ${
                      isSelected
                        ? "border-primary bg-primary/5 shadow-lg shadow-primary/10"
                        : "border-white/10 bg-surface hover:border-white/20 hover:bg-white/[0.04]"
                    }`}
                  >
                    {isSelected && (
                      <div className="absolute flex items-center justify-center w-5 h-5 rounded-full top-3 right-3 bg-primary">
                        <Check className="w-3 h-3 text-white" />
                      </div>
                    )}
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 transition-colors ${
                      isSelected ? "bg-primary text-white" : "bg-white/[0.06] text-muted-foreground"
                    }`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <h3 className={`text-base font-semibold transition-colors ${
                      isSelected ? "text-primary" : "text-foreground"
                    }`}>
                      {role.title}
                    </h3>
                    <p className="mt-1 text-xs leading-relaxed text-muted">{role.description}</p>
                  </button>
                );
              })}
            </div>
            {errors.role && (
              <p className="mt-2 text-xs text-red-500">{errors.role.message}</p>
            )}
          </div>

          {/* Form Fields */}
          <div className="space-y-4">
            <div>
              <label className="block mb-1 text-sm font-medium text-muted-foreground">Name</label>
              <input
                {...register("name")}
                type="text"
                placeholder="Enter your name"
                className="input-field"
              />
              {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>}
            </div>

            <div>
              <label className="block mb-1 text-sm font-medium text-muted-foreground">Email</label>
              <input
                {...register("email")}
                type="email"
                placeholder="Enter your email"
                className="input-field"
              />
              {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>}
            </div>

            <div>
              <label className="block mb-1 text-sm font-medium text-muted-foreground">Password</label>
              <div className="relative">
                <input
                  {...register("password")}
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  className="input-field pr-10"
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

            <div>
              <label className="block mb-1 text-sm font-medium text-muted-foreground">
                Confirm Password
              </label>
              <div className="relative">
                <input
                  {...register("confirmPassword")}
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm your password"
                  className="input-field pr-10"
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
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="w-full py-2.5 text-sm font-medium text-white transition-all btn-primary rounded-xl disabled:opacity-50"
          >
            {isPending ? "Registering..." : "Create Account"}
          </button>

          {error && (
            <p className="text-xs text-center text-red-500">
              {error?.response?.data?.message || "Registration failed"}
            </p>
          )}
        </form>

        <p className="mt-6 text-sm text-center text-muted">
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-primary hover:underline">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}
