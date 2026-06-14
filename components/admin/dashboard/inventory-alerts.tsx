"use client";

import * as React from "react";
import Link from "next/link";
import { Spinner } from "@/components/ui/spinner";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { useGetAllProducts } from "@/app/api/products/use-get-all";
import type { Product } from "@/app/api/products/use-get-all";
import { cn } from "@/lib/utils";

interface InventoryRowProps {
  product: Product;
  tone: "warn" | "danger";
}

function InventoryRow({ product, tone }: InventoryRowProps) {
  return (
    <li className="flex items-center justify-between py-3">
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-foreground">
          {product.name}
        </p>
        <p className="mt-0.5 text-xs text-muted-foreground tabular-nums">
          {product.size} {product.packType} · Threshold {product.lowStockThreshold}
        </p>
      </div>
      <span
        className={cn(
          "shrink-0 rounded-full px-2.5 py-1 text-xs font-medium tabular-nums",
          tone === "warn"
            ? "bg-orange-100 text-orange-700 dark:bg-orange-950/40 dark:text-orange-300"
            : "bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-300",
        )}
      >
        {product.quantityInStock} in stock
      </span>
    </li>
  );
}

export function InventoryAlerts() {
  const { data: lowData, isLoading: isLoadingLow } = useGetAllProducts(
    1,
    6,
    undefined,
    "low_stock",
  );
  const { data: outData, isLoading: isLoadingOut } = useGetAllProducts(
    1,
    6,
    undefined,
    "out_of_stock",
  );

  const lowStock = lowData?.data ?? [];
  const outOfStock = outData?.data ?? [];
  const lowTotal = lowData?.pagination.total ?? 0;
  const outTotal = outData?.pagination.total ?? 0;

  return (
    <section className="rounded-xl border bg-card">
      <header className="flex items-baseline justify-between border-b px-5 py-4">
        <div>
          <h2 className="text-base font-semibold tracking-tight text-foreground">
            Inventory alerts
          </h2>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Items that need restocking
          </p>
        </div>
        <Link
          href="/admin/products"
          className="text-xs font-medium text-foreground/70 hover:text-foreground"
        >
          View inventory
        </Link>
      </header>
      <Tabs defaultValue="low" className="px-5 py-3">
        <TabsList className="bg-transparent p-0 h-auto gap-2">
          <TabsTrigger
            value="low"
            className="data-[state=active]:bg-muted data-[state=active]:shadow-none rounded-md px-3 py-1.5 text-sm font-medium"
          >
            Low stock
            <span className="ml-2 rounded-full bg-orange-100 px-1.5 text-[10px] font-semibold tabular-nums text-orange-700 dark:bg-orange-950/40 dark:text-orange-300">
              {lowTotal}
            </span>
          </TabsTrigger>
          <TabsTrigger
            value="out"
            className="data-[state=active]:bg-muted data-[state=active]:shadow-none rounded-md px-3 py-1.5 text-sm font-medium"
          >
            Out of stock
            <span className="ml-2 rounded-full bg-red-100 px-1.5 text-[10px] font-semibold tabular-nums text-red-700 dark:bg-red-950/40 dark:text-red-300">
              {outTotal}
            </span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="low" className="mt-3">
          {isLoadingLow ? (
            <div className="flex h-32 items-center justify-center">
              <Spinner className="h-5 w-5" />
            </div>
          ) : lowStock.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">
              No products are low on stock
            </p>
          ) : (
            <ul className="divide-y">
              {lowStock.map((p) => (
                <InventoryRow key={p._id} product={p} tone="warn" />
              ))}
            </ul>
          )}
        </TabsContent>

        <TabsContent value="out" className="mt-3">
          {isLoadingOut ? (
            <div className="flex h-32 items-center justify-center">
              <Spinner className="h-5 w-5" />
            </div>
          ) : outOfStock.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">
              Nothing is out of stock right now
            </p>
          ) : (
            <ul className="divide-y">
              {outOfStock.map((p) => (
                <InventoryRow key={p._id} product={p} tone="danger" />
              ))}
            </ul>
          )}
        </TabsContent>
      </Tabs>
    </section>
  );
}
