import { useMutation, useQueryClient } from "@tanstack/react-query";
import { patchClient } from "../api-callers/client";
import { useParams } from "next/navigation";

export interface ConfirmOrderResponse {
  data: {
    _id: string;
    status: string;
    updatedAt: string;
  };
  message: string;
}

export const useConfirmOrder = () => {
  const queryClient = useQueryClient();
  const { id } = useParams();

  return useMutation<ConfirmOrderResponse, Error, string>({
    mutationFn: async (orderId: string) => {
      const response = await patchClient<ConfirmOrderResponse>({
        url: `/api/orders/${orderId}/confirm`,
        body: {},
      });
      return response;
    },
    onSuccess: () => {
      // Invalidate orders queries to refetch the list
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["order"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-metrics"] });
      if (id) {
        queryClient.invalidateQueries({ queryKey: ["customer", id] });
        queryClient.invalidateQueries({ queryKey: ["customer-orders", id] });
      }
    },
  });
};
