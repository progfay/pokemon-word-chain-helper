/**
 * Storage interface that abstracts storage operations
 * Follows the Interface Segregation Principle (ISP) by defining minimal required methods
 */
interface IStorage {
	/**
	 * Get an item from storage
	 * @param key - The key to retrieve
	 * @returns The stored value or null if not found
	 */
	getItem(key: string): string | null;

	/**
	 * Set an item in storage
	 * @param key - The key to store under
	 * @param value - The value to store
	 */
	setItem(key: string, value: string): void;

	/**
	 * Remove an item from storage
	 * @param key - The key to remove
	 */
	removeItem(key: string): void;

	/**
	 * Clear all items from storage
	 */
	clear(): void;
}

/**
 * Enhanced storage interface with event support for reactive updates
 * Extends IStorage following the Interface Segregation Principle
 */
export interface IReactiveStorage extends IStorage {
	/**
	 * Subscribe to storage changes for a specific key
	 * @param key - The key to watch for changes
	 * @param callback - Function to call when the key changes
	 * @returns Unsubscribe function
	 */
	subscribe(key: string, callback: () => void): () => void;
}
