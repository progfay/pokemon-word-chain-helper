/**
 * Storage abstraction layer exports
 * Provides a clean interface for importing storage-related components
 */

export { SessionStorageAdapter } from "./session-storage-adapter";
export {
	createSessionStorage,
	getDefaultStorage,
	resetStorageInstance,
	setStorageInstance,
} from "./storage-factory";
export type { IReactiveStorage } from "./storage-interface";
