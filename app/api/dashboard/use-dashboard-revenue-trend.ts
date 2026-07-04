import { useQuery } from "@tanstack/react-query";
import { getClient } from "../api-callers/client";
import type { ApiCurrencyAmount } from "@/lib/utils";

export type RevenueRangeKey = "7d" | "14d" | "30d" | "90d";

type RevenueTrendGranularity = "day" | "week";

export interface RevenueTrendPoint {
  bucketStart: string;
  bucketEnd?: string;
  label: string;
  revenue: ApiCurrencyAmount;
  /** Cost of goods sold in this bucket (internal only). */
  cost?: ApiCurrencyAmount;
  /** Gross profit in this bucket = revenue − cost (internal only). */
  profit?: ApiCurrencyAmount;
  orderCount?: number;
}

export interface DashboardRevenueTrendResponse {
  range: RevenueRangeKey;
  granularity: RevenueTrendGranularity;
  timezone?: string;
  summary: {
    totalRevenue: ApiCurrencyAmount;
    totalCost?: ApiCurrencyAmount;
    totalProfit?: ApiCurrencyAmount;
    orderCount?: number;
    currency?: string;
    excludedStatuses?: string[];
  };
  series: RevenueTrendPoint[];
}

export const useDashboardRevenueTrend = (range: RevenueRangeKey) => {
  return useQuery({
    queryKey: ["dashboard-revenue-trend", range],
    queryFn: () =>
      getClient<DashboardRevenueTrendResponse>({
        url: `/api/dashboard/revenue-trend?range=${encodeURIComponent(range)}`,
      }),
  });
};
