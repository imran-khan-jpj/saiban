"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import {
  IconArrowDownRight,
  IconArrowLeft,
  IconArrowRight,
  IconArrowUpRight,
  IconCash,
  IconMail,
  IconMapPin,
  IconPhone,
  IconReceipt,
  IconScale,
  IconShoppingCart,
} from "@tabler/icons-react";
import dayjs from "dayjs";

import { DataTable } from "@/components/data-table";
import { useGetCustomerById } from "@/app/api/customers/use-get-by-id";
import {
  useGetCustomerLedgerEntries,
  type CustomerLedgerEntry,
} from "@/app/api/ledgers/use-get-customer-entries";
import { CustomerAvatar } from "@/components/admin/customers-v2/customer-avatar";
import { formatCurrency, formatDate } from "@/lib/utils";
import { cn } from "@/lib/utils";

import { RecordsToolbar } from "./records-toolbar";

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

const BALANCE_TONE: Record<string, { dot: string; pill: string }> = {
  settled: {
    dot: "bg-gray-400",
    pill: "bg-gray-100 text-gray-700 dark:bg-gray-900/40 dark:text-gray-300",
  },
  we_owe_customer: {
    dot: "bg-emerald-500",
    pill:
      "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300",
  },
  customer_owes: {
    dot: "bg-red-500",
    pill: "bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-300",
  },
};

const BALANCE_LABEL: Record<string, string> = {
  settled: "Settled",
  we_owe_customer: "Advance",
  customer_owes: "Pending payment",
};

interface CustomerLedgerRecordsV2Props {
  customerId: string;
}

export function CustomerLedgerRecordsV2({
  customerId,
}: CustomerLedgerRecordsV2Props) {
  const router = useRouter();
  const [startDate, setStartDate] = React.useState<Date | undefined>();
  const [endDate, setEndDate] = React.useState<Date | undefined>();
  const [pagination, setPagination] = React.useState({
    pageIndex: 0,
    pageSize: 10,
  });

  React.useEffect(() => {
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
  }, [startDate, endDate]);

  const { data: customer, isLoading: isLoadingCustomer } =
    useGetCustomerById(customerId);

  const { data, isLoading, isFetching, isError, error } =
    useGetCustomerLedgerEntries(
      customerId,
      pagination.pageIndex + 1,
      pagination.pageSize,
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

  const columns = React.useMemo<
    ColumnDef<CustomerLedgerEntry & { id: string }>[]
  >(
    () => [
      {
        accessorKey: "sourceType",
        header: "Source",
        size: 240,
        cell: ({ row }) => {
          const Icon = SOURCE_ICONS[row.original.sourceType] ?? IconReceipt;
          const label =
            SOURCE_LABELS[row.original.sourceType] ?? row.original.sourceType;
          return (
            <div className="flex items-center gap-2 text-sm">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-muted text-muted-foreground">
                <Icon className="h-3.5 w-3.5" />
              </span>
              <span className="capitalize">{label}</span>
            </div>
          );
        },
      },
      {
        accessorKey: "createdAt",
        header: "Date",
        size: 160,
        cell: ({ row }) => (
          <div className="text-xs text-muted-foreground tabular-nums">
            {formatDate(row.original.createdAt)}
          </div>
        ),
      },
      {
        accessorKey: "entryType",
        header: "Type",
        size: 130,
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
        size: 240,
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
    [],
  );

  const totalCount = data?.pagination.total ?? 0;
  const showingFrom =
    entries.length === 0 ? 0 : pagination.pageIndex * pagination.pageSize + 1;
  const showingTo = pagination.pageIndex * pagination.pageSize + entries.length;

  const fullName = customer
    ? `${customer.firstName} ${customer.lastName ?? ""}`.trim()
    : "";
  const address = customer
    ? [customer.streetAddress, customer.city, customer.state]
        .filter(Boolean)
        .join(", ")
    : "";

  if (isLoadingCustomer) {
    return (
      <div className="flex items-center justify-center py-20">
        <Spinner className="h-6 w-6" />
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-[1400px] flex-col gap-6 px-4 pb-10 pt-6 sm:px-6">
      {/* Back link */}
      <Link
        href="/admin/v2/ledgers"
        className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors w-fit"
        onClick={(e) => {
          e.preventDefault();
          router.push("/admin/v2/ledgers");
        }}
      >
        <IconArrowLeft className="h-3.5 w-3.5" />
        All ledgers
      </Link>

      {/* Customer header */}
      {customer && (
        <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-4 min-w-0">
            <CustomerAvatar
              firstName={customer.firstName}
              lastName={customer.lastName}
              size="lg"
            />
            <div className="min-w-0">
              <p className="text-xs font-medium text-muted-foreground">
                Customer ledger
              </p>
              <h1
                className="mt-1 text-2xl font-semibold tracking-tight text-foreground truncate"
                title={fullName}
              >
                {fullName}
              </h1>
              <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-sm text-muted-foreground">
                {customer.phoneNumber && (
                  <a
                    href={`tel:${customer.phoneNumber}`}
                    className="inline-flex items-center gap-1.5 tabular-nums hover:text-foreground transition-colors"
                  >
                    <IconPhone className="h-3.5 w-3.5" />
                    {customer.phoneNumber}
                  </a>
                )}
                {customer.email && (
                  <a
                    href={`mailto:${customer.email}`}
                    className="inline-flex items-center gap-1.5 hover:text-foreground transition-colors"
                  >
                    <IconMail className="h-3.5 w-3.5" />
                    {customer.email}
                  </a>
                )}
                {address && (
                  <span className="inline-flex items-center gap-1.5">
                    <IconMapPin className="h-3.5 w-3.5" />
                    {address}
                  </span>
                )}
              </div>
            </div>
          </div>

          <Button asChild variant="outline" size="sm">
            <Link href={`/admin/v2/customers/${customer._id}`}>
              View customer profile
              <IconArrowRight className="h-3.5 w-3.5 ml-1" />
            </Link>
          </Button>
        </header>
      )}

      {/* Balance hero card */}
      {customer && customer.balance && (
        <BalanceHero
          amount={customer.balance.absoluteAmount}
          direction={customer.balance.direction}
        />
      )}

      <RecordsToolbar
        startDate={startDate}
        endDate={endDate}
        onStartDateChange={setStartDate}
        onEndDateChange={setEndDate}
      />

      {/* Records table */}
      <div className="flex flex-1 min-h-0 flex-col rounded-xl border bg-card">
        <div className="flex items-center justify-between border-b px-5 py-3">
          <p className="text-xs text-muted-foreground tabular-nums">
            {totalCount === 0
              ? "No records"
              : `Showing ${showingFrom}–${showingTo} of ${totalCount}`}
          </p>
        </div>

        <div className="flex-1 min-h-0">
          {isError ? (
            <div className="flex h-64 items-center justify-center px-5">
              <p className="text-sm text-destructive">
                Error loading records: {error?.message || "Unknown error"}
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
                No ledger records yet
              </p>
              <p className="text-xs text-muted-foreground">
                Orders, payments, and adjustments will appear here.
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

interface BalanceHeroProps {
  amount: number;
  direction: string;
}

function BalanceHero({ amount, direction }: BalanceHeroProps) {
  const tone = BALANCE_TONE[direction] ?? BALANCE_TONE.settled;
  const label = BALANCE_LABEL[direction] ?? "Settled";
  const isOwed = direction === "customer_owes";

  return (
    <section className="rounded-xl border bg-card px-6 py-5">
      <div className="flex items-baseline justify-between gap-3">
        <p className="text-sm font-medium text-muted-foreground">
          Current balance
        </p>
        <span
          className={cn(
            "inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[10px] font-medium",
            tone.pill,
          )}
        >
          <span className={cn("h-1.5 w-1.5 rounded-full", tone.dot)} />
          {label}
        </span>
      </div>
      <p
        className={cn(
          "mt-2 text-3xl font-semibold tabular-nums tracking-tight",
          isOwed && "text-red-600 dark:text-red-500",
        )}
      >
        {formatCurrency(amount)}
      </p>
    </section>
  );
}
