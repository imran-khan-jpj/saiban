import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { ADMIN_HOME_PATH } from "@/lib/admin-routes";

export default async function Home() {
  const cookieStore = await cookies();
  const authToken = cookieStore.get("auth-token");

  if (!authToken) {
    redirect("/login");
  }

  redirect(ADMIN_HOME_PATH);
}
