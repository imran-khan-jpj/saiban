"use client";

import * as React from "react";
import { DataTable } from "@/components/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  IconPlus,
  IconEye,
  IconCheck,
  IconX as IconCancel,
  IconFilter,
  IconX,
  IconSearch,
  IconCash,
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
import { Badge } from "@/components/ui/badge";
import { useQueryClient } from "@tanstack/react-query";

// Re-export Order type
export type { Order };

interface OrdersProps {
  searchInput: string;
  onSearchInputChange: (value: string) => void;
  statusFilter: string;
  onStatusFilterChange: (value: string) => void;
}

export function Orders({
  searchInput,
  onSearchInputChange,
  statusFilter,
  onStatusFilterChange,
}: OrdersProps) {
  const queryClient = useQueryClient();
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
  const [debouncedSearch, setDebouncedSearch] = React.useState("");

  // Debounce search input
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchInput);
      setPagination((prev) => ({ ...prev, pageIndex: 0 }));
    }, 500);

    return () => clearTimeout(timer);
  }, [searchInput]);

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

  const getStatusBadge = (status: string) => {
    const statusStyles: Record<string, string> = {
      pending: "bg-orange-500 text-white hover:bg-orange-600",
      confirmed: "bg-green-600 text-white hover:bg-green-700",
      completed: "bg-green-600 text-white hover:bg-green-700",
      cancelled: "bg-red-600 text-white hover:bg-red-700",
      paid: "bg-green-600 text-white hover:bg-green-700",
    };
    return (
      <Badge
        className={`capitalize ${statusStyles[status] || "bg-gray-500 text-white"}`}
      >
        {status}
      </Badge>
    );
  };

  // Column definitions
  const columns: ColumnDef<Order & { id: string }>[] = [
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
            {getStatusBadge(row.original.status)}
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
            // variant="outline"
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
  ];

  const handleAddOrder = (data: {
    customerId: string;
    items: Array<{
      productId: string;
      quantity: number;
      discountPercentage: number;
    }>;
    paymentMethod: string;
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

  const handleView = (orderId: string) => {
    setViewingOrderId(orderId);
  };

  const handleConfirm = (orderId: string) => {
    setConfirmingOrderId(orderId);
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

  const handleCancel = (orderId: string) => {
    setCancellingOrderId(orderId);
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

  const handleRecordPaymentClick = (orderId: string, customerId: string) => {
    setPaymentOrderId(orderId);
    setPaymentCustomerId(customerId);
  };

  const handleRecordPayment = (data: {
    orderId?: string;
    amount: number;
    paymentMethod: string;
    reference: string;
    note: string;
  }) => {
    if (!paymentCustomerId || !paymentOrderId) return;

    recordPayment.mutate(
      {
        customerId: paymentCustomerId,
        orderId: paymentOrderId,
        amount: data.amount,
        paymentMethod: data.paymentMethod,
        reference: data.reference,
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-10">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="rounded-lg border border-destructive p-4">
        <p className="text-destructive">
          Error loading orders: {error?.message || "Unknown error"}
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full space-y-4 min-h-0">
      <div className="shrink-0 flex items-center justify-between mt-2">
        <div className="flex items-center gap-2 flex-1">
          <div className="relative max-w-sm">
            <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search orders..."
              value={searchInput}
              onChange={(e) => onSearchInputChange(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2">
            <Select value={statusFilter} onValueChange={onStatusFilterChange}>
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
                onClick={() => onStatusFilterChange("")}
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
        <DataTable
          data={orders}
          columns={columns}
          enableRowSelection={false}
          manualPagination={true}
          pageCount={data?.pagination.pages}
          pagination={pagination}
          onPaginationChange={setPagination}
        />
      </div>

      {/* View Order Dialog */}
      <Dialog
        open={!!viewingOrderId}
        onOpenChange={(open) => !open && setViewingOrderId(null)}
      >
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Order Details</DialogTitle>
            <DialogDescription>
              View detailed information about this order
            </DialogDescription>
          </DialogHeader>
          {isLoadingOrder && (
            <div className="flex items-center justify-center py-8">
              <Spinner className="h-8 w-8" />
            </div>
          )}
          {isOrderError && (
            <div className="rounded-lg border border-destructive p-4">
              <p className="text-destructive">
                Error loading order details. Please try again.
              </p>
            </div>
          )}
          {viewingOrderData && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label className="text-muted-foreground">Order ID</Label>
                  <p className="font-mono text-sm">{viewingOrderData._id}</p>
                </div>
                <div className="space-y-1">
                  <Label className="text-muted-foreground">Status</Label>
                  {getStatusBadge(viewingOrderData.status)}
                </div>
              </div>

              <div className="space-y-1">
                <Label className="text-muted-foreground">Customer</Label>
                <div className="p-3 bg-muted rounded-lg">
                  <p className="font-medium">
                    {viewingOrderData.customerId.firstName}{" "}
                    {viewingOrderData.customerId.lastName}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {viewingOrderData.customerId.email}
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
                      {viewingOrderData.items.map((item, index) => (
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
                    {formatCurrency(viewingOrderData.subtotal)}
                  </p>
                </div>
                <div className="flex items-center justify-between">
                  <Label className="text-sm">Discount</Label>
                  <p className="text-sm font-medium">
                    {formatCurrency(viewingOrderData.discountTotal)}
                  </p>
                </div>
                <div className="flex items-center justify-between">
                  <Label className="text-sm">GST</Label>
                  <p className="text-sm font-medium">
                    {formatCurrency(viewingOrderData.gstTotal)}
                  </p>
                </div>
                <div className="flex items-center justify-between pt-2 border-t">
                  <Label className="text-lg font-semibold">Grand Total</Label>
                  <p className="text-lg font-bold">
                    {formatCurrency(viewingOrderData.grandTotal)}
                  </p>
                </div>
              </div>

              {viewingOrderData.note && (
                <div className="space-y-1">
                  <Label className="text-muted-foreground">Note</Label>
                  <p className="text-sm p-3 bg-muted rounded-lg">
                    {viewingOrderData.note}
                  </p>
                </div>
              )}

              <div className="space-y-1">
                <Label className="text-muted-foreground">Payment Method</Label>
                <p className="text-sm capitalize">
                  {viewingOrderData.paymentMethod.replace("_", " ")}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label className="text-muted-foreground">Date</Label>
                  <p className="text-sm">
                    {formatDate(viewingOrderData.createdAt)}
                  </p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

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
