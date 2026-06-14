import { Customers } from "@/components/admin/customers";
import { SiteHeader } from "@/components/site-header";

export default function CustomersPage() {
  return (
    <div className="flex h-full flex-col overflow-hidden">
      <SiteHeader title="Customers" />
      <div className="flex-1 overflow-auto">
        <Customers />
      </div>
    </div>
  );
}
