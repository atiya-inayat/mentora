"use client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/axios";

export default function AdminPanel() {
  const queryClient = useQueryClient();

  const { data: usersData, isLoading } = useQuery({
    queryKey: ["admin", "users"],
    queryFn: () => api.get("/admin/getAllUsers").then((r) => r.data),
  });

  const { mutate: blockUser } = useMutation({
    mutationFn: (userId) => api.put(`/admin/users/${userId}/block`),
    onSuccess: () => queryClient.invalidateQueries(["admin", "users"]),
  });

  const { mutate: approveMentor } = useMutation({
    mutationFn: (mentorId) => api.put(`/api/admin/mentors/${mentorId}/approve`),
    onSuccess: () => queryClient.invalidateQueries(["admin"]),
  });

  if (isLoading) return <div>Loading...</div>;

  const users = usersData?.allUsers || [];

  return (
    <div>
      <h1>Admin Panel</h1>
      <h2>All Users</h2>
      {users.map((user) => (
        <div key={user._id}>
          <p>
            {user.name} — {user.role}
          </p>
          <p>Status: {user.isBlocked ? "Blocked" : "Active"}</p>
          <button onClick={() => blockUser(user._id)}>Block</button>
          {user.role === "mentor" && (
            <button onClick={() => approveMentor(user._id)}>
              Approve Mentor
            </button>
          )}
        </div>
      ))}
    </div>
  );
}
