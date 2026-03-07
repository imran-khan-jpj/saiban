"use client";

import { IconTrendingDown, IconTrendingUp } from "@tabler/icons-react";

import { SectionCard } from "./section-card";
import { useDashboardMetrics } from "@/app/api/dashboard/use-dashboard-metrics";
import { formatCurrency } from "@/lib/utils";

export function SectionCards() {
  const { data, isLoading } = useDashboardMetrics();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-24 animate-pulse rounded-lg bg-muted"></div>
        ))}
      </div>
    );
  }

  const totalProducts = data?.metrics.totalProducts ?? 0;
  const totalCustomers = data?.metrics.totalCustomers ?? 0;
  const totalOrders = data?.metrics.totalOrders ?? 0;
  const totalRevenue = data?.metrics.totalRevenue ?? 0;

  return (
    <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
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
        description="Revenue"
        value={formatCurrency(totalRevenue)}
        href="/admin/ledgers"
      />
    </div>
  );
}
