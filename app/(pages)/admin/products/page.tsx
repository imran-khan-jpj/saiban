import { Products } from "@/components/admin/products";
import { SiteHeader } from "@/components/site-header";

export default function ProductsPage() {
  return (
    <div className="flex h-full flex-col overflow-hidden">
      <SiteHeader title="Inventory" />
      <div className="flex-1 overflow-auto">
        <Products />
      </div>
    </div>
  );
}
