import { useQuery } from "@tanstack/react-query";
import { getClient } from "../api-callers/client";

export interface Product {
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
}

export interface GetAllProductsResponse {
  data: Product[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export const useGetAllProducts = (
  page: number = 1,
  limit: number = 10,
  search?: string,
  stockStatus?: string,
) => {
  return useQuery<GetAllProductsResponse>({
    queryKey: ["products", page, limit, search, stockStatus],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });
      if (search) {
        params.append("search", search);
      }
      if (stockStatus) {
        params.append("stockStatus", stockStatus);
      }
      const response = await getClient<GetAllProductsResponse>({
        url: `/api/products?${params.toString()}`,
      });
      return response;
    },
  });
};
