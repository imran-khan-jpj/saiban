import { Dashboard } from "@/components/admin/dashboard";
import { SiteHeader } from "@/components/site-header";

export default function DashboardPage() {
  return (
    <div className="flex h-full flex-col overflow-hidden">
      <SiteHeader title="Dashboard" />
      <div className="flex-1 overflow-auto">
        <Dashboard />
      </div>
    </div>
  );
}
