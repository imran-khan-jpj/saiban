import { useQuery } from "@tanstack/react-query";
import { getClient } from "../api-callers/client";
import type { ApiCurrencyAmount } from "@/lib/utils";

type DashboardMetricsResponse = {
  metrics: {
    totalProducts: number;
    totalCustomers: number;
    totalOrders: number;
    totalRevenue: ApiCurrencyAmount;
    pendingPayments: ApiCurrencyAmount;
    receivedPayments: ApiCurrencyAmount;
    /** Cost of goods sold across all (non-cancelled) orders. */
    totalCost?: ApiCurrencyAmount;
    /** Gross profit = totalRevenue − totalCost. */
    grossProfit?: ApiCurrencyAmount;
    /** Gross margin percentage (0–100). */
    profitMargin?: ApiCurrencyAmount;
    /** Value of current stock on hand, valued at purchase/cost price. */
    inventoryValueAtCost?: ApiCurrencyAmount;
    /** Products with no purchase price — profit on their orders stays incomplete. */
    productsMissingPurchasePrice?: number;
  };
  alerts: {
    lowStockProducts: unknown[];
    pendingOrders: unknown[];
  };
};

export const useDashboardMetrics = () => {
  return useQuery({
    queryKey: ["dashboard-metrics"],
    queryFn: () =>
      getClient<DashboardMetricsResponse>({
        url: "/api/dashboard/metrics",
      }),
  });
};
