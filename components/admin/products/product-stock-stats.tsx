"use client";

import { useGetAllProducts } from "@/app/api/products/use-get-all";
import { Spinner } from "@/components/ui/spinner";

export function ProductStockStats() {
  const { data: totalData, isLoading: isLoadingTotal } = useGetAllProducts(
    1,
    1,
  );
  const { data: lowStockData, isLoading: isLoadingLowStock } =
    useGetAllProducts(1, 1, undefined, "low_stock");
  const { data: outOfStockData, isLoading: isLoadingOutOfStock } =
    useGetAllProducts(1, 1, undefined, "out_of_stock");

  const totalItems = totalData?.pagination.total ?? 0;
  const lowStockItems = lowStockData?.pagination.total ?? 0;
  const outOfStockItems = outOfStockData?.pagination.total ?? 0;

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 py-4">
      <div className="rounded-lg border p-6">
        <h3 className="text-sm font-medium text-muted-foreground">
          Total Items
        </h3>
        {isLoadingTotal ? (
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
        {isLoadingLowStock ? (
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
        {isLoadingOutOfStock ? (
          <div className="mt-2 h-9 flex items-center">
            <Spinner className="h-5 w-5" />
          </div>
        ) : (
          <>
            <p className="mt-2 text-3xl font-bold text-red-600">
              {outOfStockItems}
            </p>
            <p className="text-sm text-muted-foreground">Urgent attention</p>
          </>
        )}
      </div>
    </div>
  );
}
