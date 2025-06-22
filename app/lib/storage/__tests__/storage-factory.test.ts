import { afterEach, describe, expect, it } from "vitest";
import { SessionStorageAdapter } from "../session-storage-adapter";
import {
	createSessionStorage,
	getDefaultStorage,
	resetStorageInstance,
	setStorageInstance,
} from "../storage-factory";
import type { IReactiveStorage } from "../storage-interface";

describe("StorageFactory", () => {
	afterEach(() => {
		// Reset the factory instance between tests
		resetStorageInstance();
	});

	it("should return the same instance on multiple calls to getDefaultStorage", () => {
		const instance1 = getDefaultStorage();
		const instance2 = getDefaultStorage();

		expect(instance1).toBe(instance2);
		expect(instance1).toBeInstanceOf(SessionStorageAdapter);
	});

	it("should create new instances with createSessionStorage", () => {
		const instance1 = createSessionStorage();
		const instance2 = createSessionStorage();

		expect(instance1).not.toBe(instance2);
		expect(instance1).toBeInstanceOf(SessionStorageAdapter);
		expect(instance2).toBeInstanceOf(SessionStorageAdapter);
	});

	it("should allow setting a custom storage instance", () => {
		const customStorage: IReactiveStorage = {
			getItem: () => "custom",
			setItem: () => {},
			removeItem: () => {},
			clear: () => {},
			subscribe: () => () => {},
		};

		setStorageInstance(customStorage);
		const instance = getDefaultStorage();

		expect(instance).toBe(customStorage);
	});

	it("should reset to default after resetInstance", () => {
		const customStorage: IReactiveStorage = {
			getItem: () => "custom",
			setItem: () => {},
			removeItem: () => {},
			clear: () => {},
			subscribe: () => () => {},
		};

		setStorageInstance(customStorage);
		resetStorageInstance();

		const instance = getDefaultStorage();
		expect(instance).not.toBe(customStorage);
		expect(instance).toBeInstanceOf(SessionStorageAdapter);
	});
});
