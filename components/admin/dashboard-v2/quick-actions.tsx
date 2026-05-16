"use client";

import Link from "next/link";
import {
  IconShoppingCart,
  IconUserPlus,
  IconPackage,
  IconChevronRight,
} from "@tabler/icons-react";
import { cn } from "@/lib/utils";

const ACTIONS = [
  {
    label: "Create order",
    description: "Bill a customer",
    href: "/admin/v2/orders",
    icon: IconShoppingCart,
  },
  {
    label: "Add customer",
    description: "Register a new account",
    href: "/admin/v2/customers",
    icon: IconUserPlus,
  },
  {
    label: "Add product",
    description: "Expand inventory",
    href: "/admin/v2/products",
    icon: IconPackage,
  },
];

export function QuickActions({ className }: { className?: string }) {
  return (
    <div className={cn("grid gap-3 sm:grid-cols-3", className)}>
      {ACTIONS.map((action) => {
        const Icon = action.icon;
        return (
          <Link
            key={action.label}
            href={action.href}
            className="group flex items-center justify-between rounded-xl border bg-card px-4 py-3 transition-colors hover:border-foreground/20 hover:bg-accent/30"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted text-foreground/70 group-hover:text-foreground">
                <Icon className="h-4 w-4" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">
                  {action.label}
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {action.description}
                </p>
              </div>
            </div>
            <IconChevronRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
          </Link>
        );
      })}
    </div>
  );
}
