"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { IconArrowLeft, IconCopy, IconCash } from "@tabler/icons-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { formatDate } from "@/lib/utils";
import { useGetOrderById } from "@/app/api/orders/use-get-by-id";
import { useRecordPayment } from "@/app/api/customers/use-record-payment";
import { PaymentForm } from "../customers/payment-form";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

interface OrderDetailProps {
  orderId: string;
}

export function OrderDetail({ orderId }: OrderDetailProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = React.useState(false);
  const [copiedOrderId, setCopiedOrderId] = React.useState(false);
  const { data: order, isLoading, isError } = useGetOrderById(orderId);
  const recordPayment = useRecordPayment();

  const handleRecordPayment = (data: {
    orderId?: string;
    amount: number;
    paymentMethod: string;
    reference: string;
    note: string;
  }) => {
    if (!order) return;
    recordPayment.mutate(
      {
        customerId: order.customerId._id,
        orderId: orderId,
        amount: data.amount,
        paymentMethod: data.paymentMethod,
        reference: data.reference,
        note: data.note,
      },
      {
        onSuccess: () => {
          toast.success("Payment recorded successfully");
          setIsPaymentDialogOpen(false);
          queryClient.invalidateQueries({
            queryKey: ["order", orderId],
          });
        },
        onError: (error) => {
          toast.error(`Failed to record payment: ${error.message}`);
        },
      },
    );
  };

  const getStatusBadge = (status: string) => {
    const statusStyles: Record<string, string> = {
      pending: "bg-orange-500 text-white",
      confirmed: "bg-green-600 text-white",
      completed: "bg-green-600 text-white",
      cancelled: "bg-red-600 text-white",
      paid: "bg-green-600 text-white",
    };
    return (
      <Badge
        className={`capitalize ${statusStyles[status] || "bg-gray-500 text-white"}`}
      >
        {status}
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-10">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  if (isError || !order) {
    return (
      <div className="rounded-lg border border-destructive p-4">
        <p className="text-destructive">Error loading order details</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full space-y-4 py-4 overflow-auto">
      {/* Header with back button */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <IconArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold">Order Details</h2>
            <span className="text-muted-foreground">•</span>
            <p className="text-muted-foreground">
              View complete information about this order
            </p>
          </div>
        </div>
        <Button
          size="sm"
          className="bg-black text-white hover:bg-black/90"
          onClick={() => setIsPaymentDialogOpen(true)}
        >
          <IconCash className="h-4 w-4 mr-2" />
          Record Payment
        </Button>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <Label className="text-muted-foreground">Order ID</Label>
            <div className="flex items-center gap-2">
              <p className="font-mono text-sm">{order._id}</p>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className={`h-6 w-6 ${
                        copiedOrderId
                          ? "text-green-600 hover:text-green-700"
                          : ""
                      }`}
                      onClick={() => {
                        navigator.clipboard.writeText(order._id);
                        setCopiedOrderId(true);
                        toast.success("Order ID copied!", {
                          description: order._id,
                        });
                      }}
                    >
                      <IconCopy className="h-3 w-3" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Copy Order ID</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
          <div className="space-y-1">
            <Label className="text-muted-foreground">Status</Label>
            {getStatusBadge(order.status)}
          </div>
        </div>

        <div className="space-y-1">
          <Label className="text-muted-foreground">Customer</Label>
          <div className="p-3 bg-muted rounded-lg">
            <Link
              href={`/admin/customers/${order.customerId._id}`}
              className="font-medium hover:text-primary hover:underline"
            >
              {order.customerId.firstName} {order.customerId.lastName}
            </Link>
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
                  <th className="text-left p-3 text-sm font-medium">Product</th>
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
                    <td className="p-3 text-right">PKR {item.unitPrice}</td>
                    <td className="p-3 text-right">
                      {item.discountPercentage}%
                    </td>
                    <td className="p-3 text-right font-medium">
                      PKR {item.lineTotal}
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
            <p className="text-sm font-medium">PKR {order.subtotal}</p>
          </div>
          <div className="flex items-center justify-between">
            <Label className="text-sm">Discount</Label>
            <p className="text-sm font-medium">PKR {order.discountTotal}</p>
          </div>
          <div className="flex items-center justify-between">
            <Label className="text-sm">GST</Label>
            <p className="text-sm font-medium">PKR {order.gstTotal}</p>
          </div>
          <div className="flex items-center justify-between pt-2 border-t">
            <Label className="text-lg font-semibold">Grand Total</Label>
            <p className="text-lg font-bold">PKR {order.grandTotal}</p>
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

      {/* Record Payment Dialog */}
      <Dialog open={isPaymentDialogOpen} onOpenChange={setIsPaymentDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Record Payment</DialogTitle>
            <DialogDescription>
              Record a payment for this order
            </DialogDescription>
          </DialogHeader>
          <PaymentForm
            onSubmit={handleRecordPayment}
            onCancel={() => setIsPaymentDialogOpen(false)}
            isSubmitting={recordPayment.isPending}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
