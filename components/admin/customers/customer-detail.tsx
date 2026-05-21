"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
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
import { IconArrowLeft, IconPencil, IconCash } from "@tabler/icons-react";
import { useRouter } from "next/navigation";
import { useGetCustomerOrders } from "@/app/api/customers/use-get-customer-orders";
import { useGetCustomerTransactions } from "@/app/api/customers/use-get-customer-transactions";
import { useGetCustomerById } from "@/app/api/customers/use-get-by-id";
import { useUpdateCustomer } from "@/app/api/customers/use-update";
import { useRecordPayment } from "@/app/api/customers/use-record-payment";
import { useBalanceAdjustment } from "@/app/api/customers/use-balance-adjustment";
import { useConfirmOrder } from "@/app/api/orders/use-confirm";
import { useCancelOrder } from "@/app/api/orders/use-cancel";
import { CustomerForm, type CustomerFormPayload } from "./customer-form";
import { PaymentForm } from "./payment-form";
import { BalanceAdjustmentForm } from "./balance-adjustment-form";
import { CustomerSummaryCards } from "./customer-summary-cards";
import { CustomerOrdersCard } from "./customer-orders-card";
import { CustomerTransactionsCard } from "./customer-transactions-card";
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
  const [isBalanceAdjustmentDialogOpen, setIsBalanceAdjustmentDialogOpen] =
    React.useState(false);
  const [confirmingOrderId, setConfirmingOrderId] = React.useState<
    string | null
  >(null);
  const [cancellingOrderId, setCancellingOrderId] = React.useState<
    string | null
  >(null);
  const ordersPerPage = 10;
  const transactionsPerPage = 10;

  const {
    data: customer,
    isLoading: isLoadingCustomer,
    isError: isCustomerError,
  } = useGetCustomerById(customerId);

  const {
    data: ordersData,
    isLoading: isLoadingOrders,
    isError: isOrdersError,
  } = useGetCustomerOrders(customerId, orderPage, ordersPerPage);

  const {
    data: transactionsData,
    isLoading: isLoadingTransactions,
    isError: isTransactionsError,
  } = useGetCustomerTransactions(
    customerId,
    transactionPage,
    transactionsPerPage,
  );

  const confirmOrder = useConfirmOrder();
  const cancelOrder = useCancelOrder();
  const updateCustomer = useUpdateCustomer();
  const recordPayment = useRecordPayment();
  const balanceAdjustment = useBalanceAdjustment();

  const orders = ordersData?.data || [];
  const transactions = transactionsData?.data || [];

  const handleConfirmOrder = () => {
    if (!confirmingOrderId) return;

    confirmOrder.mutate(confirmingOrderId, {
      onSuccess: () => {
        toast.success("Order confirmed successfully");
        setConfirmingOrderId(null);
        queryClient.invalidateQueries({
          queryKey: ["customer-orders", customerId],
        });
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
        queryClient.invalidateQueries({
          queryKey: ["customer-orders", customerId],
        });
      },
      onError: (error) => {
        toast.error(`Failed to cancel order: ${error.message}`);
        setCancellingOrderId(null);
      },
    });
  };

  const handleUpdateCustomer = (data: CustomerFormPayload) => {
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
    note: string;
  }) => {
    recordPayment.mutate(
      {
        customerId,
        orderId: data.orderId || undefined,
        amount: data.amount,
        paymentMethod: data.paymentMethod,
        note: data.note,
      },
      {
        onSuccess: () => {
          toast.success("Payment recorded successfully");
          setIsPaymentDialogOpen(false);
          queryClient.invalidateQueries({
            queryKey: ["customer", customerId],
          });
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

  const handleBalanceAdjustment = (data: {
    amount: number;
    direction: "customer_owes" | "we_owe_customer";
    note?: string;
  }) => {
    balanceAdjustment.mutate(
      {
        customerId,
        payload: data,
      },
      {
        onSuccess: () => {
          toast.success("Balance adjusted successfully");
          setIsBalanceAdjustmentDialogOpen(false);
        },
        onError: (error) => {
          toast.error(`Failed to adjust balance: ${error.message}`);
        },
      },
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
      {/* Header with back button and actions */}
      <div className="flex items-center justify-between gap-4 px-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <IconArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold">
                {customer.firstName} {customer.lastName}
              </h2>
              {customer.email && (
                <div>
                  <span className="text-muted-foreground">•</span>
                  <p className="text-muted-foreground">{customer.email}</p>
                </div>
              )}
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>{customer.phoneNumber}</span>
              {(customer.streetAddress || customer.city || customer.state) && (
                <div className="inline">
                  <span>•</span>
                  <span>
                    {customer.streetAddress} {customer.city} {customer.state}
                  </span>
                </div>
              )}
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
            variant="outline"
            size="sm"
            onClick={() => setIsBalanceAdjustmentDialogOpen(true)}
          >
            Balance Adjustment
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

      <CustomerSummaryCards
        customer={customer}
        orders={orders}
        totalOrders={ordersData?.pagination.total || 0}
      />

      <div className="grid gap-4 lg:grid-cols-2 mt-4 px-4 overflow-auto flex-1">
        <CustomerOrdersCard
          orders={orders}
          ordersData={ordersData}
          isLoading={isLoadingOrders}
          isError={isOrdersError}
          page={orderPage}
          onPageChange={setOrderPage}
          onConfirm={setConfirmingOrderId}
          onCancel={setCancellingOrderId}
        />

        <CustomerTransactionsCard
          transactions={transactions}
          transactionsData={transactionsData}
          isLoading={isLoadingTransactions}
          isError={isTransactionsError}
          page={transactionPage}
          onPageChange={setTransactionPage}
        />
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

      {/* Balance Adjustment Dialog */}
      <Dialog
        open={isBalanceAdjustmentDialogOpen}
        onOpenChange={setIsBalanceAdjustmentDialogOpen}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Balance Adjustment</DialogTitle>
            <DialogDescription>
              Adjust the customer&apos;s balance manually
            </DialogDescription>
          </DialogHeader>
          <BalanceAdjustmentForm
            onSubmit={handleBalanceAdjustment}
            onCancel={() => setIsBalanceAdjustmentDialogOpen(false)}
            isSubmitting={balanceAdjustment.isPending}
          />
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
