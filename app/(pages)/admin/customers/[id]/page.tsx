import { CustomerDetail } from "@/components/admin/customers/customer-detail";
import { SiteHeader } from "@/components/site-header";

export default async function CustomerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <div className="flex flex-col h-full">
      <SiteHeader title="Customer Details" />
      <div className="@container/main flex flex-1 flex-col gap-2 min-h-0">
        <CustomerDetail customerId={id} />
      </div>
    </div>
  );
}
