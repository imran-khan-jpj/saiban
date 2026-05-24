"use client";

import { SectionCard } from "./section-card";
import { useDashboardMetrics } from "@/app/api/dashboard/use-dashboard-metrics";
import { formatCurrency, parseCurrency } from "@/lib/utils";

export function SectionCards() {
  const { data, isLoading } = useDashboardMetrics();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 @xl/main:grid-cols-2 @5xl/main:grid-cols-3">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="h-24 animate-pulse rounded-lg bg-muted"></div>
        ))}
      </div>
    );
  }

  const totalProducts = data?.metrics.totalProducts ?? 0;
  const totalCustomers = data?.metrics.totalCustomers ?? 0;
  const totalOrders = data?.metrics.totalOrders ?? 0;
  const totalRevenue = data?.metrics.totalRevenue ?? 0;
  const pendingPayments = data?.metrics.pendingPayments ?? 0;
  const receivedPayments = data?.metrics.receivedPayments ?? 0;

  return (
    <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs @xl/main:grid-cols-2 @5xl/main:grid-cols-3">
      <SectionCard
        description="Total Products"
        value={totalProducts.toString()}
        href="/admin/products"
      />
      <SectionCard
        description="Total Customers"
        value={totalCustomers.toString()}
        href="/admin/customers"
      />

      <SectionCard
        description="Total Orders"
        value={totalOrders.toString()}
        href="/admin/orders"
      />
      <SectionCard
        description="Total Revenue"
        value={formatCurrency(totalRevenue)}
        href="/admin/ledgers"
      />
      <SectionCard
        description="Received Payments"
        value={formatCurrency(receivedPayments)}
      />
      <SectionCard
        description="Pending Payments"
        value={formatCurrency(pendingPayments)}
        valueClassName={
          parseCurrency(pendingPayments) > 0
            ? "text-red-600 dark:text-red-500"
            : ""
        }
      />
    </div>
  );
}
