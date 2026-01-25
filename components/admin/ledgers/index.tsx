"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { DataTable } from "@/components/data-table";
import { ColumnDef } from "@tanstack/react-table";
import {
  useGetAllLedgerEntries,
  LedgerEntry,
} from "@/app/api/ledgers/use-get-all";
import { Spinner } from "@/components/ui/spinner";
import { formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";

import { Input } from "@/components/ui/input";
import { IconX, IconSearch } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";

import { cn } from "@/lib/utils";
import { useGetAllCustomers } from "@/app/api/customers/use-get-all";

// Re-export LedgerEntry type
export type { LedgerEntry };

export function Ledgers() {
  const router = useRouter();
  const [pagination, setPagination] = React.useState({
    pageIndex: 0,
    pageSize: 10,
  });
  const [customerFilter, setCustomerFilter] = React.useState("");
  const [customerSearch, setCustomerSearch] = React.useState("");
  const [startDate, setStartDate] = React.useState("");
  const [endDate, setEndDate] = React.useState("");

  // Fetch customers for filter
  const { data: customersData } = useGetAllCustomers(1, 100);
  const customers = customersData?.data || [];

  // Fetch ledger entries from API with pagination and filters
  const { data, isLoading, isError, error } = useGetAllLedgerEntries(
    pagination.pageIndex + 1,
    pagination.pageSize,
    customerFilter || undefined,
    startDate || undefined,
    endDate || undefined,
  );

  // Filter customers based on search
  const filteredCustomers = React.useMemo(() => {
    if (!customerSearch) return customers;
    const search = customerSearch.toLowerCase();
    return customers.filter(
      (c) =>
        c.firstName.toLowerCase().includes(search) ||
        c.lastName.toLowerCase().includes(search) ||
        c.email.toLowerCase().includes(search),
    );
  }, [customers, customerSearch]);

  const handleClearFilters = () => {
    setCustomerFilter("");
    setCustomerSearch("");
    setStartDate("");
    setEndDate("");
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
  };

  // Transform data for DataTable (add id field)
  const ledgerEntries = React.useMemo(() => {
    return (data?.data || []).map((entry) => ({
      ...entry,
      id: entry._id,
    }));
  }, [data]);

  const getEntryTypeBadge = (entryType: string) => {
    return (
      <Badge
        variant={entryType === "credit" ? "default" : "destructive"}
        className="capitalize"
      >
        {entryType}
      </Badge>
    );
  };

  // Column definitions
  const columns: ColumnDef<LedgerEntry & { id: string }>[] = [
    {
      accessorKey: "customerId",
      header: "Customer",
      cell: ({ row }) => {
        const customer = row.original.customerId;
        if (typeof customer === "string") {
          return <div className="font-mono text-xs">{customer.slice(-8)}</div>;
        }
        return (
          <button
            onClick={() =>
              router.push(`/admin/ledgers/${customer._id}/records`)
            }
            className="text-left hover:underline"
          >
            <div className="font-medium">
              {customer.firstName} {customer.lastName}
            </div>
            <div className="text-xs text-muted-foreground">
              {customer.email}
            </div>
          </button>
        );
      },
    },
    {
      accessorKey: "entryType",
      header: "Type",
      cell: ({ row }) => getEntryTypeBadge(row.original.entryType),
    },
    {
      accessorKey: "amount",
      header: "Amount",
      cell: ({ row }) => (
        <div className="font-medium">PKR {row.original.amount}</div>
      ),
    },
    {
      accessorKey: "balance",
      header: "Balance",
      cell: ({ row }) => (
        <div className="font-medium">PKR {row.original.balance}</div>
      ),
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
  ];

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
          Error loading ledger entries: {error?.message || "Unknown error"}
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full space-y-4 min-h-0">
      <div className="shrink-0 flex items-end justify-between mt-2">
        <div className="flex items-center gap-2">
          <div className="relative w-64">
            <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search customers..."
              value={customerSearch}
              onChange={(e) => setCustomerSearch(e.target.value)}
              className="pl-9"
            />
            {customerSearch && filteredCustomers.length > 0 && (
              <div className="absolute top-full mt-1 w-full bg-popover border rounded-md shadow-md max-h-60 overflow-y-auto z-50">
                {filteredCustomers.map((customer) => (
                  <div
                    key={customer._id}
                    className={cn(
                      "w-full px-3 py-2 hover:bg-accent transition-colors border-b last:border-b-0",
                      customerFilter === customer._id && "bg-accent",
                    )}
                  >
                    <button
                      onClick={() => {
                        setCustomerFilter(customer._id);
                        setCustomerSearch(
                          `${customer.firstName} ${customer.lastName}`,
                        );
                      }}
                      className="w-full text-left"
                    >
                      <div className="font-medium">
                        {customer.firstName} {customer.lastName}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {customer.email}
                      </div>
                    </button>
                    <button
                      onClick={() =>
                        router.push(`/admin/ledgers/${customer._id}/records`)
                      }
                      className="text-xs text-primary hover:underline mt-1"
                    >
                      View ledger records →
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="space-y-2">
            <Label htmlFor="startDate">Start Date</Label>
            <Input
              id="startDate"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-40"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="endDate">End Date</Label>
            <Input
              id="endDate"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-40"
            />
          </div>

          {(customerFilter || startDate || endDate) && (
            <Button
              variant="outline"
              size="icon"
              onClick={handleClearFilters}
              title="Clear all filters"
            >
              <IconX className="min-w-8" />
            </Button>
          )}
        </div>
      </div>

      <div className="flex-1 min-h-0">
        <DataTable
          data={ledgerEntries}
          columns={columns}
          enableRowSelection={false}
          manualPagination={true}
          pageCount={data?.pagination.pages}
          pagination={pagination}
          onPaginationChange={setPagination}
        />
      </div>
    </div>
  );
}
