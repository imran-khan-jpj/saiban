"use client";

import type { Order } from "@/app/api/orders/use-get-all";
import { formatCurrency } from "@/lib/utils";

interface OrderSummaryCardProps {
  order: Order;
}

export function OrderSummaryCard({ order }: OrderSummaryCardProps) {
  const showDiscount = order.discountTotal > 0;
  const showGst = order.gstTotal > 0;

  return (
    <section className="rounded-xl border bg-card">
      <header className="border-b px-5 py-4">
        <h2 className="text-base font-semibold tracking-tight text-foreground">
          Summary
        </h2>
        <p className="mt-0.5 text-xs text-muted-foreground">
          Totals for this order
        </p>
      </header>

      <div className="space-y-3 px-5 py-5">
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
