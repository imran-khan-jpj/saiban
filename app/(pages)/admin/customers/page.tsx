import Link from "next/link";
import { Customers } from "@/components/admin/customers";
import { SiteHeader } from "@/components/site-header";

export default function CustomersPage() {
  return (
    <div className="flex flex-col h-full">
      <SiteHeader title="Customers">
        <Link
          href="/admin/customers/v2"
          className="mr-4 inline-flex items-center gap-1 rounded-full border bg-card px-3 py-1 text-xs font-medium text-foreground/80 hover:border-foreground/30 hover:text-foreground"
        >
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
          Try the new customers page
        </Link>
      </SiteHeader>
      <div className="@container/main flex flex-1 flex-col gap-2 min-h-0">
        <Customers />
      </div>
    </div>
  );
}
