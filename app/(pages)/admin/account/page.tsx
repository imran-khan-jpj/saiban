import { AccountSettings } from "@/components/account";
import { SiteHeader } from "@/components/site-header";

export default function AccountPage() {
  return (
    <div className="flex h-full flex-col overflow-hidden">
      <SiteHeader title="Account" />
      <div className="flex-1 overflow-auto">
        <AccountSettings />
      </div>
    </div>
  );
}
