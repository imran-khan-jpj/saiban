import { Orders } from "@/components/admin/orders";
import { SiteHeader } from "@/components/site-header";

export default function OrdersPage() {
  return (
    <div className="flex flex-col h-full">
      <SiteHeader title="Orders" />
      <div className="@container/main flex flex-1 flex-col gap-2 min-h-0">
        <Orders />
      </div>
    </div>
  );
}
