import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { UsedPokemon } from "../../types/pokemon";
import { UsageHistory } from "../UsageHistory";

describe("UsageHistory", () => {
	const mockOnClearAll = vi.fn();
	const mockOnRemoveUsed = vi.fn();

	const mockUsedPokemon: UsedPokemon[] = [
		[25, "ピカチュウ"],
		[1, "フシギダネ"],
		[6, "リザードン"],
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

		expect(screen.getByText("使用履歴")).toBeInTheDocument();
		expect(screen.getByText("(3件)")).toBeInTheDocument();
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

		expect(screen.getByText("使用履歴")).toBeInTheDocument();
		expect(screen.getByText("(0件)")).toBeInTheDocument();
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

	it("should call onRemoveUsed when remove button is clicked", () => {
		render(
			<UsageHistory
				usedPokemon={mockUsedPokemon}
				onClearAll={mockOnClearAll}
				onRemoveUsed={mockOnRemoveUsed}
			/>,
		);

		const removeButtons = screen.getAllByLabelText(/を履歴から削除/);
		fireEvent.click(removeButtons[0]); // Click first remove button
		expect(mockOnRemoveUsed).toHaveBeenCalledWith("ピカチュウ");
	});

	it("should display Pokemon in order they are provided", () => {
		const orderedPokemon: UsedPokemon[] = [
			[25, "ピカチュウ"],
			[6, "リザードン"],
			[1, "フシギダネ"],
		];

		render(
			<UsageHistory
				usedPokemon={orderedPokemon}
				onClearAll={mockOnClearAll}
				onRemoveUsed={mockOnRemoveUsed}
			/>,
		);

		const pokemonNames =
			screen.getAllByText(/ピカチュウ|リザードン|フシギダネ/);

		// Should display Pokemon in the order they are provided
		expect(pokemonNames[0]).toHaveTextContent("ピカチュウ");
		expect(pokemonNames[1]).toHaveTextContent("リザードン");
		expect(pokemonNames[2]).toHaveTextContent("フシギダネ");
	});

	it("should handle single used Pokemon correctly", () => {
		const singlePokemon: UsedPokemon[] = [[25, "ピカチュウ"]];

		render(
			<UsageHistory
				usedPokemon={singlePokemon}
				onClearAll={mockOnClearAll}
				onRemoveUsed={mockOnRemoveUsed}
			/>,
		);

		expect(screen.getByText("使用履歴")).toBeInTheDocument();
		expect(screen.getByText("(1件)")).toBeInTheDocument();
		expect(screen.getByText("ピカチュウ")).toBeInTheDocument();
	});
});
