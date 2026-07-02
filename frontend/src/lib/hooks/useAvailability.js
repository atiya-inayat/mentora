import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/axios";

export const useAvailability = (mentorId) => {
  return useQuery({
    queryKey: ["availability", mentorId],
    queryFn: () => api.get(`/api/availability/${mentorId}`).then((r) => r.data),
    enabled: !!mentorId,
  });
};

export const useUpdateAvailability = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => api.put("/api/availability", data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["availability"] }),
  });
};
