import { OrdersV2 } from "@/components/admin/orders-v2";
import { SiteHeader } from "@/components/site-header";

export default function OrdersV2Page() {
  return (
    <div className="flex h-full flex-col overflow-hidden">
      <SiteHeader title="Orders" />
      <div className="flex-1 overflow-auto">
        <OrdersV2 />
      </div>
    </div>
  );
}
