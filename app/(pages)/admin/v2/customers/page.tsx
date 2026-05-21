import { CustomersV2 } from "@/components/admin/customers-v2";
import { SiteHeader } from "@/components/site-header";

export default function CustomersV2Page() {
  return (
    <div className="flex h-full flex-col overflow-hidden">
      <SiteHeader title="Customers" />
      <div className="flex-1 overflow-auto">
        <CustomersV2 />
      </div>
    </div>
  );
}
