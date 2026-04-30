import { CustomerLedgerRecordsV2 } from "@/components/admin/ledgers-v2/customer-ledger-records-v2";
import { SiteHeader } from "@/components/site-header";

export default async function CustomerLedgerRecordsV2Page({
  params,
}: {
  params: Promise<{ customerId: string }>;
}) {
  const { customerId } = await params;

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <SiteHeader title="Customer ledger" />
      <div className="flex-1 overflow-auto">
        <CustomerLedgerRecordsV2 customerId={customerId} />
      </div>
    </div>
  );
}
