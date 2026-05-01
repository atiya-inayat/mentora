"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import useAuthStore from "@/lib/store/authStore";
import api from "@/lib/axios";

// Define validation schema with zod
const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email("Invalid email"),
  password: z.string().min(1, "Password is required"),
});

export default function LoginPage() {
  const router = useRouter();
  const { setAuth } = useAuthStore();

  // setup form with validation
  // useForm - This creates a form system for us.
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema), // This connects Zod validation to React Hook Form.
  });
  // setup mutation
  const { mutate, isPending, error } = useMutation({
    mutationFn: async (data) => {
      const res = await api.post("/auth/login", data);
      return res.data;
    },
    onSuccess: (data) => {
      const { user, token } = data;
      setAuth(user, token);
      localStorage.setItem("token", token);
      const role = user?.role;
      const routes = {
        admin: "/admin/dashboard",
        mentee: "/dashboard",
        mentor: "/mentor/dashboard",
      };

      router.push(routes[role] ?? "/unauthorized");
    },
  });

  const onSubmit = (data) => {
    mutate(data);
  };
  return (
    <div>
      <h1>Login to Mentora</h1>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div>
          <input {...register("email")} placeholder="Email" type="email" />
          {errors.email && <p>{errors.email.message}</p>}
        </div>

        <div>
          <input
            {...register("password")}
            placeholder="Password"
            type="password"
          />
          {errors.password && <p>{errors.password.message}</p>}
        </div>

        <button type="submit" disabled={isPending}>
          {isPending ? "Logging in..." : "Login"}
        </button>

        {error && <p>{error?.response?.data?.message || "Login failed"}</p>}
      </form>
    </div>
  );
}
