"use client";

import * as React from "react";
import { SiteHeader } from "@/components/site-header";
import { useGetAllProducts } from "@/app/api/products/use-get-all";
import { Spinner } from "@/components/ui/spinner";

export default function StockPage() {
  // Fetch all products
  const { data, isLoading, isError } = useGetAllProducts(1, 100);

  const products = data?.data || [];

  // Calculate stock statistics
  const totalItems = products.length;
  const lowStockItems = products.filter(
    (p) => p.quantityInStock > 0 && p.quantityInStock <= p.lowStockThreshold,
  ).length;
  const outOfStockItems = products.filter(
    (p) => p.quantityInStock === 0,
  ).length;

  // Get stock status
  const getStockStatus = (stock: number, lowStockThreshold: number) => {
    if (stock === 0) return "Out of Stock";
    if (stock <= lowStockThreshold) return "Low Stock";
    return "In Stock";
  };

  // Get stock badge variant
  const getStockBadgeClass = (status: string) => {
    if (status === "In Stock")
      return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
    if (status === "Low Stock")
      return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200";
    return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
  };

  // Get recent products sorted by stock
  const recentProducts = React.useMemo(() => {
    return [...products]
      .sort((a, b) => {
        // Prioritize out of stock and low stock
        const statusA = getStockStatus(a.quantityInStock, a.lowStockThreshold);
        const statusB = getStockStatus(b.quantityInStock, b.lowStockThreshold);
        if (statusA === "Out of Stock" && statusB !== "Out of Stock") return -1;
        if (statusB === "Out of Stock" && statusA !== "Out of Stock") return 1;
        if (statusA === "Low Stock" && statusB === "In Stock") return -1;
        if (statusB === "Low Stock" && statusA === "In Stock") return 1;
        return 0;
      })
      .slice(0, 10);
  }, [products]);

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="rounded-lg border border-destructive p-4">
        <p className="text-destructive">Error loading stock data</p>
      </div>
    );
  }

  return (
    <div>
      <SiteHeader title="Stock Management" />
      <div className="flex flex-1 flex-col">
        <div className="@container/main flex flex-1 flex-col gap-2">
          <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
            <div className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <div className="rounded-lg border p-6">
                  <h3 className="text-sm font-medium text-muted-foreground">
                    Total Items
                  </h3>
                  <p className="mt-2 text-3xl font-bold">{totalItems}</p>
                  <p className="text-sm text-muted-foreground">
                    Active products
                  </p>
                </div>

                <div className="rounded-lg border p-6">
                  <h3 className="text-sm font-medium text-muted-foreground">
                    Low Stock Items
                  </h3>
                  <p className="mt-2 text-3xl font-bold text-orange-600">
                    {lowStockItems}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Need reordering
                  </p>
                </div>

                <div className="rounded-lg border p-6">
                  <h3 className="text-sm font-medium text-muted-foreground">
                    Out of Stock
                  </h3>
                  <p className="mt-2 text-3xl font-bold text-red-600">
                    {outOfStockItems}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Urgent attention
                  </p>
                </div>
              </div>

              <div className="rounded-lg border">
                <div className="p-6">
                  <h2 className="text-xl font-semibold mb-4">
                    Recent Stock Updates
                  </h2>
                  <div className="space-y-3">
                    {recentProducts.length === 0 ? (
                      <p className="text-muted-foreground text-center py-4">
                        No products found
                      </p>
                    ) : (
                      recentProducts.map((product) => {
                        const status = getStockStatus(
                          product.quantityInStock,
                          product.lowStockThreshold,
                        );
                        return (
                          <div
                            key={product._id}
                            className="flex items-center justify-between py-2 border-b last:border-0"
                          >
                            <div>
                              <p className="font-medium">{product.name}</p>
                              <p className="text-sm text-muted-foreground">
                                Quantity: {product.quantityInStock} | Threshold:{" "}
                                {product.lowStockThreshold}
                              </p>
                            </div>
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-medium ${getStockBadgeClass(
                                status,
                              )}`}
                            >
                              {status}
                            </span>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
