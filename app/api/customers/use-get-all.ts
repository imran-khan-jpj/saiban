import { keepPreviousData, useQuery } from "@tanstack/react-query";
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

/** `name` — alphabetical (default API behavior); `recent` — newest customers first (`createdAt` desc). */
export type CustomersListSort = "name" | "recent";

export const useGetAllCustomers = (
  page: number = 1,
  limit: number = 10,
  search?: string,
  sort?: CustomersListSort,
) => {
  return useQuery<GetAllCustomersResponse>({
    queryKey: ["customers", page, limit, search, sort],
    queryFn: async () => {
      const searchParam = search ? `&search=${encodeURIComponent(search)}` : "";
      const sortParam =
        sort === "recent" || sort === "name" ? `&sort=${sort}` : "";
      const response = await getClient<GetAllCustomersResponse>({
        url: `/api/customers?page=${page}&limit=${limit}${searchParam}${sortParam}`,
      });
      return response;
    },
    placeholderData: keepPreviousData,
  });
};
