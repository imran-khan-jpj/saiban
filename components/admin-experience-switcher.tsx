"use client";

import * as React from "react";
import { usePathname, useRouter } from "next/navigation";
import { IconSparkles, IconArrowBackUp } from "@tabler/icons-react";

import { mapAdminPathToExperience } from "@/lib/admin-routes";
import {
  useSidebarVersion,
  type SidebarVersion,
} from "@/hooks/use-sidebar-version";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

/**
 * Single control to opt into (or out of) the experimental Saiban experience:
 * v2 sidebar + v2 routes for dashboard, inventory, customers, orders, and ledger.
 */
export function AdminExperienceSwitcher({
  initialVersion = "v1",
}: {
  initialVersion?: SidebarVersion;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { version, setVersion } = useSidebarVersion(initialVersion);
  const { state } = useSidebar();
  const isV2 = version === "v2";

  const applyExperience = React.useCallback(
    (next: "v1" | "v2") => {
      setVersion(next);
      router.push(mapAdminPathToExperience(pathname, next));
    },
    [pathname, router, setVersion],
  );

  if (state === "collapsed") {
    return (
      <SidebarGroup className="p-0">
        <SidebarGroupContent>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                type="button"
                tooltip={
                  isV2 ? "Switch to classic Saiban" : "Try the new Saiban"
                }
                onClick={() => applyExperience(isV2 ? "v1" : "v2")}
              >
                {isV2 ? (
                  <IconArrowBackUp className="size-4" />
                ) : (
                  <IconSparkles className="size-4 text-emerald-500" />
                )}
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
    );
  }

  return (
    <SidebarGroup className="px-2 py-0">
      <SidebarGroupContent>
        <ExperienceCard
          isV2={isV2}
          checked={isV2}
          onCheckedChange={(checked) => applyExperience(checked ? "v2" : "v1")}
        />
      </SidebarGroupContent>
    </SidebarGroup>
  );
}

function ExperienceCard({
  isV2,
  checked,
  onCheckedChange,
}: {
  isV2: boolean;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}) {
  return (
    <div
      className={cn(
        "rounded-lg border px-3 py-2.5",
        isV2
          ? "border-dashed border-foreground/15 bg-transparent"
          : "border-foreground/10 bg-card",
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 space-y-0.5">
          <p className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
            {isV2 ? (
              <IconArrowBackUp className="size-3.5 shrink-0 text-muted-foreground" />
            ) : (
              <IconSparkles className="size-3.5 shrink-0 text-emerald-500" />
            )}
            {isV2 ? "New Saiban" : "Try the new Saiban"}
          </p>
          <p className="text-[11px] leading-snug text-muted-foreground">
            {isV2
              ? "Updated sidebar and pages. Turn off to return to classic."
              : "Switch sidebar and all admin pages to the redesigned experience."}
          </p>
        </div>
        <Switch
          checked={checked}
          onCheckedChange={onCheckedChange}
          aria-label={isV2 ? "Using new Saiban" : "Using classic Saiban"}
        />
      </div>
    </div>
  );
}


