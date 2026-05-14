import Cookies from "js-cookie";

/**
 * Set a cookie with secure defaults.
 *
 * NOTE: This sets a *JS-readable* cookie. The auth JWT must NEVER be
 * stored here — it lives in an HttpOnly cookie set by the server-side
 * route handlers under `app/api/auth/*`.
 */
export const setCookie = (
  name: string,
  value: string,
  options?: Cookies.CookieAttributes,
) => {
  Cookies.set(name, value, {
    expires: 7,
    secure: true,
    sameSite: "strict",
    ...options,
  });
};

/**
 * Get a JS-readable cookie value.
 */
export const getCookie = (name: string): string | undefined => {
  return Cookies.get(name);
};

/**
 * Delete a JS-readable cookie.
 */
export const deleteCookie = (name: string) => {
  Cookies.remove(name);
};
