import { useMutation, useQueryClient } from "@tanstack/react-query";
import { patchClient } from "../api-callers/client";

export interface CancelOrderResponse {
  data: {
    _id: string;
    status: string;
    updatedAt: string;
  };
  message: string;
}

export const useCancelOrder = () => {
  const queryClient = useQueryClient();

  return useMutation<CancelOrderResponse, Error, string>({
    mutationFn: async (orderId: string) => {
      const response = await patchClient<CancelOrderResponse>({
        url: `/api/orders/${orderId}/cancel`,
        body: {},
      });
      return response;
    },
    onSuccess: () => {
      // Invalidate orders queries to refetch the list
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["order"] });
      // Invalidate products queries to update quantities after cancellation
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-metrics"] });
    },
  });
};
