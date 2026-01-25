import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import dayjs from "dayjs";

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
