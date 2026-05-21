"use client";

import * as React from "react";
import { DataTable } from "@/components/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  IconPlus,
  IconCheck,
  IconX as IconCancel,
  IconFilter,
  IconX,
  IconSearch,
} from "@tabler/icons-react";
import Link from "next/link";
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

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { OrderForm } from "./order-form";
import { OrderViewDialog } from "./order-view-dialog";
import { PaymentForm } from "../customers/payment-form";
import { useGetAllOrders, Order } from "@/app/api/orders/use-get-all";
import { useGetOrderById } from "@/app/api/orders/use-get-by-id";
import { useCreateOrder } from "@/app/api/orders/use-create";
import { useConfirmOrder } from "@/app/api/orders/use-confirm";
import { useCancelOrder } from "@/app/api/orders/use-cancel";
import { useRecordPayment } from "@/app/api/customers/use-record-payment";
import { Spinner } from "@/components/ui/spinner";
import { formatDate, formatCurrency } from "@/lib/utils";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { StatusBadge } from "@/components/common/status-badge";

// Re-export Order type
export type { Order };

export function Orders() {
  const queryClient = useQueryClient();
  const [searchInput, setSearchInput] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = React.useState(false);
  const [viewingOrderId, setViewingOrderId] = React.useState<string | null>(
    null,
  );
  const [confirmingOrderId, setConfirmingOrderId] = React.useState<
    string | null
  >(null);
  const [cancellingOrderId, setCancellingOrderId] = React.useState<
    string | null
  >(null);
  const [paymentOrderId, setPaymentOrderId] = React.useState<string | null>(
    null,
  );
  const [paymentCustomerId, setPaymentCustomerId] = React.useState<
    string | null
  >(null);
  const [pagination, setPagination] = React.useState({
    pageIndex: 0,
    pageSize: 10,
  });
  const debouncedSearch = useDebouncedValue(searchInput, 500);

  React.useEffect(() => {
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
  }, [debouncedSearch]);

  // Reset to first page when status filter changes
  React.useEffect(() => {
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
  }, [statusFilter]);

  // Fetch orders from API with pagination
  const { data, isLoading, isError, error } = useGetAllOrders(
    pagination.pageIndex + 1,
    pagination.pageSize,
    debouncedSearch || undefined,
    statusFilter || undefined,
    undefined,
  );

  // Mutations
  const createOrder = useCreateOrder();
  const confirmOrder = useConfirmOrder();
  const cancelOrder = useCancelOrder();
  const recordPayment = useRecordPayment();

  // Fetch single order for viewing
  const {
    data: viewingOrderData,
    isLoading: isLoadingOrder,
    isError: isOrderError,
  } = useGetOrderById(viewingOrderId);

  // Transform data for DataTable (add id field)
  const orders = React.useMemo(() => {
    return (data?.data || []).map((order) => ({
      ...order,
      id: order._id,
    }));
  }, [data]);

  const handleConfirm = React.useCallback((orderId: string) => {
    setConfirmingOrderId(orderId);
  }, []);

  const handleCancel = React.useCallback((orderId: string) => {
    setCancellingOrderId(orderId);
  }, []);

  const handleRecordPaymentClick = React.useCallback(
    (orderId: string, customerId: string) => {
      setPaymentOrderId(orderId);
      setPaymentCustomerId(customerId);
    },
    [],
  );

  const columns = React.useMemo<ColumnDef<Order & { id: string }>[]>(() => [
    {
      accessorKey: "customerId",
      header: "Customer",
      cell: ({ row }) => (
        <Link
          href={`/admin/customers/${row.original.customerId._id}`}
          className="text-blue-600 underline hover:text-blue-700 hover:underline"
        >
          <div className="font-medium">
            {row.original.customerId.firstName}{" "}
            {row.original.customerId.lastName}
          </div>
        </Link>
      ),
    },
    {
      accessorKey: "items",
      header: "Items",
      cell: ({ row }) => (
        <div className="text-muted-foreground">
          {row.original.items.length} item(s)
        </div>
      ),
    },
    {
      accessorKey: "grandTotal",
      header: "Total Amount",
      cell: ({ row }) => (
        <div className="font-medium">
          {formatCurrency(row.original.grandTotal)}
        </div>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const isPending = row.original.status === "pending";
        return (
          <div className="flex items-center gap-2">
            <StatusBadge status={row.original.status} />
            {isPending && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 bg-green-100 text-green-600 hover:bg-green-200"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleConfirm(row.original._id);
                  }}
                  title="Confirm order"
                >
                  <IconCheck className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 bg-red-100 text-red-600 hover:bg-red-200"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCancel(row.original._id);
                  }}
                  title="Cancel order"
                >
                  <IconCancel className="h-4 w-4" />
                </Button>
              </>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "createdAt",
      header: "Date",
      cell: ({ row }) => (
        <div className="text-muted-foreground">
          {formatDate(row.original.createdAt)}
        </div>
      ),
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => (
        <div className="flex justify-end gap-1">
          <Button
            size="sm"
            className="cursor-pointer"
            onClick={(e) => {
              e.stopPropagation();
              handleRecordPaymentClick(
                row.original._id,
                row.original.customerId._id,
              );
            }}
          >
            Record Payment
          </Button>
          <Link href={`/admin/orders/${row.original._id}`}>
            <Button size="sm" variant="outline" className="cursor-pointer">
              Details
            </Button>
          </Link>
        </div>
      ),
    },
  ], [handleConfirm, handleCancel, handleRecordPaymentClick]);

  const handleAddOrder = (data: {
    customerId: string;
    items: Array<{
      productId: string;
      quantity: number;
      discountPercentage: number;
    }>;
    note: string;
  }) => {
    createOrder.mutate(data, {
      onSuccess: () => {
        toast.success("Order created successfully");
        setIsAddDialogOpen(false);
      },
      onError: (error) => {
        toast.error(`Failed to create order: ${error.message}`);
      },
    });
  };

  const handleConfirmOrder = () => {
    if (!confirmingOrderId) return;

    confirmOrder.mutate(confirmingOrderId, {
      onSuccess: () => {
        toast.success("Order confirmed successfully");
        setConfirmingOrderId(null);
      },
      onError: (error) => {
        toast.error(`Failed to confirm order: ${error.message}`);
        setConfirmingOrderId(null);
      },
    });
  };

  const handleCancelOrder = () => {
    if (!cancellingOrderId) return;

    cancelOrder.mutate(cancellingOrderId, {
      onSuccess: () => {
        toast.success("Order cancelled successfully");
        setCancellingOrderId(null);
      },
      onError: (error) => {
        toast.error(`Failed to cancel order: ${error.message}`);
        setCancellingOrderId(null);
      },
    });
  };

  const handleDialogClose = () => {
    setIsAddDialogOpen(false);
  };

  const handleRecordPayment = (data: {
    orderId?: string;
    amount: number;
    paymentMethod: string;
    note: string;
  }) => {
    if (!paymentCustomerId || !paymentOrderId) return;

    recordPayment.mutate(
      {
        customerId: paymentCustomerId,
        orderId: paymentOrderId,
        amount: data.amount,
        paymentMethod: data.paymentMethod,
        note: data.note,
      },
      {
        onSuccess: () => {
          toast.success("Payment recorded successfully");
          setPaymentOrderId(null);
          setPaymentCustomerId(null);
          queryClient.invalidateQueries({ queryKey: ["orders"] });
        },
        onError: (error) => {
          toast.error(`Failed to record payment: ${error.message}`);
        },
      },
    );
  };

  return (
    <div className="flex flex-col h-full space-y-4 min-h-0">
      <div className="shrink-0 flex items-center justify-between mt-2">
        <div className="flex items-center gap-2 flex-1">
          <div className="relative max-w-sm">
            <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search orders..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-45">
                <IconFilter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="confirmed">Confirmed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
              </SelectContent>
            </Select>
            {statusFilter && (
              <Button
                variant="outline"
                size="icon"
                onClick={() => setStatusFilter("")}
                title="Clear filter"
              >
                <IconX className="h-4 w-4" />
              </Button>
            )}
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <IconPlus className="mr-2 h-4 w-4" />
                Create Order
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create New Order</DialogTitle>
                <DialogDescription>
                  Fill in the details to create a new order.
                </DialogDescription>
              </DialogHeader>
              <OrderForm
                onSubmit={handleAddOrder}
                onCancel={handleDialogClose}
                isSubmitting={createOrder.isPending}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="flex-1 min-h-0">
        {isError ? (
          <div className="rounded-lg border border-destructive p-4">
            <p className="text-destructive">
              Error loading orders: {error?.message || "Unknown error"}
            </p>
          </div>
        ) : isLoading ? (
          <div className="flex items-center justify-center py-10">
            <Spinner className="h-8 w-8" />
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
          />
        )}
      </div>

      <OrderViewDialog
        open={!!viewingOrderId}
        onOpenChange={(open) => !open && setViewingOrderId(null)}
        order={viewingOrderData}
        isLoading={isLoadingOrder}
        isError={isOrderError}
      />

      {/* Confirm Order Dialog */}
      <AlertDialog
        open={!!confirmingOrderId}
        onOpenChange={(open) => !open && setConfirmingOrderId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Order?</AlertDialogTitle>
            <AlertDialogDescription>
              This will mark the order as confirmed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setConfirmingOrderId(null)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmOrder}
              className="cursor-pointer"
            >
              {confirmOrder.isPending ? "Confirming..." : "Confirm"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Cancel Order Dialog */}
      <AlertDialog
        open={!!cancellingOrderId}
        onOpenChange={(open) => !open && setCancellingOrderId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel Order?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently cancel the
              order.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setCancellingOrderId(null)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleCancelOrder}
              className="cursor-pointer bg-destructive text-white hover:bg-destructive/70"
            >
              {cancelOrder.isPending ? "Cancelling..." : "Cancel Order"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Record Payment Dialog */}
      <Dialog
        open={!!paymentOrderId}
        onOpenChange={(open) => {
          if (!open) {
            setPaymentOrderId(null);
            setPaymentCustomerId(null);
          }
        }}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Record Payment</DialogTitle>
            <DialogDescription>
              Record a payment for this order
            </DialogDescription>
          </DialogHeader>
          <PaymentForm
            onSubmit={handleRecordPayment}
            onCancel={() => {
              setPaymentOrderId(null);
              setPaymentCustomerId(null);
            }}
            isSubmitting={recordPayment.isPending}
            defaultOrderId={paymentOrderId || undefined}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
