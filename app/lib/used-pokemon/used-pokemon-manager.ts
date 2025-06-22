import type { UsedPokemon } from "../../types/pokemon";

/**
 * Business logic for managing used Pokemon operations
 * Follows Single Responsibility Principle by handling only Pokemon usage logic
 */

/**
 * Add a Pokemon to the used list if it doesn't already exist
 * @param usedPokemon Current list of used Pokemon
 * @param pokemon Pokemon to add
 * @returns Updated list of used Pokemon
 */
export function addPokemon(
	usedPokemon: UsedPokemon[],
	pokemon: UsedPokemon,
): UsedPokemon[] {
	// Check if already exists to avoid duplicates
	const exists = usedPokemon.some((p) => p[1] === pokemon[1]);
	if (exists) return usedPokemon;
	return [...usedPokemon, pokemon];
}

/**
 * Remove a Pokemon from the used list by name
 * @param usedPokemon Current list of used Pokemon
 * @param pokemonName Name of Pokemon to remove
 * @returns Updated list of used Pokemon
 */
export function removePokemon(
	usedPokemon: UsedPokemon[],
	pokemonName: string,
): UsedPokemon[] {
	return usedPokemon.filter((p) => p[1] !== pokemonName);
}

/**
 * Clear all used Pokemon
 * @returns Empty array
 */
export function clearAll(): UsedPokemon[] {
	return [];
}

/**
 * Create a Set of used Pokemon names for efficient lookup
 * @param usedPokemon List of used Pokemon
 * @returns Set of Pokemon names
 */
export function createUsedPokemonSet(usedPokemon: UsedPokemon[]): Set<string> {
	return new Set(usedPokemon.map((p) => p[1]));
}

/**
 * Check if a Pokemon is already used
 * @param usedPokemon List of used Pokemon
 * @param pokemonName Name to check
 * @returns True if Pokemon is already used
 */
export function isPokemonUsed(
	usedPokemon: UsedPokemon[],
	pokemonName: string,
): boolean {
	return usedPokemon.some((p) => p[1] === pokemonName);
}
