import { useQuery } from "@tanstack/react-query";
import { getClient } from "../api-callers/client";
import type { ApiCurrencyAmount } from "@/lib/utils";

export type TopProductsMetric = "profit" | "margin" | "revenue";

export interface TopProductRow {
  productId: string;
  name: string;
  unitsSold: number;
  revenue: ApiCurrencyAmount;
  cost: ApiCurrencyAmount;
  profit: ApiCurrencyAmount;
  /** Gross margin percentage (0–100). */
  margin: ApiCurrencyAmount;
}

export interface DashboardTopProductsResponse {
  metric: TopProductsMetric;
  data: TopProductRow[];
}

export const useDashboardTopProducts = (
  metric: TopProductsMetric = "profit",
  limit: number = 5,
) => {
  return useQuery({
    queryKey: ["dashboard-top-products", metric, limit],
    queryFn: () =>
      getClient<DashboardTopProductsResponse>({
        url: `/api/dashboard/top-products?metric=${encodeURIComponent(
          metric,
        )}&limit=${limit}`,
      }),
    retry: false,
  });
};
