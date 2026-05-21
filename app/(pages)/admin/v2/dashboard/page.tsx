import { DashboardV2 } from "@/components/admin/dashboard-v2";
import { SiteHeader } from "@/components/site-header";

export default function DashboardV2Page() {
  return (
    <div className="flex h-full flex-col overflow-hidden">
      <SiteHeader title="Dashboard" />
      <div className="flex-1 overflow-auto">
        <DashboardV2 />
      </div>
    </div>
  );
}
