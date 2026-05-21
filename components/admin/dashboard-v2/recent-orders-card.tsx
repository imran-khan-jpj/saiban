"use client";

import Link from "next/link";
import { Spinner } from "@/components/ui/spinner";
import { StatusBadge } from "@/components/common/status-badge";
import { useGetAllOrders } from "@/app/api/orders/use-get-all";
import { ADMIN_V2 } from "@/lib/admin-routes";
import { formatDate, formatCurrency } from "@/lib/utils";

export function RecentOrdersCard() {
  const { data, isLoading } = useGetAllOrders(1, 5);
  const orders = data?.data ?? [];

  return (
    <section className="rounded-xl border bg-card">
      <header className="flex items-baseline justify-between border-b px-5 py-4">
        <div>
          <h2 className="text-base font-semibold tracking-tight text-foreground">
            Recent orders
          </h2>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Latest orders placed in the system
          </p>
        </div>
        <Link
          href={ADMIN_V2.orders}
          className="text-xs font-medium text-foreground/70 hover:text-foreground"
        >
          View all
        </Link>
      </header>
      <div className="px-5 py-2">
        {isLoading ? (
          <div className="flex h-32 items-center justify-center">
            <Spinner className="h-5 w-5" />
          </div>
        ) : orders.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">
            No orders yet
          </p>
        ) : (
          <ul className="divide-y">
            {orders.map((order) => (
              <li key={order._id} className="py-3">
                <Link
                  href={`/admin/v2/orders/${order._id}`}
                  className="flex items-center justify-between gap-3 group"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-foreground group-hover:underline">
                      {order.customerId.firstName} {order.customerId.lastName}
                    </p>
                    <p className="mt-0.5 text-xs text-muted-foreground tabular-nums">
                      {order.items.length} item{order.items.length === 1 ? "" : "s"}{" "}
                      · {formatDate(order.createdAt)}
                    </p>
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-1.5">
                    <span className="text-sm font-semibold tabular-nums tracking-tight">
                      {formatCurrency(order.grandTotal)}
                    </span>
                    <StatusBadge status={order.status} />
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
