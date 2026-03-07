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
