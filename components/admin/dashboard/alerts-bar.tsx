"use client";

import Link from "next/link";
import { IconAlertTriangle, IconArrowRight } from "@tabler/icons-react";
import { cn } from "@/lib/utils";

interface AlertItem {
  label: string;
  count: number;
  href: string;
  tone: "danger" | "warn" | "info";
}

interface AlertsBarProps {
  alerts: AlertItem[];
}

const TONES: Record<AlertItem["tone"], string> = {
  danger:
    "border-red-200 bg-red-50 text-red-700 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-300",
  warn: "border-orange-200 bg-orange-50 text-orange-800 dark:border-orange-900/40 dark:bg-orange-950/30 dark:text-orange-300",
  info: "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-900/40 dark:bg-blue-950/30 dark:text-blue-300",
};

export function AlertsBar({ alerts }: AlertsBarProps) {
  const visible = alerts.filter((a) => a.count > 0);
  if (visible.length === 0) return null;

  return (
    <div className="flex items-center gap-3 rounded-xl border bg-card p-3">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-orange-100 text-orange-600 dark:bg-orange-950/40 dark:text-orange-400">
        <IconAlertTriangle className="h-4 w-4" />
      </div>
      <p className="hidden text-sm font-semibold text-foreground sm:block">
        Needs your attention
      </p>
      <div className="flex flex-1 flex-wrap items-center gap-2">
        {visible.map((a) => (
          <Link
            key={a.label}
            href={a.href}
            className={cn(
              "group inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition-colors",
              TONES[a.tone],
            )}
          >
            <span className="font-semibold tabular-nums">{a.count}</span>
            <span>{a.label}</span>
            <IconArrowRight className="h-3 w-3 opacity-0 transition-opacity group-hover:opacity-100" />
          </Link>
        ))}
      </div>
    </div>
  );
}
