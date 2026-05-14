import { cookies } from "next/headers";

export type SidebarVersion = "v1" | "v2";

const COOKIE_KEY = "saiban-sidebar-version";

/**
 * Server-side reader for the user's chosen sidebar version. Used by the
 * admin layout (server component) so the first HTML sent to the browser
 * already matches the user's preference, removing the visual flash on
 * page reload.
 */
export async function readSidebarVersion(): Promise<SidebarVersion> {
  const cookieStore = await cookies();
  const value = cookieStore.get(COOKIE_KEY)?.value;
  return value === "v2" ? "v2" : "v1";
}
