import type { IReactiveStorage } from "./storage-interface";

/**
 * SessionStorage adapter that implements the IReactiveStorage interface
 * Follows Dependency Inversion Principle by depending on abstractions not concretions
 */
export class SessionStorageAdapter implements IReactiveStorage {
	private subscriptions = new Map<string, Set<() => void>>();

	constructor() {
		// Set up global event listeners for cross-component synchronization
		if (typeof window !== "undefined") {
			// Listen for storage events (cross-tab changes)
			window.addEventListener("storage", this.handleStorageEvent.bind(this));

			// Listen for custom events (same-tab changes)
			window.addEventListener(
				"sessionStorage-change",
				this.handleCustomStorageEvent.bind(this),
			);
		}
	}

	getItem(key: string): string | null {
		try {
			if (typeof window !== "undefined") {
				return window.sessionStorage.getItem(key);
			}
			return null;
		} catch (error) {
			console.warn(`Error reading sessionStorage key "${key}":`, error);
			return null;
		}
	}

	setItem(key: string, value: string): void {
		try {
			if (typeof window !== "undefined") {
				window.sessionStorage.setItem(key, value);

				// Dispatch custom event to notify subscribers in the same tab
				window.dispatchEvent(
					new CustomEvent("sessionStorage-change", {
						detail: { key, value },
					}),
				);
			}
		} catch (error) {
			console.warn(`Error setting sessionStorage key "${key}":`, error);
		}
	}

	removeItem(key: string): void {
		try {
			if (typeof window !== "undefined") {
				window.sessionStorage.removeItem(key);

				// Dispatch custom event to notify subscribers
				window.dispatchEvent(
					new CustomEvent("sessionStorage-change", {
						detail: { key, value: null },
					}),
				);
			}
		} catch (error) {
			console.warn(`Error removing sessionStorage key "${key}":`, error);
		}
	}

	clear(): void {
		try {
			if (typeof window !== "undefined") {
				window.sessionStorage.clear();

				// Notify all subscribers that storage was cleared
				for (const [_key, callbacks] of this.subscriptions) {
					callbacks.forEach((callback) => callback());
				}
			}
		} catch (error) {
			console.warn("Error clearing sessionStorage:", error);
		}
	}

	subscribe(key: string, callback: () => void): () => void {
		// Initialize subscription set for this key if it doesn't exist
		if (!this.subscriptions.has(key)) {
			this.subscriptions.set(key, new Set());
		}

		const callbacks = this.subscriptions.get(key);
		if (!callbacks) return () => {};
		callbacks.add(callback);

		// Return unsubscribe function
		return () => {
			callbacks.delete(callback);
			if (callbacks.size === 0) {
				this.subscriptions.delete(key);
			}
		};
	}

	private handleStorageEvent(event: StorageEvent): void {
		// Handle cross-tab storage changes
		if (event.key && this.subscriptions.has(event.key)) {
			const callbacks = this.subscriptions.get(event.key);
			callbacks?.forEach((callback) => callback());
		}
	}

	private handleCustomStorageEvent(event: Event): void {
		// Handle same-tab storage changes
		const customEvent = event as CustomEvent;
		const { key } = customEvent.detail;

		if (key && this.subscriptions.has(key)) {
			const callbacks = this.subscriptions.get(key);
			callbacks?.forEach((callback) => callback());
		}
	}
}
