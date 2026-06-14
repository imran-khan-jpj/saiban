"use client";

import * as React from "react";
import Link from "next/link";
import {
  IconShoppingCart,
  IconDashboard,
  IconBook2,
  IconUsers,
  IconPackage,
} from "@tabler/icons-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { useApp } from "@/providers/app-provider";
import { ADMIN_NAV } from "@/lib/admin-routes";
import { NavMain } from "@/components/nav-main";
import { NavUser } from "@/components/nav-user";

const navMainItems = [
  { title: "Dashboard", url: ADMIN_NAV[0].url, icon: IconDashboard },
  { title: "Products", url: ADMIN_NAV[1].url, icon: IconPackage },
  { title: "Customers", url: ADMIN_NAV[2].url, icon: IconUsers },
  { title: "Orders", url: ADMIN_NAV[3].url, icon: IconShoppingCart },
  { title: "Ledger", url: ADMIN_NAV[4].url, icon: IconBook2 },
];

export function AppSidebar(props: React.ComponentProps<typeof Sidebar>) {
  const { user } = useApp();

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
              <Link href={ADMIN_NAV[0].url}>
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

      <SidebarContent className="gap-2">
        <NavMain items={navMainItems} />
      </SidebarContent>

      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
    </Sidebar>
  );
}
