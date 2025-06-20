import { useCallback, useSyncExternalStore } from "react";

/**
 * Custom hook for managing state with sessionStorage persistence using useSyncExternalStore
 * @param key - The sessionStorage key to use
 * @returns [value, setValue] - Tuple of current value (null if not set) and setter function
 */
export function useSessionStorage(
	key: string,
): [
	string | null,
	(value: string | ((prev: string | null) => string)) => void,
] {
	// Subscribe function for useSyncExternalStore
	const subscribe = useCallback(
		(callback: () => void) => {
			const handleStorageChange = (event: StorageEvent) => {
				if (event.key === key) {
					callback();
				}
			};

			const handleCustomStorageChange = (event: CustomEvent) => {
				if (event.detail.key === key) {
					callback();
				}
			};

			if (typeof window !== "undefined") {
				window.addEventListener("storage", handleStorageChange);
				window.addEventListener(
					"sessionStorage-change",
					handleCustomStorageChange as EventListener,
				);

				return () => {
					window.removeEventListener("storage", handleStorageChange);
					window.removeEventListener(
						"sessionStorage-change",
						handleCustomStorageChange as EventListener,
					);
				};
			}

			return () => {};
		},
		[key],
	);

	// Get snapshot function - simply returns what's in sessionStorage
	const getSnapshot = useCallback(() => {
		try {
			if (typeof window !== "undefined") {
				return window.sessionStorage.getItem(key);
			}
			return null;
		} catch (error) {
			console.warn(`Error reading sessionStorage key "${key}":`, error);
			return null;
		}
	}, [key]);

	// Server snapshot function for useSyncExternalStore (SSR)
	const getServerSnapshot = useCallback(() => null, []);

	// Use useSyncExternalStore to get the current value
	const storedValue = useSyncExternalStore(
		subscribe,
		getSnapshot,
		getServerSnapshot,
	);

	// Update sessionStorage when state changes
	const setValue = useCallback(
		(value: string | ((prev: string | null) => string)) => {
			// Get current value for function updates
			const currentValue = getSnapshot();

			// Allow value to be a function so we have the same API as useState
			const valueToStore =
				value instanceof Function ? value(currentValue) : value;

			try {
				// Save to sessionStorage
				if (typeof window !== "undefined") {
					window.sessionStorage.setItem(key, valueToStore);

					// Dispatch custom event to notify other components in the same tab
					window.dispatchEvent(
						new CustomEvent("sessionStorage-change", {
							detail: { key, value: valueToStore },
						}),
					);
				}
			} catch (error) {
				console.warn(`Error setting sessionStorage key "${key}":`, error);
			}
		},
		[key, getSnapshot],
	);

	return [storedValue, setValue];
}
