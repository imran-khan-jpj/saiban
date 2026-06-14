"use client";

import { Spinner } from "@/components/ui/spinner";
import { KpiCard } from "@/components/admin/dashboard/kpi-card";
import { formatCurrency, formatDate } from "@/lib/utils";
import { cn } from "@/lib/utils";
import type { Customer } from "@/app/api/customers/use-get-by-id";
import type { CustomerOrder } from "@/app/api/customers/use-get-customer-orders";

interface CustomerBalanceCardsProps {
  customer: Customer;
  orders: CustomerOrder[];
  totalOrders: number;
}

const BALANCE_LABEL: Record<string, string> = {
  settled: "Settled",
  we_owe_customer: "Advance",
  customer_owes: "Pending payment",
};

const BALANCE_TONE: Record<string, { dot: string; pill: string }> = {
  settled: {
    dot: "bg-gray-400",
    pill: "bg-gray-100 text-gray-700 dark:bg-gray-900/40 dark:text-gray-300",
  },
  we_owe_customer: {
    dot: "bg-emerald-500",
    pill:
      "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300",
  },
  customer_owes: {
    dot: "bg-red-500",
    pill: "bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-300",
  },
};

interface BalanceCardProps {
  amount: number;
  direction: string;
  isLoading?: boolean;
}

function BalanceCard({ amount, direction, isLoading }: BalanceCardProps) {
  const tone = BALANCE_TONE[direction] ?? BALANCE_TONE.settled;
  const label = BALANCE_LABEL[direction] ?? "Settled";
  const isOwed = direction === "customer_owes";

  return (
    <div className="rounded-xl border bg-card px-5 py-5">
      <div className="flex items-baseline justify-between gap-3">
        <p className="text-sm font-medium text-muted-foreground">
          Current balance
        </p>
        <span
          className={cn(
            "inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[10px] font-medium",
            tone.pill,
          )}
        >
          <span className={cn("h-1.5 w-1.5 rounded-full", tone.dot)} />
          {label}
        </span>
      </div>
      {isLoading ? (
        <div className="mt-3 h-9 flex items-center">
          <Spinner className="h-4 w-4" />
        </div>
      ) : (
        <p
          className={cn(
            "mt-2 text-3xl font-semibold tabular-nums tracking-tight",
            isOwed && "text-red-600 dark:text-red-500",
          )}
        >
          {formatCurrency(amount)}
        </p>
      )}
    </div>
  );
}

export function CustomerBalanceCards({
  customer,
  orders,
  totalOrders,
}: CustomerBalanceCardsProps) {
  const pendingCount = orders.filter((o) => o.status === "pending").length;
  const lastOrder = orders.length > 0 ? formatDate(orders[0].createdAt) : "No orders yet";

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <BalanceCard
        amount={customer.balance.absoluteAmount}
        direction={customer.balance.direction}
      />
      <KpiCard label="Total orders" value={totalOrders} hint="lifetime" />
      <KpiCard label="Last order" value={lastOrder} hint="most recent" />
      <KpiCard
        label="Pending orders"
        value={pendingCount}
        hint="awaiting confirmation"
        emphasis={pendingCount > 0 ? "warn" : "default"}
      />
    </div>
  );
}
