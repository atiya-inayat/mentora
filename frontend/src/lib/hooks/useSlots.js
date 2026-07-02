import { useQuery, useMutation } from "@tanstack/react-query";
import api from "@/lib/axios";

export const useAvailableSlots = (mentorId, days = 7) => {
  return useQuery({
    queryKey: ["slots", mentorId, days],
    queryFn: () => api.get(`/api/slots/${mentorId}?days=${days}`).then((r) => r.data),
    enabled: !!mentorId,
  });
};

export const useReserveSlot = () => {
  return useMutation({
    mutationFn: ({ mentorId, startTime }) =>
      api.post(`/api/slots/${mentorId}/reserve`, { startTime }).then((r) => r.data),
  });
};

export const useReleaseSlot = () => {
  return useMutation({
    mutationFn: (slotId) => api.post(`/api/slots/${slotId}/release`),
  });
};
