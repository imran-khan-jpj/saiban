"use client";

import * as React from "react";
import {
  IconShoppingCart,
  IconDashboard,
  IconBook2,
  IconUsers,
  IconInnerShadowTop,
  IconPackage,
  IconSparkles,
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
  useSidebar,
} from "@/components/ui/sidebar";
import {
  useSidebarVersion,
  type SidebarVersion,
} from "@/hooks/use-sidebar-version";
import { AppSidebarV2 } from "@/components/sidebar-v2/app-sidebar-v2";

const navMainItems = [
  { title: "Dashboard", url: "/admin/dashboard", icon: IconDashboard },
  { title: "Products Management", url: "/admin/products", icon: IconPackage },
  { title: "Customers Management", url: "/admin/customers", icon: IconUsers },
  {
    title: "Orders Management",
    url: "/admin/orders",
    icon: IconShoppingCart,
  },
  { title: "Ledger Management", url: "/admin/ledgers", icon: IconBook2 },
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
    return <AppSidebarV2 {...props} />;
  }
  return <AppSidebarV1 {...props} />;
}

function AppSidebarV1({ ...props }: React.ComponentProps<typeof Sidebar>) {
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
      </SidebarContent>
      <SidebarFooter className="gap-1">
        {state !== "collapsed" && (
          <button
            type="button"
            onClick={() => setVersion("v2")}
            className="mx-2 mb-1 inline-flex items-center justify-center gap-1.5 rounded-full border bg-card px-3 py-1 text-[11px] font-medium text-foreground/80 transition-colors hover:border-foreground/30 hover:text-foreground"
          >
            <IconSparkles className="size-3 text-emerald-500" />
            Try the new sidebar
          </button>
        )}
        <NavUser user={user} />
      </SidebarFooter>
    </Sidebar>
  );
}
