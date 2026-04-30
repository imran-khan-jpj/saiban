"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import {
  IconCheck,
  IconChevronLeft,
  IconChevronRight,
  IconShoppingCart,
  IconX as IconCancel,
} from "@tabler/icons-react";
import { StatusBadge } from "@/components/common/status-badge";
import { formatCurrency, formatDate } from "@/lib/utils";
import type {
  CustomerOrder,
  GetCustomerOrdersResponse,
} from "@/app/api/customers/use-get-customer-orders";

interface CustomerOrdersCardV2Props {
  orders: CustomerOrder[];
  ordersData: GetCustomerOrdersResponse | undefined;
  isLoading: boolean;
  isError: boolean;
  page: number;
  onPageChange: (next: number) => void;
  onConfirm: (orderId: string) => void;
  onCancel: (orderId: string) => void;
}

export function CustomerOrdersCardV2({
  orders,
  ordersData,
  isLoading,
  isError,
  page,
  onPageChange,
  onConfirm,
  onCancel,
}: CustomerOrdersCardV2Props) {
  const totalPages = ordersData?.pagination.pages ?? 1;

  return (
    <section className="flex flex-col rounded-xl border bg-card">
      <header className="flex items-baseline justify-between gap-4 border-b px-5 py-4">
        <div>
          <h2 className="text-base font-semibold tracking-tight text-foreground">
            Order history
          </h2>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Recent orders placed by this customer
          </p>
        </div>
      </header>

      <div className="flex-1 px-5 py-3">
        {isLoading ? (
          <div className="flex h-32 items-center justify-center">
            <Spinner className="h-5 w-5" />
          </div>
        ) : isError ? (
          <p className="py-8 text-center text-sm text-destructive">
            Could not load orders
          </p>
        ) : orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 py-10 text-center">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted text-muted-foreground">
              <IconShoppingCart className="h-5 w-5" />
            </div>
            <p className="text-sm font-medium text-foreground">
              No orders yet
            </p>
            <p className="text-xs text-muted-foreground">
              Orders this customer places will show up here.
            </p>
          </div>
        ) : (
          <ul className="divide-y">
            {orders.map((order) => {
              const isPending = order.status === "pending";
              return (
                <li key={order._id} className="py-3">
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <Link
                        href={`/admin/orders/${order._id}`}
                        className="block truncate text-sm font-semibold text-foreground hover:underline underline-offset-4"
                      >
                        Order #{order._id.slice(-6).toUpperCase()}
                      </Link>
                      <p className="mt-0.5 text-xs text-muted-foreground tabular-nums">
                        {order.items.length} item{order.items.length === 1 ? "" : "s"} ·{" "}
                        {formatDate(order.createdAt)}
                      </p>
                    </div>

                    <div className="flex shrink-0 items-center gap-3">
                      <span className="text-sm font-semibold tabular-nums tracking-tight">
                        {formatCurrency(order.grandTotal)}
                      </span>
                      <StatusBadge status={order.status} />
                      {isPending && (
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 bg-emerald-100 text-emerald-700 hover:bg-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300"
                            onClick={() => onConfirm(order._id)}
                            title="Confirm order"
                          >
                            <IconCheck className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-950/40 dark:text-red-300"
                            onClick={() => onCancel(order._id)}
                            title="Cancel order"
                          >
                            <IconCancel className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {totalPages > 1 && (
        <footer className="flex items-center justify-between border-t px-5 py-3">
          <p className="text-xs text-muted-foreground tabular-nums">
            Page {page} of {totalPages}
          </p>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-muted-foreground hover:text-foreground"
              onClick={() => onPageChange(Math.max(1, page - 1))}
              disabled={page === 1}
            >
              <IconChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-muted-foreground hover:text-foreground"
              onClick={() => onPageChange(Math.min(totalPages, page + 1))}
              disabled={page === totalPages}
            >
              <IconChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </footer>
      )}
    </section>
  );
}
