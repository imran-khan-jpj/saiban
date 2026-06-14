"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  IconCash,
  IconCheck,
  IconDots,
  IconEye,
  IconX,
} from "@tabler/icons-react";

interface OrderRowActionsProps {
  status: string;
  onView: () => void;
  onRecordPayment: () => void;
  onConfirm: () => void;
  onCancel: () => void;
}

export function OrderRowActions({
  status,
  onView,
  onRecordPayment,
  onConfirm,
  onCancel,
}: OrderRowActionsProps) {
  const isPending = status === "pending";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-muted-foreground hover:text-foreground"
          aria-label="Row actions"
        >
          <IconDots className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem onClick={onView}>
          <IconEye className="mr-2 h-4 w-4" />
          Open order
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onRecordPayment}>
          <IconCash className="mr-2 h-4 w-4" />
          Record payment
        </DropdownMenuItem>
        {isPending && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={onConfirm}
              className="text-emerald-700 focus:text-emerald-700 dark:text-emerald-400"
            >
              <IconCheck className="mr-2 h-4 w-4" />
              Confirm order
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={onCancel}
              className="text-destructive focus:text-destructive"
            >
              <IconX className="mr-2 h-4 w-4" />
              Cancel order
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
