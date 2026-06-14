import { cn } from "@/lib/utils";

const PALETTE = [
  "bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300",
  "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300",
  "bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300",
  "bg-purple-100 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300",
  "bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300",
  "bg-teal-100 text-teal-700 dark:bg-teal-950/40 dark:text-teal-300",
  "bg-indigo-100 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300",
];

function hashString(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (h << 5) - h + s.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h);
}

export function UserAvatar({
  name,
  className,
}: {
  name: string;
  className?: string;
}) {
  const initials = (name.slice(0, 2) || "U").toUpperCase();
  const color = PALETTE[hashString(name || "user") % PALETTE.length];

  return (
    <div
      aria-hidden
      className={cn(
        "flex aspect-square size-8 shrink-0 items-center justify-center rounded-md text-xs font-semibold tracking-tight",
        color,
        className,
      )}
    >
      {initials}
    </div>
  );
}
