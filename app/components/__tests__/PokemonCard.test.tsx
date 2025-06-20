import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Pokemon } from "../../types/pokemon";
import { PokemonCard } from "../PokemonCard";

// Mock Pokemon data
const mockPokemon: Pokemon = [
	"ピカチュウ", // name
	"ねずみ", // genus
	1, // generation
	25, // pokedex number
	[4], // types (electric)
];

const mockDualTypePokemon: Pokemon = [
	"フシギダネ", // name
	"たね", // genus
	1, // generation
	1, // pokedex number
	[5, 8], // types (grass/poison)
];

describe("PokemonCard", () => {
	const mockOnMarkAsUsed = vi.fn();

	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("should render Pokemon card with basic information", () => {
		render(
			<PokemonCard
				pokemon={mockPokemon}
				isUsed={false}
				onMarkAsUsed={mockOnMarkAsUsed}
			/>,
		);

		expect(screen.getByText("#025")).toBeInTheDocument();
		expect(screen.getByText("答えを見る")).toBeInTheDocument();
	});

	it("should show Pokemon name when answer is revealed", () => {
		render(
			<PokemonCard
				pokemon={mockPokemon}
				isUsed={true}
				onMarkAsUsed={mockOnMarkAsUsed}
			/>,
		);

		expect(screen.getByText("ピカチュウ")).toBeInTheDocument();
		expect(screen.getByText("使用済み")).toBeInTheDocument();
	});

	it("should show confirmation modal when answer button is clicked", () => {
		render(
			<PokemonCard
				pokemon={mockPokemon}
				isUsed={false}
				onMarkAsUsed={mockOnMarkAsUsed}
			/>,
		);

		fireEvent.click(screen.getByText("答えを見る"));

		expect(screen.getByText("答えを確認")).toBeInTheDocument();
		expect(screen.getByText("確認")).toBeInTheDocument();
		expect(screen.getByText("キャンセル")).toBeInTheDocument();
	});

	it("should call onMarkAsUsed when answer is confirmed", () => {
		render(
			<PokemonCard
				pokemon={mockPokemon}
				isUsed={false}
				onMarkAsUsed={mockOnMarkAsUsed}
			/>,
		);

		// Click answer button
		fireEvent.click(screen.getByText("答えを見る"));

		// Confirm the answer
		fireEvent.click(screen.getByText("確認"));

		expect(mockOnMarkAsUsed).toHaveBeenCalledWith({
			name: "ピカチュウ",
			pokedexNumber: 25,
			timestamp: expect.any(Number),
		});
	});

	it("should close modal when cancelled", () => {
		render(
			<PokemonCard
				pokemon={mockPokemon}
				isUsed={false}
				onMarkAsUsed={mockOnMarkAsUsed}
			/>,
		);

		// Click answer button
		fireEvent.click(screen.getByText("答えを見る"));
		expect(screen.getByText("答えを確認")).toBeInTheDocument();

		// Cancel
		fireEvent.click(screen.getByText("キャンセル"));
		expect(screen.queryByText("答えを確認")).not.toBeInTheDocument();
		expect(mockOnMarkAsUsed).not.toHaveBeenCalled();
	});

	it("should expand and collapse generation hint", () => {
		render(
			<PokemonCard
				pokemon={mockPokemon}
				isUsed={false}
				onMarkAsUsed={mockOnMarkAsUsed}
			/>,
		);

		const generationButton = screen.getByText("世代").closest("button");
		expect(generationButton).toBeInTheDocument();

		// Initially collapsed
		expect(screen.queryByText("第1世代")).not.toBeInTheDocument();

		// Click to expand
		if (generationButton) fireEvent.click(generationButton);
		expect(screen.getByText("第1世代")).toBeInTheDocument();

		// Click to collapse
		if (generationButton) fireEvent.click(generationButton);
		expect(screen.queryByText("第1世代")).not.toBeInTheDocument();
	});

	it("should expand and show type information", () => {
		render(
			<PokemonCard
				pokemon={mockPokemon}
				isUsed={false}
				onMarkAsUsed={mockOnMarkAsUsed}
			/>,
		);

		const typeButton = screen.getByText("タイプ").closest("button");

		// Click to expand types
		if (typeButton) fireEvent.click(typeButton);
		expect(screen.getByText("でんき")).toBeInTheDocument();
	});

	it("should show dual types correctly", () => {
		render(
			<PokemonCard
				pokemon={mockDualTypePokemon}
				isUsed={false}
				onMarkAsUsed={mockOnMarkAsUsed}
			/>,
		);

		const typeButton = screen.getByText("タイプ").closest("button");

		// Click to expand types
		if (typeButton) fireEvent.click(typeButton);
		expect(screen.getByText("くさ")).toBeInTheDocument();
		expect(screen.getByText("どく")).toBeInTheDocument();
	});

	it("should show image controls when image hint is expanded", () => {
		render(
			<PokemonCard
				pokemon={mockPokemon}
				isUsed={false}
				onMarkAsUsed={mockOnMarkAsUsed}
			/>,
		);

		const imageButton = screen.getByText("画像").closest("button");

		// Click to expand image section
		if (imageButton) fireEvent.click(imageButton);

		expect(screen.getByText("シルエット")).toBeInTheDocument();
		expect(screen.getByText("ぼかし")).toBeInTheDocument();
		expect(screen.getByText("フルカラー")).toBeInTheDocument();
	});

	it("should change image visibility when buttons are clicked", () => {
		render(
			<PokemonCard
				pokemon={mockPokemon}
				isUsed={false}
				onMarkAsUsed={mockOnMarkAsUsed}
			/>,
		);

		const imageButton = screen.getByText("画像").closest("button");
		if (imageButton) fireEvent.click(imageButton);

		const silhouetteButton = screen.getByText("シルエット");
		const blurButton = screen.getByText("ぼかし");
		const fullColorButton = screen.getByText("フルカラー");

		// Test silhouette button
		fireEvent.click(silhouetteButton);
		expect(silhouetteButton).toHaveClass("bg-blue-600");

		// Test blur button
		fireEvent.click(blurButton);
		expect(blurButton).toHaveClass("bg-blue-600");
		expect(silhouetteButton).not.toHaveClass("bg-blue-600");

		// Test full color button
		fireEvent.click(fullColorButton);
		expect(fullColorButton).toHaveClass("bg-blue-600");
		expect(blurButton).not.toHaveClass("bg-blue-600");
	});
});
