/**
 * Simple memoization utility for caching function results
 */
export function memoize<T extends (...args: unknown[]) => unknown>(
  func: T,
  keyGenerator?: (...args: Parameters<T>) => string,
): T {
  const cache = new Map<string, ReturnType<T>>();

  const generateKey =
    keyGenerator || ((...args: Parameters<T>) => JSON.stringify(args));

  return ((...args: Parameters<T>): ReturnType<T> => {
    const key = generateKey(...args);

    const c = cache.get(key);
    if (c !== undefined) {
      return c;
    }

    const result = func(...args) as ReturnType<T>;
    cache.set(key, result);

    return result;
  }) as T;
}

/**
 * LRU (Least Recently Used) cache implementation
 */
export class LRUCache<K, V> {
  private capacity: number;
  private cache: Map<K, V>;

  constructor(capacity = 100) {
    this.capacity = capacity;
    this.cache = new Map();
  }

  get(key: K): V | undefined {
    if (this.cache.has(key)) {
      // Move to end (most recently used)
      const value = this.cache.get(key);
      if (value !== undefined) {
        this.cache.delete(key);
        this.cache.set(key, value);
      }
      return value;
    }
    return undefined;
  }

  set(key: K, value: V): void {
    if (this.cache.has(key)) {
      // Update existing key
      this.cache.delete(key);
    } else if (this.cache.size >= this.capacity) {
      // Remove least recently used (first item)
      const firstKey = this.cache.keys().next().value as K;
      if (firstKey !== undefined) {
        this.cache.delete(firstKey);
      }
    }

    this.cache.set(key, value);
  }

  clear(): void {
    this.cache.clear();
  }

  size(): number {
    return this.cache.size;
  }
}

/**
 * Memoization with LRU cache for memory efficiency
 */
export function memoizeLRU<T extends (...args: unknown[]) => unknown>(
  func: T,
  capacity = 100,
  keyGenerator?: (...args: Parameters<T>) => string,
): T {
  const cache = new LRUCache<string, ReturnType<T>>(capacity);

  const generateKey =
    keyGenerator || ((...args: Parameters<T>) => JSON.stringify(args));

  return ((...args: Parameters<T>): ReturnType<T> => {
    const key = generateKey(...args);

    const cached = cache.get(key);
    if (cached !== undefined) {
      return cached;
    }

    const result = func(...args) as ReturnType<T>;
    cache.set(key, result);

    return result;
  }) as T;
}
