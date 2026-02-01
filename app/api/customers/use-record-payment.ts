"use client";

import { useMutation } from "@tanstack/react-query";
import { postClient } from "../api-callers/client";

interface RecordPaymentData {
  customerId: string;
  orderId?: string;
  amount: number;
  paymentMethod: string;
  reference: string;
  note: string;
}

interface PaymentResponse {
  customerId: string;
  orderId: string | null;
  amount: number;
  paymentMethod: string;
  reference: string;
  note: string;
  _id: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export function useRecordPayment() {
  return useMutation({
    mutationFn: async (data: RecordPaymentData) => {
      const response = await postClient<PaymentResponse>({
        url: "/api/payment",
        body: data,
      });
      return response;
    },
  });
}
