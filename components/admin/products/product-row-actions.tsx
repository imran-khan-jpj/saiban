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
  IconDots,
  IconEye,
  IconPencil,
  IconTrash,
} from "@tabler/icons-react";

interface ProductRowActionsProps {
  onView: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export function ProductRowActions({
  onView,
  onEdit,
  onDelete,
}: ProductRowActionsProps) {
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
      <DropdownMenuContent align="end" className="w-40">
        <DropdownMenuItem onClick={onView}>
          <IconEye className="mr-2 h-4 w-4" />
          View details
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onEdit}>
          <IconPencil className="mr-2 h-4 w-4" />
          Edit
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={onDelete}
          className="text-destructive focus:text-destructive"
        >
          <IconTrash className="mr-2 h-4 w-4" />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
