import { LedgersV2 } from "@/components/admin/ledgers-v2";
import { SiteHeader } from "@/components/site-header";

export default function LedgersV2Page() {
  return (
    <div className="flex h-full flex-col overflow-hidden">
      <SiteHeader title="Ledger" />
      <div className="flex-1 overflow-auto">
        <LedgersV2 />
      </div>
    </div>
  );
}
