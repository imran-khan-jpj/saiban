import { useMutation, useQueryClient } from "@tanstack/react-query";
import { patchClient } from "../api-callers/client";

export interface UpdateProductPayload {
  name: string;
  shortDescription: string;
  descriptionUrdu: string;
  formulation: string;
  packType: string;
  size: number;
  unitPrice: number;
  lowStockThreshold: number;
  quantityInStock: number;
}

export interface UpdateProductResponse {
  data: {
    _id: string;
    name: string;
    shortDescription: string;
    descriptionUrdu: string;
    formulation: string;
    packType: string;
    size: number;
    unitPrice: number;
    lowStockThreshold: number;
    quantityInStock: number;
    createdAt: string;
    updatedAt: string;
    __v: number;
  };
  message: string;
}

export const useUpdateProduct = () => {
  const queryClient = useQueryClient();

  return useMutation<
    UpdateProductResponse,
    Error,
    { productId: string; data: UpdateProductPayload }
  >({
    mutationFn: async ({ productId, data }) => {
      const response = await patchClient<UpdateProductResponse>({
        url: `/api/products/${productId}`,
        body: data,
      });
      return response;
    },
    onSuccess: () => {
      // Invalidate products queries to refetch the list
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
};
