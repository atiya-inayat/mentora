import { useQuery } from "@tanstack/react-query";
import api from "@/lib/axios";

export const useMentors = (filters = {}) => {
  const params = new URLSearchParams();
  if (filters.search) params.set("search", filters.search);
  if (filters.skill) params.set("skill", filters.skill);
  if (filters.minRate) params.set("minRate", filters.minRate);
  if (filters.maxRate) params.set("maxRate", filters.maxRate);
  if (filters.minRating) params.set("minRating", filters.minRating);
  if (filters.page) params.set("page", filters.page);

  const qs = params.toString();

  return useQuery({
    queryKey: ["mentors", filters],
    queryFn: async () => {
      const res = await api.get(`/api/mentors${qs ? `?${qs}` : ""}`);
      return res.data;
    },
  });
};

// Hook for fetching single mentor
export const useMentor = (id) => {
  return useQuery({
    queryKey: ["mentors", id],
    queryFn: async () => {
      const res = await api.get(`/api/mentors/${id}`);
      return res.data;
    },
    enabled: !!id, // only runs if id exists
  });
};
