import { CustomerDetailV2 } from "@/components/admin/customers-v2/customer-detail-v2";
import { SiteHeader } from "@/components/site-header";

export default async function CustomerDetailV2Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <SiteHeader title="Customer details" />
      <div className="flex-1 overflow-auto">
        <CustomerDetailV2 customerId={id} />
      </div>
    </div>
  );
}
