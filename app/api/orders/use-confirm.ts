import { useMutation, useQueryClient } from "@tanstack/react-query";
import { patchClient } from "../api-callers/client";

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
    },
  });
};
