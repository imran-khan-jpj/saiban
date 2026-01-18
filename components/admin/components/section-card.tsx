import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { IconTrendingUp } from "@tabler/icons-react";
import React from "react";

interface SectionCardProps {
  description: string;
  value: string | number;
  badgeIcon?: React.ReactNode;
  badgeText: string;
  badgeVariant?: "default" | "secondary" | "destructive" | "outline";
  footerTitle: string;
  footerIcon?: React.ReactNode;
  footerDescription?: string;
  className?: string;
}

export const SectionCard = ({
  description,
  value,
  badgeIcon = <IconTrendingUp />,
  badgeText,
  badgeVariant = "outline",
  footerTitle,
  footerIcon = <IconTrendingUp className="size-4" />,
  footerDescription,
  className,
}: SectionCardProps) => {
  return (
    <Card className={`@container/card ${className || ""}`}>
      <CardHeader>
        <CardDescription>{description}</CardDescription>
        <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
          {value}
        </CardTitle>
        <CardAction>
          <Badge variant={badgeVariant}>
            {badgeIcon}
            {badgeText}
          </Badge>
        </CardAction>
      </CardHeader>
      <CardFooter className="flex-col items-start gap-1.5 text-sm">
        <div className="line-clamp-1 flex gap-2 font-medium">
          {footerTitle} {footerIcon}
        </div>
        {footerDescription && (
          <div className="text-muted-foreground">{footerDescription}</div>
        )}
      </CardFooter>
    </Card>
  );
};
