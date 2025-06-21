import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { PokemonApp } from "../components/PokemonApp";
import type { PokemonDatabase } from "../types/pokemon";

// Mock Pokemon database
const mockPokemonDatabase: PokemonDatabase = {
	ピ: [["ピカチュウ", "ねずみ", 1, 25, [4]]],
	フ: [["フシギダネ", "たね", 1, 1, [5, 8]]],
	ア: [["アーボ", "へび", 1, 23, [8]]],
};

// Mock alert
global.alert = vi.fn();

describe("Home Integration Tests", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("should load and display the app correctly", async () => {
		render(<PokemonApp pokemonDatabase={mockPokemonDatabase} />);

		// Should show usage history
		expect(screen.getByText("使用履歴 (0件)")).toBeInTheDocument();

		// Should show accordion groups
		expect(screen.getByText("ア行")).toBeInTheDocument();
		expect(screen.getByText("カ行")).toBeInTheDocument();

		// Should show footer input
		expect(screen.getByText("ポケモンを使用する")).toBeInTheDocument();
		expect(
			screen.getByPlaceholderText("ポケモン名を入力..."),
		).toBeInTheDocument();
	});

	it("should allow adding Pokemon via footer input and update usage history", async () => {
		render(<PokemonApp pokemonDatabase={mockPokemonDatabase} />);

		// Should start with empty usage history
		expect(screen.getByText("使用履歴 (0件)")).toBeInTheDocument();

		// Add Pokemon via footer input
		const input = screen.getByPlaceholderText("ポケモン名を入力...");
		const addButton = screen.getByText("追加");

		fireEvent.change(input, { target: { value: "ピカチュウ" } });
		fireEvent.click(addButton);

		// Should update usage history
		await waitFor(() => {
			expect(screen.getByText("使用履歴 (1件)")).toBeInTheDocument();
			expect(screen.getByText("ピカチュウ")).toBeInTheDocument();
		});

		// Input should be cleared
		expect(input).toHaveValue("");
	});

	it("should allow expanding accordion and revealing Pokemon answers", async () => {
		render(<PokemonApp pokemonDatabase={mockPokemonDatabase} />);

		// Should show accordion groups immediately
		expect(screen.getByText("ア行")).toBeInTheDocument();

		// Expand ア行 accordion
		const aGroupButton = screen.getByText("ア行").closest("button");
		if (aGroupButton) fireEvent.click(aGroupButton);

		// Should show character tabs
		await waitFor(() => {
			expect(screen.getByText("ア")).toBeInTheDocument();
		});

		// Should show Pokemon card with answer button
		expect(screen.getByText("答えを見る")).toBeInTheDocument();
		expect(screen.getByText("#023")).toBeInTheDocument();

		// Click answer button
		fireEvent.click(screen.getByText("答えを見る"));

		// Should show confirmation modal
		expect(screen.getByText("答えを確認")).toBeInTheDocument();

		// Confirm answer
		fireEvent.click(screen.getByText("確認"));

		// Should reveal Pokemon name and mark as used
		await waitFor(() => {
			expect(screen.getAllByText("アーボ")).toHaveLength(2); // One in card, one in history
			expect(screen.getByText("使用済み")).toBeInTheDocument();
		});

		// Should update usage history
		expect(screen.getByText("使用履歴 (1件)")).toBeInTheDocument();
	});

	it("should allow switching between character tabs", async () => {
		render(<PokemonApp pokemonDatabase={mockPokemonDatabase} />);

		// Should show accordion groups immediately
		expect(screen.getByText("ア行")).toBeInTheDocument();

		// Expand ア行 accordion
		const aGroupButton = screen.getByText("ア行").closest("button");
		if (aGroupButton) fireEvent.click(aGroupButton);

		await waitFor(() => {
			expect(screen.getByText("ア")).toBeInTheDocument();
		});

		// Click different character tab
		const iTab = screen.getByText("イ");
		fireEvent.click(iTab);

		// Should show active styling for イ tab
		const iButton = iTab.closest("button");
		expect(iButton).toHaveClass("bg-blue-600", "text-white");
	});

	it("should allow clearing all used Pokemon", async () => {
		render(<PokemonApp pokemonDatabase={mockPokemonDatabase} />);

		// Should start with empty usage history
		expect(screen.getByText("使用履歴 (0件)")).toBeInTheDocument();

		// Add Pokemon first
		const input = screen.getByPlaceholderText("ポケモン名を入力...");
		fireEvent.change(input, { target: { value: "ピカチュウ" } });
		fireEvent.click(screen.getByText("追加"));

		await waitFor(() => {
			expect(screen.getByText("使用履歴 (1件)")).toBeInTheDocument();
		});

		// Clear all
		fireEvent.click(screen.getByText("クリア"));

		// Should be empty again
		expect(screen.getByText("使用履歴 (0件)")).toBeInTheDocument();
		expect(
			screen.getByText("まだ使用したポケモンはありません"),
		).toBeInTheDocument();
	});

	it("should allow removing individual Pokemon from usage history", async () => {
		render(<PokemonApp pokemonDatabase={mockPokemonDatabase} />);

		// Should start with empty usage history
		expect(screen.getByText("使用履歴 (0件)")).toBeInTheDocument();

		// Add multiple Pokemon
		const input = screen.getByPlaceholderText("ポケモン名を入力...");

		fireEvent.change(input, { target: { value: "ピカチュウ" } });
		fireEvent.click(screen.getByText("追加"));

		await waitFor(() => {
			expect(screen.getByText("使用履歴 (1件)")).toBeInTheDocument();
		});

		fireEvent.change(input, { target: { value: "フシギダネ" } });
		fireEvent.click(screen.getByText("追加"));

		await waitFor(() => {
			expect(screen.getByText("使用履歴 (2件)")).toBeInTheDocument();
		});

		// Remove one Pokemon by clicking on it
		const pokemonButtons = screen
			.getAllByRole("button")
			.filter((button) => button.textContent === "ピカチュウ");
		fireEvent.click(pokemonButtons[0]);

		// Should have one less Pokemon
		await waitFor(() => {
			expect(screen.getByText("使用履歴 (1件)")).toBeInTheDocument();
			expect(screen.queryByText("ピカチュウ")).not.toBeInTheDocument();
			expect(screen.getByText("フシギダネ")).toBeInTheDocument();
		});
	});

	it("should handle invalid Pokemon names gracefully", async () => {
		render(<PokemonApp pokemonDatabase={mockPokemonDatabase} />);

		// Should start with empty usage history
		expect(screen.getByText("使用履歴 (0件)")).toBeInTheDocument();

		const input = screen.getByPlaceholderText("ポケモン名を入力...");
		fireEvent.change(input, { target: { value: "InvalidPokemon" } });
		fireEvent.click(screen.getByText("追加"));

		// Should show alert
		expect(global.alert).toHaveBeenCalledWith(
			"そのポケモンは見つかりませんでした。正確な名前を入力してください。",
		);

		// Usage history should remain unchanged
		expect(screen.getByText("使用履歴 (0件)")).toBeInTheDocument();
	});

	it("should persist used Pokemon in sessionStorage", async () => {
		// Mock sessionStorage with stateful behavior
		let store: Record<string, string> = {};
		const sessionStorageMock = {
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
		Object.defineProperty(window, "sessionStorage", {
			value: sessionStorageMock,
		});

		render(<PokemonApp pokemonDatabase={mockPokemonDatabase} />);

		// Should start with empty usage history
		expect(screen.getByText("使用履歴 (0件)")).toBeInTheDocument();

		// Add a Pokemon
		const input = screen.getByPlaceholderText("ポケモン名を入力...");
		fireEvent.change(input, { target: { value: "ピカチュウ" } });
		fireEvent.click(screen.getByText("追加"));

		await waitFor(() => {
			expect(screen.getByText("使用履歴 (1件)")).toBeInTheDocument();
		});

		// Check that sessionStorage.setItem was called
		expect(sessionStorageMock.setItem).toHaveBeenCalledWith(
			"usedPokemon",
			expect.stringContaining("ピカチュウ"),
		);
	});

	it("should load used Pokemon from sessionStorage on mount", async () => {
		// Mock sessionStorage with existing data
		const existingUsedPokemon = [
			{ name: "ピカチュウ", pokedexNumber: 25, timestamp: Date.now() },
		];
		const sessionStorageMock = {
			getItem: vi.fn((key) => {
				if (key === "usedPokemon") {
					return JSON.stringify(existingUsedPokemon);
				}
				return null;
			}),
			setItem: vi.fn(),
			removeItem: vi.fn(),
			clear: vi.fn(),
		};
		Object.defineProperty(window, "sessionStorage", {
			value: sessionStorageMock,
		});

		render(<PokemonApp pokemonDatabase={mockPokemonDatabase} />);

		// Should show pre-loaded Pokemon
		await waitFor(() => {
			expect(screen.getByText("使用履歴 (1件)")).toBeInTheDocument();
			expect(screen.getByText("ピカチュウ")).toBeInTheDocument();
		});

		// Check that sessionStorage.getItem was called
		expect(sessionStorageMock.getItem).toHaveBeenCalledWith("usedPokemon");
	});
});
