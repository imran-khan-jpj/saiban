import { CustomerLedgerRecords } from "@/components/admin/ledgers/customer-ledger-records";
import { SiteHeader } from "@/components/site-header";

export default async function CustomerLedgerRecordsPage({
  params,
}: {
  params: Promise<{ customerId: string }>;
}) {
  const { customerId } = await params;

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <SiteHeader title="Customer ledger" />
      <div className="flex-1 overflow-auto">
        <CustomerLedgerRecords customerId={customerId} />
      </div>
    </div>
  );
}
