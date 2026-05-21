import { OrderDetailV2 } from "@/components/admin/orders-v2/order-detail-v2";
import { SiteHeader } from "@/components/site-header";

export default async function OrderDetailV2Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <SiteHeader title="Order details" />
      <div className="flex-1 overflow-auto">
        <OrderDetailV2 orderId={id} />
      </div>
    </div>
  );
}
