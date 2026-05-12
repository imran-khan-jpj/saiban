"use client";

import { type Icon } from "@tabler/icons-react";
import { usePathname } from "next/navigation";
import Link from "next/link";

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

interface NavItem {
  title: string;
  url: string;
  icon?: Icon;
}

export function NavMainV2({ items }: { items: NavItem[] }) {
  const pathname = usePathname();

  return (
    <SidebarGroup className="px-2 py-3">
      <SidebarGroupContent>
        <SidebarMenu className="gap-0.5">
          {items.map((item) => {
            // Active when on the exact route or any nested route (including v2).
            const isActive =
              pathname === item.url || pathname.startsWith(item.url + "/");
            return (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton
                  tooltip={item.title}
                  asChild
                  className={cn(
                    "h-9 gap-3 rounded-md text-sm font-medium text-muted-foreground transition-colors",
                    "hover:bg-accent hover:text-foreground",
                    isActive &&
                      "bg-accent text-foreground font-semibold hover:bg-accent",
                  )}
                >
                  <Link href={item.url}>
                    {item.icon && (
                      <item.icon
                        className={cn(
                          "size-4 shrink-0",
                          isActive
                            ? "text-foreground"
                            : "text-muted-foreground",
                        )}
                      />
                    )}
                    <span>{item.title}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
