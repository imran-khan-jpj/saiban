"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import { CustomerLedgerRecords } from "@/components/admin/ledgers/customer-records";
import { SiteHeader } from "@/components/site-header";
import { useGetAllCustomers } from "@/app/api/customers/use-get-all";

export default function CustomerLedgerRecordsPage() {
  const params = useParams();
  const customerId = params.customerId as string;

  // Fetch customer details
  const { data: customersData } = useGetAllCustomers(1, 100);
  const customer = customersData?.data?.find((c) => c._id === customerId);

  const customerName = customer
    ? `${customer.firstName} ${customer.lastName}`
    : "Customer";

  return (
    <div className="flex flex-col h-full">
      <SiteHeader title={`Ledger - ${customerName}`} />
      <div className="@container/main flex flex-1 flex-col gap-2 min-h-0">
        <CustomerLedgerRecords
          customerId={customerId}
          customerName={customerName}
        />
      </div>
    </div>
  );
}
