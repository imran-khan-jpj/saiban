"use client";

import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { Customer } from "@/app/api/customers/use-get-by-id";
import type { CustomerOrder } from "@/app/api/customers/use-get-customer-orders";

interface CustomerSummaryCardsProps {
  customer: Customer;
  orders: CustomerOrder[];
  totalOrders: number;
}

export function CustomerSummaryCards({
  customer,
  orders,
  totalOrders,
}: CustomerSummaryCardsProps) {
  const pendingCount = orders.filter((o) => o.status === "pending").length;

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mt-4 px-4">
      <Card>
        <CardHeader>
          <CardDescription>Current Balance</CardDescription>
          <CardTitle className="text-2xl flex items-center gap-2">
            {formatCurrency(customer.balance.absoluteAmount)}
            {customer.balance.direction === "settled" && (
              <Badge className="bg-gray-500 hover:bg-gray-500 text-white">
                Settled
              </Badge>
            )}
            {customer.balance.direction === "we_owe_customer" && (
              <Badge className="bg-green-600 hover:bg-green-600 text-white">
                Advance
              </Badge>
            )}
            {customer.balance.direction === "customer_owes" && (
              <Badge className="bg-red-600 text-white hover:bg-red-600">
                Pending payment
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
      </Card>
      <Card>
        <CardHeader>
          <CardDescription>Total Orders</CardDescription>
          <CardTitle className="text-2xl">{totalOrders}</CardTitle>
        </CardHeader>
      </Card>
      <Card>
        <CardHeader>
          <CardDescription>Last Order</CardDescription>
          <CardTitle className="text-xl">
            {orders.length > 0 ? formatDate(orders[0].createdAt) : "No orders"}
          </CardTitle>
        </CardHeader>
      </Card>
      <Card>
        <CardHeader>
          <CardDescription>Pending Orders</CardDescription>
          <CardTitle className="text-2xl">{pendingCount}</CardTitle>
        </CardHeader>
      </Card>
    </div>
  );
}
