"use client";

import { useGetAllOrders } from "@/app/api/orders/use-get-all";
import { KpiCard } from "@/components/admin/dashboard/kpi-card";

export function OrdersStats() {
  const { data: totalData, isLoading: isLoadingTotal } = useGetAllOrders(
    1,
    1,
  );
  const { data: pendingData, isLoading: isLoadingPending } = useGetAllOrders(
    1,
    1,
    undefined,
    "pending",
  );
  const { data: completedData, isLoading: isLoadingCompleted } =
    useGetAllOrders(1, 1, undefined, "completed");
  const { data: cancelledData, isLoading: isLoadingCancelled } =
    useGetAllOrders(1, 1, undefined, "cancelled");

  const total = totalData?.pagination.total ?? 0;
  const pending = pendingData?.pagination.total ?? 0;
  const completed = completedData?.pagination.total ?? 0;
  const cancelled = cancelledData?.pagination.total ?? 0;

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <KpiCard
        label="Total orders"
        value={total}
        hint="lifetime"
        isLoading={isLoadingTotal}
      />
      <KpiCard
        label="Pending"
        value={pending}
        hint="awaiting confirmation"
        emphasis={pending > 0 ? "warn" : "default"}
        isLoading={isLoadingPending}
      />
      <KpiCard
        label="Completed"
        value={completed}
        hint="fulfilled"
        isLoading={isLoadingCompleted}
      />
      <KpiCard
        label="Cancelled"
        value={cancelled}
        hint="reverted"
        isLoading={isLoadingCancelled}
      />
    </div>
  );
}
