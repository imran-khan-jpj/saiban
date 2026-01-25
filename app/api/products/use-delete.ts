import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteClient } from "../api-callers/client";

export interface DeleteProductResponse {
  message: string;
}

export const useDeleteProduct = () => {
  const queryClient = useQueryClient();

  return useMutation<DeleteProductResponse, Error, string>({
    mutationFn: async (productId: string) => {
      const response = await deleteClient<DeleteProductResponse>({
        url: `/api/products/${productId}`,
      });
      return response;
    },
    onSuccess: () => {
      // Invalidate products queries to refetch the list
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
};
