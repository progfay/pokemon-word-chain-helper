import { describe, expect, it } from "vitest";
import type { PokemonDatabase } from "../../../types/pokemon";
import { findPokemonByName } from "../pokemon-finder";

const mockDatabase: PokemonDatabase = {
	ピ: [
		["ピカチュウ", "ねずみ", 1, 25, [4]],
		["ピチュー", "こねずみ", 2, 172, [4]],
	],
	フ: [
		["フシギダネ", "たね", 1, 1, [5, 8]],
		["フシギソウ", "たね", 1, 2, [5, 8]],
	],
};

describe("findPokemonByName", () => {
	it("should find Pokemon by exact name", () => {
		const result = findPokemonByName(mockDatabase, "ピカチュウ");
		expect(result).toEqual(["ピカチュウ", "ねずみ", 1, 25, [4]]);
	});

	it("should return null for non-existent Pokemon", () => {
		const result = findPokemonByName(mockDatabase, "存在しない");
		expect(result).toBeNull();
	});

	it("should handle empty name", () => {
		const result = findPokemonByName(mockDatabase, "");
		expect(result).toBeNull();
	});

	it("should trim whitespace", () => {
		const result = findPokemonByName(mockDatabase, "  ピカチュウ  ");
		expect(result).toEqual(["ピカチュウ", "ねずみ", 1, 25, [4]]);
	});

	it("should find different Pokemon in the same database", () => {
		const pikachu = findPokemonByName(mockDatabase, "ピカチュウ");
		const bulbasaur = findPokemonByName(mockDatabase, "フシギダネ");

		expect(pikachu).toEqual(["ピカチュウ", "ねずみ", 1, 25, [4]]);
		expect(bulbasaur).toEqual(["フシギダネ", "たね", 1, 1, [5, 8]]);
	});
});
