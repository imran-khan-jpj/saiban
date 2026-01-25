import { Customers } from "@/components/admin/customers";
import { SiteHeader } from "@/components/site-header";

export default function CustomersPage() {
  return (
    <div className="flex flex-col h-full p-4">
      <SiteHeader title="Customers" />
      <div className="@container/main flex flex-1 flex-col gap-2 min-h-0">
        <Customers />
      </div>
    </div>
  );
}
