"use client";

import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import type { SidebarVersion } from "@/hooks/use-sidebar-version";

interface AdminShellProps {
  initialSidebarVersion: SidebarVersion;
  children: React.ReactNode;
}

/**
 * Client-side wrapper that owns the SidebarProvider context. Receives the
 * server-resolved sidebar version so the first client render already
 * matches the cookie value (no flash).
 */
export function AdminShell({
  initialSidebarVersion,
  children,
}: AdminShellProps) {
  return (
    <SidebarProvider>
      <AppSidebar initialVersion={initialSidebarVersion} />
      <SidebarInset className="h-screen overflow-hidden p-4 pt-2">
        {children}
      </SidebarInset>
    </SidebarProvider>
  );
}
