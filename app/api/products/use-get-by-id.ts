import { useQuery } from "@tanstack/react-query";
import { getClient } from "../api-callers/client";
import { Product } from "./use-get-all";

export const useGetProductById = (productId: string | null) => {
  return useQuery<Product>({
    queryKey: ["product", productId],
    queryFn: async () => {
      if (!productId) throw new Error("Product ID is required");
      const response = await getClient<Product>({
        url: `/api/products/${productId}`,
      });
      return response;
    },
    enabled: !!productId,
    staleTime: 0,
  });
};
