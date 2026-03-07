import { useQuery } from "@tanstack/react-query";
import { getClient } from "../api-callers/client";

type DashboardMetricsResponse = {
  metrics: {
    totalProducts: number;
    totalCustomers: number;
    totalOrders: number;
    totalRevenue: number;
  };
  alerts: {
    lowStockProducts: any[];
    pendingOrders: any[];
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
