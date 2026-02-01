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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import {
  IconArrowLeft,
  IconCheck,
  IconX as IconCancel,
  IconChevronLeft,
  IconChevronRight,
  IconPencil,
  IconCash,
  IconCopy,
} from "@tabler/icons-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { formatDate } from "@/lib/utils";
import { useGetCustomerOrders } from "@/app/api/customers/use-get-customer-orders";
import { useGetCustomerTransactions } from "@/app/api/customers/use-get-customer-transactions";
import {
  useGetCustomerById,
  Customer,
} from "@/app/api/customers/use-get-by-id";
import { useUpdateCustomer } from "@/app/api/customers/use-update";
import { useRecordPayment } from "@/app/api/customers/use-record-payment";
import { useConfirmOrder } from "@/app/api/orders/use-confirm";
import { useCancelOrder } from "@/app/api/orders/use-cancel";
import { CustomerForm } from "./customer-form";
import { PaymentForm } from "./payment-form";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

interface CustomerDetailProps {
  customerId: string;
}

export function CustomerDetail({ customerId }: CustomerDetailProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [orderPage, setOrderPage] = React.useState(1);
  const [transactionPage, setTransactionPage] = React.useState(1);
  const [isEditDialogOpen, setIsEditDialogOpen] = React.useState(false);
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = React.useState(false);
  const [copiedOrderId, setCopiedOrderId] = React.useState<string | null>(null);
  const ordersPerPage = 10;
  const transactionsPerPage = 10;

  // Fetch customer details
  const {
    data: customer,
    isLoading: isLoadingCustomer,
    isError: isCustomerError,
  } = useGetCustomerById(customerId);

  // Fetch customer orders
  const {
    data: ordersData,
    isLoading: isLoadingOrders,
    isError: isOrdersError,
  } = useGetCustomerOrders(customerId, orderPage, ordersPerPage);

  // Fetch customer transactions
  const {
    data: transactionsData,
    isLoading: isLoadingTransactions,
    isError: isTransactionsError,
  } = useGetCustomerTransactions(
    customerId,
    transactionPage,
    transactionsPerPage,
  );

  // Mutations
  const confirmOrder = useConfirmOrder();
  const cancelOrder = useCancelOrder();
  const updateCustomer = useUpdateCustomer();
  const recordPayment = useRecordPayment();

  const orders = ordersData?.data || [];
  const transactions = transactionsData?.data || [];

  const handleConfirm = (orderId: string) => {
    confirmOrder.mutate(orderId, {
      onSuccess: () => {
        toast.success("Order confirmed successfully");
      },
      onError: (error) => {
        toast.error(`Failed to confirm order: ${error.message}`);
      },
    });
  };

  const handleCancel = (orderId: string) => {
    cancelOrder.mutate(orderId, {
      onSuccess: () => {
        toast.success("Order cancelled successfully");
      },
      onError: (error) => {
        toast.error(`Failed to cancel order: ${error.message}`);
      },
    });
  };

  const handleUpdateCustomer = (
    data: Omit<Customer, "_id" | "createdAt" | "updatedAt" | "__v">,
  ) => {
    updateCustomer.mutate(
      { customerId, data },
      {
        onSuccess: () => {
          toast.success("Customer updated successfully");
          setIsEditDialogOpen(false);
          queryClient.invalidateQueries({ queryKey: ["customer", customerId] });
        },
        onError: (error) => {
          toast.error(`Failed to update customer: ${error.message}`);
        },
      },
    );
  };

  const handleRecordPayment = (data: {
    orderId?: string;
    amount: number;
    paymentMethod: string;
    reference: string;
    note: string;
  }) => {
    recordPayment.mutate(
      {
        customerId,
        orderId: data.orderId || undefined,
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
            queryKey: ["customer-transactions", customerId],
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

  if (isLoadingCustomer) {
    return (
      <div className="flex items-center justify-center h-full">
        <Spinner />
      </div>
    );
  }

  if (isCustomerError || !customer) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-red-500">Failed to load customer details</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full py-4">
      {/* Header with back button and edit */}
      <div className="flex items-center justify-between gap-4 px-4">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push("/admin/customers")}
          >
            <IconArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold">
                {customer.firstName} {customer.lastName}
              </h2>
              <span className="text-muted-foreground">•</span>
              <p className="text-muted-foreground">{customer.email}</p>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>{customer.phoneNumber}</span>
              <span>•</span>
              <span>
                {customer.streetAddress}, {customer.city}, {customer.state}
              </span>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsEditDialogOpen(true)}
          >
            <IconPencil className="h-4 w-4 mr-2" />
            Edit Customer
          </Button>
          <Button
            size="sm"
            className="bg-black text-white hover:bg-black/90"
            onClick={() => setIsPaymentDialogOpen(true)}
          >
            <IconCash className="h-4 w-4 mr-2" />
            Record Payment
          </Button>
        </div>
      </div>

      {/* Customer Info Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mt-4 px-4">
        <Card>
          <CardHeader>
            <CardDescription>Current Balance</CardDescription>
            <CardTitle className="text-2xl">PKR 0</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Total Orders</CardDescription>
            <CardTitle className="text-2xl">
              {ordersData?.pagination.total || 0}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Total Spent</CardDescription>
            <CardTitle className="text-2xl">PKR 0</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Total Paid</CardDescription>
            <CardTitle className="text-2xl">PKR 0</CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Order History and Transaction History - Side by Side */}
      <div className="grid gap-4 lg:grid-cols-2 mt-4 px-4 overflow-auto flex-1">
        {/* Order History Card */}
        <Card>
          <CardHeader>
            <CardTitle>Order History</CardTitle>
            <CardDescription>
              Recent orders placed by this customer
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingOrders ? (
              <div className="flex justify-center py-8">
                <Spinner className="h-6 w-6" />
              </div>
            ) : isOrdersError ? (
              <p className="text-destructive text-center py-4">
                Error loading orders
              </p>
            ) : orders.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                No orders found
              </p>
            ) : (
              <>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader className="bg-muted">
                      <TableRow>
                        <TableHead>Order ID</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="w-12"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {orders.map((order) => {
                        const isPending = order.status === "pending";
                        return (
                          <TableRow key={order._id}>
                            <TableCell>
                              <Link
                                href={`/admin/orders/${order._id}`}
                                className="font-mono text-xs hover:text-primary hover:underline"
                              >
                                {order._id.slice(-8)}
                              </Link>
                            </TableCell>
                            <TableCell className="text-muted-foreground text-sm">
                              {formatDate(order.createdAt)}
                            </TableCell>
                            <TableCell className="font-medium">
                              PKR {order.grandTotal}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1">
                                {getStatusBadge(order.status)}
                                {isPending && (
                                  <>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-6 w-6 bg-green-100 text-green-600 hover:bg-green-200"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleConfirm(order._id);
                                      }}
                                      title="Confirm order"
                                    >
                                      <IconCheck className="h-3 w-3" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-6 w-6 bg-red-100 text-red-600 hover:bg-red-200"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleCancel(order._id);
                                      }}
                                      title="Cancel order"
                                    >
                                      <IconCancel className="h-3 w-3" />
                                    </Button>
                                  </>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className={`h-6 w-6 cursor-pointer ${
                                        copiedOrderId === order._id
                                          ? "text-green-600 hover:text-green-700"
                                          : ""
                                      }`}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        navigator.clipboard.writeText(
                                          order._id,
                                        );
                                        setCopiedOrderId(order._id);
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
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
                {/* Orders Pagination */}
                {ordersData && ordersData.pagination.pages > 1 && (
                  <div className="flex items-center justify-between mt-4">
                    <p className="text-sm text-muted-foreground">
                      Page {orderPage} of {ordersData.pagination.pages}
                    </p>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          setOrderPage((prev) => Math.max(1, prev - 1))
                        }
                        disabled={orderPage === 1}
                      >
                        <IconChevronLeft className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          setOrderPage((prev) =>
                            Math.min(ordersData.pagination.pages, prev + 1),
                          )
                        }
                        disabled={orderPage === ordersData.pagination.pages}
                      >
                        <IconChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>

        {/* Transaction History Card */}
        <Card>
          <CardHeader>
            <CardTitle>Transaction History</CardTitle>
            <CardDescription>
              Recent transactions for this customer
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingTransactions ? (
              <div className="flex justify-center py-8">
                <Spinner className="h-6 w-6" />
              </div>
            ) : isTransactionsError ? (
              <p className="text-destructive text-center py-4">
                Error loading transactions
              </p>
            ) : transactions.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                No transactions found
              </p>
            ) : (
              <>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader className="bg-muted">
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Source</TableHead>
                        <TableHead>Amount</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {transactions.map((transaction) => (
                        <TableRow key={transaction._id}>
                          <TableCell className="text-muted-foreground text-sm">
                            {formatDate(transaction.createdAt)}
                          </TableCell>
                          <TableCell>
                            <Badge
                              className={`capitalize ${
                                transaction.entryType === "debit"
                                  ? "bg-red-600 text-white"
                                  : "bg-green-600 text-white"
                              }`}
                            >
                              {transaction.entryType}
                            </Badge>
                          </TableCell>
                          <TableCell className="capitalize text-sm">
                            {transaction.sourceType}
                          </TableCell>
                          <TableCell
                            className={`font-medium ${
                              transaction.entryType === "debit"
                                ? "text-red-600"
                                : "text-green-600"
                            }`}
                          >
                            {transaction.entryType === "debit" ? "-" : "+"}PKR{" "}
                            {transaction.amount}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                {/* Transactions Pagination */}
                {transactionsData && transactionsData.pagination.pages > 1 && (
                  <div className="flex items-center justify-between mt-4">
                    <p className="text-sm text-muted-foreground">
                      Page {transactionPage} of{" "}
                      {transactionsData.pagination.pages}
                    </p>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          setTransactionPage((prev) => Math.max(1, prev - 1))
                        }
                        disabled={transactionPage === 1}
                      >
                        <IconChevronLeft className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          setTransactionPage((prev) =>
                            Math.min(
                              transactionsData.pagination.pages,
                              prev + 1,
                            ),
                          )
                        }
                        disabled={
                          transactionPage === transactionsData.pagination.pages
                        }
                      >
                        <IconChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Edit Customer Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Customer</DialogTitle>
            <DialogDescription>Update customer information</DialogDescription>
          </DialogHeader>
          <CustomerForm
            customer={customer}
            onSubmit={handleUpdateCustomer}
            onCancel={() => setIsEditDialogOpen(false)}
            isSubmitting={updateCustomer.isPending}
          />
        </DialogContent>
      </Dialog>

      {/* Record Payment Dialog */}
      <Dialog open={isPaymentDialogOpen} onOpenChange={setIsPaymentDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Record Payment</DialogTitle>
            <DialogDescription>
              Record a payment received from this customer
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
