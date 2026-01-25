"use client";

import { useQuery } from "@tanstack/react-query";
import { getClient } from "../api-callers/client";

export interface CustomerLedgerEntry {
  _id: string;
  customerId: string;
  entryType: "debit" | "credit";
  amount: number;
  sourceType: string;
  sourceId: string;
  balance: number;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

interface GetCustomerLedgerEntriesResponse {
  data: CustomerLedgerEntry[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export function useGetCustomerLedgerEntries(
  customerId: string,
  page: number = 1,
  limit: number = 10,
  startDate?: string,
  endDate?: string,
) {
  return useQuery<GetCustomerLedgerEntriesResponse>({
    queryKey: [
      "customer-ledger-entries",
      customerId,
      page,
      limit,
      startDate,
      endDate,
    ],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });

      if (startDate) params.append("startDate", startDate);
      if (endDate) params.append("endDate", endDate);

      const response = await getClient<GetCustomerLedgerEntriesResponse>({
        url: `/api/ledger/customer/${customerId}/entries?${params.toString()}`,
      });
      return response;
    },
    enabled: !!customerId,
  });
}
