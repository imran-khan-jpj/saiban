"use client";

import * as React from "react";
import { Spinner } from "@/components/ui/spinner";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  useDashboardTopProducts,
  type TopProductsMetric,
} from "@/app/api/dashboard/use-dashboard-top-products";
import { formatCurrency, formatPercent, parseCurrency } from "@/lib/utils";

const METRIC_OPTIONS: { key: TopProductsMetric; label: string }[] = [
  { key: "profit", label: "Profit" },
  { key: "margin", label: "Margin" },
  { key: "revenue", label: "Revenue" },
];

export function TopProducts() {
  const [metric, setMetric] = React.useState<TopProductsMetric>("profit");
  const { data, isLoading, isError } = useDashboardTopProducts(metric, 5);

  const rows = data?.data ?? [];

  return (
    <section className="rounded-xl border bg-card">
      <header className="flex flex-col gap-3 border-b px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-base font-semibold tracking-tight text-foreground">
            Most profitable products
          </h2>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Top performers by the selected measure
          </p>
        </div>
        <Tabs
          value={metric}
          onValueChange={(v) => setMetric(v as TopProductsMetric)}
        >
          <TabsList className="h-8 bg-muted p-0.5">
            {METRIC_OPTIONS.map((opt) => (
              <TabsTrigger
                key={opt.key}
                value={opt.key}
                className="h-7 px-2.5 text-xs data-[state=active]:bg-card data-[state=active]:shadow-sm"
              >
                {opt.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </header>

      {isLoading ? (
        <div className="flex h-[180px] items-center justify-center">
          <Spinner className="h-5 w-5" />
        </div>
      ) : isError || rows.length === 0 ? (
        <div className="flex h-[180px] flex-col items-center justify-center gap-1 px-5 text-center">
          <p className="text-sm font-medium text-foreground">
            No profit data yet
          </p>
          <p className="text-xs text-muted-foreground">
            Product profitability appears here once orders are recorded with
            cost prices.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/40">
              <tr className="text-xs font-medium text-muted-foreground">
                <th className="px-5 py-2.5 text-left font-medium">Product</th>
                <th className="px-5 py-2.5 text-right font-medium">Sold</th>
                <th className="px-5 py-2.5 text-right font-medium">Revenue</th>
                <th className="px-5 py-2.5 text-right font-medium">Profit</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {rows.map((row) => {
                const profit = parseCurrency(row.profit);
                return (
                  <tr key={row.productId} className="text-sm text-foreground">
                    <td className="px-5 py-3">
                      <p className="truncate font-medium text-foreground">
                        {row.name}
                      </p>
                    </td>
                    <td className="px-5 py-3 text-right tabular-nums text-muted-foreground">
                      {row.unitsSold}
                    </td>
                    <td className="px-5 py-3 text-right tabular-nums">
                      {formatCurrency(row.revenue)}
                    </td>
                    <td className="px-5 py-3 text-right tabular-nums">
                      <span
                        className={
                          profit < 0
                            ? "font-medium text-red-600 dark:text-red-500"
                            : "font-medium text-emerald-600 dark:text-emerald-500"
                        }
                      >
                        {formatCurrency(profit)}
                      </span>
                      <span className="ml-1 text-xs text-muted-foreground">
                        {formatPercent(parseCurrency(row.margin))}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
