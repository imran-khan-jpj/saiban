"use client";

import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import {
  IconArrowDownRight,
  IconArrowUpRight,
  IconChevronLeft,
  IconChevronRight,
  IconReceipt,
} from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import { formatCurrency, formatDate } from "@/lib/utils";
import type {
  CustomerTransaction,
  GetCustomerTransactionsResponse,
} from "@/app/api/customers/use-get-customer-transactions";

interface CustomerTransactionsCardProps {
  transactions: CustomerTransaction[];
  transactionsData: GetCustomerTransactionsResponse | undefined;
  isLoading: boolean;
  isError: boolean;
  page: number;
  onPageChange: (next: number) => void;
}

const SOURCE_LABELS: Record<string, string> = {
  order: "Order",
  payment: "Payment",
  adjustment: "Balance adjustment",
  refund: "Refund",
};

export function CustomerTransactionsCard({
  transactions,
  transactionsData,
  isLoading,
  isError,
  page,
  onPageChange,
}: CustomerTransactionsCardProps) {
  const totalPages = transactionsData?.pagination.pages ?? 1;

  return (
    <section className="flex flex-col rounded-xl border bg-card">
      <header className="flex items-baseline justify-between gap-4 border-b px-5 py-4">
        <div>
          <h2 className="text-base font-semibold tracking-tight text-foreground">
            Transaction history
          </h2>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Every debit and credit on this customer&apos;s ledger
          </p>
        </div>
      </header>

      <div className="flex-1 px-5 py-3">
        {isLoading ? (
          <div className="flex h-32 items-center justify-center">
            <Spinner className="h-5 w-5" />
          </div>
        ) : isError ? (
          <p className="py-8 text-center text-sm text-destructive">
            Could not load transactions
          </p>
        ) : transactions.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 py-10 text-center">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted text-muted-foreground">
              <IconReceipt className="h-5 w-5" />
            </div>
            <p className="text-sm font-medium text-foreground">
              No transactions yet
            </p>
            <p className="text-xs text-muted-foreground">
              Orders, payments, and adjustments will appear here.
            </p>
          </div>
        ) : (
          <ul className="divide-y">
            {transactions.map((tx) => {
              const isDebit = tx.entryType === "debit";
              const note = (tx.note ?? "").trim();
              return (
                <li key={tx._id} className="py-3">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={cn(
                          "flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
                          isDebit
                            ? "bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-300"
                            : "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300",
                        )}
                      >
                        {isDebit ? (
                          <IconArrowUpRight className="h-4 w-4" />
                        ) : (
                          <IconArrowDownRight className="h-4 w-4" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-foreground">
                          {SOURCE_LABELS[tx.sourceType] ?? tx.sourceType}
                        </p>
                        <p className="text-xs text-muted-foreground tabular-nums">
                          {formatDate(tx.createdAt)} · {isDebit ? "Debit" : "Credit"}
                        </p>
                        {note.length > 0 && (
                          <p
                            className="mt-1 truncate text-xs text-muted-foreground/90"
                            title={note}
                          >
                            {note}
                          </p>
                        )}
                      </div>
                    </div>
                    <span
                      className={cn(
                        "shrink-0 text-sm font-semibold tabular-nums tracking-tight",
                        isDebit
                          ? "text-red-700 dark:text-red-400"
                          : "text-emerald-700 dark:text-emerald-400",
                      )}
                    >
                      {isDebit ? "−" : "+"}
                      {formatCurrency(tx.amount)}
                    </span>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {totalPages > 1 && (
        <footer className="flex items-center justify-between border-t px-5 py-3">
          <p className="text-xs text-muted-foreground tabular-nums">
            Page {page} of {totalPages}
          </p>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-muted-foreground hover:text-foreground"
              onClick={() => onPageChange(Math.max(1, page - 1))}
              disabled={page === 1}
            >
              <IconChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-muted-foreground hover:text-foreground"
              onClick={() => onPageChange(Math.min(totalPages, page + 1))}
              disabled={page === totalPages}
            >
              <IconChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </footer>
      )}
    </section>
  );
}
