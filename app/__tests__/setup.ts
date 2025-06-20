import "@testing-library/jest-dom";
import { beforeEach, vi } from "vitest";

// Mock fetch for Pokemon database loading
global.fetch = vi.fn();

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

// Setup global mocks
Object.defineProperty(window, "matchMedia", {
	writable: true,
	value: vi.fn().mockImplementation((query: string) => ({
		matches: false,
		media: query,
		onchange: null,
		addListener: vi.fn(), // deprecated
		removeListener: vi.fn(), // deprecated
		addEventListener: vi.fn(),
		removeEventListener: vi.fn(),
		dispatchEvent: vi.fn(),
	})),
});

// Clear sessionStorage before each test
beforeEach(() => {
	sessionStorageMock.clear();
	vi.clearAllMocks();

	// No cache to clear with simplified implementation
});
