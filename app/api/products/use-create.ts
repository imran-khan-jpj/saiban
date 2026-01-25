import { useMutation, useQueryClient } from "@tanstack/react-query";
import { postClient } from "../api-callers/client";

export interface CreateProductPayload {
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

export interface CreateProductResponse {
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

export const useCreateProduct = () => {
  const queryClient = useQueryClient();

  return useMutation<CreateProductResponse, Error, CreateProductPayload>({
    mutationFn: async (payload: CreateProductPayload) => {
      const response = await postClient<CreateProductResponse>({
        url: "/api/products",
        body: payload,
      });
      return response;
    },
    onSuccess: () => {
      // Invalidate products queries to refetch the list
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
};
