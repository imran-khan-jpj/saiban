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
import { formatDate, formatCurrency } from "@/lib/utils";
import { Label } from "@/components/ui/label";

import { Input } from "@/components/ui/input";
import { IconX, IconSearch } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/ui/date-picker";

import { cn } from "@/lib/utils";
import { useGetAllCustomers } from "@/app/api/customers/use-get-all";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { StatusBadge } from "@/components/common/status-badge";

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
  const debouncedCustomerSearch = useDebouncedValue(customerSearch, 400);
  const [startDate, setStartDate] = React.useState<Date | undefined>();
  const [endDate, setEndDate] = React.useState<Date | undefined>();
  const [customersPagination] = React.useState({
    page: 1,
    limit: 50,
  });

  // Fetch customers for filter with search
  const { data: customersData } = useGetAllCustomers(
    customersPagination.page,
    customersPagination.limit,
    debouncedCustomerSearch,
  );
  const customers = customersData?.data || [];

  // Clear customer filter when search input changes (user is typing new search)
  React.useEffect(() => {
    // Only clear if customerSearch doesn't match the selected customer's name
    if (customerFilter && customerSearch) {
      const selectedCustomer = customers.find((c) => c._id === customerFilter);
      if (selectedCustomer) {
        const fullName = `${selectedCustomer.firstName} ${selectedCustomer.lastName}`;
        if (customerSearch !== fullName) {
          setCustomerFilter("");
        }
      }
    } else if (customerFilter && !customerSearch) {
      // Clear filter if search input is empty
      setCustomerFilter("");
    }
  }, [customerSearch, customerFilter, customers]);

  // Fetch ledger entries from API with pagination and filters
  const { data, isLoading, isError, error } = useGetAllLedgerEntries(
      pagination.pageIndex + 1,
      pagination.pageSize,
      customerFilter || undefined,
      startDate ? formatDate(startDate, "YYYY-MM-DD") : undefined,
      endDate ? formatDate(endDate, "YYYY-MM-DD") : undefined,
    );

  const handleClearFilters = () => {
    setCustomerFilter("");
    setCustomerSearch("");
    setStartDate(undefined);
    setEndDate(undefined);
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
  };

  // Transform data for DataTable (add id field)
  const ledgerEntries = React.useMemo(() => {
    return (data?.data || []).map((entry) => ({
      ...entry,
      id: entry._id,
    }));
  }, [data]);

  const columns = React.useMemo<ColumnDef<LedgerEntry & { id: string }>[]>(() => [
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
      accessorKey: "entryType",
      header: "Type",
      cell: ({ row }) => (
        <StatusBadge status={row.original.entryType} variant="ledger" />
      ),
    },
    {
      accessorKey: "amount",
      header: "Amount",
      cell: ({ row }) => (
        <div className="font-medium">{formatCurrency(row.original.amount)}</div>
      ),
    },
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
            className="text-left hover:underline cursor-pointer"
          >
            <div className="font-medium text-blue-600 underline hover:text-blue-700 hover:underline">
              {customer?.firstName ?? ""} {customer?.lastName ?? ""}
            </div>
          </button>
        );
      },
    },
    {
      accessorKey: "note",
      header: "Note",
      cell: ({ row }) => {
        const note = (row.original.note ?? "").trim();
        if (!note) {
          return <span className="text-muted-foreground/60">—</span>;
        }
        return (
          <div
            className="text-sm text-muted-foreground truncate max-w-[260px]"
            title={note}
          >
            {note}
          </div>
        );
      },
    },
  ], [router]);

  return (
    <div className="flex flex-col h-full space-y-4 min-h-0">
      <div className="shrink-0 flex items-end justify-between mt-2">
        <div className="relative w-64">
          <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search customers..."
            value={customerSearch}
            onChange={(e) => setCustomerSearch(e.target.value)}
            className="pl-9"
          />
          {customerSearch && customers.length > 0 && (
            <div className="absolute top-full mt-1 w-full bg-popover border rounded-md shadow-md max-h-60 overflow-y-auto z-50">
              {customers.map((customer) => (
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
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Label htmlFor="startDate">Start Date</Label>
            <DatePicker
              date={startDate}
              onDateChange={setStartDate}
              placeholder="01-Feb-2025"
            />
          </div>

          <div className="flex items-center gap-2">
            <Label htmlFor="endDate">End Date</Label>
            <DatePicker
              date={endDate}
              onDateChange={setEndDate}
              placeholder="28-Feb-2025"
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
        {isError ? (
          <div className="rounded-lg border border-destructive p-4">
            <p className="text-destructive">
              Error loading ledger entries: {error?.message || "Unknown error"}
            </p>
          </div>
        ) : isLoading ? (
          <div className="flex items-center justify-center py-10">
            <Spinner className="h-8 w-8" />
          </div>
        ) : (
          <DataTable
            data={ledgerEntries}
            columns={columns}
            enableRowSelection={false}
            manualPagination={true}
            pageCount={data?.pagination.pages}
            pagination={pagination}
            onPaginationChange={setPagination}
          />
        )}
      </div>
    </div>
  );
}
