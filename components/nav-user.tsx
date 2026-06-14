"use client";

import { IconLogout } from "@tabler/icons-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { logout } from "@/lib/auth";
import { useApp } from "@/providers/app-provider";
import { cn } from "@/lib/utils";

interface NavUserProps {
  user?: {
    name: string;
    email: string;
    avatar: string;
  } | null;
}

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

function UserAvatar({ name, className }: { name: string; className?: string }) {
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

export function NavUser({ user }: NavUserProps) {
  const { setUser } = useApp();
  const { state } = useSidebar();

  const handleLogout = () => {
    setUser(null);
    logout();
  };

  const displayName = user?.name?.trim() || "Account";
  const displayEmail = user?.email ?? "";

  if (state === "collapsed") {
    return (
      <SidebarMenu>
        <SidebarMenuItem>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <SidebarMenuButton size="lg" className="cursor-pointer">
                <UserAvatar name={displayName} />
              </SidebarMenuButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent side="right" align="end" className="w-56">
              <DropdownMenuLabel>
                <div className="flex flex-col gap-0.5">
                  <p className="text-sm font-semibold tracking-tight">
                    {displayName}
                  </p>
                  {displayEmail && (
                    <p className="text-xs font-normal text-muted-foreground">
                      {displayEmail}
                    </p>
                  )}
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={handleLogout}
                className="text-destructive focus:text-destructive"
              >
                <IconLogout className="mr-2 h-4 w-4" />
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarMenuItem>
      </SidebarMenu>
    );
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton size="lg" className="h-12 gap-3 hover:bg-accent/50">
          <UserAvatar name={displayName} />
          <div className="grid flex-1 text-left leading-tight min-w-0">
            <span className="truncate text-sm font-semibold tracking-tight">
              {displayName}
            </span>
            {displayEmail && (
              <span className="truncate text-xs text-muted-foreground">
                {displayEmail}
              </span>
            )}
          </div>
          <TooltipProvider delayDuration={300}>
            <Tooltip>
              <TooltipTrigger asChild>
                <div
                  role="button"
                  tabIndex={0}
                  aria-label="Log out"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleLogout();
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      e.stopPropagation();
                      handleLogout();
                    }
                  }}
                  className="ml-auto flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive cursor-pointer"
                >
                  <IconLogout className="size-4" />
                </div>
              </TooltipTrigger>
              <TooltipContent side="top">
                <p>Log out</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
