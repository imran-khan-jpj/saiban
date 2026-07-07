import { useMutation, useQueryClient } from "@tanstack/react-query";
import { patchClient } from "../api-callers/client";

export interface UpdateCustomerPayload {
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  email?: string;
  streetAddress?: string;
  city?: string;
  state?: string;
  /** Free-text note / context saved directly on the customer. */
  note?: string;
}

export interface UpdateCustomerResponse {
  data: {
    _id: string;
    firstName: string;
    lastName: string;
    phoneNumber: string;
    email: string;
    streetAddress: string;
    city: string;
    state: string;
    note?: string;
    createdAt: string;
    updatedAt: string;
  };
  message: string;
}

export const useUpdateCustomer = () => {
  const queryClient = useQueryClient();

  return useMutation<
    UpdateCustomerResponse,
    Error,
    { customerId: string; data: UpdateCustomerPayload }
  >({
    mutationFn: async ({ customerId, data }) => {
      const response = await patchClient<UpdateCustomerResponse>({
        url: `/api/customers/${customerId}`,
        body: data,
      });
      return response;
    },
    onSuccess: () => {
      // Invalidate customers queries to refetch the list
      queryClient.invalidateQueries({ queryKey: ["customers"] });
    },
  });
};
