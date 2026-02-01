"use client";

import { IconTrendingDown, IconTrendingUp } from "@tabler/icons-react";

import { SectionCard } from "./section-card";
import { useDashboardMetrics } from "@/app/api/dashboard/use-dashboard-metrics";

export function SectionCards() {
  const { data, isLoading } = useDashboardMetrics();

  const formatPKR = (amount: number) => {
    return new Intl.NumberFormat("en-PK", {
      style: "currency",
      currency: "PKR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-24 animate-pulse rounded-lg bg-muted"></div>
        ))}
      </div>
    );
  }

  const totalReceivable = data?.metrics.ledger.totalReceivable ?? 0;
  const totalDebit = data?.metrics.ledger.totalDebit ?? 0;
  const totalCredit = data?.metrics.ledger.totalCredit ?? 0;
  const balance = totalDebit - totalCredit;

  return (
    <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
      <SectionCard
        description="Total Products"
        value={data?.metrics.totalProducts.toString() ?? "0"}
        badgeText={`${data?.alerts.lowStockProducts.length ?? 0} Low Stock`}
        badgeVariant="outline"
        footerTitle="Stock Management"
        href="/admin/products"
      />
      <SectionCard
        description="Total Customers"
        value={data?.metrics.totalCustomers.toString() ?? "0"}
        badgeText="Active"
        badgeVariant="outline"
        footerTitle="Registered Customers"
        href="/admin/customers"
      />

      <SectionCard
        description="Total Orders"
        value={data?.metrics.totalOrders.toString() ?? "0"}
        badgeText={`${data?.alerts.pendingOrders.length ?? 0} Pending`}
        badgeVariant="outline"
        footerTitle="Order Management"
        href="/admin/orders"
      />
      <SectionCard
        description="Revenue (PKR)"
        value={formatPKR(balance)}
        badgeIcon={balance >= 0 ? <IconTrendingUp /> : <IconTrendingDown />}
        badgeText={formatPKR(Math.abs(totalReceivable))}
        badgeVariant="outline"
        footerTitle={`Debit: ${formatPKR(totalDebit)} | Credit: ${formatPKR(totalCredit)}`}
        footerIcon={
          balance >= 0 ? (
            <IconTrendingUp className="size-4" />
          ) : (
            <IconTrendingDown className="size-4" />
          )
        }
        href="/admin/ledgers"
      />
    </div>
  );
}
