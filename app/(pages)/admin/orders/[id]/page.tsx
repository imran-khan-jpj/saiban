import { OrderDetail } from "@/components/admin/orders/order-detail";
import { SiteHeader } from "@/components/site-header";

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <SiteHeader title="Order details" />
      <div className="flex-1 overflow-auto">
        <OrderDetail orderId={id} />
      </div>
    </div>
  );
}
