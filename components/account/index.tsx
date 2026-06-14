"use client";

import { ProfileForm } from "@/components/account/profile-form";
import { ChangePasswordForm } from "@/components/account/change-password-form";
import { useApp } from "@/providers/app-provider";
import { UserAvatar } from "@/components/account/user-avatar";

export function AccountSettings() {
  const { user } = useApp();

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6 p-4 md:p-6">
      <div className="flex items-center gap-4">
        <UserAvatar name={user?.name ?? "Account"} className="size-14 text-base" />
        <div>
          <h2 className="text-lg font-semibold tracking-tight">
            {user?.name ?? "Account"}
          </h2>
          <p className="text-sm text-muted-foreground">{user?.email}</p>
        </div>
      </div>

      <ProfileForm />
      <ChangePasswordForm />
    </div>
  );
}
