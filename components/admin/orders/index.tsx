"use client";

import * as React from "react";
import { DataTable } from "@/components/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import {
  IconPlus,
  IconEye,
  IconCheck,
  IconX as IconCancel,
  IconDotsVertical,
  IconFilter,
  IconX,
} from "@tabler/icons-react";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { OrderForm } from "./order-form";
import { useGetAllOrders, Order } from "@/app/api/orders/use-get-all";
import { useGetOrderById } from "@/app/api/orders/use-get-by-id";
import { useCreateOrder } from "@/app/api/orders/use-create";
import { useConfirmOrder } from "@/app/api/orders/use-confirm";
import { useCancelOrder } from "@/app/api/orders/use-cancel";
import { Spinner } from "@/components/ui/spinner";
import { formatDate } from "@/lib/utils";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

// Re-export Order type
export type { Order };

interface OrdersProps {
  searchInput: string;
  statusFilter: string;
  onStatusFilterChange: (value: string) => void;
}

export function Orders({
  searchInput,
  statusFilter,
  onStatusFilterChange,
}: OrdersProps) {
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
    const variants: Record<string, "default" | "secondary" | "destructive"> = {
      pending: "secondary",
      confirmed: "default",
      cancelled: "destructive",
      paid: "default",
    };
    return (
      <Badge variant={variants[status] || "default"} className="capitalize">
        {status}
      </Badge>
    );
  };

  // Column definitions
  const columns: ColumnDef<Order & { id: string }>[] = [
    {
      accessorKey: "_id",
      header: "Order ID",
      size: 150,
      cell: ({ row }) => (
        <div className="font-mono text-xs">{row.original._id.slice(-8)}</div>
      ),
    },
    {
      accessorKey: "customerId",
      header: "Customer",
      cell: ({ row }) => (
        <div>
          <div className="font-medium">
            {row.original.customerId.firstName}{" "}
            {row.original.customerId.lastName}
          </div>
          <div className="text-sm text-muted-foreground">
            {row.original.customerId.email}
          </div>
        </div>
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
        <div className="font-medium">PKR {row.original.grandTotal}</div>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => getStatusBadge(row.original.status),
    },
    {
      accessorKey: "createdAt",
      header: "Created At",
      cell: ({ row }) => (
        <div className="text-muted-foreground">
          {formatDate(row.original.createdAt)}
        </div>
      ),
    },
    {
      id: "actions",
      header: () => <div className="text-right">Actions</div>,
      cell: ({ row }) => (
        <div className="flex justify-end">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <IconDotsVertical className="h-4 w-4" />
                <span className="sr-only">Open menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleView(row.original._id)}>
                <IconEye className="mr-2 h-4 w-4" />
                View
              </DropdownMenuItem>
              {row.original.status === "pending" && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => handleConfirm(row.original._id)}
                  >
                    <IconCheck className="mr-2 h-4 w-4" />
                    Confirm
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="text-destructive"
                    onClick={() => handleCancel(row.original._id)}
                  >
                    <IconCancel className="mr-2 h-4 w-4" />
                    Cancel
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
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
        <div>
          <p className="text-muted-foreground">
            Manage orders and track their status ({data?.pagination.total || 0}{" "}
            total)
          </p>
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
                            PKR {item.unitPrice}
                          </td>
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
                  <p className="text-sm font-medium">
                    PKR {viewingOrderData.subtotal}
                  </p>
                </div>
                <div className="flex items-center justify-between">
                  <Label className="text-sm">Discount</Label>
                  <p className="text-sm font-medium">
                    PKR {viewingOrderData.discountTotal}
                  </p>
                </div>
                <div className="flex items-center justify-between">
                  <Label className="text-sm">GST</Label>
                  <p className="text-sm font-medium">
                    PKR {viewingOrderData.gstTotal}
                  </p>
                </div>
                <div className="flex items-center justify-between pt-2 border-t">
                  <Label className="text-lg font-semibold">Grand Total</Label>
                  <p className="text-lg font-bold">
                    PKR {viewingOrderData.grandTotal}
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
                  <Label className="text-muted-foreground">Created At</Label>
                  <p className="text-sm">
                    {formatDate(viewingOrderData.createdAt)}
                  </p>
                </div>
                <div className="space-y-1">
                  <Label className="text-muted-foreground">Last Updated</Label>
                  <p className="text-sm">
                    {formatDate(viewingOrderData.updatedAt)}
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
    </div>
  );
}
