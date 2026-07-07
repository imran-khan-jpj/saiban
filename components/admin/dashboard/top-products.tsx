"use client";

import { Spinner } from "@/components/ui/spinner";
import { useDashboardTopProducts } from "@/app/api/dashboard/use-dashboard-top-products";
import { formatCurrency } from "@/lib/utils";

export function TopProducts() {
  const { data, isLoading, isError } = useDashboardTopProducts("profit", 5);

  const rows = data?.data ?? [];

  return (
    <section className="rounded-xl border bg-card">
      <header className="border-b px-5 py-4">
        <div>
          <h2 className="text-base font-semibold tracking-tight text-foreground">
            Most profitable products
          </h2>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Top performers by profitability
          </p>
        </div>
      </header>

      {isLoading ? (
        <div className="flex h-[180px] items-center justify-center">
          <Spinner className="h-5 w-5" />
        </div>
      ) : isError ? (
        <div className="flex h-[180px] items-center justify-center px-5 text-sm text-destructive">
          Could not load product profitability
        </div>
      ) : rows.length === 0 ? (
        <div className="flex h-[180px] flex-col items-center justify-center gap-1 px-5 text-center">
          <p className="text-sm font-medium text-foreground">
            No completed sales yet
          </p>
          <p className="text-xs text-muted-foreground">
            Top products by profit will appear once orders are completed.
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
              </tr>
            </thead>
            <tbody className="divide-y">
              {rows.map((row) => (
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
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
