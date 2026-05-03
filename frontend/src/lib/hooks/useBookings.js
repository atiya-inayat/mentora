import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/axios";

// useQuery - Fetch data from server and keep it updated automatically - useQuery → GET bookings
// useMutation - Send data to server (create, update, delete) - useMutation → POST / DELETE / PUT
// useQueryClient - Tell React Query: "data is outdated → refetch it" - useQueryClient → refetch updated data

export const useMyBookings = () => {
  return useQuery({
    queryKey: ["bookings", "my"],
    queryFn: async () => {
      const res = await api.get("/bookings/my");
      return res.data;
    },
  });
};

export const useCreateBooking = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ mentorId, scheduledAt }) => {
      const res = await api.post(`/bookings/${mentorId}`, { scheduledAt });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["bookings"]);
    },
  });
};
