import { useQuery } from "@tanstack/react-query";
import { getClient } from "../api-callers/client";

export interface Customer {
  _id: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  email: string;
  streetAddress: string;
  city: string;
  state: string;
  createdAt: string;
  updatedAt: string;
}

export interface GetAllCustomersResponse {
  data: Customer[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export const useGetAllCustomers = (page: number = 1, limit: number = 10, search?: string) => {
  return useQuery<GetAllCustomersResponse>({
    queryKey: ["customers", page, limit, search],
    queryFn: async () => {
      const searchParam = search ? `&search=${encodeURIComponent(search)}` : '';
      const response = await getClient<GetAllCustomersResponse>({
        url: `/api/customers?page=${page}&limit=${limit}${searchParam}`,
      });
      return response;
    },
  });
};
