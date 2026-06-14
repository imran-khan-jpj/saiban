import { Orders } from "@/components/admin/orders";
import { SiteHeader } from "@/components/site-header";

export default function OrdersPage() {
  return (
    <div className="flex h-full flex-col overflow-hidden">
      <SiteHeader title="Orders" />
      <div className="flex-1 overflow-auto">
        <Orders />
      </div>
    </div>
  );
}
