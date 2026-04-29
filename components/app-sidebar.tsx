"use client";

import * as React from "react";
import {
  IconShoppingCart,
  IconDashboard,
  IconBoxSeam,
  IconBook2,
  IconUsers,
  IconInnerShadowTop,
  IconPackage,
} from "@tabler/icons-react";

import { NavMain } from "@/components/nav-main";
import { NavUser } from "@/components/nav-user";
import { useApp } from "@/providers/app-provider";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

const navMainItems = [
  {
    title: "Dashboard",
    url: "/admin/dashboard",
    icon: IconDashboard,
  },
  {
    title: "Products Management",
    url: "/admin/products",
    icon: IconPackage,
  },
  {
    title: "Customers Management",
    url: "/admin/customers",
    icon: IconUsers,
  },
  {
    title: "Orders Management",
    url: "/admin/orders",
    icon: IconShoppingCart,
  },
  {
    title: "Ledger Management",
    url: "/admin/ledgers",
    icon: IconBook2,
  },
];

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user } = useApp();

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:p-1.5!"
            >
              <a href="#">
                <IconInnerShadowTop className="size-5" />
                <span className="text-base font-semibold">Saiban</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navMainItems} />
        {/* <NavDocuments items={data.documents} /> */}
        {/* <NavSecondary items={data.navSecondary} className="mt-auto" /> */}
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
    </Sidebar>
  );
}
