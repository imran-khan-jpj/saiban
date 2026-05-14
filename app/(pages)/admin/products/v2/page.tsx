import { ProductsV2 } from "@/components/admin/products-v2";
import { SiteHeader } from "@/components/site-header";

export default function ProductsV2Page() {
  return (
    <div className="flex h-full flex-col overflow-hidden">
      <SiteHeader title="Inventory" />
      <div className="flex-1 overflow-auto">
        <ProductsV2 />
      </div>
    </div>
  );
}
