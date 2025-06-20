import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { PokemonDatabase } from "../../types/pokemon";
import { FooterInput } from "../FooterInput";

// Mock alert
global.alert = vi.fn();

const mockPokemonDatabase: PokemonDatabase = {
	ピ: [["ピカチュウ", "ねずみ", 1, 25, [4]]],
	フ: [["フシギダネ", "たね", 1, 1, [5, 8]]],
	リ: [["リザードン", "かえん", 1, 6, [2, 10]]],
};

describe("FooterInput", () => {
	const mockOnAddUsed = vi.fn();

	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("should render input form with correct elements", () => {
		render(
			<FooterInput
				pokemonDatabase={mockPokemonDatabase}
				onAddUsed={mockOnAddUsed}
			/>,
		);

		expect(screen.getByText("ポケモンを使用する")).toBeInTheDocument();
		expect(
			screen.getByPlaceholderText("ポケモン名を入力..."),
		).toBeInTheDocument();
		expect(screen.getByText("追加")).toBeInTheDocument();
	});

	it("should add valid Pokemon when form is submitted", async () => {
		render(
			<FooterInput
				pokemonDatabase={mockPokemonDatabase}
				onAddUsed={mockOnAddUsed}
			/>,
		);

		const input = screen.getByPlaceholderText("ポケモン名を入力...");
		const submitButton = screen.getByText("追加");

		fireEvent.change(input, { target: { value: "ピカチュウ" } });
		fireEvent.click(submitButton);

		expect(mockOnAddUsed).toHaveBeenCalledWith({
			name: "ピカチュウ",
			pokedexNumber: 25,
			timestamp: expect.any(Number),
		});

		// Input should be cleared after successful submission
		await waitFor(() => {
			expect(input).toHaveValue("");
		});
	});

	it("should handle form submission with Enter key", () => {
		render(
			<FooterInput
				pokemonDatabase={mockPokemonDatabase}
				onAddUsed={mockOnAddUsed}
			/>,
		);

		const input = screen.getByPlaceholderText("ポケモン名を入力...");

		fireEvent.change(input, { target: { value: "フシギダネ" } });
		const form = input.closest("form");
		if (form) fireEvent.submit(form);

		expect(mockOnAddUsed).toHaveBeenCalledWith({
			name: "フシギダネ",
			pokedexNumber: 1,
			timestamp: expect.any(Number),
		});
	});

	it("should show alert for invalid Pokemon name", () => {
		render(
			<FooterInput
				pokemonDatabase={mockPokemonDatabase}
				onAddUsed={mockOnAddUsed}
			/>,
		);

		const input = screen.getByPlaceholderText("ポケモン名を入力...");
		const submitButton = screen.getByText("追加");

		fireEvent.change(input, { target: { value: "InvalidPokemon" } });
		fireEvent.click(submitButton);

		expect(global.alert).toHaveBeenCalledWith(
			"そのポケモンは見つかりませんでした。正確な名前を入力してください。",
		);
		expect(mockOnAddUsed).not.toHaveBeenCalled();
	});

	it("should handle empty input gracefully", () => {
		render(
			<FooterInput
				pokemonDatabase={mockPokemonDatabase}
				onAddUsed={mockOnAddUsed}
			/>,
		);

		const submitButton = screen.getByText("追加");

		fireEvent.click(submitButton);

		expect(global.alert).toHaveBeenCalledWith(
			"そのポケモンは見つかりませんでした。正確な名前を入力してください。",
		);
		expect(mockOnAddUsed).not.toHaveBeenCalled();
	});

	it("should handle whitespace in input", () => {
		render(
			<FooterInput
				pokemonDatabase={mockPokemonDatabase}
				onAddUsed={mockOnAddUsed}
			/>,
		);

		const input = screen.getByPlaceholderText("ポケモン名を入力...");
		const submitButton = screen.getByText("追加");

		fireEvent.change(input, { target: { value: "  ピカチュウ  " } });
		fireEvent.click(submitButton);

		expect(mockOnAddUsed).toHaveBeenCalledWith({
			name: "ピカチュウ",
			pokedexNumber: 25,
			timestamp: expect.any(Number),
		});
	});

	it("should handle case where Pokemon database is empty", () => {
		render(<FooterInput pokemonDatabase={{}} onAddUsed={mockOnAddUsed} />);

		const input = screen.getByPlaceholderText("ポケモン名を入力...");
		const submitButton = screen.getByText("追加");

		fireEvent.change(input, { target: { value: "ピカチュウ" } });
		fireEvent.click(submitButton);

		expect(global.alert).toHaveBeenCalledWith(
			"そのポケモンは見つかりませんでした。正確な名前を入力してください。",
		);
		expect(mockOnAddUsed).not.toHaveBeenCalled();
	});

	it("should update input value when typing", () => {
		render(
			<FooterInput
				pokemonDatabase={mockPokemonDatabase}
				onAddUsed={mockOnAddUsed}
			/>,
		);

		const input = screen.getByPlaceholderText("ポケモン名を入力...");

		fireEvent.change(input, { target: { value: "テスト" } });
		expect(input).toHaveValue("テスト");

		fireEvent.change(input, { target: { value: "ピカチュウ" } });
		expect(input).toHaveValue("ピカチュウ");
	});
});
