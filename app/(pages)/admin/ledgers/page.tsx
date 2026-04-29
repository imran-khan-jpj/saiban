import { Ledgers } from "@/components/admin/ledgers";
import { SiteHeader } from "@/components/site-header";

export default function LedgersPage() {
  return (
    <div className="flex flex-col h-full">
      <SiteHeader title="Ledgers" />
      <div className="@container/main flex flex-1 flex-col gap-2 min-h-0">
        <Ledgers />
      </div>
    </div>
  );
}
