"use client";

import type { Order } from "@/app/api/orders/use-get-all";
import {
  formatCurrency,
  formatPercent,
  getMarginPercent,
  getProfit,
  parseCurrency,
} from "@/lib/utils";

interface OrderSummaryCardProps {
  order: Order;
}

function resolveOrderCost(order: Order): number | null {
  if (order.costTotal != null) return parseCurrency(order.costTotal);
  let total = 0;
  let found = false;
  for (const item of order.items) {
    const unitCost =
      item.costPrice != null
        ? parseCurrency(item.costPrice)
        : item.productId?.purchasePrice != null
          ? parseCurrency(item.productId.purchasePrice)
          : null;
    if (item.lineCost != null) {
      total += parseCurrency(item.lineCost);
      found = true;
    } else if (unitCost != null) {
      total += parseCurrency(unitCost * item.quantity);
      found = true;
    }
  }
  return found ? parseCurrency(total) : null;
}

export function OrderSummaryCard({ order }: OrderSummaryCardProps) {
  const showDiscount = parseCurrency(order.discountTotal) > 0;
  const showGst = parseCurrency(order.gstTotal) > 0;

  const resolvedCost = resolveOrderCost(order);
  // Orders created before cost tracking have a cost of 0; suppress the profit
  // block for them rather than implying a misleading 100% margin.
  const cost = resolvedCost != null && resolvedCost > 0 ? resolvedCost : null;
  const revenue = parseCurrency(order.subtotal);
  const profit = cost != null ? getProfit(revenue, cost) : null;
  const margin = cost != null ? getMarginPercent(revenue, cost) : null;

  return (
    <section className="rounded-xl border bg-card">
      <header className="border-b px-5 py-3">
        <h2 className="text-base font-semibold tracking-tight text-foreground">
          Summary
        </h2>
      </header>

      <div className="space-y-3 px-5 py-4">
        <Row label="Subtotal" value={formatCurrency(order.subtotal)} />
        {showDiscount && (
          <Row
            label="Discount"
            value={`− ${formatCurrency(order.discountTotal)}`}
            tone="muted"
          />
        )}
        {showGst && (
          <Row label="GST" value={formatCurrency(order.gstTotal)} tone="muted" />
        )}
        <div className="border-t pt-3 mt-3 flex items-baseline justify-between">
          <span className="text-sm font-semibold text-foreground">
            Grand total
          </span>
          <span className="text-2xl font-semibold tabular-nums tracking-tight">
            {formatCurrency(order.grandTotal)}
          </span>
        </div>

        {profit != null && (
          <div className="mt-3 rounded-lg border border-dashed bg-muted/30 px-3 py-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                Internal · not on invoice
              </span>
            </div>
            <div className="mt-1.5 space-y-1.5">
              <Row
                label="Cost of goods"
                value={formatCurrency(cost ?? 0)}
                tone="muted"
              />
              <div className="flex items-baseline justify-between">
                <span className="text-sm text-muted-foreground">
                  Gross profit
                </span>
                <span
                  className={`text-sm font-semibold tabular-nums ${
                    profit < 0
                      ? "text-red-600 dark:text-red-500"
                      : "text-emerald-600 dark:text-emerald-500"
                  }`}
                >
                  {formatCurrency(profit)}
                  {margin != null && (
                    <span className="ml-1 text-xs font-normal text-muted-foreground">
                      {formatPercent(margin)}
                    </span>
                  )}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

function Row({
  label,
  value,
  tone = "default",
}: {
  label: string;
  value: string;
  tone?: "default" | "muted";
}) {
  return (
    <div className="flex items-baseline justify-between">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span
        className={`text-sm tabular-nums ${
          tone === "muted" ? "text-muted-foreground" : "font-medium"
        }`}
      >
        {value}
      </span>
    </div>
  );
}
