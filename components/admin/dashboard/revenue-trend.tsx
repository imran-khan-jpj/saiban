"use client";

import * as React from "react";
import {
  Area,
  ComposedChart,
  CartesianGrid,
  Legend,
  Line,
  XAxis,
  YAxis,
} from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { Spinner } from "@/components/ui/spinner";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  useDashboardRevenueTrend,
  type RevenueRangeKey,
} from "@/app/api/dashboard/use-dashboard-revenue-trend";
import { formatCurrency, parseCurrency } from "@/lib/utils";

interface RangeOption {
  key: RevenueRangeKey;
  label: string;
  shortLabel: string;
}

const RANGE_OPTIONS: RangeOption[] = [
  { key: "7d", label: "Last 7 days", shortLabel: "7d" },
  { key: "14d", label: "Last 14 days", shortLabel: "14d" },
  { key: "30d", label: "Last 30 days", shortLabel: "30d" },
  { key: "90d", label: "Last 90 days", shortLabel: "90d" },
];

const COST_COLOR = "#f59e0b"; // amber-500
const PROFIT_COLOR = "#10b981"; // emerald-500

/** Cost/profit only when the bucket has snapshotted purchase cost (> 0). */
function bucketCost(point: {
  cost?: string | number | null;
}): number | null {
  if (point.cost == null) return null;
  const cost = parseCurrency(point.cost);
  return cost > 0 ? cost : null;
}

function bucketProfit(
  revenue: number,
  cost: number | null,
  profit?: string | number | null,
): number | null {
  if (cost == null) return null;
  if (profit != null) return parseCurrency(profit);
  return parseCurrency(revenue - cost);
}

const chartConfig = {
  revenue: {
    label: "Revenue",
    color: "hsl(var(--foreground))",
  },
  cost: {
    label: "Cost",
    color: COST_COLOR,
  },
  profit: {
    label: "Profit",
    color: PROFIT_COLOR,
  },
} satisfies ChartConfig;

interface DataPoint {
  date: string;
  label: string;
  revenue: number;
  cost: number | null;
  profit: number | null;
}

export function RevenueTrend() {
  const [range, setRange] = React.useState<RevenueRangeKey>("14d");
  const activeRange =
    RANGE_OPTIONS.find((r) => r.key === range) ?? RANGE_OPTIONS[1];

  const { data, isLoading, isError } = useDashboardRevenueTrend(range);

  const series = React.useMemo<DataPoint[]>(() => {
    if (!data?.series) return [];
    return data.series.map((point) => {
      const revenue = parseCurrency(point.revenue);
      const cost = bucketCost(point);
      return {
        date: point.bucketStart,
        label: point.label,
        revenue,
        cost,
        profit: bucketProfit(revenue, cost, point.profit),
      };
    });
  }, [data]);

  const hasProfitData = series.some((p) => p.cost != null);
  const hasPartialCostData =
    hasProfitData &&
    series.some((p) => p.revenue > 0 && p.cost == null);

  const total = parseCurrency(data?.summary?.totalRevenue);
  const totalProfit = hasProfitData
    ? data?.summary?.totalProfit != null
      ? parseCurrency(data.summary.totalProfit)
      : series.reduce((sum, p) => sum + (p.profit ?? 0), 0)
    : null;

  return (
    <section className="rounded-xl border bg-card">
      <header className="flex flex-col gap-3 border-b px-5 py-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-base font-semibold tracking-tight text-foreground">
            {hasProfitData ? "Revenue & profit" : "Revenue"}
          </h2>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {activeRange.label}, excluding cancelled orders
            {hasPartialCostData && (
              <span className="block text-[11px] text-muted-foreground/80">
                Some orders lack purchase price — cost and profit may be
                incomplete on those days
              </span>
            )}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Tabs
            value={range}
            onValueChange={(v) => setRange(v as RevenueRangeKey)}
          >
            <TabsList className="h-8 bg-muted p-0.5">
              {RANGE_OPTIONS.map((opt) => (
                <TabsTrigger
                  key={opt.key}
                  value={opt.key}
                  className="h-7 px-2.5 text-xs data-[state=active]:bg-card data-[state=active]:shadow-sm"
                >
                  {opt.shortLabel}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
          <div className="text-right">
            <p className="text-xl font-semibold tabular-nums tracking-tight whitespace-nowrap">
              {formatCurrency(total)}
            </p>
            {totalProfit != null && (
              <p
                className="text-xs font-medium tabular-nums whitespace-nowrap"
                style={{ color: PROFIT_COLOR }}
              >
                {formatCurrency(totalProfit)} profit
              </p>
            )}
          </div>
        </div>
      </header>
      <div className="px-2 py-2">
        {isLoading ? (
          <div className="flex h-[220px] items-center justify-center">
            <Spinner className="h-5 w-5" />
          </div>
        ) : isError ? (
          <p className="flex h-[220px] items-center justify-center text-sm text-destructive">
            Could not load revenue trend
          </p>
        ) : (
          <ChartContainer
            config={chartConfig}
            className="aspect-auto h-[220px] w-full"
          >
            <ComposedChart
              data={series}
              margin={{ left: 4, right: 16, top: 8 }}
            >
              <defs>
                <linearGradient id="revenueFill" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor="var(--color-revenue)"
                    stopOpacity={0.18}
                  />
                  <stop
                    offset="95%"
                    stopColor="var(--color-revenue)"
                    stopOpacity={0}
                  />
                </linearGradient>
              </defs>
              <CartesianGrid
                vertical={false}
                strokeDasharray="3 3"
                strokeOpacity={0.4}
              />
              <XAxis
                dataKey="label"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                interval="preserveStartEnd"
                minTickGap={32}
              />
              <YAxis
                width={48}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v: number) =>
                  v >= 1000 ? `${Math.round(v / 1000)}k` : `${v}`
                }
              />
              <ChartTooltip
                cursor={{ strokeOpacity: 0.4 }}
                content={
                  <ChartTooltipContent
                    indicator="line"
                    formatter={(value) =>
                      formatCurrency(
                        Array.isArray(value) ? value[0] : value,
                      )
                    }
                  />
                }
              />
              {hasProfitData && (
                <Legend
                  verticalAlign="top"
                  height={28}
                  iconType="plainline"
                  wrapperStyle={{ fontSize: 12 }}
                />
              )}
              <Area
                name="Revenue"
                dataKey="revenue"
                type="monotone"
                stroke="var(--color-revenue)"
                strokeWidth={2}
                fill="url(#revenueFill)"
              />
              {hasProfitData && (
                <Line
                  name="Cost"
                  dataKey="cost"
                  type="monotone"
                  stroke={COST_COLOR}
                  strokeWidth={2}
                  strokeDasharray="4 3"
                  dot={false}
                  connectNulls
                />
              )}
              {hasProfitData && (
                <Line
                  name="Profit"
                  dataKey="profit"
                  type="monotone"
                  stroke={PROFIT_COLOR}
                  strokeWidth={2}
                  dot={false}
                  connectNulls
                />
              )}
            </ComposedChart>
          </ChartContainer>
        )}
      </div>
    </section>
  );
}
