import { useQuery } from "@tanstack/react-query";
import { getClient } from "../api-callers/client";

export interface CustomerTransaction {
  _id: string;
  customerId: string;
  entryType: "debit" | "credit";
  amount: number;
  sourceType: string;
  sourceId: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface GetCustomerTransactionsResponse {
  data: CustomerTransaction[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export const useGetCustomerTransactions = (
  customerId: string,
  page: number = 1,
  limit: number = 10,
) => {
  return useQuery<GetCustomerTransactionsResponse>({
    queryKey: ["customer-transactions", customerId, page, limit],
    queryFn: async () => {
      const response = await getClient<GetCustomerTransactionsResponse>({
        url: `/api/customers/${customerId}/transactions?page=${page}&limit=${limit}`,
      });
      return response;
    },
    enabled: !!customerId,
  });
};
