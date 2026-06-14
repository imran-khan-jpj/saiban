"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { ColumnDef } from "@tanstack/react-table";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Spinner } from "@/components/ui/spinner";
import {
  IconArrowDownRight,
  IconArrowUpRight,
  IconCash,
  IconReceipt,
  IconScale,
  IconShoppingCart,
} from "@tabler/icons-react";

import { DataTable } from "@/components/data-table";
import {
  useGetAllLedgerEntries,
  type LedgerEntry,
} from "@/app/api/ledgers/use-get-all";
import { CustomerAvatar } from "@/components/admin/customers/customer-avatar";
import { formatCurrency, formatDate } from "@/lib/utils";
import { cn } from "@/lib/utils";
import dayjs from "dayjs";

import { LedgersToolbar } from "./ledgers-toolbar";

const SOURCE_LABELS: Record<string, string> = {
  order: "Order",
  payment: "Payment",
  adjustment: "Balance adjustment",
  refund: "Refund",
};

const SOURCE_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  order: IconShoppingCart,
  payment: IconCash,
  adjustment: IconScale,
  refund: IconReceipt,
};

export function Ledgers() {
  const router = useRouter();
  const [customerId, setCustomerId] = React.useState("");
  const [startDate, setStartDate] = React.useState<Date | undefined>();
  const [endDate, setEndDate] = React.useState<Date | undefined>();
  const [pagination, setPagination] = React.useState({
    pageIndex: 0,
    pageSize: 10,
  });

  React.useEffect(() => {
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
  }, [customerId, startDate, endDate]);

  const { data, isLoading, isFetching, isError, error } = useGetAllLedgerEntries(
    pagination.pageIndex + 1,
    pagination.pageSize,
    customerId || undefined,
    startDate ? dayjs(startDate).format("YYYY-MM-DD") : undefined,
    endDate ? dayjs(endDate).format("YYYY-MM-DD") : undefined,
  );

  const entries = React.useMemo(
    () =>
      (data?.data || []).map((e) => ({
        ...e,
        id: e._id,
      })),
    [data],
  );

  const columns = React.useMemo<ColumnDef<LedgerEntry & { id: string }>[]>(
    () => [
      {
        accessorKey: "customerId",
        header: "Customer",
        size: 380,
        cell: ({ row }) => {
          const c = row.original.customerId;
          if (typeof c === "string") {
            return (
              <span className="font-mono text-xs text-muted-foreground">
                #{c.slice(-8)}
              </span>
            );
          }
          const fullName = `${c.firstName} ${c.lastName ?? ""}`.trim();
          return (
            <div className="flex items-center gap-3 min-w-0 overflow-hidden">
              <CustomerAvatar
                firstName={c.firstName}
                lastName={c.lastName}
                size="sm"
              />
              <div className="min-w-0 flex-1">
                <TooltipProvider delayDuration={300}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        onClick={() =>
                          router.push(`/admin/ledgers/${c._id}`)
                        }
                        className="block w-full text-left truncate text-sm font-semibold text-foreground hover:underline underline-offset-4"
                      >
                        {fullName}
                      </button>
                    </TooltipTrigger>
                    <TooltipContent className="max-w-[320px]">
                      {fullName}
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                {c.email && (
                  <p className="mt-0.5 truncate text-xs text-muted-foreground">
                    {c.email}
                  </p>
                )}
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: "sourceType",
        header: "Source",
        size: 240,
        cell: ({ row }) => {
          const Icon = SOURCE_ICONS[row.original.sourceType] ?? IconReceipt;
          const label =
            SOURCE_LABELS[row.original.sourceType] ?? row.original.sourceType;
          const note = (row.original.note ?? "").trim();
          return (
            <div className="flex items-start gap-2 text-sm min-w-0">
              <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
                <Icon className="h-3.5 w-3.5" />
              </span>
              <div className="min-w-0">
                <div className="truncate capitalize">{label}</div>
                {note.length > 0 && (
                  <div
                    className="truncate text-xs text-muted-foreground"
                    title={note}
                  >
                    {note}
                  </div>
                )}
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: "createdAt",
        header: "Date",
        size: 130,
        cell: ({ row }) => (
          <div className="text-xs text-muted-foreground tabular-nums">
            {formatDate(row.original.createdAt)}
          </div>
        ),
      },
      {
        accessorKey: "entryType",
        header: "Type",
        size: 110,
        cell: ({ row }) => {
          const isDebit = row.original.entryType === "debit";
          return (
            <span
              className={cn(
                "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium",
                isDebit
                  ? "bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-300"
                  : "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300",
              )}
            >
              {isDebit ? (
                <IconArrowUpRight className="h-3 w-3" />
              ) : (
                <IconArrowDownRight className="h-3 w-3" />
              )}
              {isDebit ? "Debit" : "Credit"}
            </span>
          );
        },
      },
      {
        accessorKey: "amount",
        header: () => <div className="text-right pr-6">Amount</div>,
        size: 200,
        cell: ({ row }) => {
          const isDebit = row.original.entryType === "debit";
          return (
            <div
              className={cn(
                "text-right pr-6 text-sm font-semibold tabular-nums tracking-tight",
                isDebit
                  ? "text-red-700 dark:text-red-400"
                  : "text-emerald-700 dark:text-emerald-400",
              )}
            >
              {isDebit ? "−" : "+"}
              {formatCurrency(row.original.amount)}
            </div>
          );
        },
      },
    ],
    [router],
  );

  const totalCount = data?.pagination.total ?? 0;
  const showingFrom =
    entries.length === 0 ? 0 : pagination.pageIndex * pagination.pageSize + 1;
  const showingTo = pagination.pageIndex * pagination.pageSize + entries.length;

  return (
    <div className="mx-auto flex w-full max-w-[1400px] flex-col gap-6 px-4 pb-10 pt-6 sm:px-6">
      {/* Header */}
      <header className="flex flex-col gap-1">
        <p className="text-xs font-medium text-muted-foreground">Finance</p>
        <h1 className="text-3xl font-semibold tracking-tight text-foreground">
          Ledger
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Every credit and debit recorded across all customer accounts.
        </p>
      </header>

      <LedgersToolbar
        customerId={customerId}
        onCustomerIdChange={setCustomerId}
        startDate={startDate}
        endDate={endDate}
        onStartDateChange={setStartDate}
        onEndDateChange={setEndDate}
      />

      {/* Table card */}
      <div className="flex flex-1 min-h-0 flex-col rounded-xl border bg-card">
        <div className="flex items-center justify-between border-b px-5 py-3">
          <p className="text-xs text-muted-foreground tabular-nums">
            {totalCount === 0
              ? "No entries"
              : `Showing ${showingFrom}–${showingTo} of ${totalCount}`}
          </p>
        </div>

        <div className="flex-1 min-h-0">
          {isError ? (
            <div className="flex h-64 items-center justify-center px-5">
              <p className="text-sm text-destructive">
                Error loading entries: {error?.message || "Unknown error"}
              </p>
            </div>
          ) : isLoading ? (
            <div className="flex h-64 items-center justify-center">
              <Spinner className="h-6 w-6" />
            </div>
          ) : entries.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 py-16 text-center">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted text-muted-foreground">
                <IconReceipt className="h-5 w-5" />
              </div>
              <p className="text-sm font-medium text-foreground">
                No ledger entries match your filters
              </p>
              <p className="text-xs text-muted-foreground">
                Try clearing the customer or date filters.
              </p>
            </div>
          ) : (
            <DataTable
              data={entries}
              columns={columns}
              enableRowSelection={false}
              manualPagination={true}
              pageCount={data?.pagination.pages}
              pagination={pagination}
              onPaginationChange={setPagination}
              isFetching={isFetching}
            />
          )}
        </div>
      </div>
    </div>
  );
}
