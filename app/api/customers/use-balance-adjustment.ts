import { useMutation, useQueryClient } from "@tanstack/react-query";
import { postClient } from "../api-callers/client";

export interface BalanceAdjustmentPayload {
  amount: number;
  direction: "customer_owes" | "we_owe_customer";
  note?: string;
}

export interface BalanceAdjustmentResponse {
  message: string;
  data: {
    _id: string;
    customer: string;
    amount: number;
    direction: string;
    note?: string;
    createdAt: string;
    updatedAt: string;
  };
}

export const useBalanceAdjustment = () => {
  const queryClient = useQueryClient();

  return useMutation<
    BalanceAdjustmentResponse,
    Error,
    { customerId: string; payload: BalanceAdjustmentPayload }
  >({
    mutationFn: async ({ customerId, payload }) => {
      const response = await postClient<BalanceAdjustmentResponse>({
        url: `/api/customers/${customerId}/balance-adjustments`,
        body: payload,
      });
      return response;
    },
    onSuccess: (_, variables) => {
      // Invalidate customer queries to refetch updated balance
      queryClient.invalidateQueries({
        queryKey: ["customer", variables.customerId],
      });
      queryClient.invalidateQueries({
        queryKey: ["customer-transactions", variables.customerId],
      });
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      // Invalidate ledger entries to refetch updated data
      queryClient.invalidateQueries({
        queryKey: ["ledger-entries"],
      });
    },
  });
};
