import { readSidebarVersion } from "@/lib/sidebar-version-server";
import { AdminShell } from "./admin-shell";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const initialSidebarVersion = await readSidebarVersion();

  return (
    <AdminShell initialSidebarVersion={initialSidebarVersion}>
      {children}
    </AdminShell>
  );
}
