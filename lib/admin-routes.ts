export const ADMIN_ROUTES = {
  dashboard: "/admin/dashboard",
  products: "/admin/products",
  customers: "/admin/customers",
  orders: "/admin/orders",
  ledgers: "/admin/ledgers",
  account: "/admin/account",
} as const;

export const ADMIN_HOME_PATH = ADMIN_ROUTES.dashboard;

export const ADMIN_NAV = [
  { title: "Dashboard", url: ADMIN_ROUTES.dashboard },
  { title: "Products", url: ADMIN_ROUTES.products },
  { title: "Customers", url: ADMIN_ROUTES.customers },
  { title: "Orders", url: ADMIN_ROUTES.orders },
  { title: "Ledger", url: ADMIN_ROUTES.ledgers },
] as const;

/**
 * Rewrites legacy admin URLs so bookmarks keep working after routes were
 * flattened from /admin/v2/* to /admin/*.
 */
export function normalizeAdminPath(pathname: string): string {
  if (pathname.startsWith("/admin/v2")) {
    const rest = pathname.slice("/admin/v2".length);
    return rest ? `/admin${rest}` : ADMIN_HOME_PATH;
  }

  const legacyLedgerRecords = pathname.match(
    /^\/admin\/ledgers\/([^/]+)\/records\/?$/,
  );
  if (legacyLedgerRecords) {
    return `/admin/ledgers/${legacyLedgerRecords[1]}`;
  }

  return pathname;
}
