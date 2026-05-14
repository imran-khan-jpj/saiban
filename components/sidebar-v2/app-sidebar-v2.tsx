"use client";

import * as React from "react";
import Link from "next/link";
import {
  IconShoppingCart,
  IconDashboard,
  IconBook2,
  IconUsers,
  IconPackage,
  IconArrowBackUp,
} from "@tabler/icons-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { useApp } from "@/providers/app-provider";
import { useSidebarVersion } from "@/hooks/use-sidebar-version";

import { NavMainV2 } from "./nav-main";
import { NavUserV2 } from "./nav-user";

const navMainItems = [
  {
    title: "Dashboard",
    url: "/admin/dashboard",
    icon: IconDashboard,
  },
  {
    title: "Products",
    url: "/admin/products",
    icon: IconPackage,
  },
  {
    title: "Customers",
    url: "/admin/customers",
    icon: IconUsers,
  },
  {
    title: "Orders",
    url: "/admin/orders",
    icon: IconShoppingCart,
  },
  {
    title: "Ledger",
    url: "/admin/ledgers",
    icon: IconBook2,
  },
];

export function AppSidebarV2(props: React.ComponentProps<typeof Sidebar>) {
  const { user } = useApp();
  const { setVersion } = useSidebarVersion();
  const { state } = useSidebar();

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              size="lg"
              className="data-[slot=sidebar-menu-button]:p-2!"
            >
              <Link href="/admin/dashboard">
                <div className="flex aspect-square size-8 shrink-0 items-center justify-center rounded-md bg-foreground text-background">
                  <span className="text-base font-bold tracking-tight">S</span>
                </div>
                <div className="grid flex-1 text-left leading-tight">
                  <span className="text-sm font-semibold tracking-tight text-foreground">
                    Saiban
                  </span>
                  <span className="text-[11px] text-muted-foreground">
                    Homoeopathic Pharma
                  </span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <NavMainV2 items={navMainItems} />
      </SidebarContent>

      <SidebarFooter className="gap-1">
        {state !== "collapsed" && (
          <button
            type="button"
            onClick={() => setVersion("v1")}
            className="mx-2 mb-1 flex items-center justify-center gap-1.5 rounded-md border border-dashed border-foreground/15 px-2 py-1.5 text-[11px] font-medium text-muted-foreground transition-colors hover:border-foreground/30 hover:text-foreground"
          >
            <IconArrowBackUp className="size-3" />
            Switch to classic sidebar
          </button>
        )}
        <NavUserV2 user={user} />
      </SidebarFooter>
    </Sidebar>
  );
}
