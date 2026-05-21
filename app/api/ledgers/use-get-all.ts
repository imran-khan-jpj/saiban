import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { getClient } from "../api-callers/client";

export interface LedgerEntry {
  _id: string;
  customerId:
    | {
        _id: string;
        firstName: string;
        lastName: string;
        email: string;
      }
    | string;
  entryType: "debit" | "credit";
  amount: number;
  sourceType: string;
  sourceId: string;
  balance: number;
  note: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface GetAllLedgerEntriesResponse {
  data: LedgerEntry[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export const useGetAllLedgerEntries = (
  page: number = 1,
  limit: number = 10,
  customerId?: string,
  startDate?: string,
  endDate?: string,
) => {
  return useQuery<GetAllLedgerEntriesResponse>({
    queryKey: ["ledger-entries", page, limit, customerId, startDate, endDate],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });

      if (customerId) params.append("customerId", customerId);
      if (startDate) params.append("startDate", startDate);
      if (endDate) params.append("endDate", endDate);

      const response = await getClient<GetAllLedgerEntriesResponse>({
        url: `/api/ledger/entries?${params.toString()}`,
      });
      return response;
    },
    placeholderData: keepPreviousData,
  });
};
