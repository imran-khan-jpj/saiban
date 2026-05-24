"use client";

import * as React from "react";
import dayjs from "dayjs";
import {
  Area,
  AreaChart,
  CartesianGrid,
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
import { useGetAllOrders } from "@/app/api/orders/use-get-all";
import { formatCurrency, parseCurrency, type ApiCurrencyAmount } from "@/lib/utils";

type RangeKey = "7d" | "14d" | "30d" | "90d";

interface RangeOption {
  key: RangeKey;
  label: string;
  shortLabel: string;
  days: number;
  granularity: "day" | "week";
}

const RANGE_OPTIONS: RangeOption[] = [
  { key: "7d", label: "Last 7 days", shortLabel: "7d", days: 7, granularity: "day" },
  { key: "14d", label: "Last 14 days", shortLabel: "14d", days: 14, granularity: "day" },
  { key: "30d", label: "Last 30 days", shortLabel: "30d", days: 30, granularity: "day" },
  { key: "90d", label: "Last 90 days", shortLabel: "90d", days: 90, granularity: "week" },
];

// Cap on how many orders we fetch from the API to bucket client-side.
// At 500 we comfortably cover several months for typical-sized stores.
// For longer ranges (6m / 1y) the proper solution is a backend aggregation
// endpoint — this client-side approach intentionally tops out at 90 days.
const ORDERS_FETCH_LIMIT = 500;

const chartConfig = {
  revenue: {
    label: "Revenue",
    color: "hsl(var(--foreground))",
  },
} satisfies ChartConfig;

interface DataPoint {
  date: string;
  label: string;
  revenue: number;
}

function buildSeries(
  orders: Array<{ createdAt: string; grandTotal: ApiCurrencyAmount; status: string }>,
  days: number,
  granularity: "day" | "week",
): { series: DataPoint[]; total: number } {
  const buckets = new Map<string, DataPoint>();

  if (granularity === "day") {
    const today = dayjs().startOf("day");
    for (let i = days - 1; i >= 0; i--) {
      const d = today.subtract(i, "day");
      buckets.set(d.format("YYYY-MM-DD"), {
        date: d.format("YYYY-MM-DD"),
        label: d.format("DD MMM"),
        revenue: 0,
      });
    }
  } else {
    // Weekly buckets, anchored to the start of the current week.
    const thisWeek = dayjs().startOf("week");
    const numWeeks = Math.ceil(days / 7);
    for (let i = numWeeks - 1; i >= 0; i--) {
      const w = thisWeek.subtract(i, "week");
      buckets.set(w.format("YYYY-MM-DD"), {
        date: w.format("YYYY-MM-DD"),
        label: w.format("DD MMM"),
        revenue: 0,
      });
    }
  }

  const earliestKey = Array.from(buckets.keys())[0];
  const earliest = dayjs(earliestKey);

  let total = 0;
  for (const order of orders) {
    if (order.status === "cancelled") continue;
    const orderDate = dayjs(order.createdAt);
    if (orderDate.isBefore(earliest)) continue;
    const key =
      granularity === "day"
        ? orderDate.startOf("day").format("YYYY-MM-DD")
        : orderDate.startOf("week").format("YYYY-MM-DD");
    const bucket = buckets.get(key);
    if (!bucket) continue;
    const orderTotal = parseCurrency(order.grandTotal);
    bucket.revenue += orderTotal;
    total += orderTotal;
  }

  return { series: Array.from(buckets.values()), total };
}

export function RevenueTrend() {
  const [range, setRange] = React.useState<RangeKey>("14d");
  const activeRange =
    RANGE_OPTIONS.find((r) => r.key === range) ?? RANGE_OPTIONS[1];

  const { data, isLoading, isError } = useGetAllOrders(1, ORDERS_FETCH_LIMIT);

  const { series, total } = React.useMemo(() => {
    if (!data?.data) return { series: [], total: 0 };
    return buildSeries(data.data, activeRange.days, activeRange.granularity);
  }, [data, activeRange.days, activeRange.granularity]);

  return (
    <section className="rounded-xl border bg-card">
      <header className="flex flex-col gap-3 border-b px-5 py-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-base font-semibold tracking-tight text-foreground">
            Revenue
          </h2>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {activeRange.label}, excluding cancelled orders
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Tabs
            value={range}
            onValueChange={(v) => setRange(v as RangeKey)}
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
          <p className="text-xl font-semibold tabular-nums tracking-tight whitespace-nowrap">
            {formatCurrency(total)}
          </p>
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
            <AreaChart data={series} margin={{ left: 4, right: 16, top: 8 }}>
              <defs>
                <linearGradient id="revenueFill" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor="currentColor"
                    stopOpacity={0.18}
                  />
                  <stop
                    offset="95%"
                    stopColor="currentColor"
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
              <Area
                dataKey="revenue"
                type="monotone"
                stroke="currentColor"
                strokeWidth={2}
                fill="url(#revenueFill)"
                className="text-foreground"
              />
            </AreaChart>
          </ChartContainer>
        )}
      </div>
    </section>
  );
}
