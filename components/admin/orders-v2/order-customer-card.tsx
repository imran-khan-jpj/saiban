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
      <header className="flex items-baseline justify-between gap-4 border-b px-5 py-4">
        <div>
          <h2 className="text-base font-semibold tracking-tight text-foreground">
            Customer
          </h2>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Who this order belongs to
          </p>
        </div>
        <Link
          href={`/admin/customers/v2/${customer._id}`}
          className="inline-flex items-center gap-1 text-xs font-medium text-foreground/70 hover:text-foreground"
        >
          View profile
          <IconArrowRight className="h-3 w-3" />
        </Link>
      </header>

      <div className="flex items-start gap-4 px-5 py-5">
        <CustomerAvatar
          firstName={customer.firstName}
          lastName={customer.lastName}
          size="lg"
        />
        <div className="min-w-0 flex-1">
          <Link
            href={`/admin/customers/v2/${customer._id}`}
            className="text-base font-semibold text-foreground hover:underline underline-offset-4"
          >
            {fullName}
          </Link>
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
    </section>
  );
}
