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
import { AdminExperienceSwitcher } from "@/components/admin-experience-switcher";
import { useApp } from "@/providers/app-provider";
import { ADMIN_NAV_V2 } from "@/lib/admin-routes";
import type { SidebarVersion } from "@/hooks/use-sidebar-version";

import { NavMainV2 } from "./nav-main";
import { NavUserV2 } from "./nav-user";

const navMainItems = [
  { title: "Dashboard", url: ADMIN_NAV_V2[0].url, icon: IconDashboard },
  { title: "Products", url: ADMIN_NAV_V2[1].url, icon: IconPackage },
  { title: "Customers", url: ADMIN_NAV_V2[2].url, icon: IconUsers },
  { title: "Orders", url: ADMIN_NAV_V2[3].url, icon: IconShoppingCart },
  { title: "Ledger", url: ADMIN_NAV_V2[4].url, icon: IconBook2 },
];

export function AppSidebarV2({
  initialVersion = "v2",
  ...props
}: React.ComponentProps<typeof Sidebar> & {
  initialVersion?: SidebarVersion;
}) {
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
              <Link href={ADMIN_NAV_V2[0].url}>
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
        <AdminExperienceSwitcher initialVersion={initialVersion} />
        <NavMainV2 items={navMainItems} />
      </SidebarContent>

      <SidebarFooter>
        <NavUserV2 user={user} />
      </SidebarFooter>
    </Sidebar>
  );
}
