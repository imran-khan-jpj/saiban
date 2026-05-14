"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { IconChevronLeft, IconChevronRight } from "@tabler/icons-react";
import { formatDate } from "@/lib/utils";
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

export function CustomerTransactionsCard({
  transactions,
  transactionsData,
  isLoading,
  isError,
  page,
  onPageChange,
}: CustomerTransactionsCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Transaction History</CardTitle>
        <CardDescription>
          Recent transactions for this customer
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Spinner className="h-6 w-6" />
          </div>
        ) : isError ? (
          <p className="text-destructive text-center py-4">
            Error loading transactions
          </p>
        ) : transactions.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">
            No transactions found
          </p>
        ) : (
          <>
            <div className="rounded-md border">
              <Table>
                <TableHeader className="bg-muted">
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Source</TableHead>
                    <TableHead>Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.map((transaction) => (
                    <TableRow key={transaction._id}>
                      <TableCell className="text-muted-foreground text-sm">
                        {formatDate(transaction.createdAt)}
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={`capitalize ${
                            transaction.entryType === "debit"
                              ? "bg-red-600 text-white"
                              : "bg-green-600 text-white"
                          }`}
                        >
                          {transaction.entryType}
                        </Badge>
                      </TableCell>
                      <TableCell className="capitalize text-sm">
                        {transaction.sourceType}
                      </TableCell>
                      <TableCell
                        className={`font-medium ${
                          transaction.entryType === "debit"
                            ? "text-red-600"
                            : "text-green-600"
                        }`}
                      >
                        {transaction.entryType === "debit" ? "-" : "+"}PKR{" "}
                        {transaction.amount}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {transactionsData && transactionsData.pagination.pages > 1 && (
              <div className="flex items-center justify-between mt-4">
                <p className="text-sm text-muted-foreground">
                  Page {page} of {transactionsData.pagination.pages}
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
                        Math.min(transactionsData.pagination.pages, page + 1),
                      )
                    }
                    disabled={page === transactionsData.pagination.pages}
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
