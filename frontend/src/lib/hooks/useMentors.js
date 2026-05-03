import { useQuery } from "@tanstack/react-query";
import api from "@/lib/axios";

// Hook for fetching all mentors
export const useMentors = () => {
  return useQuery({
    queryKey: ["mentors"],
    queryFn: async () => {
      const res = await api.get("/mentors");
      return res.data;
    },
  });
};

// Hook for fetching single mentor
export const useMentor = (id) => {
  return useQuery({
    queryKey: ["mentors", id],
    queryFn: async () => {
      const res = await api.get(`/mentors/${id}`);
      return res.data;
    },
    enabled: !!id, // only runs if id exists
  });
};
