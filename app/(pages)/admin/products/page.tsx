"use client";

import * as React from "react";
import { Products } from "@/components/admin/products";
import { SiteHeader } from "@/components/site-header";
import { Input } from "@/components/ui/input";
import { IconSearch } from "@tabler/icons-react";

export default function ProductsPage() {
  const [searchInput, setSearchInput] = React.useState("");
  const [stockStatus, setStockStatus] = React.useState<string>("");

  return (
    <div className="flex flex-col h-full">
      <SiteHeader title="Products" />
      <div className="@container/main flex flex-1 flex-col gap-2 min-h-0">
        <Products
          setSearchInput={setSearchInput}
          searchInput={searchInput}
          stockStatus={stockStatus}
          onStockStatusChange={setStockStatus}
        />
      </div>
    </div>
  );
}
