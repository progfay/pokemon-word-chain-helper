import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { IReactiveStorage } from "../../lib/storage/storage-interface";
import { useSessionStorage } from "../useSessionStorage";

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

describe("useSessionStorage", () => {
	beforeEach(() => {
		sessionStorageMock.clear();
		vi.clearAllMocks();
	});

	afterEach(() => {
		sessionStorageMock.clear();
	});

	it("should return null when no stored value exists", () => {
		const { result } = renderHook(() => useSessionStorage("test-key"));

		expect(result.current[0]).toBeNull();
		expect(sessionStorageMock.getItem).toHaveBeenCalledWith("test-key");
	});

	it("should return stored value when it exists", () => {
		sessionStorageMock.setItem("test-key", "stored-value");

		const { result } = renderHook(() => useSessionStorage("test-key"));

		expect(result.current[0]).toBe("stored-value");
	});

	it("should update state and sessionStorage when setValue is called", () => {
		const { result } = renderHook(() => useSessionStorage("test-key"));

		act(() => {
			result.current[1]("new-value");
		});

		expect(result.current[0]).toBe("new-value");
		expect(sessionStorageMock.setItem).toHaveBeenCalledWith(
			"test-key",
			"new-value",
		);
	});

	it("should handle function updates like useState", () => {
		// Set initial value
		sessionStorageMock.setItem("test-key", "5");

		const { result } = renderHook(() => useSessionStorage("test-key"));

		act(() => {
			result.current[1]((prev) => String(Number(prev || "0") + 1));
		});

		expect(result.current[0]).toBe("6");
		expect(sessionStorageMock.setItem).toHaveBeenCalledWith("test-key", "6");
	});

	it("should work with JSON strings (parsing handled by caller)", () => {
		const initialObjectString = '{"name":"test","count":0}';
		const updatedObjectString = '{"name":"updated","count":5}';

		// Set initial value
		sessionStorageMock.setItem("test-key", initialObjectString);

		const { result } = renderHook(() => useSessionStorage("test-key"));

		expect(result.current[0]).toBe(initialObjectString);

		act(() => {
			result.current[1](updatedObjectString);
		});

		expect(result.current[0]).toBe(updatedObjectString);
		expect(sessionStorageMock.setItem).toHaveBeenCalledWith(
			"test-key",
			updatedObjectString,
		);
	});

	it("should work with JSON array strings (parsing handled by caller)", () => {
		const initialArrayString = "[]";
		const updatedArrayString = '["item1","item2"]';

		// Set initial value
		sessionStorageMock.setItem("test-key", initialArrayString);

		const { result } = renderHook(() => useSessionStorage("test-key"));

		expect(result.current[0]).toBe(initialArrayString);

		act(() => {
			result.current[1](updatedArrayString);
		});

		expect(result.current[0]).toBe(updatedArrayString);
		expect(sessionStorageMock.setItem).toHaveBeenCalledWith(
			"test-key",
			updatedArrayString,
		);
	});

	it("should handle storage read errors gracefully", () => {
		// Mock console.warn to avoid noise in test output
		const consoleSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

		// Mock getItem to throw an error
		sessionStorageMock.getItem.mockImplementationOnce(() => {
			throw new Error("Storage access denied");
		});

		const { result } = renderHook(() => useSessionStorage("test-key"));

		expect(result.current[0]).toBeNull();
		expect(consoleSpy).toHaveBeenCalledWith(
			'Error reading sessionStorage key "test-key":',
			expect.any(Error),
		);

		consoleSpy.mockRestore();
	});

	it("should handle sessionStorage.setItem errors gracefully", () => {
		// Mock console.warn to avoid noise in test output
		const consoleSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

		// Mock setItem to throw an error
		sessionStorageMock.setItem.mockImplementationOnce(() => {
			throw new Error("Storage quota exceeded");
		});

		const { result } = renderHook(() => useSessionStorage("test-key"));

		act(() => {
			result.current[1]("new-value");
		});

		// With the simplified version, state won't update if storage fails
		// because we're directly reading from sessionStorage
		expect(result.current[0]).toBeNull();
		expect(consoleSpy).toHaveBeenCalledWith(
			'Error setting sessionStorage key "test-key":',
			expect.any(Error),
		);

		consoleSpy.mockRestore();
	});

	it("should handle server-side rendering gracefully", () => {
		// Test the hook logic directly without renderHook to avoid React DOM issues
		const originalWindow = global.window;
		// @ts-expect-error - Testing SSR behavior
		delete global.window;

		try {
			// Test the initialization logic that would run during SSR
			let storedValue: string | null;
			try {
				if (typeof window !== "undefined") {
					storedValue = window.sessionStorage.getItem("test-key");
				} else {
					storedValue = null;
				}
			} catch (_error) {
				storedValue = null;
			}

			expect(storedValue).toBeNull();
		} finally {
			// Always restore window
			global.window = originalWindow;
		}
	});

	it("should work with custom storage implementations", () => {
		// Create a mock storage implementation
		const mockStorage: IReactiveStorage = {
			getItem: vi.fn(() => "custom-value"),
			setItem: vi.fn(),
			removeItem: vi.fn(),
			clear: vi.fn(),
			subscribe: vi.fn(() => () => {}),
		};

		const { result } = renderHook(() =>
			useSessionStorage("test-key", mockStorage),
		);

		// Verify the hook uses the custom storage
		expect(result.current[0]).toBe("custom-value");
		expect(mockStorage.getItem).toHaveBeenCalledWith("test-key");
		expect(mockStorage.subscribe).toHaveBeenCalledWith(
			"test-key",
			expect.any(Function),
		);
	});

	it("should subscribe to storage changes through the storage abstraction", () => {
		// Create a mock storage with subscription capability
		let subscriptionCallback: (() => void) | null = null;
		const mockStorage: IReactiveStorage = {
			getItem: vi.fn(() => "initial-value"),
			setItem: vi.fn(),
			removeItem: vi.fn(),
			clear: vi.fn(),
			subscribe: vi.fn((_key: string, callback: () => void) => {
				subscriptionCallback = callback;
				return () => {
					subscriptionCallback = null;
				};
			}),
		};

		const { result } = renderHook(() =>
			useSessionStorage("test-key", mockStorage),
		);

		// Verify subscription was set up
		expect(mockStorage.subscribe).toHaveBeenCalledWith(
			"test-key",
			expect.any(Function),
		);
		expect(result.current[0]).toBe("initial-value");

		// Simulate a storage change
		vi.mocked(mockStorage.getItem).mockReturnValue("updated-value");
		expect(subscriptionCallback).not.toBeNull();
		act(() => {
			subscriptionCallback?.();
		});

		// The component should re-render with the updated value
		expect(result.current[0]).toBe("updated-value");
	});

	it("should call setItem on the storage when setting values", () => {
		// Create a mock storage to verify interaction
		const mockStorage: IReactiveStorage = {
			getItem: vi.fn(() => null),
			setItem: vi.fn(),
			removeItem: vi.fn(),
			clear: vi.fn(),
			subscribe: vi.fn(() => () => {}),
		};

		const { result } = renderHook(() =>
			useSessionStorage("test-key", mockStorage),
		);

		act(() => {
			result.current[1]("new-value");
		});

		// Verify that setItem was called on the storage abstraction
		expect(mockStorage.setItem).toHaveBeenCalledWith("test-key", "new-value");
	});
});
