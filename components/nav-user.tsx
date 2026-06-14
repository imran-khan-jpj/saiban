"use client";

import Link from "next/link";
import { IconLogout, IconSettings } from "@tabler/icons-react";

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
import { UserAvatar } from "@/components/account/user-avatar";
import { logout } from "@/lib/auth";
import { ADMIN_ROUTES } from "@/lib/admin-routes";
import { useApp } from "@/providers/app-provider";

interface NavUserProps {
  user?: {
    name: string;
    email: string;
    avatar: string;
  } | null;
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

  const menuContent = (
    <>
      <DropdownMenuLabel>
        <div className="flex flex-col gap-0.5">
          <p className="text-sm font-semibold tracking-tight">{displayName}</p>
          {displayEmail && (
            <p className="text-xs font-normal text-muted-foreground">
              {displayEmail}
            </p>
          )}
        </div>
      </DropdownMenuLabel>
      <DropdownMenuSeparator />
      <DropdownMenuItem asChild>
        <Link href={ADMIN_ROUTES.account}>
          <IconSettings className="mr-2 h-4 w-4" />
          Account settings
        </Link>
      </DropdownMenuItem>
      <DropdownMenuSeparator />
      <DropdownMenuItem
        onClick={handleLogout}
        className="text-destructive focus:text-destructive"
      >
        <IconLogout className="mr-2 h-4 w-4" />
        Log out
      </DropdownMenuItem>
    </>
  );

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="h-12 cursor-pointer gap-3 hover:bg-accent/50 data-[state=open]:bg-accent/50"
            >
              <UserAvatar name={displayName} />
              {state !== "collapsed" && (
                <div className="grid min-w-0 flex-1 text-left leading-tight">
                  <span className="truncate text-sm font-semibold tracking-tight">
                    {displayName}
                  </span>
                  {displayEmail && (
                    <span className="truncate text-xs text-muted-foreground">
                      {displayEmail}
                    </span>
                  )}
                </div>
              )}
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            side={state === "collapsed" ? "right" : "top"}
            align="end"
            className="w-56"
          >
            {menuContent}
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
