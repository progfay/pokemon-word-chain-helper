/**
 * Debounce function to limit the rate of function execution
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  delay: number,
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;

  return (...args: Parameters<T>) => {
    if (timeoutId !== null) {
      clearTimeout(timeoutId);
    }

    timeoutId = setTimeout(() => {
      func(...args);
      timeoutId = null;
    }, delay);
  };
}

/**
 * Throttle function to limit the rate of function execution
 */
export function throttle<T extends (...args: unknown[]) => unknown>(
  func: T,
  delay: number,
): (...args: Parameters<T>) => void {
  let lastCallTime = 0;
  let timeoutId: ReturnType<typeof setTimeout> | null = null;

  return (...args: Parameters<T>) => {
    const now = Date.now();

    if (now - lastCallTime >= delay) {
      lastCallTime = now;
      func(...args);
    } else if (timeoutId === null) {
      timeoutId = setTimeout(
        () => {
          lastCallTime = Date.now();
          func(...args);
          timeoutId = null;
        },
        delay - (now - lastCallTime),
      );
    }
  };
}
