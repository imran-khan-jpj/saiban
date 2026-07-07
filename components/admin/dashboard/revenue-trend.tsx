"use client";

import * as React from "react";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  type ChartConfig,
} from "@/components/ui/chart";
import { Spinner } from "@/components/ui/spinner";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  useDashboardRevenueTrend,
  type RevenueRangeKey,
} from "@/app/api/dashboard/use-dashboard-revenue-trend";
import { cn, formatCurrency, formatPercent, parseCurrency } from "@/lib/utils";

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

const REVENUE_COLOR = "hsl(var(--foreground))";
const COST_COLOR = "#f59e0b"; // amber-500
const PROFIT_COLOR = "#10b981"; // emerald-500
const UNCOSTED_COLOR = "hsl(var(--muted-foreground))";

/** Cost/profit only when the bucket has snapshotted purchase cost (> 0). */
function bucketCost(point: { cost?: string | number | null }): number | null {
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
  revenue: { label: "Revenue", color: REVENUE_COLOR },
  cost: { label: "Cost", color: COST_COLOR },
  profit: { label: "Profit", color: PROFIT_COLOR },
  uncosted: { label: "Revenue", color: UNCOSTED_COLOR },
} satisfies ChartConfig;

interface DataPoint {
  date: string;
  label: string;
  revenue: number;
  cost: number | null;
  profit: number | null;
  margin: number | null;
  // Stacked segments — cost + profit sum to revenue on costed buckets;
  // uncosted carries the full revenue when a bucket has no cost data.
  costSeg: number;
  profitSeg: number;
  uncostedSeg: number;
}

function compactCurrency(value: number): string {
  const abs = Math.abs(value);
  if (abs >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}m`;
  if (abs >= 1_000) return `${Math.round(value / 1000)}k`;
  return `${value}`;
}

interface StatBlockProps {
  label: string;
  value: string;
  dotColor?: string;
  prominent?: boolean;
  valueClassName?: string;
}

function StatBlock({
  label,
  value,
  dotColor,
  prominent,
  valueClassName,
}: StatBlockProps) {
  return (
    <div className="flex flex-col gap-1">
      <span className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
        {dotColor && (
          <span
            className="h-2 w-2 shrink-0 rounded-full"
            style={{ background: dotColor }}
          />
        )}
        {label}
      </span>
      <span
        className={cn(
          "tabular-nums tracking-tight whitespace-nowrap",
          prominent ? "text-2xl font-semibold" : "text-base font-semibold",
          valueClassName,
        )}
      >
        {value}
      </span>
    </div>
  );
}

function TooltipRow({
  color,
  label,
  value,
}: {
  color: string;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="flex items-center gap-1.5 text-muted-foreground">
        <span
          className="h-2 w-2 shrink-0 rounded-[2px]"
          style={{ background: color }}
        />
        {label}
      </span>
      <span className="font-medium tabular-nums text-foreground">{value}</span>
    </div>
  );
}

function RevenueTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{ payload: DataPoint }>;
}) {
  if (!active || !payload?.length) return null;
  const p = payload[0].payload;

  return (
    <div className="min-w-[10rem] rounded-lg border border-border/50 bg-background px-3 py-2 text-xs shadow-xl">
      <p className="mb-1.5 font-medium text-foreground">{p.label}</p>
      <div className="grid gap-1">
        <TooltipRow
          color={p.cost != null ? UNCOSTED_COLOR : REVENUE_COLOR}
          label="Revenue"
          value={formatCurrency(p.revenue)}
        />
        {p.cost != null && (
          <TooltipRow
            color={COST_COLOR}
            label="Cost"
            value={formatCurrency(p.cost)}
          />
        )}
        {p.profit != null && (
          <TooltipRow
            color={PROFIT_COLOR}
            label="Profit"
            value={formatCurrency(p.profit)}
          />
        )}
        {p.margin != null && (
          <div className="mt-0.5 flex items-center justify-between gap-4 border-t border-border/50 pt-1">
            <span className="text-muted-foreground">Margin</span>
            <span className="font-medium tabular-nums text-foreground">
              {formatPercent(p.margin)}
            </span>
          </div>
        )}
        {p.cost == null && p.revenue > 0 && (
          <p className="mt-0.5 text-[11px] text-muted-foreground">
            Cost not recorded
          </p>
        )}
      </div>
    </div>
  );
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
      const profit = bucketProfit(revenue, cost, point.profit);
      const costed = cost != null;
      return {
        date: point.bucketStart,
        label: point.label,
        revenue,
        cost,
        profit,
        margin: costed && revenue > 0 ? ((profit ?? 0) / revenue) * 100 : null,
        costSeg: costed ? (cost as number) : 0,
        profitSeg: costed ? (profit ?? 0) : 0,
        uncostedSeg: costed ? 0 : revenue,
      };
    });
  }, [data]);

  const hasProfitData = series.some((p) => p.cost != null);
  const hasPartialCostData =
    hasProfitData && series.some((p) => p.revenue > 0 && p.cost == null);
  const hasAnyData = series.some((p) => p.revenue !== 0);

  const total = parseCurrency(data?.summary?.totalRevenue);
  const totalCost = hasProfitData
    ? data?.summary?.totalCost != null
      ? parseCurrency(data.summary.totalCost)
      : series.reduce((sum, p) => sum + (p.cost ?? 0), 0)
    : 0;
  const totalProfit = hasProfitData
    ? data?.summary?.totalProfit != null
      ? parseCurrency(data.summary.totalProfit)
      : series.reduce((sum, p) => sum + (p.profit ?? 0), 0)
    : null;
  // Margin over costed revenue only, so partial-cost days don't dilute it.
  const costedRevenue = totalCost + (totalProfit ?? 0);
  const margin =
    hasProfitData && costedRevenue > 0
      ? ((totalProfit ?? 0) / costedRevenue) * 100
      : null;

  return (
    <section className="rounded-xl border bg-card">
      <header className="flex flex-col gap-4 border-b px-5 py-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 className="text-base font-semibold tracking-tight text-foreground">
              {hasProfitData ? "Revenue & profit" : "Revenue"}
            </h2>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {activeRange.label}, excluding cancelled orders
            </p>
          </div>
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
        </div>

        <div className="flex flex-wrap items-end gap-x-8 gap-y-3">
          <StatBlock label="Revenue" value={formatCurrency(total)} prominent />
          {hasProfitData && (
            <StatBlock
              label="Cost"
              dotColor={COST_COLOR}
              value={formatCurrency(totalCost)}
            />
          )}
          {hasProfitData && totalProfit != null && (
            <StatBlock
              label="Profit"
              dotColor={PROFIT_COLOR}
              value={formatCurrency(totalProfit)}
              valueClassName="text-emerald-600 dark:text-emerald-500"
            />
          )}
          {margin != null && (
            <StatBlock
              label="Margin"
              value={formatPercent(margin)}
              valueClassName={cn(
                margin >= 0
                  ? "text-emerald-600 dark:text-emerald-500"
                  : "text-red-600 dark:text-red-500",
              )}
            />
          )}
        </div>

        {hasPartialCostData && (
          <p className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
            <span
              className="h-2 w-2 shrink-0 rounded-full"
              style={{ background: UNCOSTED_COLOR, opacity: 0.5 }}
            />
            Lighter bars are revenue from orders with no purchase price — cost
            and profit exclude those.
          </p>
        )}
      </header>

      <div className="px-2 py-3">
        {isLoading ? (
          <div className="flex h-[240px] items-center justify-center">
            <Spinner className="h-5 w-5" />
          </div>
        ) : isError ? (
          <p className="flex h-[240px] items-center justify-center text-sm text-destructive">
            Could not load revenue trend
          </p>
        ) : !hasAnyData ? (
          <div className="flex h-[240px] flex-col items-center justify-center gap-1 px-5 text-center">
            <p className="text-sm font-medium text-foreground">
              No revenue in this period
            </p>
            <p className="text-xs text-muted-foreground">
              Confirmed orders will show up here as daily bars.
            </p>
          </div>
        ) : (
          <ChartContainer
            config={chartConfig}
            className="aspect-auto h-[240px] w-full"
          >
            <BarChart
              data={series}
              margin={{ left: 4, right: 8, top: 8 }}
              maxBarSize={36}
              barCategoryGap="18%"
            >
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
                minTickGap={24}
              />
              <YAxis
                width={44}
                tickLine={false}
                axisLine={false}
                tickFormatter={compactCurrency}
              />
              <ChartTooltip
                cursor={{ fill: "hsl(var(--muted))", fillOpacity: 0.5 }}
                content={<RevenueTooltip />}
              />
              {hasProfitData && (
                <Bar
                  dataKey="costSeg"
                  name="Cost"
                  stackId="rev"
                  fill={COST_COLOR}
                  radius={[0, 0, 0, 0]}
                />
              )}
              {hasProfitData && (
                <Bar
                  dataKey="profitSeg"
                  name="Profit"
                  stackId="rev"
                  fill={PROFIT_COLOR}
                  radius={[4, 4, 0, 0]}
                />
              )}
              {hasProfitData && (
                <Bar
                  dataKey="uncostedSeg"
                  name="Revenue"
                  stackId="rev"
                  fill={UNCOSTED_COLOR}
                  fillOpacity={0.35}
                  radius={[4, 4, 0, 0]}
                />
              )}
              {!hasProfitData && (
                <Bar
                  dataKey="revenue"
                  name="Revenue"
                  fill={REVENUE_COLOR}
                  fillOpacity={0.85}
                  radius={[4, 4, 0, 0]}
                />
              )}
            </BarChart>
          </ChartContainer>
        )}
      </div>
    </section>
  );
}
