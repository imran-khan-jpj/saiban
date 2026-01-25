import { useMutation, useQueryClient } from "@tanstack/react-query";
import { postClient } from "../api-callers/client";

export interface CreateOrderPayload {
  customerId: string;
  items: Array<{
    productId: string;
    quantity: number;
    discountPercentage: number;
  }>;
  paymentMethod: string;
  note: string;
}

export interface CreateOrderResponse {
  data: {
    _id: string;
    customer: string;
    items: Array<{
      product: string;
      quantity: number;
      price: number;
    }>;
    totalAmount: number;
    status: string;
    createdAt: string;
    updatedAt: string;
    __v: number;
  };
  message: string;
}

export const useCreateOrder = () => {
  const queryClient = useQueryClient();

  return useMutation<CreateOrderResponse, Error, CreateOrderPayload>({
    mutationFn: async (payload: CreateOrderPayload) => {
      const response = await postClient<CreateOrderResponse>({
        url: "/api/orders",
        body: payload,
      });
      return response;
    },
    onSuccess: () => {
      // Invalidate orders queries to refetch the list
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
  });
};
