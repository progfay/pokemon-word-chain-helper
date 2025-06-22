import { useCallback, useSyncExternalStore } from "react";
import { getDefaultStorage } from "../lib/storage/storage-factory";
import type { IReactiveStorage } from "../lib/storage/storage-interface";

/**
 * Custom hook for managing state with storage persistence using useSyncExternalStore
 * Now uses the storage abstraction layer following Dependency Inversion Principle
 * @param key - The storage key to use
 * @param storage - Optional storage instance (defaults to SessionStorage)
 * @returns [value, setValue] - Tuple of current value (null if not set) and setter function
 */
export function useSessionStorage(
	key: string,
	storage: IReactiveStorage = getDefaultStorage(),
): [
	string | null,
	(value: string | ((prev: string | null) => string)) => void,
] {
	// Subscribe function for useSyncExternalStore
	const subscribe = useCallback(
		(callback: () => void) => {
			return storage.subscribe(key, callback);
		},
		[key, storage],
	);

	// Get snapshot function - reads from the storage abstraction
	const getSnapshot = useCallback(() => {
		return storage.getItem(key);
	}, [key, storage]);

	// Server snapshot function for useSyncExternalStore (SSR)
	const getServerSnapshot = useCallback(() => null, []);

	// Use useSyncExternalStore to get the current value
	const storedValue = useSyncExternalStore(
		subscribe,
		getSnapshot,
		getServerSnapshot,
	);

	// Update storage when state changes
	const setValue = useCallback(
		(value: string | ((prev: string | null) => string)) => {
			// Get current value for function updates
			const currentValue = getSnapshot();

			// Allow value to be a function so we have the same API as useState
			const valueToStore =
				value instanceof Function ? value(currentValue) : value;

			// Save to storage using the abstraction
			storage.setItem(key, valueToStore);
		},
		[key, storage, getSnapshot],
	);

	return [storedValue, setValue];
}
