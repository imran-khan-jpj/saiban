"use client";

import * as React from "react";
import {
  IconShoppingCart,
  IconDashboard,
  IconBook2,
  IconUsers,
  IconInnerShadowTop,
  IconPackage,
} from "@tabler/icons-react";

import { NavMain } from "@/components/nav-main";
import { NavUser } from "@/components/nav-user";
import { AdminExperienceSwitcher } from "@/components/admin-experience-switcher";
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
import {
  useSidebarVersion,
  type SidebarVersion,
} from "@/hooks/use-sidebar-version";
import { ADMIN_NAV_V1 } from "@/lib/admin-routes";
import { AppSidebarV2 } from "@/components/sidebar-v2/app-sidebar-v2";

const navMainItems = [
  { title: "Dashboard", url: ADMIN_NAV_V1[0].url, icon: IconDashboard },
  {
    title: "Products Management",
    url: ADMIN_NAV_V1[1].url,
    icon: IconPackage,
  },
  {
    title: "Customers Management",
    url: ADMIN_NAV_V1[2].url,
    icon: IconUsers,
  },
  {
    title: "Orders Management",
    url: ADMIN_NAV_V1[3].url,
    icon: IconShoppingCart,
  },
  { title: "Ledger Management", url: ADMIN_NAV_V1[4].url, icon: IconBook2 },
];

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  initialVersion?: SidebarVersion;
}

/**
 * Top-level sidebar entry point. Picks v1 (default) or the experimental v2
 * sidebar based on the user's preference (read from a cookie on the server
 * and passed in as `initialVersion`, then synced live as the user toggles).
 */
export function AppSidebar({
  initialVersion = "v1",
  ...props
}: AppSidebarProps) {
  const { version } = useSidebarVersion(initialVersion);

  if (version === "v2") {
    return <AppSidebarV2 initialVersion={initialVersion} {...props} />;
  }
  return <AppSidebarV1 initialVersion={initialVersion} {...props} />;
}

function AppSidebarV1({
  initialVersion = "v1",
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
      <SidebarContent className="gap-2">
        <AdminExperienceSwitcher initialVersion={initialVersion} />
        <NavMain items={navMainItems} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
    </Sidebar>
  );
}
