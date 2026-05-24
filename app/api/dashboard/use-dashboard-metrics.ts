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
