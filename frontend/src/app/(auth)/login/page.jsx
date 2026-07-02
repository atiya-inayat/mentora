"use client";

import { Suspense, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import useAuthStore from "@/lib/store/authStore";
import { Eye, EyeOff } from "lucide-react";
import usePageTitle from "@/lib/hooks/usePageTitle";

const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email("Invalid email"),
  password: z.string().min(1, "Password is required"),
});

function LoginForm() {
  usePageTitle("Login");
  const searchParams = useSearchParams();
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);

  const { login, isLoading } = useAuthStore();
  const queryClient = useQueryClient();

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
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-semibold tracking-tight text-foreground">Mentora</h1>
          <p className="mt-2 text-muted">Welcome back — log in to your account</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
                className="absolute -translate-y-1/2 right-3 top-1/2 text-muted hover:text-foreground"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {errors.password && (
              <p className="mt-1 text-xs text-red-500">{errors.password.message}</p>
            )}
          </div>

          {errors.root && (
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20">
              <p className="text-xs text-red-400">{errors.root.message}</p>
            </div>
          )}

          <div className="flex items-center justify-between">
            <Link href="/forgot-password" className="text-xs text-muted hover:text-foreground transition-colors">
              Forgot password?
            </Link>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2.5 text-sm font-medium text-white transition-all btn-primary rounded-xl disabled:opacity-50"
          >
            {isLoading ? "Logging in..." : "Login"}
          </button>
        </form>

        <p className="mt-6 text-sm text-center text-muted">
          Don&apos;t have an account?{" "}
          <Link href="/register" className="font-medium text-primary hover:underline">
            Register
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}
