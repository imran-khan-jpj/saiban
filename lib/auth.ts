import { deleteAuthToken } from "./cookies";

/**
 * Logout function that clears auth token and redirects to login page
 */
export const logout = () => {
  // Remove auth token cookie
  deleteAuthToken();

  // Redirect to login page
  window.location.href = "/login";
};
