"use client";

import api from "@/lib/axios";
import useAuthStore from "@/lib/store/authStore";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";

// defining validation schema
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
    <div>
      <h1>Register to Mentora</h1>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div>
          <select {...register("role")}>
            <option value="" disabled>
              Select role
            </option>
            <option value="mentor">Mentor</option>
            <option value="mentee">Mentee</option>
          </select>
          {errors.role && <p>{errors.role.message}</p>}
        </div>

        <div>
          <input {...register("name")} placeholder="Name" type="text" />
          {errors.name && <p>{errors.name.message}</p>}
        </div>
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
        <div>
          <input
            {...register("confirmPassword")}
            placeholder="Confirm Password"
            type="password"
          />
          {errors.confirmPassword && <p>{errors.confirmPassword.message}</p>}
        </div>

        <button type="submit" disabled={isPending}>
          {isPending ? "Registering..." : "Register"}
        </button>

        {error && (
          <p>{error?.response?.data?.message || "Registeration failed"}</p>
        )}
      </form>
    </div>
  );
}
