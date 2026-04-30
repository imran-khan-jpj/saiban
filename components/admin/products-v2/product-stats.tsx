"use client";

import { useGetAllProducts } from "@/app/api/products/use-get-all";
import { KpiCard } from "@/components/admin/dashboard-v2/kpi-card";

export function ProductStats() {
  const { data: totalData, isLoading: isLoadingTotal } = useGetAllProducts(
    1,
    1,
  );
  const { data: lowStockData, isLoading: isLoadingLow } = useGetAllProducts(
    1,
    1,
    undefined,
    "low_stock",
  );
  const { data: outOfStockData, isLoading: isLoadingOut } = useGetAllProducts(
    1,
    1,
    undefined,
    "out_of_stock",
  );
  const { data: inStockData, isLoading: isLoadingHealthy } = useGetAllProducts(
    1,
    1,
    undefined,
    "in_stock",
  );

  const total = totalData?.pagination.total ?? 0;
  const lowStock = lowStockData?.pagination.total ?? 0;
  const outOfStock = outOfStockData?.pagination.total ?? 0;
  // Fall back to derived value if backend doesn't support the in_stock filter.
  const apiInStock = inStockData?.pagination.total ?? null;
  const inStock = apiInStock ?? Math.max(total - lowStock - outOfStock, 0);

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <KpiCard
        label="Total products"
        value={total}
        hint="active SKUs"
        isLoading={isLoadingTotal}
      />
      <KpiCard
        label="In stock"
        value={inStock}
        hint="healthy levels"
        isLoading={isLoadingHealthy && isLoadingTotal}
      />
      <KpiCard
        label="Low stock"
        value={lowStock}
        hint="below threshold"
        emphasis={lowStock > 0 ? "warn" : "default"}
        isLoading={isLoadingLow}
      />
      <KpiCard
        label="Out of stock"
        value={outOfStock}
        hint="needs reorder now"
        emphasis={outOfStock > 0 ? "danger" : "default"}
        isLoading={isLoadingOut}
      />
    </div>
  );
}
