import { useQuery } from "@tanstack/react-query";
import { getClient } from "../api-callers/client";
import { Order } from "./use-get-all";

export const useGetOrderById = (orderId: string | null) => {
  return useQuery<Order>({
    queryKey: ["order", orderId],
    queryFn: async () => {
      if (!orderId) throw new Error("Order ID is required");
      const response = await getClient<Order>({
        url: `/api/orders/${orderId}`,
      });
      return response;
    },
    enabled: !!orderId,
    staleTime: 0,
  });
};
