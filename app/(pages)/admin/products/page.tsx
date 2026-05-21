import { Products } from "@/components/admin/products";
import { ProductStockStats } from "@/components/admin/products/product-stock-stats";
import { SiteHeader } from "@/components/site-header";

export default function ProductsPage() {
  return (
    <div className="flex flex-col h-full">
      <SiteHeader title="Products" />
      <div className="@container/main flex flex-1 flex-col gap-2 min-h-0">
        <ProductStockStats />
        <Products />
      </div>
    </div>
  );
}
