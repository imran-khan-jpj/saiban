"use client";

import { Spinner } from "@/components/ui/spinner";
import { useDashboardMetrics } from "@/app/api/dashboard/use-dashboard-metrics";
import { formatCurrency } from "@/lib/utils";

export function PaymentSplit() {
  const { data, isLoading } = useDashboardMetrics();

  const received = data?.metrics.receivedPayments ?? 0;
  const pending = data?.metrics.pendingPayments ?? 0;
  const total = received + pending;
  const pctReceived = total > 0 ? Math.round((received / total) * 100) : 0;
  const pctPending = total > 0 ? 100 - pctReceived : 0;

  return (
    <section className="rounded-xl border bg-card">
      <header className="border-b px-5 py-4">
        <h2 className="text-base font-semibold tracking-tight text-foreground">
          Payments
        </h2>
        <p className="mt-0.5 text-xs text-muted-foreground">
          Received vs pending across all customers
        </p>
      </header>
      <div className="space-y-5 px-5 py-5">
        {isLoading ? (
          <div className="flex h-[180px] items-center justify-center">
            <Spinner className="h-5 w-5" />
          </div>
        ) : (
          <>
            <div className="space-y-2">
              <div className="flex items-baseline justify-between">
                <span className="text-sm font-medium text-muted-foreground">
                  Received
                </span>
                <span className="text-lg font-semibold tabular-nums tracking-tight">
                  {formatCurrency(received)}
                </span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-emerald-500/80 transition-[width]"
                  style={{ width: `${pctReceived}%` }}
                />
              </div>
              <p className="text-xs text-muted-foreground tabular-nums">
                {pctReceived}% of total
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-baseline justify-between">
                <span className="text-sm font-medium text-muted-foreground">
                  Pending
                </span>
                <span className="text-lg font-semibold tabular-nums tracking-tight">
                  {formatCurrency(pending)}
                </span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-orange-500/80 transition-[width]"
                  style={{ width: `${pctPending}%` }}
                />
              </div>
              <p className="text-xs text-muted-foreground tabular-nums">
                {pctPending}% of total
              </p>
            </div>

            <div className="rounded-lg bg-muted/40 px-4 py-3">
              <div className="flex items-baseline justify-between">
                <span className="text-sm font-medium text-muted-foreground">
                  Collection rate
                </span>
                <span className="text-2xl font-semibold tabular-nums tracking-tight">
                  {pctReceived}%
                </span>
              </div>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
