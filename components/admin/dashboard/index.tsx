"use client";

import * as React from "react";
import { useDashboardMetrics } from "@/app/api/dashboard/use-dashboard-metrics";
import { useGetAllProducts } from "@/app/api/products/use-get-all";
import { useGetAllOrders } from "@/app/api/orders/use-get-all";
import { useApp } from "@/providers/app-provider";
import { ADMIN_ROUTES } from "@/lib/admin-routes";
import {
  formatCurrency,
  formatPercent,
  getMarginPercent,
  parseCurrency,
} from "@/lib/utils";

import { AlertsBar } from "./alerts-bar";
import { QuickActions } from "./quick-actions";
import { KpiCard } from "./kpi-card";
import { RevenueTrend } from "./revenue-trend";
import { PaymentSplit } from "./payment-split";
import { RecentCustomersCard } from "./recent-customers-card";
import { RecentOrdersCard } from "./recent-orders-card";
import { InventoryAlerts } from "./inventory-alerts";
import { TopProducts } from "./top-products";

const greeting = (date = new Date()): string => {
  const h = date.getHours();
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
};

export function Dashboard() {
  const { user } = useApp();
  const { data: metrics, isLoading: metricsLoading } = useDashboardMetrics();
  const { data: outOfStockData } = useGetAllProducts(
    1,
    1,
    undefined,
    "out_of_stock",
  );
  const { data: pendingOrdersData } = useGetAllOrders(
    1,
    1,
    undefined,
    "pending",
  );

  const m = metrics?.metrics;
  const firstName = (user?.name ?? "").split(" ")[0] || user?.name || "there";

  // Profitability — values come from the backend once cost tracking is wired.
  const hasCost = m?.totalCost != null;
  const grossProfit =
    m?.grossProfit != null
      ? parseCurrency(m.grossProfit)
      : hasCost
        ? parseCurrency(m?.totalRevenue) - parseCurrency(m?.totalCost)
        : null;
  const profitMargin =
    m?.profitMargin != null
      ? parseCurrency(m.profitMargin)
      : hasCost
        ? getMarginPercent(m?.totalRevenue, m?.totalCost)
        : null;

  return (
    <div className="mx-auto flex w-full max-w-[1400px] flex-col gap-6 px-4 pb-10 pt-6 sm:px-6">
      {/* Greeting + quick actions */}
      <header className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs font-medium text-muted-foreground">
            {new Date().toLocaleDateString("en-US", {
              weekday: "long",
              month: "long",
              day: "numeric",
            })}
          </p>
          <h1 className="mt-1.5 text-3xl font-semibold tracking-tight text-foreground">
            {greeting()}, {firstName}
          </h1>
          <p className="mt-1.5 text-sm text-muted-foreground">
            Here&apos;s what&apos;s happening across your store today.
          </p>
        </div>
        <QuickActions className="lg:w-[640px]" />
      </header>

      {/* Alerts strip */}
      <AlertsBar
        alerts={[
          {
            label: "out of stock",
            count: outOfStockData?.pagination.total ?? 0,
            href: ADMIN_ROUTES.products,
            tone: "danger",
          },
          {
            label: "pending orders",
            count: pendingOrdersData?.pagination.total ?? 0,
            href: ADMIN_ROUTES.orders,
            tone: "warn",
          },
        ]}
      />

      {/* KPI grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          label="Total revenue"
          value={formatCurrency(m?.totalRevenue ?? 0)}
          hint={`from ${m?.totalOrders ?? 0} orders`}
          isLoading={metricsLoading}
          href={ADMIN_ROUTES.ledgers}
        />
        <KpiCard
          label="Pending payments"
          value={formatCurrency(m?.pendingPayments ?? 0)}
          hint="across all customers"
          isLoading={metricsLoading}
          emphasis={parseCurrency(m?.pendingPayments) > 0 ? "warn" : "default"}
          href={ADMIN_ROUTES.ledgers}
        />
        <KpiCard
          label="Customers"
          value={m?.totalCustomers ?? 0}
          hint="total accounts"
          isLoading={metricsLoading}
          href={ADMIN_ROUTES.customers}
        />
        <KpiCard
          label="Products"
          value={m?.totalProducts ?? 0}
          hint="active SKUs"
          isLoading={metricsLoading}
          href={ADMIN_ROUTES.products}
        />
      </div>

      {/* Profitability */}
      <div>
        <h2 className="mb-3 text-sm font-semibold tracking-tight text-foreground">
          Profitability
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <KpiCard
            label="Cost of goods sold"
            value={hasCost ? formatCurrency(m?.totalCost) : "—"}
            hint="what sold inventory cost you"
            isLoading={metricsLoading}
          />
          <KpiCard
            label="Gross profit"
            value={grossProfit != null ? formatCurrency(grossProfit) : "—"}
            hint="revenue − cost of goods"
            emphasis={
              grossProfit != null && grossProfit < 0 ? "danger" : "default"
            }
            isLoading={metricsLoading}
          />
          <KpiCard
            label="Profit margin"
            value={profitMargin != null ? formatPercent(profitMargin) : "—"}
            hint="gross profit ÷ revenue"
            emphasis={
              profitMargin != null && profitMargin < 0 ? "danger" : "default"
            }
            isLoading={metricsLoading}
          />
          <KpiCard
            label="Inventory value (at cost)"
            value={
              m?.inventoryValueAtCost != null
                ? formatCurrency(m.inventoryValueAtCost)
                : "—"
            }
            hint="stock on hand, valued at cost"
            isLoading={metricsLoading}
            href={ADMIN_ROUTES.products}
          />
        </div>
      </div>

      {/* Revenue trend + payment split */}
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <RevenueTrend />
        </div>
        <PaymentSplit />
      </div>

      {/* Top products by profit */}
      <TopProducts />

      {/* Recent activity */}
      <div className="grid gap-4 lg:grid-cols-2">
        <RecentCustomersCard />
        <RecentOrdersCard />
      </div>

      {/* Inventory alerts */}
      <InventoryAlerts />
    </div>
  );
}
