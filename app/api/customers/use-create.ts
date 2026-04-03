import { useMutation, useQueryClient } from "@tanstack/react-query";
import { postClient } from "../api-callers/client";

export interface CreateCustomerPayload {
  firstName: string;
  lastName: string;
  phoneNumber: string;
  email: string;
  streetAddress: string;
  city: string;
  state: string;
  balanceAdjustment?: {
    amount: number;
    direction: "customer_owes" | "we_owe_customer";
    note?: string;
  };
}

export interface CreateCustomerResponse {
  data: {
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
  };
  message: string;
}

export const useCreateCustomer = () => {
  const queryClient = useQueryClient();

  return useMutation<CreateCustomerResponse, Error, CreateCustomerPayload>({
    mutationFn: async (payload: CreateCustomerPayload) => {
      const response = await postClient<CreateCustomerResponse>({
        url: "/api/customers",
        body: payload,
      });
      return response;
    },
    onSuccess: () => {
      // Invalidate customers queries to refetch the list
      queryClient.invalidateQueries({ queryKey: ["customers"] });
    },
  });
};
