"use client";

import { cn } from "@/lib/utils";

interface StockIndicatorProps {
  quantity: number;
  threshold: number;
}

type Status = "healthy" | "low" | "out";

const TONE: Record<Status, { dot: string; text: string; bar: string }> = {
  healthy: {
    dot: "bg-emerald-500",
    text: "text-foreground",
    bar: "bg-emerald-500/70",
  },
  low: {
    dot: "bg-orange-500",
    text: "text-orange-700 dark:text-orange-400",
    bar: "bg-orange-500/80",
  },
  out: {
    dot: "bg-red-500",
    text: "text-red-700 dark:text-red-400",
    bar: "bg-red-500/80",
  },
};

const LABEL: Record<Status, string> = {
  healthy: "In stock",
  low: "Low stock",
  out: "Out of stock",
};

export function StockIndicator({ quantity, threshold }: StockIndicatorProps) {
  const status: Status =
    quantity === 0 ? "out" : quantity <= threshold ? "low" : "healthy";

  const denominator = Math.max(threshold * 2, threshold + 1, quantity);
  const pct = Math.max(
    0,
    Math.min(100, Math.round((quantity / denominator) * 100)),
  );
  const tone = TONE[status];

  return (
    <div className="min-w-[100px]">
      <div className="flex items-baseline gap-2">
        <span className={cn("text-sm font-semibold tabular-nums", tone.text)}>
          {quantity}
        </span>
        <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
          <span className={cn("h-1.5 w-1.5 rounded-full", tone.dot)} />
          {LABEL[status]}
        </span>
      </div>
      <div className="mt-1.5 h-1 w-20 overflow-hidden rounded-full bg-muted">
        <div
          className={cn("h-full rounded-full transition-[width]", tone.bar)}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
