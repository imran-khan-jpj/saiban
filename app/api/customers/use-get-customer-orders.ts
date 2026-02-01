import { useQuery } from "@tanstack/react-query";
import { getClient } from "../api-callers/client";

export interface OrderItem {
  productId: {
    _id: string;
    name: string;
    shortDescription: string;
    descriptionUrdu: string;
    formulation: string;
    packType: string;
    size: number;
    unitPrice: number;
    lowStockThreshold: number;
    quantityInStock: number;
    createdAt: string;
    updatedAt: string;
    __v: number;
  };
  quantity: number;
  unitPrice: number;
  discountPercentage: number;
  lineTotal: number;
}

export interface CustomerOrder {
  _id: string;
  customerId: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  status: string;
  paymentMethod: string;
  items: OrderItem[];
  discountTotal: number;
  gstTotal: number;
  note: string;
  subtotal: number;
  grandTotal: number;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface GetCustomerOrdersResponse {
  data: CustomerOrder[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export const useGetCustomerOrders = (
  customerId: string,
  page: number = 1,
  limit: number = 10,
) => {
  return useQuery<GetCustomerOrdersResponse>({
    queryKey: ["customer-orders", customerId, page, limit],
    queryFn: async () => {
      const response = await getClient<GetCustomerOrdersResponse>({
        url: `/api/customers/${customerId}/orders?page=${page}&limit=${limit}`,
      });
      return response;
    },
    enabled: !!customerId,
  });
};
