import { useMutation } from "@tanstack/react-query";
import api from "@/lib/axios";

export const useInitiatePayment = () => {
  return useMutation({
    mutationFn: async (bookingId) => {
      const res = await api.post(`/api/payments/initiate/${bookingId}`);
      return res.data;
    },
  });
};
