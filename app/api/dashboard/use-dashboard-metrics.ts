import { useQuery } from "@tanstack/react-query";
import { getClient } from "../api-callers/client";

type DashboardMetricsResponse = {
  metrics: {
    totalProducts: number;
    totalCustomers: number;
    totalOrders: number;
    ledger: {
      totalReceivable: number;
      totalDebit: number;
      totalCredit: number;
    };
  };
  alerts: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    lowStockProducts: any[];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
