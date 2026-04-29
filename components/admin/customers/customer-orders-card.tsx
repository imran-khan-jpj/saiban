"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  IconCheck,
  IconChevronLeft,
  IconChevronRight,
  IconX as IconCancel,
} from "@tabler/icons-react";
import { StatusBadge } from "@/components/common/status-badge";
import { formatAmount, formatDate } from "@/lib/utils";
import type {
  CustomerOrder,
  GetCustomerOrdersResponse,
} from "@/app/api/customers/use-get-customer-orders";

interface CustomerOrdersCardProps {
  orders: CustomerOrder[];
  ordersData: GetCustomerOrdersResponse | undefined;
  isLoading: boolean;
  isError: boolean;
  page: number;
  onPageChange: (next: number) => void;
  onConfirm: (orderId: string) => void;
  onCancel: (orderId: string) => void;
}

export function CustomerOrdersCard({
  orders,
  ordersData,
  isLoading,
  isError,
  page,
  onPageChange,
  onConfirm,
  onCancel,
}: CustomerOrdersCardProps) {
  const router = useRouter();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Order History</CardTitle>
        <CardDescription>
          Recent orders placed by this customer
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Spinner className="h-6 w-6" />
          </div>
        ) : isError ? (
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
                        <TableCell className="text-muted-foreground text-sm">
                          {formatDate(order.createdAt)}
                        </TableCell>
                        <TableCell className="font-medium">
                          {formatAmount(order.grandTotal)}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <StatusBadge status={order.status} />
                            {isPending && (
                              <>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-6 w-6 bg-green-100 text-green-600 hover:bg-green-200"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onConfirm(order._id);
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
                                    onCancel(order._id);
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
                                  variant="outline"
                                  className="cursor-pointer"
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    router.push(
                                      `/admin/orders/${order._id}`,
                                    );
                                  }}
                                >
                                  Details
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>View Order</p>
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

            {ordersData && ordersData.pagination.pages > 1 && (
              <div className="flex items-center justify-between mt-4">
                <p className="text-sm text-muted-foreground">
                  Page {page} of {ordersData.pagination.pages}
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onPageChange(Math.max(1, page - 1))}
                    disabled={page === 1}
                  >
                    <IconChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      onPageChange(
                        Math.min(ordersData.pagination.pages, page + 1),
                      )
                    }
                    disabled={page === ordersData.pagination.pages}
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
  );
}
