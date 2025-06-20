import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { UsedPokemon } from "../../types/pokemon";
import { UsageHistory } from "../UsageHistory";

describe("UsageHistory", () => {
	const mockOnClearAll = vi.fn();
	const mockOnRemoveUsed = vi.fn();

	const mockUsedPokemon: UsedPokemon[] = [
		{ name: "ピカチュウ", pokedexNumber: 25, timestamp: 1000 },
		{ name: "フシギダネ", pokedexNumber: 1, timestamp: 2000 },
		{ name: "リザードン", pokedexNumber: 6, timestamp: 3000 },
	];

	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("should render usage history with correct count", () => {
		render(
			<UsageHistory
				usedPokemon={mockUsedPokemon}
				onClearAll={mockOnClearAll}
				onRemoveUsed={mockOnRemoveUsed}
			/>,
		);

		expect(screen.getByText("使用履歴 (3件)")).toBeInTheDocument();
		expect(screen.getByText("クリア")).toBeInTheDocument();
	});

	it("should render all used Pokemon names", () => {
		render(
			<UsageHistory
				usedPokemon={mockUsedPokemon}
				onClearAll={mockOnClearAll}
				onRemoveUsed={mockOnRemoveUsed}
			/>,
		);

		expect(screen.getByText("ピカチュウ")).toBeInTheDocument();
		expect(screen.getByText("フシギダネ")).toBeInTheDocument();
		expect(screen.getByText("リザードン")).toBeInTheDocument();
	});

	it("should show empty state when no Pokemon are used", () => {
		render(
			<UsageHistory
				usedPokemon={[]}
				onClearAll={mockOnClearAll}
				onRemoveUsed={mockOnRemoveUsed}
			/>,
		);

		expect(screen.getByText("使用履歴 (0件)")).toBeInTheDocument();
		expect(
			screen.getByText("まだ使用したポケモンはありません"),
		).toBeInTheDocument();
	});

	it("should call onClearAll when clear button is clicked", () => {
		render(
			<UsageHistory
				usedPokemon={mockUsedPokemon}
				onClearAll={mockOnClearAll}
				onRemoveUsed={mockOnRemoveUsed}
			/>,
		);

		fireEvent.click(screen.getByText("クリア"));
		expect(mockOnClearAll).toHaveBeenCalledTimes(1);
	});

	it("should call onRemoveUsed when Pokemon is clicked", () => {
		render(
			<UsageHistory
				usedPokemon={mockUsedPokemon}
				onClearAll={mockOnClearAll}
				onRemoveUsed={mockOnRemoveUsed}
			/>,
		);

		fireEvent.click(screen.getByText("ピカチュウ"));
		expect(mockOnRemoveUsed).toHaveBeenCalledWith("ピカチュウ");
	});

	it("should sort Pokemon by newest first (descending timestamp)", () => {
		const unsortedPokemon: UsedPokemon[] = [
			{ name: "ピカチュウ", pokedexNumber: 25, timestamp: 1000 },
			{ name: "リザードン", pokedexNumber: 6, timestamp: 3000 },
			{ name: "フシギダネ", pokedexNumber: 1, timestamp: 2000 },
		];

		render(
			<UsageHistory
				usedPokemon={unsortedPokemon}
				onClearAll={mockOnClearAll}
				onRemoveUsed={mockOnRemoveUsed}
			/>,
		);

		const pokemonButtons = screen
			.getAllByRole("button")
			.filter(
				(button) =>
					button.textContent && !button.textContent.includes("クリア"),
			);

		// Should be sorted by timestamp descending (newest first)
		expect(pokemonButtons[0]).toHaveTextContent("リザードン"); // timestamp: 3000
		expect(pokemonButtons[1]).toHaveTextContent("フシギダネ"); // timestamp: 2000
		expect(pokemonButtons[2]).toHaveTextContent("ピカチュウ"); // timestamp: 1000
	});

	it("should handle single used Pokemon correctly", () => {
		const singlePokemon: UsedPokemon[] = [
			{ name: "ピカチュウ", pokedexNumber: 25, timestamp: 1000 },
		];

		render(
			<UsageHistory
				usedPokemon={singlePokemon}
				onClearAll={mockOnClearAll}
				onRemoveUsed={mockOnRemoveUsed}
			/>,
		);

		expect(screen.getByText("使用履歴 (1件)")).toBeInTheDocument();
		expect(screen.getByText("ピカチュウ")).toBeInTheDocument();
	});
});
