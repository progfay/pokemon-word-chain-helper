import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { SessionStorageAdapter } from "../session-storage-adapter";

// Mock sessionStorage
const sessionStorageMock = (() => {
	let store: Record<string, string> = {};

	return {
		getItem: vi.fn((key: string) => store[key] || null),
		setItem: vi.fn((key: string, value: string) => {
			store[key] = value;
		}),
		removeItem: vi.fn((key: string) => {
			delete store[key];
		}),
		clear: vi.fn(() => {
			store = {};
		}),
	};
})();

Object.defineProperty(window, "sessionStorage", {
	value: sessionStorageMock,
});

describe("SessionStorageAdapter", () => {
	let adapter: SessionStorageAdapter;

	beforeEach(() => {
		sessionStorageMock.clear();
		vi.clearAllMocks();
		adapter = new SessionStorageAdapter();
	});

	afterEach(() => {
		sessionStorageMock.clear();
	});

	it("should get item from sessionStorage", () => {
		sessionStorageMock.setItem("test-key", "test-value");

		const result = adapter.getItem("test-key");

		expect(result).toBe("test-value");
		expect(sessionStorageMock.getItem).toHaveBeenCalledWith("test-key");
	});

	it("should return null for non-existent item", () => {
		const result = adapter.getItem("non-existent");

		expect(result).toBeNull();
	});

	it("should set item in sessionStorage", () => {
		const mockDispatchEvent = vi.fn();
		const originalDispatchEvent = window.dispatchEvent;
		window.dispatchEvent = mockDispatchEvent;

		adapter.setItem("test-key", "test-value");

		expect(sessionStorageMock.setItem).toHaveBeenCalledWith(
			"test-key",
			"test-value",
		);
		expect(mockDispatchEvent).toHaveBeenCalledWith(
			expect.objectContaining({
				detail: { key: "test-key", value: "test-value" },
			}),
		);

		window.dispatchEvent = originalDispatchEvent;
	});

	it("should remove item from sessionStorage", () => {
		const mockDispatchEvent = vi.fn();
		const originalDispatchEvent = window.dispatchEvent;
		window.dispatchEvent = mockDispatchEvent;

		adapter.removeItem("test-key");

		expect(sessionStorageMock.removeItem).toHaveBeenCalledWith("test-key");
		expect(mockDispatchEvent).toHaveBeenCalledWith(
			expect.objectContaining({
				detail: { key: "test-key", value: null },
			}),
		);

		window.dispatchEvent = originalDispatchEvent;
	});

	it("should clear all items from sessionStorage", () => {
		adapter.clear();

		expect(sessionStorageMock.clear).toHaveBeenCalled();
	});

	it("should handle subscription and unsubscription", () => {
		const callback = vi.fn();

		const unsubscribe = adapter.subscribe("test-key", callback);

		// Verify subscription was set up
		expect(typeof unsubscribe).toBe("function");

		// Unsubscribe
		unsubscribe();

		// Should not throw
		expect(() => unsubscribe()).not.toThrow();
	});

	it("should handle storage errors gracefully", () => {
		const consoleSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

		// Mock getItem to throw an error
		sessionStorageMock.getItem.mockImplementationOnce(() => {
			throw new Error("Storage access denied");
		});

		const result = adapter.getItem("test-key");

		expect(result).toBeNull();
		expect(consoleSpy).toHaveBeenCalledWith(
			'Error reading sessionStorage key "test-key":',
			expect.any(Error),
		);

		consoleSpy.mockRestore();
	});

	it("should handle server-side rendering gracefully", () => {
		const originalWindow = global.window;
		// @ts-expect-error - Testing SSR behavior
		delete global.window;

		try {
			const ssrAdapter = new SessionStorageAdapter();

			// Should not throw and return null
			const result = ssrAdapter.getItem("test-key");
			expect(result).toBeNull();

			// Should not throw
			expect(() => ssrAdapter.setItem("test-key", "value")).not.toThrow();
			expect(() => ssrAdapter.removeItem("test-key")).not.toThrow();
			expect(() => ssrAdapter.clear()).not.toThrow();
		} finally {
			global.window = originalWindow;
		}
	});
});
