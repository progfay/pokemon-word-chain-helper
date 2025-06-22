import type { UsedPokemon } from "../../types/pokemon";

/**
 * Handles JSON parsing and serialization for used Pokemon data
 * Follows Single Responsibility Principle by handling only data conversion logic
 */

/**
 * Parse JSON string to UsedPokemon array
 * @param jsonString JSON string to parse
 * @returns Parsed UsedPokemon array or empty array if parsing fails
 */
export function fromJson(jsonString: string | null): UsedPokemon[] {
	if (!jsonString) return [];

	try {
		const parsed = JSON.parse(jsonString);
		// Validate that parsed data is an array of valid UsedPokemon tuples
		if (
			Array.isArray(parsed) &&
			parsed.every(
				(item) =>
					Array.isArray(item) &&
					item.length === 2 &&
					typeof item[0] === "number" &&
					typeof item[1] === "string",
			)
		) {
			return parsed as UsedPokemon[];
		}
		return [];
	} catch {
		return [];
	}
}

/**
 * Serialize UsedPokemon array to JSON string
 * @param usedPokemon Array to serialize
 * @returns JSON string representation
 */
export function toJson(usedPokemon: UsedPokemon[]): string {
	return JSON.stringify(usedPokemon);
}
