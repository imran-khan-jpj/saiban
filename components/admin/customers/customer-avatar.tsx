"use client";

import { cn } from "@/lib/utils";

interface CustomerAvatarProps {
  firstName: string;
  lastName?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const PALETTE = [
  "bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300",
  "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300",
  "bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300",
  "bg-purple-100 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300",
  "bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300",
  "bg-teal-100 text-teal-700 dark:bg-teal-950/40 dark:text-teal-300",
  "bg-indigo-100 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300",
  "bg-fuchsia-100 text-fuchsia-700 dark:bg-fuchsia-950/40 dark:text-fuchsia-300",
];

const SIZES = {
  sm: "h-7 w-7 text-[10px]",
  md: "h-9 w-9 text-xs",
  lg: "h-12 w-12 text-sm",
};

function hashString(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (h << 5) - h + s.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h);
}

function getInitials(firstName: string, lastName?: string): string {
  const f = (firstName || "").trim();
  const l = (lastName || "").trim();
  if (f && l) return `${f[0]}${l[0]}`.toUpperCase();
  if (f.length >= 2) return f.slice(0, 2).toUpperCase();
  if (f.length === 1) return f.toUpperCase();
  return "?";
}

export function CustomerAvatar({
  firstName,
  lastName,
  size = "md",
  className,
}: CustomerAvatarProps) {
  const seed = `${firstName}-${lastName ?? ""}`;
  const color = PALETTE[hashString(seed) % PALETTE.length];

  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center rounded-full font-semibold tracking-tight",
        SIZES[size],
        color,
        className,
      )}
      aria-hidden
    >
      {getInitials(firstName, lastName)}
    </div>
  );
}
