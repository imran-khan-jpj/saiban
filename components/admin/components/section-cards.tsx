import { IconTrendingDown, IconTrendingUp } from "@tabler/icons-react";

import { SectionCard } from "./section-card";

export function SectionCards() {
  return (
    <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
      <SectionCard
        description="Total Revenue"
        value="$1,250.00"
        badgeIcon={<IconTrendingUp />}
        badgeText="+12.5%"
        badgeVariant="outline"
        footerTitle="Trending up this month"
        footerIcon={<IconTrendingUp className="size-4" />}
        footerDescription="Visitors for the last 6 months"
      />
      <SectionCard
        description="New Customers"
        value="1,234"
        badgeIcon={<IconTrendingDown />}
        badgeText="-20%"
        badgeVariant="outline"
        footerTitle="Down 20% this period"
        footerIcon={<IconTrendingDown className="size-4" />}
        footerDescription="Acquisition needs attention"
      />

      <SectionCard
        description="Active Accounts"
        value="45,678"
        badgeIcon={<IconTrendingUp />}
        badgeText="+12.5%"
        badgeVariant="outline"
        footerTitle="Strong user retention"
        footerIcon={<IconTrendingUp className="size-4" />}
        footerDescription="Engagement exceed targets"
      />
      <SectionCard
        description="Growth Rate"
        value="4.5%"
        badgeIcon={<IconTrendingUp />}
        badgeText="+4.5%"
        badgeVariant="outline"
        footerTitle="Steady performance increase"
        footerIcon={<IconTrendingUp className="size-4" />}
        footerDescription="Meets growth projections"
      />
    </div>
  );
}
