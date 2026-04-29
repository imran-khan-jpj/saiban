"use client";

import * as React from "react";

/**
 * Returns a debounced version of `value` that only updates after `delay`
 * milliseconds have passed since the last change.
 */
export function useDebouncedValue<T>(value: T, delay: number = 400): T {
  const [debounced, setDebounced] = React.useState(value);

  React.useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debounced;
}
