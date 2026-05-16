"use client";

import Link from "next/link";
import { Spinner } from "@/components/ui/spinner";
import { useGetAllCustomers } from "@/app/api/customers/use-get-all";
import { ADMIN_V2 } from "@/lib/admin-routes";
import { formatDate } from "@/lib/utils";

export function RecentCustomersCard() {
  const { data, isLoading } = useGetAllCustomers(1, 5, undefined, "recent");
  const customers = data?.data ?? [];

  return (
    <section className="rounded-xl border bg-card">
      <header className="flex items-baseline justify-between border-b px-5 py-4">
        <div>
          <h2 className="text-base font-semibold tracking-tight text-foreground">
            Recent customers
          </h2>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Newest accounts in the system
          </p>
        </div>
        <Link
          href={ADMIN_V2.customers}
          className="text-xs font-medium text-foreground/70 hover:text-foreground"
        >
          View all
        </Link>
      </header>
      <div className="px-5 py-2">
        {isLoading ? (
          <div className="flex h-32 items-center justify-center">
            <Spinner className="h-5 w-5" />
          </div>
        ) : customers.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">
            No customers yet
          </p>
        ) : (
          <ul className="divide-y">
            {customers.map((customer) => (
              <li key={customer._id} className="py-3">
                <Link
                  href={`/admin/v2/customers/${customer._id}`}
                  className="flex items-center justify-between gap-3 group"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-foreground group-hover:underline">
                      {customer.firstName} {customer.lastName}
                    </p>
                    {customer.email && (
                      <p className="mt-0.5 truncate text-xs text-muted-foreground">
                        {customer.email}
                      </p>
                    )}
                  </div>
                  <span className="shrink-0 text-xs font-medium tabular-nums text-muted-foreground">
                    {formatDate(customer.createdAt)}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
