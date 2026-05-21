import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const ORDER_STATUS_STYLES: Record<string, string> = {
  pending: "bg-orange-500 text-white hover:bg-orange-600",
  completed: "bg-green-600 text-white hover:bg-green-700",
  cancelled: "bg-red-600 text-white hover:bg-red-700",
};

const LEDGER_ENTRY_STYLES: Record<string, string> = {
  credit: "bg-green-600 text-white hover:bg-green-700",
  debit: "bg-red-600 text-white hover:bg-red-700",
};

const FALLBACK = "bg-gray-500 text-white";

type Variant = "order" | "ledger";

interface StatusBadgeProps {
  status: string;
  variant?: Variant;
  className?: string;
}

export function StatusBadge({
  status,
  variant = "order",
  className,
}: StatusBadgeProps) {
  const map = variant === "ledger" ? LEDGER_ENTRY_STYLES : ORDER_STATUS_STYLES;
  return (
    <Badge className={cn("capitalize", map[status] ?? FALLBACK, className)}>
      {status}
    </Badge>
  );
}
