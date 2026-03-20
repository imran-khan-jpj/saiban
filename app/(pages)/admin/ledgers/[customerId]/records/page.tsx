"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import { CustomerLedgerRecords } from "@/components/admin/ledgers/customer-records";
import { SiteHeader } from "@/components/site-header";
import { useGetCustomerById } from "@/app/api/customers/use-get-by-id";
import { formatCurrency } from "@/lib/utils";
import {
  Card,
  CardHeader,
  CardDescription,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function CustomerLedgerRecordsPage() {
  const params = useParams();
  const customerId = params.customerId as string;

  // Fetch customer details with balance
  const { data: customer, isLoading } = useGetCustomerById(customerId);

  const customerName = customer
    ? `${customer.firstName} ${customer.lastName}`
    : "Customer";

  return (
    <div className="flex flex-col h-full">
      <SiteHeader title={`Ledger - ${customerName}`} />
      <div className="@container/main flex flex-1 flex-col gap-2 min-h-0">
        {customer && customer.balance && (
          <div className="grid gap-4 md:grid-cols-2 mt-2">
            <Card>
              <CardHeader>
                <CardDescription>Customer Information</CardDescription>
                <CardTitle className="text-xl">
                  <div>
                    <h3 className="font-semibold">{customerName}</h3>
                    <p className="text-sm text-muted-foreground font-normal">
                      {customer.email} • {customer.phoneNumber}
                    </p>
                  </div>
                </CardTitle>
              </CardHeader>
            </Card>
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
          </div>
        )}
        <CustomerLedgerRecords
          customerId={customerId}
          customerName={customerName}
        />
      </div>
    </div>
  );
}
