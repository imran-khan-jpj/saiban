"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Spinner } from "@/components/ui/spinner";
import { Label } from "@/components/ui/label";
import { StatusBadge } from "@/components/common/status-badge";
import { formatDate, formatCurrency } from "@/lib/utils";
import type { Order } from "@/app/api/orders/use-get-all";

interface OrderViewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  order: Order | undefined;
  isLoading: boolean;
  isError: boolean;
}

export function OrderViewDialog({
  open,
  onOpenChange,
  order,
  isLoading,
  isError,
}: OrderViewDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Order Details</DialogTitle>
          <DialogDescription>
            View detailed information about this order
          </DialogDescription>
        </DialogHeader>
        {isLoading && (
          <div className="flex items-center justify-center py-8">
            <Spinner className="h-8 w-8" />
          </div>
        )}
        {isError && (
          <div className="rounded-lg border border-destructive p-4">
            <p className="text-destructive">
              Error loading order details. Please try again.
            </p>
          </div>
        )}
        {order && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label className="text-muted-foreground">Order ID</Label>
                <p className="font-mono text-sm">{order._id}</p>
              </div>
              <div className="space-y-1">
                <Label className="text-muted-foreground">Status</Label>
                <StatusBadge status={order.status} />
              </div>
            </div>

            <div className="space-y-1">
              <Label className="text-muted-foreground">Customer</Label>
              <div className="p-3 bg-muted rounded-lg">
                <p className="font-medium">
                  {order.customerId.firstName} {order.customerId.lastName}
                </p>
                <p className="text-sm text-muted-foreground">
                  {order.customerId.email}
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-muted-foreground">Order Items</Label>
              <div className="border rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead className="bg-muted">
                    <tr>
                      <th className="text-left p-3 text-sm font-medium">
                        Product
                      </th>
                      <th className="text-right p-3 text-sm font-medium">
                        Quantity
                      </th>
                      <th className="text-right p-3 text-sm font-medium">
                        Unit Price
                      </th>
                      <th className="text-right p-3 text-sm font-medium">
                        Discount
                      </th>
                      <th className="text-right p-3 text-sm font-medium">
                        Line Total
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {order.items.map((item, index) => (
                      <tr key={index} className="border-t">
                        <td className="p-3">{item.productId.name}</td>
                        <td className="p-3 text-right">{item.quantity}</td>
                        <td className="p-3 text-right">
                          {formatCurrency(item.unitPrice)}
                        </td>
                        <td className="p-3 text-right">
                          {item.discountPercentage}%
                        </td>
                        <td className="p-3 text-right font-medium">
                          {formatCurrency(item.lineTotal)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="space-y-2 p-4 bg-muted rounded-lg">
              <div className="flex items-center justify-between">
                <Label className="text-sm">Subtotal</Label>
                <p className="text-sm font-medium">
                  {formatCurrency(order.subtotal)}
                </p>
              </div>
              <div className="flex items-center justify-between">
                <Label className="text-sm">Discount</Label>
                <p className="text-sm font-medium">
                  {formatCurrency(order.discountTotal)}
                </p>
              </div>
              <div className="flex items-center justify-between">
                <Label className="text-sm">GST</Label>
                <p className="text-sm font-medium">
                  {formatCurrency(order.gstTotal)}
                </p>
              </div>
              <div className="flex items-center justify-between pt-2 border-t">
                <Label className="text-lg font-semibold">Grand Total</Label>
                <p className="text-lg font-bold">
                  {formatCurrency(order.grandTotal)}
                </p>
              </div>
            </div>

            {order.note && (
              <div className="space-y-1">
                <Label className="text-muted-foreground">Note</Label>
                <p className="text-sm p-3 bg-muted rounded-lg">{order.note}</p>
              </div>
            )}

            <div className="space-y-1">
              <Label className="text-muted-foreground">Payment Method</Label>
              <p className="text-sm capitalize">
                {order.paymentMethod.replace("_", " ")}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label className="text-muted-foreground">Date</Label>
                <p className="text-sm">{formatDate(order.createdAt)}</p>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
