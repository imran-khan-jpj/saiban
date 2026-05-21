import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Link from "next/link";

interface SectionCardProps {
  description: string;
  value: string | number;
  className?: string;
  href?: string;
  valueClassName?: string;
}

export const SectionCard = ({
  description,
  value,
  className,
  href,
  valueClassName,
}: SectionCardProps) => {
  const cardContent = (
    <Card
      className={`@container/card ${className || ""} ${href ? "cursor-pointer transition-all hover:shadow-md hover:border-primary/50" : ""}`}
    >
      <CardHeader className="pb-2">
        <CardDescription>{description}</CardDescription>
        <CardTitle
          className={`text-2xl font-semibold tabular-nums @[250px]/card:text-3xl ${valueClassName || ""}`}
        >
          {value}
        </CardTitle>
      </CardHeader>
    </Card>
  );

  if (href) {
    return <Link href={href}>{cardContent}</Link>;
  }

  return cardContent;
};
