import { CustomerDetail } from "@/components/admin/customers/customer-detail";
import { SiteHeader } from "@/components/site-header";

export default async function CustomerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <SiteHeader title="Customer details" />
      <div className="flex-1 overflow-auto">
        <CustomerDetail customerId={id} />
      </div>
    </div>
  );
}
