"use client";

import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { SessionHydration } from "@/components/auth/session-hydration";

interface AdminShellProps {
  children: React.ReactNode;
}

export function AdminShell({ children }: AdminShellProps) {
  return (
    <SidebarProvider>
      <SessionHydration>
        <AppSidebar />
        <SidebarInset className="h-screen overflow-hidden p-4 pt-2">
          {children}
        </SidebarInset>
      </SessionHydration>
    </SidebarProvider>
  );
}
