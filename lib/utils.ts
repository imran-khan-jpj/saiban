import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";

dayjs.extend(customParseFormat);

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format a date string or Date object using dayjs
 * @param date - Date string or Date object
 * @param format - Format string (default: "MMM D, YYYY")
 * @returns Formatted date string
 */
export function formatDate(
  date: string | Date,
  format: string = "DD-MMM-YYYY",
): string {
  return dayjs(date).format(format);
}

/**
 * Format a date to relative time (e.g., "2 hours ago")
 * @param date - Date string or Date object
 * @returns Relative time string
 */
export function formatRelativeTime(date: string | Date): string {
  const now = dayjs();
  const target = dayjs(date);
  const diffInDays = now.diff(target, "day");

  if (diffInDays === 0) {
    return "Today";
  } else if (diffInDays === 1) {
    return "Yesterday";
  } else if (diffInDays < 7) {
    return `${diffInDays} days ago`;
  } else {
    return formatDate(date);
  }
}

/**
 * Format a number with comma separators for better readability
 * @param amount - Number or string to format
 * @returns Formatted number string with commas (e.g., "1,000" or "1,000,000")
 */
export function formatAmount(amount: number | string): string {
  const num = typeof amount === "string" ? parseFloat(amount) : amount;
  if (isNaN(num)) return "0";
  return num.toLocaleString("en-US");
}

/**
 * Format a number as PKR currency with proper formatting
 * @param amount - Number to format
 * @returns Formatted currency string (e.g., "PKR 1,000" or "PKR 1,000,000")
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-PK", {
    style: "currency",
    currency: "PKR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Format date for input display (DD-MMM-YYYY format)
 * @param date - Date string in YYYY-MM-DD format or empty string
 * @returns Formatted date string (e.g., "01-Jan-2025") or empty string
 */
export function formatDateForInput(date: string): string {
  if (!date) return "";
  return dayjs(date).format("DD-MMM-YYYY");
}

/**
 * Parse display date format to API format (YYYY-MM-DD)
 * @param date - Date string in DD-MMM-YYYY format
 * @returns Date string in YYYY-MM-DD format or empty string
 */
export function parseDateFromInput(date: string): string {
  if (!date) return "";
  const parsed = dayjs(date, "DD-MMM-YYYY");
  return parsed.isValid() ? parsed.format("YYYY-MM-DD") : "";
}
