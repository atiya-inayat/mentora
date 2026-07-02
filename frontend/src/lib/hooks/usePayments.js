import { useMutation } from "@tanstack/react-query";
import api from "@/lib/axios";

export const useCreateCheckout = () => {
  return useMutation({
    mutationFn: ({ slotId, notes }) =>
      api.post("/api/payments/create-checkout", { slotId, notes }).then((r) => r.data),
  });
};
