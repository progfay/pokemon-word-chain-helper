import type { PokemonType, PokemonTypeInfo } from "../types/pokemon";

/**
 * Pokemon type information with Japanese names and colors
 */
export const POKEMON_TYPES: Record<PokemonType, PokemonTypeInfo> = {
	1: { id: 1, name: "ノーマル", color: "#A8A878" },
	2: { id: 2, name: "ほのお", color: "#F08030" },
	3: { id: 3, name: "みず", color: "#6890F0" },
	4: { id: 4, name: "でんき", color: "#F8D030" },
	5: { id: 5, name: "くさ", color: "#78C850" },
	6: { id: 6, name: "こおり", color: "#98D8D8" },
	7: { id: 7, name: "かくとう", color: "#C03028" },
	8: { id: 8, name: "どく", color: "#A040A0" },
	9: { id: 9, name: "じめん", color: "#E0C068" },
	10: { id: 10, name: "ひこう", color: "#A890F0" },
	11: { id: 11, name: "エスパー", color: "#F85888" },
	12: { id: 12, name: "むし", color: "#A8B820" },
	13: { id: 13, name: "いわ", color: "#B8A038" },
	14: { id: 14, name: "ゴースト", color: "#705898" },
	15: { id: 15, name: "ドラゴン", color: "#7038F8" },
	16: { id: 16, name: "あく", color: "#705848" },
	17: { id: 17, name: "はがね", color: "#B8B8D0" },
	18: { id: 18, name: "フェアリー", color: "#EE99AC" },
};

/**
 * Get type information by ID
 */
export function getTypeInfo(typeId: PokemonType): PokemonTypeInfo {
	return POKEMON_TYPES[typeId];
}

/**
 * Get multiple type information
 */
export function getTypesInfo(
	typeIds: [PokemonType] | [PokemonType, PokemonType],
): PokemonTypeInfo[] {
	return typeIds.map((id) => getTypeInfo(id));
}
