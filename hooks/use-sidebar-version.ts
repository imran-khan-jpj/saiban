"use client";

import * as React from "react";
import Cookies from "js-cookie";

const COOKIE_KEY = "saiban-sidebar-version";
const CHANGE_EVENT = "saiban:sidebar-version-change";
const COOKIE_MAX_AGE_DAYS = 365;

export type SidebarVersion = "v1" | "v2";

const isValidVersion = (v: string | null | undefined): v is SidebarVersion =>
  v === "v1" || v === "v2";

/**
 * Tracks whether the user has opted into the experimental v2 experience
 * (sidebar + v2 admin routes). Persisted via cookie.
 *
 * Persisted in a cookie (not localStorage) so the value is also available
 * on the server. The admin layout reads this cookie via `next/headers`
 * and passes `initialVersion` down so the first server-rendered HTML
 * already matches the user's choice — eliminating the v1→v2 flash on
 * page reload.
 *
 * In-tab updates: `setVersion` writes the cookie AND dispatches a custom
 * event. Every hook instance listens for it so all sidebar copies stay
 * in sync the moment the toggle is clicked.
 *
 * Cross-tab updates: cookies don't fire `storage` events; we poll the
 * cookie on `visibilitychange` instead, which is enough for the
 * experimental opt-in case.
 */
export function useSidebarVersion(initialVersion: SidebarVersion = "v1"): {
  version: SidebarVersion;
  setVersion: (v: SidebarVersion) => void;
} {
  const [version, setVersionState] = React.useState<SidebarVersion>(
    initialVersion,
  );

  React.useEffect(() => {
    if (typeof window === "undefined") return;

    // Reconcile against the live cookie in case it changed (e.g. another tab).
    const stored = Cookies.get(COOKIE_KEY);
    if (isValidVersion(stored) && stored !== version) {
      setVersionState(stored);
    }

    const handleInTabChange = (event: Event) => {
      const next = (event as CustomEvent<SidebarVersion>).detail;
      if (isValidVersion(next)) setVersionState(next);
    };

    const handleVisibility = () => {
      if (document.visibilityState !== "visible") return;
      const fresh = Cookies.get(COOKIE_KEY);
      if (isValidVersion(fresh)) setVersionState(fresh);
    };

    window.addEventListener(CHANGE_EVENT, handleInTabChange);
    document.addEventListener("visibilitychange", handleVisibility);
    return () => {
      window.removeEventListener(CHANGE_EVENT, handleInTabChange);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
    // We intentionally only run this effect once on mount; the live cookie
    // reconciliation here is a one-time correction.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setVersion = React.useCallback((next: SidebarVersion) => {
    if (typeof window === "undefined") return;
    Cookies.set(COOKIE_KEY, next, {
      expires: COOKIE_MAX_AGE_DAYS,
      sameSite: "lax",
      path: "/",
    });
    window.dispatchEvent(
      new CustomEvent<SidebarVersion>(CHANGE_EVENT, { detail: next }),
    );
  }, []);

  return { version, setVersion };
}
