import { useQuery } from "@tanstack/react-query";
import api from "@/lib/axios";

export const useSession = (sessionId) => {
  return useQuery({
    queryKey: ["session", sessionId],
    queryFn: async () => {
      const res = await api.get(`/sessions/${sessionId}`);
      return res.data;
    },
    enabled: !!sessionId,
  });
};
