"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  IconArrowLeft,
  IconCash,
  IconCalendar,
  IconReceipt,
} from "@tabler/icons-react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

import { useGetOrderById } from "@/app/api/orders/use-get-by-id";
import { useRecordPayment } from "@/app/api/customers/use-record-payment";
import { GeneratePDF } from "@/components/admin/orders/generate-pdf";
import { StatusBadge } from "@/components/common/status-badge";
import { formatDate } from "@/lib/utils";
import { DEFAULT_INVOICE_WARRANTY_NOTE } from "@/components/admin/orders/constants";
import {
  PaymentFormV2,
  type PaymentFormValues,
} from "@/components/admin/customers-v2/payment-form-v2";

import { OrderCustomerCard } from "./order-customer-card";
import { OrderItemsTable } from "./order-items-table";
import { OrderSummaryCard } from "./order-summary-card";

interface OrderDetailV2Props {
  orderId: string;
}

export function OrderDetailV2({ orderId }: OrderDetailV2Props) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = React.useState(false);
  const [customNote, setCustomNote] = React.useState(
    DEFAULT_INVOICE_WARRANTY_NOTE,
  );

  const { data: order, isLoading, isError } = useGetOrderById(orderId);
  const recordPayment = useRecordPayment();

  const handleRecordPayment = (data: PaymentFormValues) => {
    if (!order) return;
    recordPayment.mutate(
      {
        customerId: order.customerId._id,
        orderId,
        amount: data.amount,
        paymentMethod: data.paymentMethod,
        note: data.note,
      },
      {
        onSuccess: () => {
          toast.success("Payment recorded");
          setIsPaymentDialogOpen(false);
          queryClient.invalidateQueries({ queryKey: ["order", orderId] });
        },
        onError: (err) => {
          toast.error(`Failed to record payment: ${err.message}`);
        },
      },
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Spinner className="h-6 w-6" />
      </div>
    );
  }

  if (isError || !order) {
    return (
      <div className="mx-auto max-w-md py-20 text-center">
        <p className="text-sm text-destructive">Failed to load order details.</p>
      </div>
    );
  }

  const orderNumber = order.invoiceNumber
    ? order.invoiceNumber
    : `#${order._id.slice(-6).toUpperCase()}`;

  return (
    <div className="mx-auto flex w-full max-w-[1200px] flex-col gap-6 px-4 pb-10 pt-6 sm:px-6">
      {/* Back link */}
      <Link
        href="/admin/v2/orders"
        className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors w-fit"
        onClick={(e) => {
          e.preventDefault();
          router.push("/admin/v2/orders");
        }}
      >
        <IconArrowLeft className="h-3.5 w-3.5" />
        All orders
      </Link>

      {/* Header */}
      <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-4 min-w-0">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
            <IconReceipt className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl font-semibold tracking-tight text-foreground font-mono">
                Order {orderNumber}
              </h1>
              <StatusBadge status={order.status} />
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-1.5 tabular-nums">
                <IconCalendar className="h-3.5 w-3.5" />
                Created {formatDate(order.createdAt)}
              </span>
              {order.paymentMethod && (
                <span className="capitalize">
                  {order.paymentMethod.replace("_", " ")}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <GeneratePDF order={order} customNote={customNote} buttonOnly />
          <Button onClick={() => setIsPaymentDialogOpen(true)}>
            <IconCash className="h-4 w-4 mr-1.5" />
            Record payment
          </Button>
        </div>
      </header>

      <OrderCustomerCard customer={order.customerId} />

      <OrderItemsTable items={order.items} />

      <div className="grid gap-4 lg:grid-cols-2">
        <OrderSummaryCard order={order} />

        {/* Notes & warranty */}
        <section className="rounded-xl border bg-card flex flex-col">
          <header className="border-b px-5 py-4">
            <h2 className="text-base font-semibold tracking-tight text-foreground">
              Invoice warranty
            </h2>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Note printed at the bottom of the downloaded invoice
            </p>
          </header>
          <div className="flex-1 px-5 py-5 flex flex-col gap-3">
            {order.note && (
              <div className="rounded-lg bg-muted/40 px-4 py-3">
                <Label className="text-xs font-medium text-muted-foreground">
                  Order note
                </Label>
                <p className="mt-1 text-sm">{order.note}</p>
              </div>
            )}
            <div className="flex-1">
              <GeneratePDF
                order={order}
                customNote={customNote}
                onNoteChange={setCustomNote}
                textareaOnly
              />
            </div>
          </div>
        </section>
      </div>

      {/* Record payment dialog */}
      <Dialog open={isPaymentDialogOpen} onOpenChange={setIsPaymentDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Record payment</DialogTitle>
            <DialogDescription>
              Record a payment received for order {orderNumber}.
            </DialogDescription>
          </DialogHeader>
          <PaymentFormV2
            onSubmit={handleRecordPayment}
            onCancel={() => setIsPaymentDialogOpen(false)}
            isSubmitting={recordPayment.isPending}
            defaultOrderId={orderId}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
