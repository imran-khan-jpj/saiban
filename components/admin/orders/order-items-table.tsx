"use client";

import type { Order } from "@/app/api/orders/use-get-all";
import {
  formatCurrency,
  formatPercent,
  getMarginPercent,
  getProfit,
  parseCurrency,
} from "@/lib/utils";

interface OrderItemsTableProps {
  items: Order["items"];
}

export function OrderItemsTable({ items }: OrderItemsTableProps) {
  const resolveLineCost = (item: Order["items"][number]): number | null => {
    if (item.lineCost != null) return parseCurrency(item.lineCost);
    const unitCost =
      item.costPrice != null
        ? parseCurrency(item.costPrice)
        : item.productId?.purchasePrice != null
          ? parseCurrency(item.productId.purchasePrice)
          : null;
    if (unitCost == null) return null;
    return parseCurrency(unitCost * item.quantity);
  };

  // Only render cost/profit columns once at least one line has real cost data.
  // Orders created before cost tracking have a cost of 0, which would otherwise
  // show a misleading "100% margin"; treat those as having no cost data.
  const hasCostData = items.some((item) => {
    const cost = resolveLineCost(item);
    return cost != null && cost > 0;
  });

  return (
    <section className="rounded-xl border bg-card overflow-hidden">
      <header className="flex items-center justify-between gap-4 border-b px-5 py-3">
        <h2 className="text-base font-semibold tracking-tight text-foreground">
          Items
          <span className="ml-2 text-xs font-normal text-muted-foreground tabular-nums">
            {items.length} {items.length === 1 ? "product" : "products"}
          </span>
        </h2>
      </header>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-muted/40">
            <tr className="text-xs font-medium text-muted-foreground">
              <th className="text-left px-5 py-2.5 font-medium">Product</th>
              <th className="text-right px-5 py-2.5 font-medium">Qty</th>
              <th className="text-right px-5 py-2.5 font-medium">
                Unit price
              </th>
              <th className="text-right px-5 py-2.5 font-medium">Discount</th>
              <th className="text-right px-5 py-2.5 font-medium">Line total</th>
              {hasCostData && (
                <>
                  <th className="text-right px-5 py-2.5 font-medium">Cost</th>
                  <th className="text-right px-5 py-2.5 font-medium">Profit</th>
                </>
              )}
            </tr>
          </thead>
          <tbody className="divide-y">
            {items.map((item, idx) => {
              const resolvedCost = resolveLineCost(item);
              const lineCost =
                resolvedCost != null && resolvedCost > 0 ? resolvedCost : null;
              const lineRevenue = parseCurrency(item.lineTotal);
              const profit =
                lineCost != null ? getProfit(lineRevenue, lineCost) : null;
              const margin =
                lineCost != null
                  ? getMarginPercent(lineRevenue, lineCost)
                  : null;
              return (
                <tr key={idx} className="text-sm text-foreground">
                  <td className="px-5 py-3">
                    <p className="font-medium text-foreground">
                      {item.productId.name}
                    </p>
                    <p className="mt-0.5 text-xs text-muted-foreground tabular-nums">
                      {item.productId.size} {item.productId.packType}
                    </p>
                  </td>
                  <td className="px-5 py-3 text-right tabular-nums">
                    {item.quantity}
                  </td>
                  <td className="px-5 py-3 text-right tabular-nums">
                    {formatCurrency(item.unitPrice)}
                  </td>
                  <td className="px-5 py-3 text-right tabular-nums">
                    {item.discountPercentage}%
                  </td>
                  <td className="px-5 py-3 text-right font-semibold tabular-nums tracking-tight">
                    {formatCurrency(item.lineTotal)}
                  </td>
                  {hasCostData && (
                    <>
                      <td className="px-5 py-3 text-right tabular-nums text-muted-foreground">
                        {lineCost != null ? formatCurrency(lineCost) : "—"}
                      </td>
                      <td className="px-5 py-3 text-right tabular-nums">
                        {profit != null ? (
                          <span
                            className={
                              profit < 0
                                ? "text-red-600 dark:text-red-500 font-medium"
                                : "text-emerald-600 dark:text-emerald-500 font-medium"
                            }
                          >
                            {formatCurrency(profit)}
                            {margin != null && (
                              <span className="ml-1 text-xs text-muted-foreground">
                                {formatPercent(margin)}
                              </span>
                            )}
                          </span>
                        ) : (
                          "—"
                        )}
                      </td>
                    </>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}
