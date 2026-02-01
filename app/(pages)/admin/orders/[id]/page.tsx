import { OrderDetail } from "@/components/admin/orders/order-detail";
import { SiteHeader } from "@/components/site-header";

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <div className="flex flex-col h-full">
      <SiteHeader title="Order Details" />
      <div className="@container/main flex flex-1 flex-col gap-2 min-h-0">
        <OrderDetail orderId={id} />
      </div>
    </div>
  );
}
