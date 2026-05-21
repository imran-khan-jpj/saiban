"use client";

import Link from "next/link";
import {
  IconArrowRight,
  IconMail,
  IconMapPin,
  IconPhone,
} from "@tabler/icons-react";
import { CustomerAvatar } from "@/components/admin/customers-v2/customer-avatar";
import type { Order } from "@/app/api/orders/use-get-all";

interface OrderCustomerCardProps {
  customer: Order["customerId"];
}

export function OrderCustomerCard({ customer }: OrderCustomerCardProps) {
  const fullName = `${customer.firstName} ${customer.lastName ?? ""}`.trim();
  const address = [customer.streetAddress, customer.city, customer.state]
    .filter(Boolean)
    .join(", ");

  return (
    <section className="rounded-xl border bg-card">
      <header className="flex items-center justify-between gap-4 border-b px-5 py-3">
        <h2 className="text-base font-semibold tracking-tight text-foreground">
          Customer
        </h2>
        <Link
          href={`/admin/v2/customers/${customer._id}`}
          className="inline-flex items-center gap-1 text-xs font-medium text-foreground/70 hover:text-foreground"
        >
          View profile
          <IconArrowRight className="h-3 w-3" />
        </Link>
      </header>

      <div className="flex items-start gap-3 px-5 py-3">
        <CustomerAvatar
          firstName={customer.firstName}
          lastName={customer.lastName}
          size="md"
        />
        <div className="min-w-0 flex-1">
          <Link
            href={`/admin/v2/customers/${customer._id}`}
            className="text-sm font-medium text-foreground hover:underline underline-offset-4"
          >
            {fullName}
          </Link>
          <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
            {customer.phoneNumber && (
              <a
                href={`tel:${customer.phoneNumber}`}
                className="inline-flex items-center gap-1.5 tabular-nums hover:text-foreground transition-colors"
              >
                <IconPhone className="h-3 w-3" />
                {customer.phoneNumber}
              </a>
            )}
            {customer.email && (
              <a
                href={`mailto:${customer.email}`}
                className="inline-flex items-center gap-1.5 hover:text-foreground transition-colors"
              >
                <IconMail className="h-3 w-3" />
                {customer.email}
              </a>
            )}
            {address && (
              <span className="inline-flex items-center gap-1.5">
                <IconMapPin className="h-3 w-3" />
                {address}
              </span>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
