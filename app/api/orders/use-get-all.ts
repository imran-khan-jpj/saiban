import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { getClient } from "../api-callers/client";

export interface Order {
  _id: string;
  customerId: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber?: string;
    streetAddress: string;
    city: string;
    state: string;
  };
  items: Array<{
    productId: {
      _id: string;
      name: string;
      shortDescription: string;
      descriptionUrdu: string;
      formulation: string;
      packType: string;
      batchNo?: string;
      size: number;
      unitPrice: number;
      lowStockThreshold: number;
      quantityInStock: number;
      createdAt: string;
      updatedAt: string;
      mfg: string;
      expiry: string;
      __v: number;
    };
    quantity: number;
    unitPrice: number;
    discountPercentage: number;
    lineTotal: number;
  }>;
  status: "pending" | "confirmed" | "cancelled" | "paid";
  paymentMethod: string;
  discountTotal: number;
  gstTotal: number;
  note: string;
  subtotal: number;
  grandTotal: number;
  createdAt: string;
  updatedAt: string;
  invoiceNumber: string;
  __v: number;

  invoiceBalanceSummary: {
    previousBalance: {
      amount: number;
      sign: string;
      direction: "we_owe_customer" | "customer_owes_us";
      note: string;
    };
    currentOrderBill: {
      amount: number;
      sign: string;
      balanceImpact: number;
      note: string;
    };
    netPayable: {
      amount: number;
      sign: string;
      direction: "settled";
      note: string;
    };
    calculation: {
      previousBalance: number;
      orderImpact: number;
      netPayable: number;
      expression: string;
    };
    legend: {
      positive: string;
      negative: string;
      zero: string;
    };
    basis: "as_of_invoice_issue";
  };
}

export interface GetAllOrdersResponse {
  data: Order[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export const useGetAllOrders = (
  page: number = 1,
  limit: number = 10,
  search?: string,
  status?: string,
  customerId?: string,
) => {
  return useQuery<GetAllOrdersResponse>({
    queryKey: ["orders", page, limit, search, status, customerId],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });
      if (search) {
        params.append("search", search);
      }
      if (status) {
        params.append("status", status);
      }
      if (customerId) {
        params.append("customerId", customerId);
      }
      const response = await getClient<GetAllOrdersResponse>({
        url: `/api/orders?${params.toString()}`,
      });
      return response;
    },
    placeholderData: keepPreviousData,
  });
};
