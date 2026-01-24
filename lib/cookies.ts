import Cookies from "js-cookie";

/**
 * Set a cookie with secure defaults
 */
export const setCookie = (
  name: string,
  value: string,
  options?: Cookies.CookieAttributes,
) => {
  Cookies.set(name, value, {
    expires: 7, // 7 days default
    secure: true, // Only sent over HTTPS
    sameSite: "strict", // CSRF protection
    ...options,
  });
};

/**
 * Get a cookie value
 */
export const getCookie = (name: string): string | undefined => {
  return Cookies.get(name);
};

/**
 * Delete a cookie
 */
export const deleteCookie = (name: string) => {
  Cookies.remove(name);
};

/**
 * Auth-specific cookie helpers
 */
export const AUTH_TOKEN_KEY = "auth-token";

export const setAuthToken = (token: string) => {
  setCookie(AUTH_TOKEN_KEY, token);
};

export const getAuthToken = (): string | undefined => {
  return getCookie(AUTH_TOKEN_KEY);
};

export const deleteAuthToken = () => {
  deleteCookie(AUTH_TOKEN_KEY);
};
