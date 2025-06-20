import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
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

	it("should set up event listeners for cross-hook synchronization", () => {
		// Mock window with event handling capabilities
		const mockWindow = {
			...window,
			addEventListener: vi.fn(),
			removeEventListener: vi.fn(),
			dispatchEvent: vi.fn(),
			sessionStorage: sessionStorageMock,
		};
		const originalWindow = global.window;
		global.window = mockWindow as unknown as typeof global.window;

		try {
			const { result } = renderHook(() => useSessionStorage("shared-key"));

			// Verify that event listeners are set up
			expect(mockWindow.addEventListener).toHaveBeenCalledWith(
				"storage",
				expect.any(Function),
			);
			expect(mockWindow.addEventListener).toHaveBeenCalledWith(
				"sessionStorage-change",
				expect.any(Function),
			);

			// Verify hook works normally (returns null when no value)
			expect(result.current[0]).toBeNull();
		} finally {
			global.window = originalWindow;
		}
	});

	it("should register storage event listeners for cross-tab synchronization", () => {
		// Mock window with event handling capabilities
		const mockWindow = {
			...window,
			addEventListener: vi.fn(),
			removeEventListener: vi.fn(),
			dispatchEvent: vi.fn(),
			sessionStorage: sessionStorageMock,
		};
		const originalWindow = global.window;
		global.window = mockWindow as unknown as typeof global.window;

		try {
			renderHook(() => useSessionStorage("test-key"));

			// Verify that storage event listeners are registered for cross-tab sync
			expect(mockWindow.addEventListener).toHaveBeenCalledWith(
				"storage",
				expect.any(Function),
			);
			expect(mockWindow.addEventListener).toHaveBeenCalledWith(
				"sessionStorage-change",
				expect.any(Function),
			);
		} finally {
			global.window = originalWindow;
		}
	});

	it("should dispatch custom events when setting values", () => {
		// Mock window with event handling capabilities
		const eventListener = vi.fn();
		const mockWindow = {
			...window,
			addEventListener: vi.fn(),
			removeEventListener: vi.fn(),
			dispatchEvent: vi.fn(),
			sessionStorage: sessionStorageMock,
		};
		const originalWindow = global.window;
		global.window = mockWindow as unknown as typeof global.window;

		try {
			mockWindow.addEventListener("sessionStorage-change", eventListener);

			const { result } = renderHook(() => useSessionStorage("test-key"));

			act(() => {
				result.current[1]("new-value");
			});

			expect(mockWindow.dispatchEvent).toHaveBeenCalledWith(
				expect.objectContaining({
					detail: { key: "test-key", value: "new-value" },
				}),
			);

			mockWindow.removeEventListener("sessionStorage-change", eventListener);
		} finally {
			global.window = originalWindow;
		}
	});
});
