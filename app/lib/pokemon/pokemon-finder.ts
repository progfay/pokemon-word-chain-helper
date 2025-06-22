import type { Pokemon, PokemonDatabase } from "../../types/pokemon";

/**
 * Find a Pokemon by exact name match
 * @param database - The Pokemon database to search in
 * @param name - The name to search for (will be trimmed)
 * @returns The found Pokemon or null if not found
 */
export function findPokemonByName(
	database: PokemonDatabase,
	name: string,
): Pokemon | null {
	const trimmedName = name.trim();
	if (!trimmedName) return null;

	// Search through all Pokemon in the database
	for (const [_firstChar, pokemonList] of Object.entries(database)) {
		const found = pokemonList.find((pokemon) => pokemon[0] === trimmedName);
		if (found) {
			return found;
		}
	}
	return null;
}
