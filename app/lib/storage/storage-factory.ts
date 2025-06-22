import { SessionStorageAdapter } from "./session-storage-adapter";
import type { IReactiveStorage } from "./storage-interface";

/**
 * Storage factory that creates storage instances
 * Follows the Factory Pattern and Dependency Inversion Principle
 * Enables easy testing and alternative storage implementations
 */
let storageInstance: IReactiveStorage | null = null;

/**
 * Get the default storage instance (singleton pattern)
 * Uses sessionStorage in browser environments
 */
export function getDefaultStorage(): IReactiveStorage {
	if (!storageInstance) {
		storageInstance = new SessionStorageAdapter();
	}
	return storageInstance;
}

/**
 * Create a new storage instance
 * Useful for testing or custom implementations
 */
export function createSessionStorage(): IReactiveStorage {
	return new SessionStorageAdapter();
}

/**
 * Set a custom storage instance for testing
 * Allows dependency injection for unit tests
 */
export function setStorageInstance(storage: IReactiveStorage): void {
	storageInstance = storage;
}

/**
 * Reset the storage instance (useful for testing)
 */
export function resetStorageInstance(): void {
	storageInstance = null;
}
