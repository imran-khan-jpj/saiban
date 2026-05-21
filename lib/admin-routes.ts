import type { SidebarVersion } from "@/hooks/use-sidebar-version";

export type AdminExperience = SidebarVersion;

export const ADMIN_V2_PREFIX = "/admin/v2";

const LIST_ROUTES = {
  dashboard: { v1: "/admin/dashboard", v2: `${ADMIN_V2_PREFIX}/dashboard` },
  products: { v1: "/admin/products", v2: `${ADMIN_V2_PREFIX}/products` },
  customers: { v1: "/admin/customers", v2: `${ADMIN_V2_PREFIX}/customers` },
  orders: { v1: "/admin/orders", v2: `${ADMIN_V2_PREFIX}/orders` },
  ledgers: { v1: "/admin/ledgers", v2: `${ADMIN_V2_PREFIX}/ledgers` },
} as const;

/** True when the pathname is an experimental v2 admin screen. */
export function isV2AdminPath(pathname: string): boolean {
  const normalized = normalizeAdminPath(pathname);
  return (
    normalized === ADMIN_V2_PREFIX ||
    normalized.startsWith(`${ADMIN_V2_PREFIX}/`)
  );
}

/**
 * Rewrites legacy suffix-style v2 URLs (/admin/dashboard/v2) to the canonical
 * prefix form (/admin/v2/dashboard) so bookmarks keep working.
 */
export function normalizeAdminPath(pathname: string): string {
  if (pathname.startsWith(`${ADMIN_V2_PREFIX}/`) || pathname === ADMIN_V2_PREFIX) {
    return pathname;
  }

  const legacyList = pathname.match(
    /^\/admin\/(dashboard|products|customers|orders|ledgers)\/v2\/?$/,
  );
  if (legacyList) {
    return `${ADMIN_V2_PREFIX}/${legacyList[1]}`;
  }

  const legacyDetail = pathname.match(
    /^\/admin\/(customers|orders)\/v2\/([^/]+)$/,
  );
  if (legacyDetail) {
    return `${ADMIN_V2_PREFIX}/${legacyDetail[1]}/${legacyDetail[2]}`;
  }

  const legacyLedger = pathname.match(/^\/admin\/ledgers\/v2\/([^/]+)$/);
  if (legacyLedger) {
    return `${ADMIN_V2_PREFIX}/ledgers/${legacyLedger[1]}`;
  }

  return pathname;
}

/**
 * Maps the current admin pathname to the equivalent route for the target
 * experience (classic v1 UI or experimental v2 UI).
 */
export function mapAdminPathToExperience(
  pathname: string,
  experience: AdminExperience,
): string {
  const path = normalizeAdminPath(pathname);
  const wantV2 = experience === "v2";

  const orderV2 = path.match(/^\/admin\/v2\/orders\/([^/]+)$/);
  if (orderV2) {
    return wantV2 ? path : `/admin/orders/${orderV2[1]}`;
  }

  const orderV1 = path.match(/^\/admin\/orders\/([^/]+)$/);
  if (orderV1) {
    return wantV2 ? `${ADMIN_V2_PREFIX}/orders/${orderV1[1]}` : path;
  }

  const customerV2 = path.match(/^\/admin\/v2\/customers\/([^/]+)$/);
  if (customerV2) {
    return wantV2 ? path : `/admin/customers/${customerV2[1]}`;
  }

  const customerV1 = path.match(/^\/admin\/customers\/([^/]+)$/);
  if (customerV1) {
    return wantV2 ? `${ADMIN_V2_PREFIX}/customers/${customerV1[1]}` : path;
  }

  const ledgerV2 = path.match(/^\/admin\/v2\/ledgers\/([^/]+)$/);
  if (ledgerV2) {
    return wantV2 ? path : `/admin/ledgers/${ledgerV2[1]}/records`;
  }

  const ledgerV1 = path.match(/^\/admin\/ledgers\/([^/]+)\/records$/);
  if (ledgerV1) {
    return wantV2 ? `${ADMIN_V2_PREFIX}/ledgers/${ledgerV1[1]}` : path;
  }

  for (const { v1, v2 } of Object.values(LIST_ROUTES)) {
    if (path === v1 || path === v2) {
      return wantV2 ? v2 : v1;
    }
  }

  return wantV2 ? LIST_ROUTES.dashboard.v2 : LIST_ROUTES.dashboard.v1;
}

export const ADMIN_NAV_V1 = [
  { title: "Dashboard", url: LIST_ROUTES.dashboard.v1 },
  { title: "Products Management", url: LIST_ROUTES.products.v1 },
  { title: "Customers Management", url: LIST_ROUTES.customers.v1 },
  { title: "Orders Management", url: LIST_ROUTES.orders.v1 },
  { title: "Ledger Management", url: LIST_ROUTES.ledgers.v1 },
] as const;

export const ADMIN_V2 = {
  dashboard: LIST_ROUTES.dashboard.v2,
  products: LIST_ROUTES.products.v2,
  customers: LIST_ROUTES.customers.v2,
  orders: LIST_ROUTES.orders.v2,
  ledgers: LIST_ROUTES.ledgers.v2,
} as const;

/** Default landing route for the given experience (used after login / root redirect). */
export function getAdminHomePath(experience: AdminExperience): string {
  return experience === "v2" ? ADMIN_V2.dashboard : LIST_ROUTES.dashboard.v1;
}

export const ADMIN_NAV_V2 = [
  { title: "Dashboard", url: ADMIN_V2.dashboard },
  { title: "Products", url: ADMIN_V2.products },
  { title: "Customers", url: ADMIN_V2.customers },
  { title: "Orders", url: ADMIN_V2.orders },
  { title: "Ledger", url: ADMIN_V2.ledgers },
] as const;
