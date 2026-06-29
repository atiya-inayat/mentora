"use client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/axios";
import Navbar from "@/app/components/shared/Navbar";
import { Shield, ShieldBan, ShieldCheck, Search } from "lucide-react";
import Avatar from "@/app/components/shared/Avatar";
import usePageTitle from "@/lib/hooks/usePageTitle";
import { useState } from "react";
import ConfirmDialog from "@/app/components/shared/ConfirmDialog";

export default function AdminPanel() {
  usePageTitle("Admin Panel");
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [blockTarget, setBlockTarget] = useState(null);

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
          u.role?.toLowerCase().includes(search.toLowerCase()),
      )
    : users;

  return (
    <main className="min-h-screen bg-background">
      <Navbar />

      <div className="px-4 py-12 mx-auto max-w-6xl sm:px-6 lg:px-8">
        <div className="flex items-center gap-3 mb-2">
          <Shield className="w-7 h-7 text-primary" />
          <h1 className="text-3xl font-semibold text-primary font-fugaz">Admin Panel</h1>
        </div>
        <p className="mb-8 text-white/60">Manage users, block accounts, and approve mentors</p>

        <div className="relative mb-6">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, email, or role..."
            className="w-full px-4 py-3 pl-11 border rounded-xl outline-none bg-surface border-white/5 focus:border-primary focus:ring-1 focus:ring-primary text-primary placeholder:text-white/40"
          />
        </div>

        <div className="overflow-hidden glass-card rounded-3xl">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-background border-white/10">
                  <th className="px-6 py-4 text-left text-sm font-semibold text-primary">Name</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-primary">Email</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-primary">Role</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-primary">Status</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-primary">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-primary/10">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-white/40">
                      No users found
                    </td>
                  </tr>
                ) : (
                  filtered.map((u) => (
                    <tr key={u._id} className="transition hover:bg-white/[0.04]">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <Avatar src={u.photo} name={u.name} size="sm" />
                          <span className="font-medium text-primary">{u.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-white/60">{u.email}</td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-block px-3 py-1 text-xs font-medium rounded-full capitalize ${
                            u.role === "admin"
                              ? "bg-purple-500/10 text-purple-400"
                              : u.role === "mentor"
                                ? "bg-blue-500/10 text-blue-400"
                                : "bg-green-500/10 text-green-400"
                          }`}
                        >
                          {u.role}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-full ${
                            u.isBlocked ? "bg-red-100 text-red-600" : "bg-white/[0.06] text-primary"
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
                              onClick={() => setBlockTarget(u)}
                              className="px-3 py-1.5 text-xs font-medium transition rounded-full bg-red-500/10 text-red-400 hover:bg-red-500/[0.15]"
                            >
                              Block
                            </button>
                          )}
                          {u.role === "mentor" && (
                            <button
                              onClick={() => approveMentor(u._id)}
                              className="px-3 py-1.5 text-xs font-medium transition rounded-full bg-white/[0.06] text-primary hover:bg-white/[0.10]"
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

      <ConfirmDialog
        open={!!blockTarget}
        onOpenChange={(open) => !open && setBlockTarget(null)}
        title="Block User"
        description={`Are you sure you want to block ${blockTarget?.name || "this user"}? They will be unable to access their account.`}
        confirmLabel="Block User"
        variant="danger"
        onConfirm={() => {
          if (blockTarget) {
            blockUser(blockTarget._id);
            setBlockTarget(null);
          }
        }}
      />
    </main>
  );
}
