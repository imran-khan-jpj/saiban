import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { getClient } from "../api-callers/client";
import type { ApiCurrencyAmount } from "@/lib/utils";

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
      unitPrice: ApiCurrencyAmount;
      /** Cost / purchase price on the product (internal only). */
      purchasePrice?: ApiCurrencyAmount;
      lowStockThreshold: number;
      quantityInStock: number;
      createdAt: string;
      updatedAt: string;
      mfg: string;
      expiry: string;
      __v: number;
    };
    quantity: number;
    unitPrice: ApiCurrencyAmount;
    /** Cost per unit snapshotted at order time (internal only). */
    costPrice?: ApiCurrencyAmount;
    discountPercentage: number;
    lineTotal: ApiCurrencyAmount;
    /** Cost × quantity for this line (internal only). */
    lineCost?: ApiCurrencyAmount;
  }>;
  status: "pending" | "completed" | "cancelled";
  paymentMethod: string;
  discountTotal: ApiCurrencyAmount;
  gstTotal: ApiCurrencyAmount;
  note: string;
  subtotal: ApiCurrencyAmount;
  /** Total cost of goods for this order (internal only). */
  costTotal?: ApiCurrencyAmount;
  /** Gross profit for this order = subtotal − costTotal (internal only). */
  profitTotal?: ApiCurrencyAmount;
  grandTotal: ApiCurrencyAmount;
  createdAt: string;
  updatedAt: string;
  invoiceNumber: string;
  __v: number;

  invoiceBalanceSummary: {
    previousBalance: {
      amount: ApiCurrencyAmount;
      sign: string;
      direction: "we_owe_customer" | "customer_owes_us";
      note: string;
    };
    currentOrderBill: {
      amount: ApiCurrencyAmount;
      sign: string;
      balanceImpact: ApiCurrencyAmount;
      note: string;
    };
    netPayable: {
      amount: ApiCurrencyAmount;
      sign: string;
      direction: "settled";
      note: string;
    };
    calculation: {
      previousBalance: ApiCurrencyAmount;
      orderImpact: ApiCurrencyAmount;
      netPayable: ApiCurrencyAmount;
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
