"use client";

import Link from "next/link";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";

interface KpiCardProps {
  label: string;
  value: string | number;
  hint?: string;
  href?: string;
  isLoading?: boolean;
  emphasis?: "default" | "warn" | "danger";
}

const EMPHASIS: Record<NonNullable<KpiCardProps["emphasis"]>, string> = {
  default: "text-foreground",
  warn: "text-orange-600 dark:text-orange-500",
  danger: "text-red-600 dark:text-red-500",
};

export function KpiCard({
  label,
  value,
  hint,
  href,
  isLoading,
  emphasis = "default",
}: KpiCardProps) {
  const body = (
    <div
      className={cn(
        "rounded-xl border bg-card px-5 py-5 transition-colors",
        href && "hover:border-foreground/20 hover:bg-accent/30 cursor-pointer",
      )}
    >
      <p className="text-sm font-medium text-muted-foreground">{label}</p>
      {isLoading ? (
        <div className="mt-3 h-9 flex items-center">
          <Spinner className="h-4 w-4" />
        </div>
      ) : (
        <p
          className={cn(
            "mt-2 text-3xl font-semibold tabular-nums tracking-tight",
            EMPHASIS[emphasis],
          )}
        >
          {value}
        </p>
      )}
      {hint && (
        <p className="mt-1.5 text-xs text-muted-foreground">{hint}</p>
      )}
    </div>
  );

  return href ? <Link href={href}>{body}</Link> : body;
}
