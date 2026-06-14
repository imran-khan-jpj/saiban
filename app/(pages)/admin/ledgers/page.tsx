import { Ledgers } from "@/components/admin/ledgers";
import { SiteHeader } from "@/components/site-header";

export default function LedgersPage() {
  return (
    <div className="flex h-full flex-col overflow-hidden">
      <SiteHeader title="Ledger" />
      <div className="flex-1 overflow-auto">
        <Ledgers />
      </div>
    </div>
  );
}
