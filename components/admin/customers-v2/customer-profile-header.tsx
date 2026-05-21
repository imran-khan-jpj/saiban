"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  IconArrowLeft,
  IconCash,
  IconMail,
  IconMapPin,
  IconPencil,
  IconPhone,
  IconScale,
} from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { CustomerAvatar } from "./customer-avatar";

interface CustomerProfileHeaderProps {
  firstName: string;
  lastName?: string;
  email?: string;
  phoneNumber?: string;
  streetAddress?: string;
  city?: string;
  state?: string;
  onEdit: () => void;
  onAdjustBalance: () => void;
  onRecordPayment: () => void;
}

export function CustomerProfileHeader({
  firstName,
  lastName,
  email,
  phoneNumber,
  streetAddress,
  city,
  state,
  onEdit,
  onAdjustBalance,
  onRecordPayment,
}: CustomerProfileHeaderProps) {
  const router = useRouter();
  const fullName = `${firstName} ${lastName ?? ""}`.trim();
  const address = [streetAddress, city, state].filter(Boolean).join(", ");

  return (
    <div className="flex flex-col gap-5">
      <Link
        href="/admin/v2/customers"
        className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
        onClick={(e) => {
          e.preventDefault();
          router.push("/admin/v2/customers");
        }}
      >
        <IconArrowLeft className="h-3.5 w-3.5" />
        All customers
      </Link>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-4 min-w-0">
          <CustomerAvatar
            firstName={firstName}
            lastName={lastName}
            size="lg"
          />
          <div className="min-w-0">
            <h1
              className="text-2xl font-semibold tracking-tight text-foreground truncate"
              title={fullName}
            >
              {fullName}
            </h1>
            <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-sm text-muted-foreground">
              {phoneNumber && (
                <a
                  href={`tel:${phoneNumber}`}
                  className="inline-flex items-center gap-1.5 tabular-nums hover:text-foreground transition-colors"
                >
                  <IconPhone className="h-3.5 w-3.5" />
                  {phoneNumber}
                </a>
              )}
              {email && (
                <a
                  href={`mailto:${email}`}
                  className="inline-flex items-center gap-1.5 hover:text-foreground transition-colors"
                >
                  <IconMail className="h-3.5 w-3.5" />
                  {email}
                </a>
              )}
              {address && (
                <span className="inline-flex items-center gap-1.5">
                  <IconMapPin className="h-3.5 w-3.5" />
                  {address}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" size="sm" onClick={onEdit}>
            <IconPencil className="h-4 w-4 mr-1.5" />
            Edit
          </Button>
          <Button variant="outline" size="sm" onClick={onAdjustBalance}>
            <IconScale className="h-4 w-4 mr-1.5" />
            Adjust balance
          </Button>
          <Button size="sm" onClick={onRecordPayment}>
            <IconCash className="h-4 w-4 mr-1.5" />
            Record payment
          </Button>
        </div>
      </div>
    </div>
  );
}
