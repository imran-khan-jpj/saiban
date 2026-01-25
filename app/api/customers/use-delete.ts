import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteClient } from "../api-callers/client";

export interface DeleteCustomerResponse {
  message: string;
}

export const useDeleteCustomer = () => {
  const queryClient = useQueryClient();

  return useMutation<DeleteCustomerResponse, Error, string>({
    mutationFn: async (customerId: string) => {
      const response = await deleteClient<DeleteCustomerResponse>({
        url: `/api/customers/${customerId}`,
      });
      return response;
    },
    onSuccess: () => {
      // Invalidate customers queries to refetch the list
      queryClient.invalidateQueries({ queryKey: ["customers"] });
    },
  });
};
