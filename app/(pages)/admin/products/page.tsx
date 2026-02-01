"use client";

import * as React from "react";
import { Products } from "@/components/admin/products";
import { SiteHeader } from "@/components/site-header";
import { Input } from "@/components/ui/input";
import { IconSearch } from "@tabler/icons-react";
import { useGetAllProducts } from "@/app/api/products/use-get-all";
import { Spinner } from "@/components/ui/spinner";

export default function ProductsPage() {
  const [searchInput, setSearchInput] = React.useState("");
  const [stockStatus, setStockStatus] = React.useState<string>("");

  // Fetch all products for stock statistics
  const { data, isLoading } = useGetAllProducts(1, 100);
  const products = data?.data || [];

  // Calculate stock statistics
  const totalItems = products.length;
  const lowStockItems = products.filter(
    (p) => p.quantityInStock > 0 && p.quantityInStock <= p.lowStockThreshold,
  ).length;
  const outOfStockItems = products.filter(
    (p) => p.quantityInStock === 0,
  ).length;

  return (
    <div className="flex flex-col h-full">
      <SiteHeader title="Products" />
      <div className="@container/main flex flex-1 flex-col gap-2 min-h-0">
        {/* Stock Statistics Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 py-4">
          <div className="rounded-lg border p-6">
            <h3 className="text-sm font-medium text-muted-foreground">
              Total Items
            </h3>
            {isLoading ? (
              <div className="mt-2 h-9 flex items-center">
                <Spinner className="h-5 w-5" />
              </div>
            ) : (
              <>
                <p className="mt-2 text-3xl font-bold">{totalItems}</p>
                <p className="text-sm text-muted-foreground">Active products</p>
              </>
            )}
          </div>

          <div className="rounded-lg border p-6">
            <h3 className="text-sm font-medium text-muted-foreground">
              Low Stock Items
            </h3>
            {isLoading ? (
              <div className="mt-2 h-9 flex items-center">
                <Spinner className="h-5 w-5" />
              </div>
            ) : (
              <>
                <p className="mt-2 text-3xl font-bold text-orange-600">
                  {lowStockItems}
                </p>
                <p className="text-sm text-muted-foreground">Need reordering</p>
              </>
            )}
          </div>

          <div className="rounded-lg border p-6">
            <h3 className="text-sm font-medium text-muted-foreground">
              Out of Stock
            </h3>
            {isLoading ? (
              <div className="mt-2 h-9 flex items-center">
                <Spinner className="h-5 w-5" />
              </div>
            ) : (
              <>
                <p className="mt-2 text-3xl font-bold text-red-600">
                  {outOfStockItems}
                </p>
                <p className="text-sm text-muted-foreground">
                  Urgent attention
                </p>
              </>
            )}
          </div>
        </div>

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
