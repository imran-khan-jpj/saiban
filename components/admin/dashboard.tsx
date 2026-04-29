"use client";

import { SectionCards } from "./components/section-cards";
import { SiteHeader } from "@/components/site-header";
import { useGetAllCustomers } from "@/app/api/customers/use-get-all";
import { useGetAllProducts } from "@/app/api/products/use-get-all";
import { Spinner } from "@/components/ui/spinner";
import Link from "next/link";
import { formatDate } from "@/lib/utils";

export default function Dashboard() {
  const { data: customersData, isLoading: isLoadingCustomers } =
    useGetAllCustomers(1, 5, undefined, "recent");
  const recentCustomers = customersData?.data || [];

  const { data: lowStockData, isLoading: isLoadingLowStock } =
    useGetAllProducts(1, 5, undefined, "low_stock");
  const lowStockProducts = lowStockData?.data || [];

  const { data: outOfStockData, isLoading: isLoadingOutOfStock } =
    useGetAllProducts(1, 5, undefined, "out_of_stock");
  const outOfStockProducts = outOfStockData?.data || [];

  return (
    <div>
      <SiteHeader />
      <div className="flex flex-1 flex-col">
        <div className="@container/main flex flex-1 flex-col gap-2">
          <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
            <SectionCards />

            {/* Recent Customers, Low Stock Products, and Out of Stock Products */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {/* Recent Customers */}
              <div className="rounded-lg border">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold">Recent Customers</h2>
                    <Link
                      href="/admin/customers"
                      className="text-sm text-primary hover:underline"
                    >
                      View All
                    </Link>
                  </div>
                  <div className="space-y-3">
                    {isLoadingCustomers ? (
                      <div className="flex justify-center py-4">
                        <Spinner className="h-6 w-6" />
                      </div>
                    ) : recentCustomers.length === 0 ? (
                      <p className="text-muted-foreground text-center py-4">
                        No customers found
                      </p>
                    ) : (
                      recentCustomers.map((customer) => (
                        <div
                          key={customer._id}
                          className="flex items-center justify-between py-2 border-b last:border-0"
                        >
                          <div className="flex-1 min-w-0">
                            <p className="font-medium truncate">
                              {customer.firstName} {customer.lastName}
                            </p>
                            <p className="text-sm text-muted-foreground truncate">
                              {customer.email}
                            </p>
                          </div>
                          <div className="text-right ml-2">
                            <p className="text-xs text-muted-foreground">
                              {formatDate(customer.createdAt)}
                            </p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>

              {/* Low Stock Products */}
              <div className="rounded-lg border">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold">
                      Low Stock Products
                    </h2>
                    <Link
                      href="/admin/products"
                      className="text-sm text-primary hover:underline"
                    >
                      View All
                    </Link>
                  </div>
                  <div className="space-y-3">
                    {isLoadingLowStock ? (
                      <div className="flex justify-center py-4">
                        <Spinner className="h-6 w-6" />
                      </div>
                    ) : lowStockProducts.length === 0 ? (
                      <p className="text-muted-foreground text-center py-4">
                        No low stock products
                      </p>
                    ) : (
                      lowStockProducts.map((product) => (
                        <div
                          key={product._id}
                          className="flex items-center justify-between py-2 border-b last:border-0"
                        >
                          <div className="flex-1 min-w-0">
                            <p className="font-medium truncate">
                              {product.name}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              Stock: {product.quantityInStock} | Threshold:{" "}
                              {product.lowStockThreshold}
                            </p>
                          </div>
                          <span className="ml-2 px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200">
                            Low Stock
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>

              {/* Out of Stock Products */}
              <div className="rounded-lg border">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold">
                      Out of Stock Products
                    </h2>
                    <Link
                      href="/admin/products"
                      className="text-sm text-primary hover:underline"
                    >
                      View All
                    </Link>
                  </div>
                  <div className="space-y-3">
                    {isLoadingOutOfStock ? (
                      <div className="flex justify-center py-4">
                        <Spinner className="h-6 w-6" />
                      </div>
                    ) : outOfStockProducts.length === 0 ? (
                      <p className="text-muted-foreground text-center py-4">
                        No out of stock products
                      </p>
                    ) : (
                      outOfStockProducts.map((product) => (
                        <div
                          key={product._id}
                          className="flex items-center justify-between py-2 border-b last:border-0"
                        >
                          <div className="flex-1 min-w-0">
                            <p className="font-medium truncate">
                              {product.name}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              Stock: {product.quantityInStock} | Threshold:{" "}
                              {product.lowStockThreshold}
                            </p>
                          </div>
                          <span className="ml-2 px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                            Out of Stock
                          </span>
                        </div>
                      ))
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
