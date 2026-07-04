import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/axios";

export const useSession = (sessionId) => {
  return useQuery({
    queryKey: ["session", sessionId],
    queryFn: async () => {
      const res = await api.get(`/api/sessions/${sessionId}`);
      return res.data;
    },
    enabled: !!sessionId,
    retry: false,
  });
};

export const useJoinSession = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (bookingId) => {
      const res = await api.post(`/api/sessions/${bookingId}/join`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
      queryClient.invalidateQueries({ queryKey: ["sessions"] });
    },
  });
};

export const useEndSession = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (bookingId) => {
      const res = await api.put(`/api/sessions/${bookingId}/end`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
      queryClient.invalidateQueries({ queryKey: ["sessions"] });
    },
  });
};

export const useMySessions = () => {
  const { data, isLoading } = useQuery({
    queryKey: ["bookings", "my"],
    queryFn: async () => {
      const res = await api.get("/api/bookings/my");
      return res.data;
    },
  });

  const sessions = (data?.data || []).filter(
    (b) => b.status === "confirmed" || b.status === "completed",
  );

  return { sessions, allBookings: data?.data || [], isLoading };
};