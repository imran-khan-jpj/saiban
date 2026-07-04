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
  /**
   * Note entered with the opening balance when the customer was created.
   * Sourced (read-only) from the opening-balance ledger adjustment; `null`
   * when no opening balance was set or it had no note.
   */
  openingBalanceNote?: string | null;
  createdAt: string;
  updatedAt: string;
  __v: number;
  balance: {
    netBalance: number;
    direction: string;
    absoluteAmount: number;
  };
}

export const useGetCustomerById = (customerId: string) => {
  return useQuery<Customer>({
    queryKey: ["customer", customerId],
    queryFn: async () => {
      const response = await getClient<Customer>({
        url: `/api/customers/${customerId}`,
      });
      return response;
    },
    enabled: !!customerId,
  });
};
