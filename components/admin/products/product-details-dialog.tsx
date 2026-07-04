"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Spinner } from "@/components/ui/spinner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { IconPencil } from "@tabler/icons-react";
import type { Product } from "@/app/api/products/use-get-all";
import {
  formatCurrency,
  formatDate,
  formatPercent,
  getMarginPercent,
  getProfit,
  parseCurrency,
} from "@/lib/utils";
import { StockIndicator } from "./stock-indicator";

interface ProductDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: Product | undefined;
  isLoading: boolean;
  isError: boolean;
  onEdit?: () => void;
}

export function ProductDetailsDialog({
  open,
  onOpenChange,
  product,
  isLoading,
  isError,
  onEdit,
}: ProductDetailsDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Product details</DialogTitle>
          <DialogDescription>
            View detailed information about this product
          </DialogDescription>
        </DialogHeader>

        {isLoading && (
          <div className="flex items-center justify-center py-10">
            <Spinner className="h-6 w-6" />
          </div>
        )}

        {isError && (
          <div className="rounded-lg border border-destructive/40 bg-destructive/5 p-4">
            <p className="text-sm text-destructive">
              Error loading product details. Please try again.
            </p>
          </div>
        )}

        {product && (
          <div className="space-y-6">
            {/* Identity */}
            <div>
              <h3 className="text-xl font-semibold tracking-tight">
                {product.name}
              </h3>
              <div className="mt-1.5 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                <span className="tabular-nums">
                  {product.size} {product.packType}
                </span>
                <span aria-hidden>·</span>
                <Badge
                  variant="outline"
                  className="capitalize font-normal text-xs"
                >
                  {product.formulation}
                </Badge>
              </div>
            </div>

            {/* Price + stock callout */}
            <div className="grid grid-cols-2 gap-4 rounded-xl border bg-muted/40 p-4 sm:grid-cols-3">
              <div>
                <p className="text-xs font-medium text-muted-foreground">
                  Purchase price
                </p>
                <p className="mt-1 text-2xl font-semibold tabular-nums tracking-tight text-muted-foreground">
                  {parseCurrency(product.purchasePrice) > 0
                    ? formatCurrency(product.purchasePrice)
                    : "—"}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground">
                  Sale price
                </p>
                <p className="mt-1 text-2xl font-semibold tabular-nums tracking-tight">
                  {formatCurrency(product.unitPrice)}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground">
                  Stock
                </p>
                <div className="mt-1.5">
                  <StockIndicator
                    quantity={product.quantityInStock}
                    threshold={product.lowStockThreshold}
                  />
                </div>
              </div>
            </div>

            {/* Profit callout */}
            {parseCurrency(product.purchasePrice) > 0 && (
              <div className="flex items-center justify-between rounded-xl border bg-card px-4 py-3">
                <p className="text-xs font-medium text-muted-foreground">
                  Profit per unit
                </p>
                {(() => {
                  const profit = getProfit(
                    product.unitPrice,
                    product.purchasePrice,
                  );
                  const margin = getMarginPercent(
                    product.unitPrice,
                    product.purchasePrice,
                  );
                  return (
                    <p
                      className={`text-sm font-semibold tabular-nums ${
                        profit < 0
                          ? "text-red-600 dark:text-red-500"
                          : "text-emerald-600 dark:text-emerald-500"
                      }`}
                    >
                      {formatCurrency(profit)} · {formatPercent(margin)} margin
                    </p>
                  );
                })()}
              </div>
            )}

            {/* Descriptions */}
            {(product.shortDescription || product.descriptionUrdu) && (
              <div className="grid grid-cols-2 gap-4">
                {product.shortDescription && (
                  <div>
                    <p className="text-xs font-medium text-muted-foreground">
                      Description
                    </p>
                    <p className="mt-1 text-sm leading-relaxed">
                      {product.shortDescription}
                    </p>
                  </div>
                )}
                {product.descriptionUrdu && (
                  <div>
                    <p className="text-xs font-medium text-muted-foreground">
                      Description (Urdu)
                    </p>
                    <p className="mt-1 text-sm leading-relaxed" dir="rtl">
                      {product.descriptionUrdu}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Tracking grid */}
            <div className="grid grid-cols-2 gap-x-4 gap-y-3 border-t pt-4 sm:grid-cols-4">
              <DetailItem
                label="Threshold"
                value={
                  <span className="tabular-nums">
                    {product.lowStockThreshold}
                  </span>
                }
              />
              <DetailItem
                label="Batch"
                value={product.batchNo || "—"}
              />
              <DetailItem
                label="Manufactured"
                value={product.mfg || "—"}
              />
              <DetailItem
                label="Expires"
                value={product.expiry || "—"}
              />
              <DetailItem
                label="Added"
                value={
                  <span className="tabular-nums">
                    {formatDate(product.createdAt)}
                  </span>
                }
              />
              <DetailItem
                label="Last updated"
                value={
                  <span className="tabular-nums">
                    {formatDate(product.updatedAt)}
                  </span>
                }
              />
            </div>
          </div>
        )}

        {product && onEdit && (
          <DialogFooter className="border-t pt-4">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Close
            </Button>
            <Button onClick={onEdit}>
              <IconPencil className="h-4 w-4 mr-2" />
              Edit product
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}

function DetailItem({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div>
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <p className="mt-0.5 text-sm font-medium text-foreground">{value}</p>
    </div>
  );
}
