import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { getAdminHomePath } from "@/lib/admin-routes";
import { readSidebarVersion } from "@/lib/sidebar-version-server";

export default async function Home() {
  const cookieStore = await cookies();
  const authToken = cookieStore.get("auth-token");

  if (!authToken) {
    redirect("/login");
  }

  const experience = await readSidebarVersion();
  redirect(getAdminHomePath(experience));
}
