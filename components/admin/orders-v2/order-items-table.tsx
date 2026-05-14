"use client";

import type { Order } from "@/app/api/orders/use-get-all";
import { formatCurrency } from "@/lib/utils";

interface OrderItemsTableProps {
  items: Order["items"];
}

export function OrderItemsTable({ items }: OrderItemsTableProps) {
  return (
    <section className="rounded-xl border bg-card overflow-hidden">
      <header className="flex items-baseline justify-between gap-4 border-b px-5 py-4">
        <div>
          <h2 className="text-base font-semibold tracking-tight text-foreground">
            Items
          </h2>
          <p className="mt-0.5 text-xs text-muted-foreground tabular-nums">
            {items.length} {items.length === 1 ? "product" : "products"}
          </p>
        </div>
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
            </tr>
          </thead>
          <tbody className="divide-y">
            {items.map((item, idx) => (
              <tr key={idx} className="text-sm">
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
                <td className="px-5 py-3 text-right tabular-nums text-muted-foreground">
                  {formatCurrency(item.unitPrice)}
                </td>
                <td className="px-5 py-3 text-right tabular-nums text-muted-foreground">
                  {item.discountPercentage > 0
                    ? `${item.discountPercentage}%`
                    : "—"}
                </td>
                <td className="px-5 py-3 text-right font-semibold tabular-nums tracking-tight">
                  {formatCurrency(item.lineTotal)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
