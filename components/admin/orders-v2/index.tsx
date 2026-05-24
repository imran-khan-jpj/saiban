"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { IconPlus, IconCheck, IconX as IconCancel } from "@tabler/icons-react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { DataTable } from "@/components/data-table";
import { useGetAllOrders, Order } from "@/app/api/orders/use-get-all";
import { useCreateOrder } from "@/app/api/orders/use-create";
import { useConfirmOrder } from "@/app/api/orders/use-confirm";
import { useCancelOrder } from "@/app/api/orders/use-cancel";
import { useRecordPayment } from "@/app/api/customers/use-record-payment";
import { OrderForm } from "@/components/admin/orders/order-form";
import { CustomerAvatar } from "@/components/admin/customers-v2/customer-avatar";
import {
  PaymentFormV2,
  type PaymentFormOutput,
} from "@/components/admin/customers-v2/payment-form-v2";
import { StatusBadge } from "@/components/common/status-badge";
import { formatCurrency, formatDate } from "@/lib/utils";
import { useDebouncedValue } from "@/hooks/use-debounced-value";

import { OrdersStats } from "./orders-stats";
import { OrdersToolbar } from "./orders-toolbar";
import { OrderRowActions } from "./order-row-actions";

interface CreateOrderPayload {
  customerId: string;
  items: Array<{
    productId: string;
    quantity: number;
    discountPercentage: number;
  }>;
  note: string;
}

export function OrdersV2() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [searchInput, setSearchInput] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState("");
  const [pagination, setPagination] = React.useState({
    pageIndex: 0,
    pageSize: 10,
  });

  const debouncedSearch = useDebouncedValue(searchInput, 400);

  React.useEffect(() => {
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
  }, [debouncedSearch, statusFilter]);

  const [isAddDialogOpen, setIsAddDialogOpen] = React.useState(false);
  const [confirmingOrderId, setConfirmingOrderId] = React.useState<
    string | null
  >(null);
  const [cancellingOrderId, setCancellingOrderId] = React.useState<
    string | null
  >(null);
  const [paymentTarget, setPaymentTarget] = React.useState<{
    orderId: string;
    customerId: string;
  } | null>(null);

  const { data, isLoading, isFetching, isError, error } = useGetAllOrders(
    pagination.pageIndex + 1,
    pagination.pageSize,
    debouncedSearch || undefined,
    statusFilter || undefined,
  );

  const createOrder = useCreateOrder();
  const confirmOrder = useConfirmOrder();
  const cancelOrder = useCancelOrder();
  const recordPayment = useRecordPayment();

  const orders = React.useMemo(
    () =>
      (data?.data || []).map((o) => ({
        ...o,
        id: o._id,
      })),
    [data],
  );

  const handleView = React.useCallback(
    (orderId: string) => {
      router.push(`/admin/v2/orders/${orderId}`);
    },
    [router],
  );

  const handleConfirm = React.useCallback((orderId: string) => {
    setConfirmingOrderId(orderId);
  }, []);

  const handleCancel = React.useCallback((orderId: string) => {
    setCancellingOrderId(orderId);
  }, []);

  const handleRecordPaymentClick = React.useCallback(
    (orderId: string, customerId: string) => {
      setPaymentTarget({ orderId, customerId });
    },
    [],
  );

  const columns = React.useMemo<ColumnDef<Order & { id: string }>[]>(
    () => [
      {
        accessorKey: "customerId",
        header: "Customer",
        size: 360,
        cell: ({ row }) => {
          const c = row.original.customerId;
          const fullName = `${c.firstName} ${c.lastName ?? ""}`.trim();
          return (
            <div className="flex items-center gap-3 min-w-0 overflow-hidden">
              <CustomerAvatar
                firstName={c.firstName}
                lastName={c.lastName}
                size="sm"
              />
              <div className="min-w-0 flex-1">
                <TooltipProvider delayDuration={300}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        onClick={() =>
                          router.push(`/admin/v2/customers/${c._id}`)
                        }
                        className="block w-full text-left truncate text-sm font-semibold text-foreground hover:underline underline-offset-4"
                      >
                        {fullName}
                      </button>
                    </TooltipTrigger>
                    <TooltipContent className="max-w-[320px]">
                      {fullName}
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                {c.email && (
                  <p className="mt-0.5 truncate text-xs text-muted-foreground">
                    {c.email}
                  </p>
                )}
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: "items",
        header: () => <div className="text-center">Items</div>,
        size: 70,
        cell: ({ row }) => (
          <div className="text-center text-sm tabular-nums text-muted-foreground">
            {row.original.items.length}
          </div>
        ),
      },
      {
        accessorKey: "grandTotal",
        header: () => <div className="text-right pr-6">Total</div>,
        size: 160,
        cell: ({ row }) => (
          <div className="text-right pr-6 text-sm font-semibold tabular-nums tracking-tight">
            {formatCurrency(row.original.grandTotal)}
          </div>
        ),
      },
      {
        accessorKey: "status",
        header: "Status",
        size: 200,
        cell: ({ row }) => {
          const isPending = row.original.status === "pending";
          return (
            <div className="flex items-center gap-2">
              <StatusBadge status={row.original.status} />
              {isPending && (
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 bg-emerald-100 text-emerald-700 hover:bg-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleConfirm(row.original._id);
                    }}
                    title="Confirm order"
                  >
                    <IconCheck className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-950/40 dark:text-red-300"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCancel(row.original._id);
                    }}
                    title="Cancel order"
                  >
                    <IconCancel className="h-3.5 w-3.5" />
                  </Button>
                </div>
              )}
            </div>
          );
        },
      },
      {
        accessorKey: "createdAt",
        header: "Date",
        size: 130,
        cell: ({ row }) => (
          <div className="text-xs text-muted-foreground tabular-nums">
            {formatDate(row.original.createdAt)}
          </div>
        ),
      },
      {
        id: "actions",
        header: () => <div className="text-right">Actions</div>,
        size: 80,
        cell: ({ row }) => (
          <div className="flex justify-end">
            <OrderRowActions
              status={row.original.status}
              onView={() => handleView(row.original._id)}
              onRecordPayment={() =>
                handleRecordPaymentClick(
                  row.original._id,
                  row.original.customerId._id,
                )
              }
              onConfirm={() => handleConfirm(row.original._id)}
              onCancel={() => handleCancel(row.original._id)}
            />
          </div>
        ),
      },
    ],
    [router, handleView, handleConfirm, handleCancel, handleRecordPaymentClick],
  );

  const handleAddOrder = (payload: CreateOrderPayload) => {
    createOrder.mutate(payload, {
      onSuccess: () => {
        toast.success("Order created");
        setIsAddDialogOpen(false);
      },
      onError: (err) => {
        toast.error(`Failed to create order: ${err.message}`);
      },
    });
  };

  const handleConfirmOrder = () => {
    if (!confirmingOrderId) return;
    confirmOrder.mutate(confirmingOrderId, {
      onSuccess: () => {
        toast.success("Order confirmed");
        setConfirmingOrderId(null);
      },
      onError: (err) => {
        toast.error(`Failed to confirm: ${err.message}`);
        setConfirmingOrderId(null);
      },
    });
  };

  const handleCancelOrder = () => {
    if (!cancellingOrderId) return;
    cancelOrder.mutate(cancellingOrderId, {
      onSuccess: () => {
        toast.success("Order cancelled");
        setCancellingOrderId(null);
      },
      onError: (err) => {
        toast.error(`Failed to cancel: ${err.message}`);
        setCancellingOrderId(null);
      },
    });
  };

  const handleRecordPayment = (data: PaymentFormOutput) => {
    if (!paymentTarget) return;
    recordPayment.mutate(
      {
        customerId: paymentTarget.customerId,
        orderId: paymentTarget.orderId,
        amount: data.amount,
        paymentMethod: data.paymentMethod,
        note: data.note,
      },
      {
        onSuccess: () => {
          toast.success("Payment recorded");
          setPaymentTarget(null);
          queryClient.invalidateQueries({ queryKey: ["orders"] });
        },
        onError: (err) => {
          toast.error(`Failed to record payment: ${err.message}`);
        },
      },
    );
  };

  const totalCount = data?.pagination.total ?? 0;
  const showingFrom =
    orders.length === 0 ? 0 : pagination.pageIndex * pagination.pageSize + 1;
  const showingTo = pagination.pageIndex * pagination.pageSize + orders.length;

  return (
    <div className="mx-auto flex w-full max-w-[1400px] flex-col gap-6 px-4 pb-10 pt-6 sm:px-6">
      {/* Header */}
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-medium text-muted-foreground">Operations</p>
          <h1 className="mt-1.5 text-3xl font-semibold tracking-tight text-foreground">
            Orders
          </h1>
          <p className="mt-1.5 text-sm text-muted-foreground tabular-nums">
            {totalCount} {totalCount === 1 ? "order" : "orders"} placed across
            all customers.
          </p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <IconPlus className="mr-2 h-4 w-4" />
              Create order
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create new order</DialogTitle>
              <DialogDescription>
                Pick a customer, then add the items they&apos;re buying.
              </DialogDescription>
            </DialogHeader>
            <OrderForm
              onSubmit={handleAddOrder}
              onCancel={() => setIsAddDialogOpen(false)}
              isSubmitting={createOrder.isPending}
            />
          </DialogContent>
        </Dialog>
      </header>

      <OrdersStats />

      <OrdersToolbar
        searchInput={searchInput}
        onSearchChange={setSearchInput}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
      />

      {/* Table card */}
      <div className="flex flex-1 min-h-0 flex-col rounded-xl border bg-card">
        <div className="flex items-center justify-between border-b px-5 py-3">
          <p className="text-xs text-muted-foreground tabular-nums">
            {totalCount === 0
              ? "No orders"
              : `Showing ${showingFrom}–${showingTo} of ${totalCount}`}
          </p>
        </div>

        <div className="flex-1 min-h-0">
          {isError ? (
            <div className="flex h-64 items-center justify-center px-5">
              <p className="text-sm text-destructive">
                Error loading orders: {error?.message || "Unknown error"}
              </p>
            </div>
          ) : isLoading ? (
            <div className="flex h-64 items-center justify-center">
              <Spinner className="h-6 w-6" />
            </div>
          ) : orders.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 py-16 text-center">
              <p className="text-sm font-medium text-foreground">
                No orders match your filters
              </p>
              <p className="text-xs text-muted-foreground">
                Try clearing the search or status filter.
              </p>
            </div>
          ) : (
            <DataTable
              data={orders}
              columns={columns}
              enableRowSelection={false}
              manualPagination={true}
              pageCount={data?.pagination.pages}
              pagination={pagination}
              onPaginationChange={setPagination}
              isFetching={isFetching}
            />
          )}
        </div>
      </div>

      {/* Confirm order */}
      <AlertDialog
        open={!!confirmingOrderId}
        onOpenChange={(open) => !open && setConfirmingOrderId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm this order?</AlertDialogTitle>
            <AlertDialogDescription>
              This will mark the order as confirmed and adjust inventory.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmOrder}>
              {confirmOrder.isPending ? "Confirming…" : "Confirm"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Cancel order */}
      <AlertDialog
        open={!!cancellingOrderId}
        onOpenChange={(open) => !open && setCancellingOrderId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel this order?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. The order will be permanently
              cancelled.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep order</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleCancelOrder}
              className="bg-destructive text-white hover:bg-destructive/80"
            >
              {cancelOrder.isPending ? "Cancelling…" : "Cancel order"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Record payment */}
      <Dialog
        open={!!paymentTarget}
        onOpenChange={(open) => !open && setPaymentTarget(null)}
      >
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Record payment</DialogTitle>
            <DialogDescription>
              Record a payment received for this order.
            </DialogDescription>
          </DialogHeader>
          <PaymentFormV2
            onSubmit={handleRecordPayment}
            onCancel={() => setPaymentTarget(null)}
            isSubmitting={recordPayment.isPending}
            defaultOrderId={paymentTarget?.orderId}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
