"use client";

import * as React from "react";
import { DataTable } from "@/components/data-table";
import { ColumnDef } from "@tanstack/react-table";
import {
  useGetCustomerLedgerEntries,
  CustomerLedgerEntry,
} from "@/app/api/ledgers/use-get-customer-entries";
import { Spinner } from "@/components/ui/spinner";
import { formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { IconArrowLeft, IconX } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

interface CustomerLedgerRecordsProps {
  customerId: string;
  customerName?: string;
}

export function CustomerLedgerRecords({
  customerId,
  customerName,
}: CustomerLedgerRecordsProps) {
  const router = useRouter();
  const [pagination, setPagination] = React.useState({
    pageIndex: 0,
    pageSize: 10,
  });
  const [startDate, setStartDate] = React.useState("");
  const [endDate, setEndDate] = React.useState("");

  // Fetch ledger entries from API with pagination and filters
  const { data, isLoading, isError, error } = useGetCustomerLedgerEntries(
    customerId,
    pagination.pageIndex + 1,
    pagination.pageSize,
    startDate || undefined,
    endDate || undefined,
  );

  const handleClearFilters = () => {
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
    const statusStyles: Record<string, string> = {
      credit: "bg-green-600 text-white hover:bg-green-700",
      debit: "bg-red-600 text-white hover:bg-red-700",
    };

    return (
      <Badge
        className={`capitalize ${statusStyles[entryType] || "bg-gray-500 text-white"}`}
      >
        {entryType}
      </Badge>
    );
  };

  // Column definitions
  const columns: ColumnDef<CustomerLedgerEntry & { id: string }>[] = [
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
      accessorKey: "sourceType",
      header: "Source Type",
      cell: ({ row }) => (
        <div className="capitalize">{row.original.sourceType}</div>
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
      header: "Date",
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
    <div className="flex flex-col h-full space-y-2 min-h-0">
      <div className="shrink-0 flex items-end justify-between">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push("/admin/ledgers")}
          >
            <IconArrowLeft className="mr-2 h-4 w-4" />
            Back to All Ledgers
          </Button>
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

          {(startDate || endDate) && (
            <Button
              variant="outline"
              size="icon"
              onClick={handleClearFilters}
              title="Clear all filters"
              className="mt-8"
            >
              <IconX className="h-4 w-4" />
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
