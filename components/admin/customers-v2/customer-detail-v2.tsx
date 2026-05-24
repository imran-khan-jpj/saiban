"use client";

import * as React from "react";
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
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

import { useGetCustomerById } from "@/app/api/customers/use-get-by-id";
import { useGetCustomerOrders } from "@/app/api/customers/use-get-customer-orders";
import { useGetCustomerTransactions } from "@/app/api/customers/use-get-customer-transactions";
import { useUpdateCustomer } from "@/app/api/customers/use-update";
import { useRecordPayment } from "@/app/api/customers/use-record-payment";
import { useBalanceAdjustment } from "@/app/api/customers/use-balance-adjustment";
import { useConfirmOrder } from "@/app/api/orders/use-confirm";
import { useCancelOrder } from "@/app/api/orders/use-cancel";

import { CustomerProfileHeader } from "./customer-profile-header";
import { CustomerBalanceCards } from "./customer-balance-cards";
import { CustomerOrdersCardV2 } from "./customer-orders-card-v2";
import { CustomerTransactionsCardV2 } from "./customer-transactions-card-v2";
import { CustomerFormV2, type CustomerFormPayload } from "./customer-form-v2";
import { PaymentFormV2, type PaymentFormOutput } from "./payment-form-v2";
import {
  BalanceAdjustmentFormV2,
  type BalanceAdjustmentValues,
} from "./balance-adjustment-form-v2";

interface CustomerDetailV2Props {
  customerId: string;
}

export function CustomerDetailV2({ customerId }: CustomerDetailV2Props) {
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
        toast.success("Order confirmed");
        setConfirmingOrderId(null);
        queryClient.invalidateQueries({
          queryKey: ["customer-orders", customerId],
        });
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
        queryClient.invalidateQueries({
          queryKey: ["customer-orders", customerId],
        });
      },
      onError: (err) => {
        toast.error(`Failed to cancel: ${err.message}`);
        setCancellingOrderId(null);
      },
    });
  };

  const handleUpdateCustomer = (data: CustomerFormPayload) => {
    updateCustomer.mutate(
      { customerId, data },
      {
        onSuccess: () => {
          toast.success("Customer updated");
          setIsEditDialogOpen(false);
          queryClient.invalidateQueries({ queryKey: ["customer", customerId] });
        },
        onError: (err) => {
          toast.error(`Failed to update: ${err.message}`);
        },
      },
    );
  };

  const handleRecordPayment = (data: PaymentFormOutput) => {
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
          toast.success("Payment recorded");
          setIsPaymentDialogOpen(false);
          queryClient.invalidateQueries({
            queryKey: ["customer", customerId],
          });
          queryClient.invalidateQueries({
            queryKey: ["customer-transactions", customerId],
          });
        },
        onError: (err) => {
          toast.error(`Failed to record payment: ${err.message}`);
        },
      },
    );
  };

  const handleBalanceAdjustment = (data: BalanceAdjustmentValues) => {
    balanceAdjustment.mutate(
      { customerId, payload: data },
      {
        onSuccess: () => {
          toast.success("Balance adjusted");
          setIsBalanceAdjustmentDialogOpen(false);
        },
        onError: (err) => {
          toast.error(`Failed to adjust balance: ${err.message}`);
        },
      },
    );
  };

  if (isLoadingCustomer) {
    return (
      <div className="flex items-center justify-center py-20">
        <Spinner className="h-6 w-6" />
      </div>
    );
  }

  if (isCustomerError || !customer) {
    return (
      <div className="mx-auto max-w-md py-20 text-center">
        <p className="text-sm text-destructive">
          Failed to load customer details.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-[1400px] flex-col gap-6 px-4 pb-10 pt-6 sm:px-6">
      <CustomerProfileHeader
        firstName={customer.firstName}
        lastName={customer.lastName}
        email={customer.email}
        phoneNumber={customer.phoneNumber}
        streetAddress={customer.streetAddress}
        city={customer.city}
        state={customer.state}
        onEdit={() => setIsEditDialogOpen(true)}
        onAdjustBalance={() => setIsBalanceAdjustmentDialogOpen(true)}
        onRecordPayment={() => setIsPaymentDialogOpen(true)}
      />

      <CustomerBalanceCards
        customer={customer}
        orders={orders}
        totalOrders={ordersData?.pagination.total || 0}
      />

      <div className="grid gap-4 lg:grid-cols-2">
        <CustomerOrdersCardV2
          orders={orders}
          ordersData={ordersData}
          isLoading={isLoadingOrders}
          isError={isOrdersError}
          page={orderPage}
          onPageChange={setOrderPage}
          onConfirm={setConfirmingOrderId}
          onCancel={setCancellingOrderId}
        />

        <CustomerTransactionsCardV2
          transactions={transactions}
          transactionsData={transactionsData}
          isLoading={isLoadingTransactions}
          isError={isTransactionsError}
          page={transactionPage}
          onPageChange={setTransactionPage}
        />
      </div>

      {/* Edit Customer */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit customer</DialogTitle>
            <DialogDescription>
              Update the customer&apos;s information below.
            </DialogDescription>
          </DialogHeader>
          <CustomerFormV2
            customer={customer}
            onSubmit={handleUpdateCustomer}
            onCancel={() => setIsEditDialogOpen(false)}
            isSubmitting={updateCustomer.isPending}
          />
        </DialogContent>
      </Dialog>

      {/* Record Payment */}
      <Dialog open={isPaymentDialogOpen} onOpenChange={setIsPaymentDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Record payment</DialogTitle>
            <DialogDescription>
              Record a payment received from {customer.firstName}{" "}
              {customer.lastName ?? ""}.
            </DialogDescription>
          </DialogHeader>
          <PaymentFormV2
            onSubmit={handleRecordPayment}
            onCancel={() => setIsPaymentDialogOpen(false)}
            isSubmitting={recordPayment.isPending}
          />
        </DialogContent>
      </Dialog>

      {/* Balance Adjustment */}
      <Dialog
        open={isBalanceAdjustmentDialogOpen}
        onOpenChange={setIsBalanceAdjustmentDialogOpen}
      >
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Adjust balance</DialogTitle>
            <DialogDescription>
              Manually correct {customer.firstName} {customer.lastName ?? ""}
              &apos;s balance.
            </DialogDescription>
          </DialogHeader>
          <BalanceAdjustmentFormV2
            onSubmit={handleBalanceAdjustment}
            onCancel={() => setIsBalanceAdjustmentDialogOpen(false)}
            isSubmitting={balanceAdjustment.isPending}
          />
        </DialogContent>
      </Dialog>

      {/* Confirm order */}
      <AlertDialog
        open={!!confirmingOrderId}
        onOpenChange={(open) => !open && setConfirmingOrderId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm this order?</AlertDialogTitle>
            <AlertDialogDescription>
              This will mark the order as confirmed and update inventory.
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
              This action cannot be undone. The order will be marked as
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
    </div>
  );
}
