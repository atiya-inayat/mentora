"use client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/axios";
import Navbar from "@/app/components/shared/Navbar";
import {
  Shield,
  User,
  ShieldBan,
  ShieldCheck,
  Search,
} from "lucide-react";
import { useState } from "react";

export default function AdminPanel() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");

  const { data: usersData, isLoading } = useQuery({
    queryKey: ["admin", "users"],
    queryFn: () => api.get("/api/admin/getAllUsers").then((r) => r.data),
  });

  const { mutate: blockUser } = useMutation({
    mutationFn: (userId) => api.put(`/api/admin/users/${userId}/block`),
    onSuccess: () => queryClient.invalidateQueries(["admin", "users"]),
  });

  const { mutate: approveMentor } = useMutation({
    mutationFn: (mentorId) => api.put(`/api/admin/mentors/${mentorId}/approve`),
    onSuccess: () => queryClient.invalidateQueries(["admin", "users"]),
  });

  if (isLoading)
    return (
      <div className="flex items-center justify-center min-h-screen bg-background text-primary">
        Loading...
      </div>
    );

  const users = usersData?.allUsers || [];

  const filtered = search
    ? users.filter(
        (u) =>
          u.name?.toLowerCase().includes(search.toLowerCase()) ||
          u.email?.toLowerCase().includes(search.toLowerCase()) ||
          u.role?.toLowerCase().includes(search.toLowerCase())
      )
    : users;

  return (
    <main className="min-h-screen bg-background">
      <Navbar />

      <div className="px-4 py-12 mx-auto max-w-6xl sm:px-6 lg:px-8">
        <div className="flex items-center gap-3 mb-2">
          <Shield className="w-7 h-7 text-primary" />
          <h1 className="text-3xl font-semibold text-primary font-fugaz">
            Admin Panel
          </h1>
        </div>
        <p className="mb-8 text-primary/70">
          Manage users, block accounts, and approve mentors
        </p>

        <div className="relative mb-6">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-primary/50" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, email, or role..."
            className="w-full px-4 py-3 pl-11 border rounded-xl outline-none bg-surface border-primary/20 focus:border-primary focus:ring-1 focus:ring-primary text-primary placeholder:text-primary/50"
          />
        </div>

        <div className="overflow-hidden border shadow-lg rounded-3xl bg-surface border-primary/20">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-background border-primary/10">
                  <th className="px-6 py-4 text-left text-sm font-semibold text-primary">
                    Name
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-primary">
                    Email
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-primary">
                    Role
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-primary">
                    Status
                  </th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-primary">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-primary/10">
                {filtered.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-6 py-12 text-center text-primary/50"
                    >
                      No users found
                    </td>
                  </tr>
                ) : (
                  filtered.map((u) => (
                    <tr key={u._id} className="transition hover:bg-background/50">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10">
                            <User className="w-4 h-4 text-primary" />
                          </div>
                          <span className="font-medium text-primary">
                            {u.name}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-primary/70">
                        {u.email}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-block px-3 py-1 text-xs font-medium rounded-full capitalize ${
                            u.role === "admin"
                              ? "bg-purple-100 text-purple-700"
                              : u.role === "mentor"
                                ? "bg-blue-100 text-blue-700"
                                : "bg-green-100 text-green-700"
                          }`}
                        >
                          {u.role}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-full ${
                            u.isBlocked
                              ? "bg-red-100 text-red-600"
                              : "bg-primary/10 text-primary"
                          }`}
                        >
                          {u.isBlocked ? (
                            <ShieldBan className="w-3 h-3" />
                          ) : (
                            <ShieldCheck className="w-3 h-3" />
                          )}
                          {u.isBlocked ? "Blocked" : "Active"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {!u.isBlocked && (
                            <button
                              onClick={() => blockUser(u._id)}
                              className="px-3 py-1.5 text-xs font-medium transition rounded-full bg-red-100 text-red-600 hover:bg-red-200"
                            >
                              Block
                            </button>
                          )}
                          {u.role === "mentor" && (
                            <button
                              onClick={() => approveMentor(u._id)}
                              className="px-3 py-1.5 text-xs font-medium transition rounded-full bg-primary/10 text-primary hover:bg-primary/20"
                            >
                              Approve
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </main>
  );
}
