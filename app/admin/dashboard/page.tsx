import { Dashboard } from "@/components/admin/dashboard";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  // Check if user is authenticated via cookie
  const cookieStore = await cookies();
  const authToken = cookieStore.get("auth-token")?.value;

  if (!authToken) {
    redirect("/login");
  }

  return <Dashboard />;
}
