import Link from "next/link";
import { Products } from "@/components/admin/products";
import { ProductStockStats } from "@/components/admin/products/product-stock-stats";
import { SiteHeader } from "@/components/site-header";

export default function ProductsPage() {
  return (
    <div className="flex flex-col h-full">
      <SiteHeader title="Products">
        <Link
          href="/admin/products/v2"
          className="mr-4 inline-flex items-center gap-1 rounded-full border bg-card px-3 py-1 text-xs font-medium text-foreground/80 hover:border-foreground/30 hover:text-foreground"
        >
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
          Try the new inventory page
        </Link>
      </SiteHeader>
      <div className="@container/main flex flex-1 flex-col gap-2 min-h-0">
        <ProductStockStats />
        <Products />
      </div>
    </div>
  );
}
