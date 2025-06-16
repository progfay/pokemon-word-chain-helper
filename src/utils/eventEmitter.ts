export interface EventMap {
  [key: string]: unknown[];
}

export interface EventEmitter<T extends EventMap> {
  on<K extends keyof T>(event: K, callback: (...args: T[K]) => void): void;
  off<K extends keyof T>(event: K, callback: (...args: T[K]) => void): void;
  emit<K extends keyof T>(event: K, ...args: T[K]): void;
  removeAllListeners(): void;
}

/**
 * Create a strongly typed event emitter
 */
export const createEventEmitter = <T extends EventMap>(): EventEmitter<T> => {
  type Callback<K extends keyof T> = (...args: T[K]) => void;
  const listeners = new Map<keyof T, Set<Callback<keyof T>>>();

  return {
    on<K extends keyof T>(event: K, callback: Callback<K>): void {
      if (!listeners.has(event)) {
        listeners.set(event, new Set());
      }
      // Type assertion needed because TypeScript can't verify the type relationship
      // between Callback<K> and Callback<keyof T> even though K extends keyof T
      listeners.get(event)?.add(callback as Callback<keyof T>);
    },

    off<K extends keyof T>(event: K, callback: Callback<K>): void {
      // Type assertion needed for the same reason as above
      listeners.get(event)?.delete(callback as Callback<keyof T>);
      if (listeners.get(event)?.size === 0) {
        listeners.delete(event);
      }
    },

    emit<K extends keyof T>(event: K, ...args: T[K]): void {
      const callbacks = listeners.get(event);
      if (!callbacks) return;

      for (const callback of callbacks) {
        try {
          // Safe to cast here because we enforce type safety when adding callbacks
          (callback as Callback<K>)(...args);
        } catch (error) {
          console.error(`Error in event listener for ${String(event)}:`, error);
        }
      }
    },

    removeAllListeners(): void {
      listeners.clear();
    },
  };
};
